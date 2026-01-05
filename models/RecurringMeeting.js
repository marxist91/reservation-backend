"use strict";

module.exports = (sequelize, DataTypes) => {
  const RecurringMeeting = sequelize.define("RecurringMeeting", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nom de la réunion récurrente (ex: Réunion des directeurs)'
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Jour de la semaine: 0=Dimanche, 1=Lundi, 2=Mardi, etc.',
      validate: {
        min: 0,
        max: 6
      }
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Heure de début'
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Heure de fin'
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de la salle réservée'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description ou motif de la réunion'
    },
    organizer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de l\'organisateur (admin qui a créé)'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du département associé pour les statistiques'
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date de début de la récurrence'
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date de fin de la récurrence (null = indéfini)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Si la réunion récurrente est active'
    },
    auto_validate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Si les réservations générées sont auto-validées'
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#1976d2',
      comment: 'Couleur pour affichage dans le calendrier'
    }
  }, {
    tableName: 'recurring_meetings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  RecurringMeeting.associate = function(models) {
    RecurringMeeting.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
    RecurringMeeting.belongsTo(models.User, {
      foreignKey: 'organizer_id',
      as: 'organizer'
    });
  };

  return RecurringMeeting;
};
