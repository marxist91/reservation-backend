'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // Général
      app_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Gestion de Réservation de Salles'
      },
      app_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 'Système de gestion des réservations de salles'
      },
      max_reservations_per_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      max_days_in_advance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      max_booking_duration_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 4
      },
      // Notifications
      enable_email_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      enable_sms_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notify_on_booking: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_rejection: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_cancellation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notify_on_modification: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      reminder_before_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 24
      },
      // Sécurité
      require_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      session_timeout_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      min_password_length: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 8
      },
      require_special_char: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      require_number: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      require_uppercase: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      // Horaires
      working_days: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: JSON.stringify([1, 2, 3, 4, 5])
      },
      opening_time: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: '08:00'
      },
      closing_time: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: '18:00'
      },
      break_start_time: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: '12:00'
      },
      break_end_time: {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: '13:00'
      },
      // Apparence
      primary_color: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#1976d2'
      },
      secondary_color: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#dc004e'
      },
      dark_mode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      compact_mode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      // Email SMTP
      smtp_host: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: 'smtp.gmail.com'
      },
      smtp_port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 587
      },
      smtp_secure: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      smtp_user: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      smtp_password: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email_from_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Système de Réservation'
      },
      email_from_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: 'noreply@reservation.com'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Insérer une ligne de configuration par défaut
    await queryInterface.bulkInsert('settings', [{
      app_name: 'Gestion de Réservation de Salles',
      app_description: 'Système de gestion des réservations de salles',
      max_reservations_per_user: 5,
      max_days_in_advance: 30,
      max_booking_duration_hours: 4,
      enable_email_notifications: true,
      enable_sms_notifications: false,
      notify_on_booking: true,
      notify_on_approval: true,
      notify_on_rejection: true,
      notify_on_cancellation: true,
      notify_on_modification: true,
      reminder_before_hours: 24,
      require_approval: true,
      session_timeout_minutes: 60,
      min_password_length: 8,
      require_special_char: true,
      require_number: true,
      require_uppercase: true,
      working_days: JSON.stringify([1, 2, 3, 4, 5]),
      opening_time: '08:00',
      closing_time: '18:00',
      break_start_time: '12:00',
      break_end_time: '13:00',
      primary_color: '#1976d2',
      secondary_color: '#dc004e',
      dark_mode: false,
      compact_mode: false,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_secure: false,
      smtp_user: null,
      smtp_password: null,
      email_from_name: 'Système de Réservation',
      email_from_address: 'noreply@reservation.com',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('settings');
  }
};
