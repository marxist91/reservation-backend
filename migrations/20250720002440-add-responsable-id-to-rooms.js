'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ajouter la colonne responsable_id
    await queryInterface.addColumn('rooms', 'responsable_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Injection du responsable fictif pour toutes les salles existantes
    await queryInterface.sequelize.query(`
      UPDATE rooms
      SET responsable_id = 1
      WHERE responsable_id IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Supprimer la colonne
    await queryInterface.removeColumn('rooms', 'responsable_id');
  }
};