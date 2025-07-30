'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Rooms', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    });

    await queryInterface.addColumn('Rooms', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Rooms', 'createdAt');
    await queryInterface.removeColumn('Rooms', 'updatedAt');
  }
};