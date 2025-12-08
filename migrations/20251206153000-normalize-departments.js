"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Vérifier si la colonne 'departement' existe
    const tableInfo = await queryInterface.describeTable('reservations');
    if (!tableInfo.departement) {
      console.log("Colonne 'departement' introuvable — rien à normaliser.");
      return Promise.resolve();
    }

    // 1) Insérer les départements distincts dans la table departments (si non présents)
    // Utilise des requêtes SQL brutes pour rester compatible avec différents dialectes
    await queryInterface.sequelize.query(`
      INSERT INTO departments (name, createdAt, updatedAt)
      SELECT DISTINCT TRIM(departement), NOW(), NOW()
      FROM reservations r
      WHERE departement IS NOT NULL AND TRIM(departement) <> ''
      AND TRIM(departement) NOT IN (SELECT name FROM departments)
    `);

    // 2) Mettre à jour reservations.department_id en joignant sur departments.name
    await queryInterface.sequelize.query(`
      UPDATE reservations r
      JOIN departments d ON TRIM(r.departement) = d.name
      SET r.department_id = d.id
      WHERE r.departement IS NOT NULL AND TRIM(r.departement) <> ''
    `);

    // 3) Supprimer la colonne textuelle 'departement'
    await queryInterface.removeColumn('reservations', 'departement');
  },

  down: async (queryInterface, Sequelize) => {
    // Dans le down, recréer la colonne 'departement' et restaurer les valeurs depuis department_id
    await queryInterface.addColumn('reservations', 'departement', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    // Copier les noms depuis departments
    await queryInterface.sequelize.query(`
      UPDATE reservations r
      LEFT JOIN departments d ON r.department_id = d.id
      SET r.departement = d.name
      WHERE r.department_id IS NOT NULL
    `);
  }
};
