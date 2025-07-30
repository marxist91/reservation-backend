// migrations/YYYYMMDDHHMMSS-create-audit-logs.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      
      // Informations sur l'action
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Type d\'action effectuée (CREATE, UPDATE, DELETE, LOGIN, etc.)'
      },
      
      // Utilisateur qui a effectué l'action
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      // Informations sur la cible de l'action
      cible_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type d\'entité ciblée (User, Reservation, Room, etc.)'
      },
      
      cible_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID de l\'entité ciblée'
      },
      
      // Détails de l'action
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Détails supplémentaires sur l\'action (JSON)'
      },
      
      // État avant modification (pour les UPDATE)
      ancien_etat: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'État de l\'entité avant modification (JSON)'
      },
      
      // Nouvel état après modification
      nouvel_etat: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'État de l\'entité après modification (JSON)'
      },
      
      // Informations techniques
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'Adresse IP de l\'utilisateur'
      },
      
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User-Agent du navigateur'
      },
      
      // Métadonnées
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Métadonnées additionnelles (JSON)'
      },
      
      // Statut de l'action
      statut: {
        type: Sequelize.ENUM('succes', 'echec', 'partiel'),
        defaultValue: 'succes',
        allowNull: false,
        comment: 'Statut de l\'exécution de l\'action'
      },
      
      // Message d'erreur en cas d'échec
      message_erreur: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Message d\'erreur si l\'action a échoué'
      },
      
      // Timestamp
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Création des index pour optimiser les performances
    await queryInterface.addIndex('audit_logs', ['action'], {
      name: 'idx_audit_logs_action'
    });
    
    await queryInterface.addIndex('audit_logs', ['user_id'], {
      name: 'idx_audit_logs_user_id'
    });
    
    await queryInterface.addIndex('audit_logs', ['cible_type'], {
      name: 'idx_audit_logs_cible_type'
    });
    
    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'idx_audit_logs_created_at'
    });
    
    await queryInterface.addIndex('audit_logs', ['user_id', 'created_at'], {
      name: 'idx_audit_logs_user_date'
    });
    
    await queryInterface.addIndex('audit_logs', ['action', 'created_at'], {
      name: 'idx_audit_logs_action_date'
    });
    
    await queryInterface.addIndex('audit_logs', ['cible_type', 'cible_id'], {
      name: 'idx_audit_logs_cible'
    });

    console.log('✅ Table audit_logs créée avec succès');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
    console.log('✅ Table audit_logs supprimée');
  }
};