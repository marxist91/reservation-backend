'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      Reservation.belongsTo(models.User, {
        foreignKey: 'user_id', // CORRIGÉ : correspond à la table
        as: 'utilisateur'
      });
      
      Reservation.belongsTo(models.Room, {
        foreignKey: 'room_id', // CORRIGÉ : correspond à la table
        as: 'salle'
      });
    }
  }

  Reservation.init({
    user_id: { // CORRIGÉ : correspond à la colonne en base
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    room_id: { // CORRIGÉ : correspond à la colonne en base
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    heure_debut: {
      type: DataTypes.TIME,
      allowNull: false
    },
    heure_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM("en_attente", "validée", "annulée"),
      allowNull: false,
      defaultValue: "en_attente"
    },
    equipements_attribues: {
      type: DataTypes.TEXT,
      allowNull: true
      // ex: chaîne JSON ou CSV : "vidéoprojecteur,sonorisation"
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'Reservations'
  });

  return Reservation;
};