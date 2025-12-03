'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // Association avec les réservations
      Room.hasMany(models.Reservation, {
        foreignKey: 'room_id',
        as: 'reservations',
        onDelete: 'CASCADE'
      });

      // Association avec l'utilisateur responsable
      Room.belongsTo(models.User, {
        foreignKey: 'responsable_id',
        as: 'responsable',
        onDelete: 'RESTRICT'
      });
    }
  }

  Room.init({
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    batiment: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    etage: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    superficie: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    responsable_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    statut: {
      type: DataTypes.ENUM('disponible', 'maintenance', 'indisponible'),
      allowNull: false,
      defaultValue: 'disponible'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    underscored: false, // BDD utilise camelCase (createdAt) pas snake_case
    timestamps: true
  });

  return Room;
};