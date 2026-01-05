"use strict";

module.exports = (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define("SupportTicket", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Sujet du ticket'
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'general',
      comment: 'Catégorie du ticket: bug, feature, question, general'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Description du problème'
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: 'normal',
      comment: 'Priorité: low, normal, high, urgent'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'open',
      comment: 'Statut: open, in_progress, resolved, closed'
    },
    responses: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Historique des réponses'
    }
  }, {
    tableName: 'support_tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SupportTicket;
};
