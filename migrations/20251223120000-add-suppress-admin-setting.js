"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne dans la table settings
    await queryInterface.addColumn('settings', 'suppress_admin_if_responsable_notified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Si true: n\'envoie pas d\'emails aux admins quand le responsable de la salle est notifié'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('settings', 'suppress_admin_if_responsable_notified');
  }
};
