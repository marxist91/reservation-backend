'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Supprimer prix_heure de la table rooms
    await queryInterface.removeColumn('rooms', 'prix_heure');
    
    // Supprimer prix_total de la table reservations
    await queryInterface.removeColumn('reservations', 'prix_total');
  },

  async down (queryInterface, Sequelize) {
    // Restaurer prix_heure dans rooms
    await queryInterface.addColumn('rooms', 'prix_heure', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });
    
    // Restaurer prix_total dans reservations
    await queryInterface.addColumn('reservations', 'prix_total', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });
  }
};
