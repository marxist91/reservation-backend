"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Utilisateur destinataire de la notification",
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Type: reservation_validated, reservation_rejected, etc.",
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reservation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: "notifications",
    timestamps: true,
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "destinataire"
    });
    Notification.belongsTo(models.Reservation, {
      foreignKey: "reservation_id",
      as: "reservation"
    });
  };

  return Notification;
};
