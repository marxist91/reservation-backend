'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Modifier le type de la colonne equipements de STRING vers JSON
    await queryInterface.changeColumn('rooms', 'equipements', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revenir à STRING
    await queryInterface.changeColumn('rooms', 'equipements', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};

