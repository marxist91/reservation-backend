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

      // Lien vers le département (si présent)
      if (models.Department) {
        Reservation.belongsTo(models.Department, {
          foreignKey: 'department_id',
          as: 'department'
        });
      }

      // Lien vers la réunion récurrente (si présent)
      if (models.RecurringMeeting) {
        Reservation.belongsTo(models.RecurringMeeting, {
          foreignKey: 'recurring_meeting_id',
          as: 'recurringMeeting'
        });
      }
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
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motif du refus de la réservation'
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
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    group_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: "UUID pour regrouper les réservations multiples"
    },
    recurring_meeting_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID de la réunion récurrente associée"
    },
    date: {
      type: DataTypes.VIRTUAL,
      get() {
        const d = this.getDataValue('date_debut');
        if (!d) return null;
        return new Date(d).toISOString().split('T')[0];
      }
    },
    heure_debut: {
      type: DataTypes.VIRTUAL,
      get() {
        const d = this.getDataValue('date_debut');
        if (!d) return null;
        const date = new Date(d);
        return date.toTimeString().split(' ')[0].substring(0, 5);
      }
    },
    heure_fin: {
      type: DataTypes.VIRTUAL,
      get() {
        const d = this.getDataValue('date_fin');
        if (!d) return null;
        const date = new Date(d);
        return date.toTimeString().split(' ')[0].substring(0, 5);
      }
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    timestamps: true,
    underscored: false
  });

  return Reservation;
};
