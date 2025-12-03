'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      // Association avec User
      AuditLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }

    // Méthode d'instance pour parser les JSON
    toJSON() {
      const values = { ...this.get() };
      
      // Parser les champs JSON
      const jsonFields = ['details', 'ancien_etat', 'nouvel_etat', 'metadata'];
      jsonFields.forEach(field => {
        if (values[field]) {
          try {
            values[field] = JSON.parse(values[field]);
          } catch (e) {
            // Garder la valeur string si le parsing échoue
          }
        }
      });
      
      return values;
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Type d\'action effectuée'
    },
    
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
    cible_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type d\'entité ciblée'
    },
    
    cible_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de l\'entité ciblée'
    },
    
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Détails JSON'
    },
    
    ancien_etat: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'État avant modification (JSON)'
    },
    
    nouvel_etat: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'État après modification (JSON)'
    },
    
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Métadonnées (JSON)'
    },
    
    statut: {
      type: DataTypes.ENUM('succes', 'echec', 'partiel'),
      defaultValue: 'succes'
    },
    
    message_erreur: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // Méthodes statiques
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
      console.error('❌ Erreur log audit:', error);
      throw error;
    }
  };

  AuditLog.cleanup = async function(daysToKeep = 90) {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - daysToKeep);
      
      const { Op } = require('sequelize');
      const deletedCount = await AuditLog.destroy({
        where: {
          created_at: {
            [Op.lt]: dateLimit
          }
        }
      });
      
      console.log(`🧹 ${deletedCount} logs supprimés`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage logs:', error);
      throw error;
    }
  };

  return AuditLog;
};