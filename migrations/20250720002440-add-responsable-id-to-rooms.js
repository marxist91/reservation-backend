'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Injection du responsable fictif pour toutes les salles existantes
    await queryInterface.sequelize.query(`
      UPDATE Rooms
      SET responsable_id = 1
      WHERE responsable_id IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // On annule en mettant les valeurs à NULL
    await queryInterface.sequelize.query(`
      UPDATE Rooms
      SET responsable_id = NULL
      WHERE responsable_id = 1;
    `);
  }
};