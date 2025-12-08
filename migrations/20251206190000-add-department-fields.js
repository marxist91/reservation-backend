"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('departments', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('departments', 'slug', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: false, // unique may require cleaning existing data
    });

    await queryInterface.addColumn('departments', 'responsable_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('departments', 'responsable_id');
    await queryInterface.removeColumn('departments', 'slug');
    await queryInterface.removeColumn('departments', 'description');
  }
};
