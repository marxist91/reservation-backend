"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create a unique index to prevent duplicate notifications for same user/reservation/type
    await queryInterface.addIndex('notifications', ['user_id', 'reservation_id', 'type'], {
      name: 'notifications_user_reservation_type_unique',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('notifications', 'notifications_user_reservation_type_unique');
  }
};
