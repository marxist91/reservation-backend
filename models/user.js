"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {class User extends Model {static associate(models) {
      // 🔹 Un utilisateur peut faire plusieurs réservations
      User.hasMany(models.Reservation, {
        foreignKey: "user_id", // CORRIGÉ : correspond à la table
        as: "reservations"
      });
      
      // 🔹 Un utilisateur peut gérer plusieurs salles
      User.hasMany(models.Room, {
        foreignKey: "responsable_id",
        as: "salles" 
      });
      
      // 🔹 Un utilisateur peut avoir plusieurs logs d'audit
      User.hasMany(models.AuditLog, {
        foreignKey: "user_id",
        as: "audit_logs"
      });
    }
  }

  User.init(
    {
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: { // AJOUTÉ car utilisé dans associations.js
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      mot_de_passe: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("admin", "responsable_salle", "utilisateur"),
        allowNull: false,
        defaultValue: "utilisateur"
      },
      actif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      
      hooks: {
        // 🔐 Hash du mot de passe à la création
        beforeCreate: async (user, options) => {
          if (user.mot_de_passe) {
            const hash = await bcrypt.hash(user.mot_de_passe, 10);
            user.mot_de_passe = hash;
          }
        },
        // 🔐 Hash si mot de passe modifié
        beforeUpdate: async (user, options) => {
          if (user.changed("mot_de_passe")) {
            const hash = await bcrypt.hash(user.mot_de_passe, 10);
            user.mot_de_passe = hash;
          }
        }
      }
    }
  );

  return User;
};