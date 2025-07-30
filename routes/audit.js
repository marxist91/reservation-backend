const express = require('express');
const { Sequelize } = require('sequelize');
const { AuditLog, User, Room, Reservation } = require('../models'); // ✅ Tous disponibles
const { Op } = require('sequelize');
const { verifyToken: authMiddleware, verifyAdmin } = require('../middlewares/auth');

const router = express.Router();
// ==========================================
// 🔧 VOS ENDPOINTS EXISTANTS (conservés)
// ==========================================
console.log('📋 Modèles disponibles:', Object.keys(require('../models')));
// GET /api/audit - Récupérer tous les logs d'audit (ADMIN seulement)
router.get('/', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { 
      limit = 50,    // ✅ Limite par défaut
      offset = 0,    // ✅ Pagination
      recent = false // ✅ Option pour logs récents seulement
    } = req.query;
    
    console.log('📋 Récupération des logs d\'audit...', { limit, offset, recent });

    // ✅ Validation des paramètres
    const limitInt = Math.min(parseInt(limit) || 50, 1000); // Max 1000
    const offsetInt = parseInt(offset) || 0;

    // ✅ Construction de la clause WHERE pour les logs récents
    let whereClause = {};
    if (recent === 'true') {
      // Logs des 7 derniers jours
      whereClause.created_at = {
        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      };
    }

    // ✅ Utilisation de findAndCountAll pour la pagination
    const result = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limitInt,
      offset: offsetInt,
      include: [
        {
          model: User, // ✅ User importé en haut du fichier
          as: 'auteur',
          attributes: ['id', 'nom', 'email', 'role'], // ✅ Ajout du rôle
          required: false // ✅ LEFT JOIN au cas où l'utilisateur serait supprimé
        }
      ]
    });

    // ✅ Statistiques rapides
    const totalLogs = await AuditLog.count();
    const recentLogs = await AuditLog.count({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      }
    });

    console.log(`✅ ${result.rows.length}/${result.count} logs récupérés`);

    res.json({
      success: true,
      summary: {
        total_logs_in_system: totalLogs,
        logs_last_24h: recentLogs,
        showing_recent_only: recent === 'true'
      },
      results: {
        total_matching: result.count,
        logs_returned: result.rows.length,
        current_page: Math.floor(offsetInt / limitInt) + 1,
        total_pages: Math.ceil(result.count / limitInt),
        has_more: result.count > (offsetInt + limitInt)
      },
      data: result.rows,
      pagination: {
        limit: limitInt,
        offset: offsetInt,
        next_offset: result.count > (offsetInt + limitInt) ? offsetInt + limitInt : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des logs d\'audit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des logs d\'audit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/audit/filter - Filtrer les logs d'audit
router.get('/filter', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { 
      action, 
      userId, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 // ✅ Ajout de la pagination
    } = req.query;
    
    console.log('🔍 Filtrage des logs avec:', { 
      action, 
      userId, 
      startDate, 
      endDate, 
      limit, 
      offset 
    });

    // ✅ Construction sécurisée de la clause WHERE
    let whereClause = {};

    // Filtre par action
    if (action) {
      if (action.includes(',')) {
        // Support des actions multiples: action=LOGIN,LOGOUT
        whereClause.action = { [Op.in]: action.split(',').map(a => a.trim()) };
      } else {
        whereClause.action = action;
      }
    }

    // Filtre par utilisateur avec validation
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'userId doit être un nombre valide'
        });
      }
      whereClause.user_id = userIdInt;
    }

    // ✅ Filtre par dates avec validation
    if (startDate || endDate) {
      whereClause.created_at = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'startDate format invalide (utilisez YYYY-MM-DD)'
          });
        }
        whereClause.created_at[Op.gte] = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'endDate format invalide (utilisez YYYY-MM-DD)'
          });
        }
        // ✅ Fin de journée pour endDate
        end.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = end;
      }
    }

    // ✅ Validation des limites
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    
    if (limitInt > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Limite maximum: 1000 enregistrements'
      });
    }

    // ✅ Utilisation de findAndCountAll pour la pagination
    const result = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limitInt,
      offset: offsetInt,
      include: [
        {
          model: User, // ✅ User importé en haut du fichier
          as: 'auteur',
          attributes: ['id', 'nom', 'email', 'role'], // ✅ Ajout du rôle
          required: false
        }
      ]
    });

    console.log(`✅ ${result.count} logs trouvés (${result.rows.length} retournés)`);

    res.json({
      success: true,
      filters_applied: {
        action,
        userId: userId ? parseInt(userId) : null,
        startDate,
        endDate,
        period: startDate && endDate ? `${startDate} à ${endDate}` : 'Toutes les dates'
      },
      results: {
        total_logs: result.count,
        logs_returned: result.rows.length,
        current_page: Math.floor(offsetInt / limitInt) + 1,
        total_pages: Math.ceil(result.count / limitInt),
        has_more: result.count > (offsetInt + limitInt)
      },
      data: result.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors du filtrage des logs d\'audit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du filtrage des logs d\'audit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/audit/stats/summary - Statistiques résumées des logs
router.get('/stats/summary',authMiddleware,verifyAdmin,async (req, res) => {
    try {
      console.log('📊 Calcul des statistiques d\'audit...');
      const { Sequelize } = require('sequelize');
      
      // Statistiques par action
      const actionStats = await AuditLog.findAll({
        attributes: [
          'action',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['action'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
      });

      // Statistiques par utilisateur (top 10)
    const userStats = await AuditLog.findAll({
  attributes: [
    'user_id',
    [Sequelize.fn('COUNT', Sequelize.col('AuditLog.id')), 'count']
  ],
  include: [{
    model: User,
    as: 'auteur',
    attributes: ['id', 'nom', 'email']
  }],
  group: ['user_id'],
  order: [[Sequelize.fn('COUNT', Sequelize.col('AuditLog.id')), 'DESC']],
  limit: 10
});
      // Total des logs
      const totalLogs = await AuditLog.count();

      // Logs des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentLogs = await AuditLog.count({
        where: {
          created_at: {
            [Op.gte]: sevenDaysAgo
          }
        }
      });

      console.log('✅ Statistiques calculées:', { totalLogs, recentLogs });

      res.json({
        success: true,
        data: {
          totalLogs,
          recentLogs,
          actionStats,
          userStats
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des statistiques'
      });
    }
  }
);

// ==========================================
// 🚀 NOUVEAUX ENDPOINTS AVANCÉS (Phase 2)
// ==========================================

/**
 * @swagger
 * /api/audit/entity/{type}/{id}:
 *   get:
 *     summary: Historique d'audit d'une entité spécifique
 *     description: Récupère tous les logs d'audit pour une entité donnée (user, room, reservation)
 *     tags: [Audit Avancé]
 */
router.get('/entity/:type/:id', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // ✅ Validation de l'ID
    const entityId = parseInt(id);
    if (!entityId || isNaN(entityId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'entité invalide'
      });
    }

    console.log(`🔍 Audit entité ${type}:${entityId}...`);

    // Validation du type d'entité
    const validTypes = ['user', 'room', 'reservation'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type d'entité invalide. Types acceptés: ${validTypes.join(', ')}`
      });
    }

    // ✅ Construction de la condition selon votre structure actuelle
    let whereCondition = {};
    let actionFilters = [];

    switch (type) {
      case 'user':
        // Logs où cet utilisateur est l'acteur
        whereCondition.user_id = entityId;
        break;
        
      case 'room':
        // Chercher par actions liées aux salles ET par détails/métadonnées
        actionFilters = ['CREATE_ROOM', 'UPDATE_ROOM', 'DELETE_ROOM'];
        whereCondition = {
          [Op.and]: [
            { action: { [Op.in]: actionFilters } },
            {
              [Op.or]: [
                { cible_id: entityId.toString() },
                { details: { [Op.like]: `%"room_id":${entityId}%` } },
                { details: { [Op.like]: `%"id":${entityId}%` } }
              ]
            }
          ]
        };
        break;
        
      case 'reservation':
        // Chercher par actions liées aux réservations
        actionFilters = ['CREATE_RESERVATION', 'UPDATE_RESERVATION', 'DELETE_RESERVATION'];
        whereCondition = {
          [Op.and]: [
            { action: { [Op.in]: actionFilters } },
            {
              [Op.or]: [
                { cible_id: entityId.toString() },
                { details: { [Op.like]: `%"reservation_id":${entityId}%` } },
                { details: { [Op.like]: `%"id":${entityId}%` } }
              ]
            }
          ]
        };
        break;
    }

    // Récupération des logs d'audit
    const auditLogs = await AuditLog.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User, // ✅ User importé en haut du fichier
          as: 'auteur',
          attributes: ['id', 'nom', 'email', 'role'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    // ✅ Informations sur l'entité ciblée avec gestion d'erreurs
    let entityInfo = null;
    try {
      switch (type) {
        case 'user':
          entityInfo = await User.findByPk(entityId, {
            attributes: ['id', 'nom', 'prenom', 'email', 'role', 'createdAt'] // ✅ Ajout prénom
          });
          break;
          
        case 'room':
          // ✅ Import des modèles depuis le haut du fichier si disponible
          const { Room } = require('../models');
          entityInfo = await Room.findByPk(entityId, {
            attributes: ['id', 'nom', 'capacite', 'createdAt'],
            include: [
              {
                model: User,
                as: 'responsable',
                attributes: ['nom', 'email'],
                required: false
              }
            ]
          });
          break;
          
        case 'reservation':
          
          entityInfo = await Reservation.findByPk(entityId, {
            include: [
              {
                model: User,
                as: 'utilisateur',
                attributes: ['nom', 'email'],
                required: false
              },
              {
                model: Room,
                as: 'room',
                attributes: ['nom', 'capacite'],
                required: false
              }
            ]
          });
          break;
      }
    } catch (entityError) {
      console.warn(`⚠️ Impossible de récupérer les infos de ${type}:${entityId}:`, entityError.message);
    }

    console.log(`✅ ${auditLogs.count} logs trouvés pour ${type}:${entityId}`);

    res.json({
      success: true,
      entity: {
        type,
        id: entityId,
        information: entityInfo,
        exists: !!entityInfo
      },
      audit: {
        total_logs: auditLogs.count,
        logs_returned: auditLogs.rows.length,
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(auditLogs.count / limit),
        search_strategy: type === 'user' ? 'user_id' : 'action_and_details'
      },
      data: auditLogs.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur GET /audit/entity:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique d\'audit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/audit/user-actions/{id}:
 *   get:
 *     summary: Actions d'audit d'un utilisateur spécifique
 *     description: Récupère toutes les actions effectuées par un utilisateur donné
 *     tags: [Audit Avancé]
 */
router.get('/user-actions/:id', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // ✅ Validation de l'ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    console.log(`🔍 Actions utilisateur ${userId}...`);

    // Informations sur l'utilisateur
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nom', 'email', 'role', 'createdAt'] // User utilise createdAt
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Actions effectuées PAR cet utilisateur (user_id = userId selon votre structure actuelle)
    const actionsPerformed = await AuditLog.findAndCountAll({
      where: {
        user_id: userId
      },
      order: [['created_at', 'DESC']], // ✅ Corrigé: created_at (snake_case) pour AuditLog
      limit,
      offset
    });

    // Actions où cet utilisateur est mentionné/affecté (si vous avez un champ target_user_id)
    // Commenté car votre structure semble différente
    /*
    const actionsReceived = await AuditLog.findAndCountAll({
      where: {
        target_user_id: userId // Si vous avez ce champ
      },
      include: [
        {
          model: User,
          as: 'auteur',
          attributes: ['nom', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    */

    // Analyse par type d'action pour cet utilisateur
    const actionTypes = await AuditLog.findAll({
      where: {
        user_id: userId
      },
      attributes: [
        'action',
        [Sequelize.fn('COUNT', Sequelize.col('action')), 'count']
      ],
      group: ['action'],
      raw: true
    });

    console.log(`✅ Analyse terminée pour utilisateur ${userId}`);

    res.json({
      success: true,
      user: user,
      activity: {
        actions_performed: {
          total: actionsPerformed.count,
          logs: actionsPerformed.rows
        }
        // actions_received: {
        //   total: actionsReceived.count,
        //   logs: actionsReceived.rows
        // }
      },
      statistics: {
        action_types: actionTypes.reduce((acc, item) => {
          acc[item.action] = parseInt(item.count);
          return acc;
        }, {})
      },
      pagination: {
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(actionsPerformed.count / limit),
        limit: limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur GET /audit/user-actions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'audit utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/audit/advanced-search:
 *   get:
 *     summary: Recherche avancée dans les logs d'audit
 *     description: Filtrage avancé avec critères multiples et statistiques
 *     tags: [Audit Avancé]
 */
router.get('/advanced-search', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      action,
      user_id, // ✅ Changé de actor_id à user_id
      entity_type,
      limit = 50,
      offset = 0,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    console.log('🔍 Recherche avancée avec filtres:', req.query);

    // Construction des filtres WHERE
    const whereConditions = {};

    // Filtre par date
    if (start_date || end_date) {
      whereConditions.created_at = {}; // ✅ Cohérent avec created_at
      if (start_date) {
        whereConditions.created_at[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereConditions.created_at[Op.lte] = new Date(end_date);
      }
    }

    // Filtre par type d'action
    if (action) {
      if (action.includes(',')) {
        whereConditions.action = { [Op.in]: action.split(',') };
      } else {
        whereConditions.action = action;
      }
    }

    // Filtre par utilisateur (user_id au lieu d'actor_id)
    if (user_id) {
      whereConditions.user_id = parseInt(user_id); // ✅ Changé en user_id
    }

    // Filtre par type d'entité (basé sur les actions)
    if (entity_type) {
      const entityActions = {
        user: ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'LOGIN', 'LOGOUT'],
        room: ['CREATE_ROOM', 'UPDATE_ROOM', 'DELETE_ROOM'],
        reservation: ['CREATE_RESERVATION', 'UPDATE_RESERVATION', 'DELETE_RESERVATION']
      };

      if (entityActions[entity_type]) {
        // ✅ Gérer le conflit si action est déjà défini
        if (whereConditions.action) {
          // Intersection entre les filtres action et entity_type
          const existingActions = Array.isArray(whereConditions.action[Op.in]) 
            ? whereConditions.action[Op.in] 
            : [whereConditions.action];
          whereConditions.action = { 
            [Op.in]: existingActions.filter(a => entityActions[entity_type].includes(a))
          };
        } else {
          whereConditions.action = { [Op.in]: entityActions[entity_type] };
        }
      }
    }

    // Validation du tri
    const allowedSortFields = ['created_at', 'action', 'user_id', 'id'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    // Récupération des logs
    const auditLogs = await AuditLog.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User, // ✅ User importé en haut du fichier
          as: 'auteur',
          attributes: ['id', 'nom', 'email', 'role'],
          required: false
        }
      ],
      order: [[sortField, sortOrder]], // ✅ Variables validées
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Statistiques sur la période filtrée
    const stats = await AuditLog.findAll({
      where: whereConditions,
      attributes: [
        'action',
        [Sequelize.fn('COUNT', Sequelize.col('action')), 'count'],
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'] // ✅ Cohérent: created_at
      ],
      group: ['action', Sequelize.fn('DATE', Sequelize.col('created_at'))], // ✅ Cohérent: created_at
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'DESC']], // ✅ Cohérent: created_at
      raw: true
    });

    console.log(`✅ ${auditLogs.count} logs trouvés avec les filtres`);

    res.json({
      success: true,
      filters_applied: {
        start_date,
        end_date,
        action,
        user_id, // ✅ Changé de actor_id à user_id
        entity_type,
        analyzed_period: whereConditions.created_at || 'All dates'
      },
      results: {
        total_logs: auditLogs.count,
        logs_returned: auditLogs.rows.length,
        current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        total_pages: Math.ceil(auditLogs.count / parseInt(limit))
      },
      data: auditLogs.rows,
      statistics: {
        actions_by_day: stats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur GET /audit/advanced-search:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche avancée dans l\'audit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/audit/:id - Récupérer un log d'audit spécifique (CONSERVÉ - placé à la fin pour éviter conflits)
router.get('/:id', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Validation de l'ID
    const auditId = parseInt(id);
    if (!auditId || isNaN(auditId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de log d\'audit invalide'
      });
    }
    
    console.log('🔍 Recherche du log d\'audit ID:', auditId);
    
    const auditLog = await AuditLog.findByPk(auditId, {
      include: [
        {
          model: User, // ✅ User importé en haut du fichier
          as: 'auteur',
          attributes: ['id', 'nom', 'email', 'role'] // ✅ Ajout du rôle pour plus d'info
        }
      ]
    });

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Log d\'audit non trouvé'
      });
    }

    // ✅ Log de succès
    console.log(`✅ Log d'audit ${auditId} récupéré avec succès`);

    res.json({
      success: true,
      data: auditLog,
      timestamp: new Date().toISOString() // ✅ Timestamp de la réponse
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du log d\'audit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du log d\'audit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;