'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Supprimer l’ancien ENUM (MySQL ne le supporte pas directement, donc on contourne)
    await queryInterface.changeColumn('Reservations', 'statut', {
      type: Sequelize.STRING
    });

    // 2️⃣ Remplacer avec le nouveau ENUM étendu
    await queryInterface.changeColumn('Reservations', 'statut', {
      type: Sequelize.ENUM('en_attente', 'validée', 'annulée'),
      allowNull: false,
      defaultValue: 'en_attente'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revenir à l’ancienne définition si besoin
    await queryInterface.changeColumn('Reservations', 'statut', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Supprimer l’ENUM type (utile surtout en PostgreSQL)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Reservations_statut";'
    );
  }
};