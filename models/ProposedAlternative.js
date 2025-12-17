'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProposedAlternative extends Model {
    static associate(models) {
      // Réservation originale refusée
      ProposedAlternative.belongsTo(models.Reservation, {
        foreignKey: 'original_reservation_id',
        as: 'originalReservation'
      });

      // Salle proposée en alternative
      ProposedAlternative.belongsTo(models.Room, {
        foreignKey: 'proposed_room_id',
        as: 'proposedRoom'
      });

      // Admin qui a proposé l'alternative
      ProposedAlternative.belongsTo(models.User, {
        foreignKey: 'proposed_by',
        as: 'proposer'
      });
    }
  }

  ProposedAlternative.init({
    original_reservation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reservations',
        key: 'id'
      }
    },
    proposed_room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    proposed_date_debut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    proposed_date_fin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Raison de la proposition alternative'
    },
    proposed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    proposed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProposedAlternative',
    tableName: 'proposed_alternatives',
    timestamps: true,
    underscored: false
  });

  return ProposedAlternative;
};
