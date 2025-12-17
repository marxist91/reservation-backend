"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // Settings is a singleton table, no associations needed
    }

    // Helper method to get all settings as an object
    static async getSettings() {
      const settings = await this.findOne();
      if (!settings) {
        return await this.create({});
      }
      return settings;
    }

    // Helper method to update settings
    static async updateSettings(data) {
      const settings = await this.getSettings();
      return await settings.update(data);
    }
  }

  Setting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // Général
      app_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Gestion de Réservation de Salles"
      },
      app_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "Système de gestion des réservations de salles"
      },
      max_reservations_per_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      max_days_in_advance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      max_booking_duration_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4
      },
      // Notifications
      enable_email_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      enable_sms_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notify_on_booking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_rejection: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_cancellation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_modification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      reminder_before_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 24
      },
      // Sécurité
      require_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      session_timeout_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      min_password_length: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 8
      },
      require_special_char: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      require_number: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      require_uppercase: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      // Horaires
      working_days: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [1, 2, 3, 4, 5] // Lundi à Vendredi
      },
      opening_time: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: "08:00"
      },
      closing_time: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: "18:00"
      },
      break_start_time: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: "12:00"
      },
      break_end_time: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: "13:00"
      },
      // Apparence
      primary_color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "#1976d2"
      },
      secondary_color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "#dc004e"
      },
      dark_mode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      compact_mode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      // Email SMTP
      smtp_host: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "smtp.gmail.com"
      },
      smtp_port: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 587
      },
      smtp_secure: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      smtp_user: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      smtp_password: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      email_from_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Système de Réservation"
      },
      email_from_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "noreply@reservation.com"
      }
    },
    {
      sequelize,
      modelName: "Setting",
      tableName: "settings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  return Setting;
};
