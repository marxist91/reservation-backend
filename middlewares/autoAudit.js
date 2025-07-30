const AuditLog = require('../models/AuditLog');

/**
 * Middleware d'audit automatique
 * @param {Object} options - Options de configuration
 * @param {string} options.action - Type d'action à auditer
 * @param {string} options.cibleType - Type d'entité ciblée
 * @param {Function} options.getEntityId - Fonction pour extraire l'ID de l'entité
 * @param {boolean} options.captureBody - Capturer le body de la requête
 * @param {boolean} options.captureParams - Capturer les paramètres de la requête
 * @returns {Function} Middleware Express
 */
const autoAudit = (options = {}) => {
  const {
    action,
    cibleType,
    getEntityId,
    captureBody = true,
    captureParams = true,
    captureResponse = false
  } = options;

  return async (req, res, next) => {
    // Capturer les informations de base
    const startTime = Date.now();
    const originalSend = res.send;
    let responseData = null;
    let responseStatus = null;

    // Intercepter la réponse si nécessaire
    if (captureResponse) {
      res.send = function(data) {
        responseData = data;
        responseStatus = res.statusCode;
        return originalSend.call(this, data);
      };
    }

    // Fonction pour créer le log d'audit
    const createAuditLog = async (status = 'succes', errorMessage = null) => {
      try {
        // Extraire l'ID de l'entité ciblée
        let entityId = null;
        if (getEntityId && typeof getEntityId === 'function') {
          entityId = getEntityId(req);
        } else if (req.params.id) {
          entityId = req.params.id;
        }

        // Préparer les détails de l'action
        const details = {
          method: req.method,
          path: req.path,
          query: req.query,
          duration_ms: Date.now() - startTime
        };

        if (captureParams && req.params) {
          details.params = req.params;
        }

        if (captureBody && req.body && Object.keys(req.body).length > 0) {
          // Exclure les mots de passe et informations sensibles
          const sanitizedBody = { ...req.body };
          ['password', 'motdepasse', 'token', 'secret'].forEach(field => {
            if (sanitizedBody[field]) {
              sanitizedBody[field] = '[MASQUE]';
            }
          });
          details.body = sanitizedBody;
        }

        if (captureResponse && responseData) {
          details.response_status = responseStatus;
          // Ne pas capturer les réponses trop volumineuses
          if (typeof responseData === 'string' && responseData.length < 1000) {
            try {
              details.response = JSON.parse(responseData);
            } catch (e) {
              details.response = responseData.substring(0, 200);
            }
          }
        }

        // Informations sur l'utilisateur
        const userId = req.user?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const userAgent = req.headers['user-agent'];

        // Métadonnées additionnelles
        const metadata = {
          timestamp: new Date().toISOString(),
          session_id: req.sessionID,
          correlation_id: req.headers['x-correlation-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Capturer l'état avant modification si disponible
        let ancienEtat = null;
        if (req.auditSnapshot) {
          ancienEtat = req.auditSnapshot;
        }

        // Créer le log d'audit
        await AuditLog.logAction({
          action: action || `${req.method}_${req.route?.path || req.path}`,
          user_id: userId,
          cible_type: cibleType,
          cible_id: entityId,
          details,
          ancien_etat: ancienEtat,
          nouvel_etat: null, // Sera rempli après l'action si nécessaire
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata,
          statut: status,
          message_erreur: errorMessage
        });

        console.log(`📝 Audit log créé: ${action || req.method} par user ${userId || 'anonyme'}`);

      } catch (auditError) {
        console.error('❌ Erreur lors de la création du log d\'audit:', auditError);
        // Ne pas faire échouer la requête principale à cause d'une erreur d'audit
      }
    };

    // Intercepter les erreurs
    const originalNext = next;
    const auditNext = (error) => {
      if (error) {
        // Créer un log d'audit pour l'erreur
        setImmediate(() => {
          createAuditLog('echec', error.message || 'Erreur inconnue');
        });
      }
      return originalNext(error);
    };

    // Intercepter la fin de la réponse
    res.on('finish', () => {
      // Créer le log d'audit après que la réponse soit envoyée
      setImmediate(() => {
        const status = res.statusCode >= 400 ? 'echec' : 'succes';
        const errorMessage = res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null;
        createAuditLog(status, errorMessage);
      });
    });

    // Continuer avec la requête
    next = auditNext;
    next();
  };
};

/**
 * Middleware spécialisé pour les actions de création
 */
autoAudit.create = (cibleType, options = {}) => {
  return autoAudit({
    action: `CREATE_${cibleType.toUpperCase()}`,
    cibleType,
    captureBody: true,
    ...options
  });
};

/**
 * Middleware spécialisé pour les actions de mise à jour
 */
autoAudit.update = (cibleType, options = {}) => {
  return autoAudit({
    action: `UPDATE_${cibleType.toUpperCase()}`,
    cibleType,
    captureBody: true,
    captureParams: true,
    ...options
  });
};

/**
 * Middleware spécialisé pour les actions de suppression
 */
autoAudit.delete = (cibleType, options = {}) => {
  return autoAudit({
    action: `DELETE_${cibleType.toUpperCase()}`,
    cibleType,
    captureParams: true,
    ...options
  });
};

/**
 * Middleware spécialisé pour les actions de lecture
 */
autoAudit.read = (cibleType, options = {}) => {
  return autoAudit({
    action: `READ_${cibleType.toUpperCase()}`,
    cibleType,
    captureParams: true,
    captureBody: false,
    ...options
  });
};

/**
 * Middleware spécialisé pour les actions d'authentification
 */
autoAudit.auth = (action, options = {}) => {
  return autoAudit({
    action: `AUTH_${action.toUpperCase()}`,
    cibleType: 'User',
    captureBody: true,
    getEntityId: (req) => req.body.email || req.user?.id,
    ...options
  });
};

/**
 * Fonction utilitaire pour capturer l'état d'une entité avant modification
 * À utiliser dans les contrôleurs avant de modifier une entité
 */
autoAudit.captureSnapshot = (entity) => {
  return (req, res, next) => {
    if (entity && typeof entity.toJSON === 'function') {
      req.auditSnapshot = entity.toJSON();
    } else if (entity && typeof entity === 'object') {
      req.auditSnapshot = { ...entity };
    }
    next();
  };
};

/**
 * Fonction pour enregistrer l'état final après modification
 * À utiliser après la modification d'une entité
 */
autoAudit.captureResult = async (req, entityId, newState) => {
  try {
    if (req.auditCorrelationId) {
      // Mettre à jour le log existant avec le nouvel état
      const log = await AuditLog.findOne({
        where: {
          metadata: {
            [require('sequelize').Op.like]: `%${req.auditCorrelationId}%`
          }
        },
        order: [['created_at', 'DESC']]
      });

      if (log) {
        await log.update({
          cible_id: entityId,
          nouvel_etat: newState ? JSON.stringify(newState) : null
        });
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la capture du résultat:', error);
  }
};

/**
 * Middleware pour les actions en lot (bulk operations)
 */
autoAudit.bulk = (action, cibleType, options = {}) => {
  return autoAudit({
    action: `BULK_${action.toUpperCase()}_${cibleType.toUpperCase()}`,
    cibleType,
    captureBody: true,
    getEntityId: (req) => {
      // Pour les opérations en lot, on peut capturer le nombre d'éléments
      if (req.body && Array.isArray(req.body)) {
        return `batch_${req.body.length}`;
      }
      return 'bulk_operation';
    },
    ...options
  });
};

/**
 * Middleware pour les actions d'export/import
 */
autoAudit.dataTransfer = (action, options = {}) => {
  return autoAudit({
    action: `DATA_${action.toUpperCase()}`,
    cibleType: 'Data',
    captureBody: false, // Ne pas capturer les gros volumes de données
    captureResponse: false,
    ...options
  });
};

/**
 * Configuration pour les actions système
 */
autoAudit.system = (action, options = {}) => {
  return autoAudit({
    action: `SYSTEM_${action.toUpperCase()}`,
    cibleType: 'System',
    captureBody: false,
    getEntityId: () => null, // Les actions système n'ont pas d'entité cible spécifique
    ...options
  });
};

/**
 * Middleware pour capturer les tentatives d'accès non autorisées
 */
autoAudit.unauthorized = () => {
  return async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];
      
      await AuditLog.logAction({
        action: 'UNAUTHORIZED_ACCESS',
        user_id: req.user?.id || null,
        cible_type: 'Security',
        cible_id: null,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          attempted_resource: req.originalUrl
        },
        ip_address: ipAddress,
        user_agent: userAgent,
        statut: 'echec',
        message_erreur: 'Tentative d\'accès non autorisée'
      });

      console.warn(`🚨 Tentative d'accès non autorisée: ${req.method} ${req.path} depuis ${ipAddress}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'audit d\'accès non autorisé:', error);
    }
    
    next();
  };
};

/**
 * Fonction utilitaire pour créer des logs d'audit manuels
 */
autoAudit.manual = async (actionData, req = null) => {
  try {
    const logData = {
      ...actionData,
      ip_address: req?.ip || req?.connection?.remoteAddress || req?.headers?.['x-forwarded-for'],
      user_agent: req?.headers?.['user-agent'],
      metadata: {
        timestamp: new Date().toISOString(),
        manual_log: true,
        ...actionData.metadata
      }
    };

    return await AuditLog.logAction(logData);
  } catch (error) {
    console.error('❌ Erreur lors de la création du log manuel:', error);
    throw error;
  }
};

module.exports = autoAudit;