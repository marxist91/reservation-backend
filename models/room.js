'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // Association avec les réservations
      Room.hasMany(models.Reservation, {
        foreignKey: 'room_id',
        as: 'roomReservations', // Alias plus spécifique pour éviter les conflits
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Association avec l'utilisateur responsable
      Room.belongsTo(models.User, {
        foreignKey: 'responsable_id',
        as: 'responsable', // Alias plus spécifique
        onDelete: 'RESTRICT', // Empêche la suppression si un responsable a des salles
        onUpdate: 'CASCADE'
      });
    }
  }

  Room.init({
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    capacite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 1000
      }
    },
    equipements: {
      type: DataTypes.TEXT, // Changé en TEXT pour plus de flexibilité
      allowNull: true,
      defaultValue: null
    },
    responsable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'Rooms',
    timestamps: true, // Explicitement activé
    indexes: [
      {
        fields: ['responsable_id']
      },
      {
        fields: ['nom']
      },
      {
        unique: true,
        fields: ['nom'] // Nom unique pour éviter les doublons
      }
    ]
  });

  return Room;
};