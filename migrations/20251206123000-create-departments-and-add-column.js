"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Créer la table departments
    await queryInterface.createTable('departments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajouter la colonne department_id à la table reservations (si elle existe)
    const tableNames = await queryInterface.showAllTables();
    const reservationsTable = tableNames.find(t => t.toString().toLowerCase() === 'reservations');
    if (reservationsTable) {
      await queryInterface.addColumn('reservations', 'department_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Supprimer la colonne department_id si présente
    const tableNames = await queryInterface.showAllTables();
    const reservationsTable = tableNames.find(t => t.toString().toLowerCase() === 'reservations');
    if (reservationsTable) {
      await queryInterface.removeColumn('reservations', 'department_id');
    }

    // Supprimer la table departments
    await queryInterface.dropTable('departments');
  }
};
