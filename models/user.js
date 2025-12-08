"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Un utilisateur peut faire plusieurs réservations
      User.hasMany(models.Reservation, {
        foreignKey: "user_id",
        as: "reservations"
      });
      
      // Un utilisateur peut gérer plusieurs salles
      User.hasMany(models.Room, {
        foreignKey: "responsable_id",
        as: "salles" 
      });
      
      // Un utilisateur peut avoir plusieurs logs d'audit
      User.hasMany(models.AuditLog, {
        foreignKey: "user_id",
        as: "audit_logs"
      });

      // Un utilisateur peut avoir plusieurs notifications
      if (models.Notification) {
        User.hasMany(models.Notification, {
          foreignKey: "user_id",
          as: "notifications"
        });
      }
    }

    // Méthode pour vérifier le mot de passe
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  User.init(
    {
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nom' // Nom de la colonne en BDD
      },
      prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'prenom'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password' // Harmonisé avec routes
      },
      role: {
        type: DataTypes.ENUM("admin", "responsable", "user"),
        allowNull: false,
        defaultValue: "user"
      },
      poste: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      telephone: {
        type: DataTypes.STRING(20),
        allowNull: true
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
      tableName: "users",
      underscored: false, // BDD utilise camelCase
      timestamps: true,
      
      hooks: {
        // Hash du mot de passe à la création
        beforeCreate: async (user) => {
          if (user.password && !user.password.startsWith('$2a$')) {
            user.password = await bcrypt.hash(user.password, 12);
          }
        },
        // Hash si mot de passe modifié
        beforeUpdate: async (user) => {
          if (user.changed("password") && !user.password.startsWith('$2a$')) {
            user.password = await bcrypt.hash(user.password, 12);
          }
        }
      }
    }
  );

  return User;
};