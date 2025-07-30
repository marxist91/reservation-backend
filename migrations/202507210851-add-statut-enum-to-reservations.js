'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Reservations', 'statut', {
      type: Sequelize.ENUM('en_attente', 'validée', 'annulée'),
      allowNull: false,
      defaultValue: 'en_attente'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Reservations', 'statut', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'en_attente'
    });

    // Supprime l'ENUM (optionnel)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Reservations_statut";');
  }
};