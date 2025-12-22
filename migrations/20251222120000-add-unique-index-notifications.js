"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cleanup existing duplicate notifications: keep the earliest (min id) per (user_id, reservation_id, type)
    // Use COALESCE to handle NULL reservation_id values
    await queryInterface.sequelize.query(`
      DELETE n FROM notifications n
      INNER JOIN (
        SELECT MIN(id) AS keep_id, user_id, COALESCE(reservation_id, 0) AS reservation_id, type
        FROM notifications
        GROUP BY user_id, COALESCE(reservation_id, 0), type
      ) t ON n.user_id = t.user_id
        AND COALESCE(n.reservation_id, 0) = t.reservation_id
        AND n.type = t.type
        AND n.id != t.keep_id;
    `);

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
