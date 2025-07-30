'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ⚠️ Injection du responsable_id = 1 dans les lignes où c’est NULL
    await queryInterface.sequelize.query(`
      UPDATE Rooms
      SET responsable_id = 1
      WHERE responsable_id IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // 🧹 Annule l’opération (remet à NULL)
    await queryInterface.sequelize.query(`
      UPDATE Rooms
      SET responsable_id = NULL
      WHERE responsable_id = 1;
    `);
  }
};