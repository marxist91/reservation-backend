'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      Reservation.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'utilisateur'
      });
      
      Reservation.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'salle'
      });

      Reservation.belongsTo(models.User, {
        foreignKey: 'validee_par',
        as: 'validateur'
      });
    }
  }

  Reservation.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value <= this.date_debut) {
            throw new Error('La date de fin doit être après la date de début');
          }
        }
      }
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'validee', 'confirmee', 'annulee', 'terminee', 'rejetee'),
      allowNull: false,
      defaultValue: 'en_attente'
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nombre_participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    equipements_supplementaires: {
      type: DataTypes.JSON,
      allowNull: true
    },
    commentaire_admin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    validee_par: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    validee_le: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    underscored: false, // BDD utilise camelCase
    timestamps: true
  });

  return Reservation;
};