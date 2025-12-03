'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ajouter la colonne prenom
    await queryInterface.addColumn('users', 'prenom', {
      type: Sequelize.STRING(100),
      allowNull: true, // Temporairement nullable pour les données existantes
      after: 'nom'
    });

    // 2. Renommer mot_de_passe en password
    await queryInterface.renameColumn('users', 'mot_de_passe', 'password');

    // 3. Ajouter les colonnes poste et telephone
    await queryInterface.addColumn('users', 'poste', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'telephone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    // 4. Modifier l'ENUM role pour correspondre au modèle
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'responsable', 'user'),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revenir à l'ancienne structure
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('super_admin', 'admin', 'directeur', 'chef_service', 'responsable_salle', 'utilisateur'),
      allowNull: false,
      defaultValue: 'utilisateur'
    });

    await queryInterface.removeColumn('users', 'telephone');
    await queryInterface.removeColumn('users', 'poste');
    await queryInterface.renameColumn('users', 'password', 'mot_de_passe');
    await queryInterface.removeColumn('users', 'prenom');
  }
};
