'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rooms', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('rooms', 'batiment', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('rooms', 'etage', {
      type: Sequelize.STRING(10),
      allowNull: true
    });

    await queryInterface.addColumn('rooms', 'superficie', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true
    });

    await queryInterface.addColumn('rooms', 'prix_heure', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('rooms', 'statut', {
      type: Sequelize.ENUM('disponible', 'maintenance', 'indisponible'),
      allowNull: false,
      defaultValue: 'disponible'
    });

    await queryInterface.addColumn('rooms', 'image_url', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rooms', 'image_url');
    await queryInterface.removeColumn('rooms', 'statut');
    await queryInterface.removeColumn('rooms', 'prix_heure');
    await queryInterface.removeColumn('rooms', 'superficie');
    await queryInterface.removeColumn('rooms', 'etage');
    await queryInterface.removeColumn('rooms', 'batiment');
    await queryInterface.removeColumn('rooms', 'description');
  }
};
