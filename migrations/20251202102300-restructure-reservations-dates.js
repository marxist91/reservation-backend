'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ajouter les nouvelles colonnes date_debut et date_fin
    await queryInterface.addColumn('reservations', 'date_debut', {
      type: Sequelize.DATE,
      allowNull: true // Temporaire
    });

    await queryInterface.addColumn('reservations', 'date_fin', {
      type: Sequelize.DATE,
      allowNull: true // Temporaire
    });

    // 2. Migrer les données existantes (si présentes)
    await queryInterface.sequelize.query(`
      UPDATE reservations
      SET date_debut = TIMESTAMP(date, heure_debut),
          date_fin = TIMESTAMP(date, heure_fin)
      WHERE date IS NOT NULL
    `);

    // 3. Supprimer les anciennes colonnes
    await queryInterface.removeColumn('reservations', 'date');
    await queryInterface.removeColumn('reservations', 'heure_debut');
    await queryInterface.removeColumn('reservations', 'heure_fin');

    // 4. Rendre les nouvelles colonnes NOT NULL
    await queryInterface.changeColumn('reservations', 'date_debut', {
      type: Sequelize.DATE,
      allowNull: false
    });

    await queryInterface.changeColumn('reservations', 'date_fin', {
      type: Sequelize.DATE,
      allowNull: false
    });

    // 5. Ajouter les autres colonnes manquantes
    await queryInterface.addColumn('reservations', 'motif', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('reservations', 'nombre_participants', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('reservations', 'equipements_supplementaires', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('reservations', 'prix_total', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('reservations', 'commentaire_admin', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('reservations', 'validee_par', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('reservations', 'validee_le', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // 6. Renommer equipements_attribues en equipements_attribues (si différent)
    // et modifier le statut ENUM
    await queryInterface.changeColumn('reservations', 'statut', {
      type: Sequelize.ENUM('en_attente', 'validee', 'rejetee', 'confirmee', 'annulee', 'terminee'),
      allowNull: false,
      defaultValue: 'en_attente'
    });
  },

  async down(queryInterface, Sequelize) {
    // Retour à l'ancienne structure
    await queryInterface.changeColumn('reservations', 'statut', {
      type: Sequelize.ENUM('en_attente', 'validée', 'annulée'),
      allowNull: false,
      defaultValue: 'en_attente'
    });

    await queryInterface.removeColumn('reservations', 'validee_le');
    await queryInterface.removeColumn('reservations', 'validee_par');
    await queryInterface.removeColumn('reservations', 'commentaire_admin');
    await queryInterface.removeColumn('reservations', 'prix_total');
    await queryInterface.removeColumn('reservations', 'equipements_supplementaires');
    await queryInterface.removeColumn('reservations', 'nombre_participants');
    await queryInterface.removeColumn('reservations', 'motif');

    await queryInterface.addColumn('reservations', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });

    await queryInterface.addColumn('reservations', 'heure_debut', {
      type: Sequelize.TIME,
      allowNull: false
    });

    await queryInterface.addColumn('reservations', 'heure_fin', {
      type: Sequelize.TIME,
      allowNull: false
    });

    await queryInterface.removeColumn('reservations', 'date_fin');
    await queryInterface.removeColumn('reservations', 'date_debut');
  }
};
