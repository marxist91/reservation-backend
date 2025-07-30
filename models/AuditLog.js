const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Informations sur l'action
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type d\'action effectuée (CREATE, UPDATE, DELETE, LOGIN, etc.)'
  },
  
  // Utilisateur qui a effectué l'action
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null pour les actions système
    references: {
      model: 'users', // Nom de la table des utilisateurs
      key: 'id'
    }
  },
  
  // Informations sur la cible de l'action
  cible_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type d\'entité ciblée (User, Reservation, Room, etc.)'
  },
  
  cible_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de l\'entité ciblée'
  },
  
  // Détails de l'action
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Détails supplémentaires sur l\'action (JSON)'
  },
  
  // État avant modification (pour les UPDATE)
  ancien_etat: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'État de l\'entité avant modification (JSON)'
  },
  
  // Nouvel état après modification
  nouvel_etat: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'État de l\'entité après modification (JSON)'
  },
  
  // Informations techniques
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Adresse IP de l\'utilisateur'
  },
  
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User-Agent du navigateur'
  },
  
  // Métadonnées
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Métadonnées additionnelles (JSON)'
  },
  
  // Statut de l'action
  statut: {
    type: DataTypes.ENUM('succes', 'echec', 'partiel'),
    defaultValue: 'succes',
    comment: 'Statut de l\'exécution de l\'action'
  },
  
  // Message d'erreur en cas d'échec
  message_erreur: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Message d\'erreur si l\'action a échoué'
  },
  
  // Timestamps
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: false, // Nous gérons manuellement created_at
  indexes: [
    {
      fields: ['action']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['cible_type']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['action', 'created_at']
    }
  ]
});

// Méthodes d'instance
AuditLog.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Parser les champs JSON
  if (values.details) {
    try {
      values.details = JSON.parse(values.details);
    } catch (e) {
      // Garder la valeur string si le parsing échoue
    }
  }
  
  if (values.ancien_etat) {
    try {
      values.ancien_etat = JSON.parse(values.ancien_etat);
    } catch (e) {
      // Garder la valeur string si le parsing échoue
    }
  }
  
  if (values.nouvel_etat) {
    try {
      values.nouvel_etat = JSON.parse(values.nouvel_etat);
    } catch (e) {
      // Garder la valeur string si le parsing échoue
    }
  }
  
  if (values.metadata) {
    try {
      values.metadata = JSON.parse(values.metadata);
    } catch (e) {
      // Garder la valeur string si le parsing échoue
    }
  }
  
  return values;
};

// Méthodes statiques pour créer des logs
AuditLog.logAction = async function(actionData) {
  try {
    const {
      action,
      user_id,
      cible_type,
      cible_id,
      details,
      ancien_etat,
      nouvel_etat,
      ip_address,
      user_agent,
      metadata,
      statut = 'succes',
      message_erreur
    } = actionData;
    
    // Convertir les objets en JSON
    const logData = {
      action,
      user_id,
      cible_type,
      cible_id,
      details: details ? JSON.stringify(details) : null,
      ancien_etat: ancien_etat ? JSON.stringify(ancien_etat) : null,
      nouvel_etat: nouvel_etat ? JSON.stringify(nouvel_etat) : null,
      ip_address,
      user_agent,
      metadata: metadata ? JSON.stringify(metadata) : null,
      statut,
      message_erreur
    };
    
    return await AuditLog.create(logData);
  } catch (error) {
    console.error('❌ Erreur lors de la création du log d\'audit:', error);
    throw error;
  }
};

// Méthode pour nettoyer les anciens logs
AuditLog.cleanup = async function(daysToKeep = 90) {
  try {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysToKeep);
    
    const deletedCount = await AuditLog.destroy({
      where: {
        created_at: {
          [require('sequelize').Op.lt]: dateLimit
        }
      }
    });
    
    console.log(`🧹 ${deletedCount} logs d'audit supprimés (plus anciens que ${daysToKeep} jours)`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des logs d\'audit:', error);
    throw error;
  }
};

module.exports = AuditLog;