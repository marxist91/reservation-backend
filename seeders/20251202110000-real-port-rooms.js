'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('rooms', [
      {
        nom: 'Salle Administration Générale',
        description: 'Salle de réunion principale de l\'administration générale du port. Équipée pour les réunions de direction et sessions de travail.',
        capacite: 30,
        equipements: JSON.stringify([
          'Vidéoprojecteur',
          'Écran',
          'Tableau blanc',
          'WiFi',
          'Climatisation',
          'Système audio'
        ]),
        batiment: 'Bâtiment Administratif',
        etage: 'Rez-de-chaussée',
        superficie: 80.00,
        responsable_id: 2, // Jean Dupont
        statut: 'disponible',
        image_url: '/images/rooms/admin-generale.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle Port de Pêche',
        description: 'Salle dédiée aux réunions concernant les activités du port de pêche. Proche des quais de débarquement.',
        capacite: 20,
        equipements: JSON.stringify([
          'Écran TV',
          'Tableau blanc',
          'WiFi',
          'Téléphone de conférence'
        ]),
        batiment: 'Zone Port de Pêche',
        etage: '1er étage',
        superficie: 50.00,
        responsable_id: 3, // Sophie Martin
        statut: 'disponible',
        image_url: '/images/rooms/port-peche.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Réunion 2ème Étage',
        description: 'Salle polyvalente située au 2ème étage, idéale pour réunions de travail et sessions de formation.',
        capacite: 25,
        equipements: JSON.stringify([
          'Vidéoprojecteur',
          'Écran motorisé',
          'Tableau blanc',
          'WiFi',
          'Climatisation',
          'Machine à café'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '2ème étage',
        superficie: 65.00,
        responsable_id: 2, // Jean Dupont
        statut: 'disponible',
        image_url: '/images/rooms/reunion-2eme.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle TD',
        description: 'Salle de travaux dirigés et formations. Configuration modulable pour ateliers pratiques et sessions de formation.',
        capacite: 15,
        equipements: JSON.stringify([
          'Écran TV',
          'Tableau blanc',
          'WiFi',
          'Tables modulables',
          'Prises électriques multiples'
        ]),
        batiment: 'Bâtiment Formation',
        etage: '1er étage',
        superficie: 40.00,
        responsable_id: 3, // Sophie Martin
        statut: 'disponible',
        image_url: '/images/rooms/salle-td.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('rooms', {
      nom: {
        [Sequelize.Op.in]: [
          'Salle Administration Générale',
          'Salle Port de Pêche',
          'Salle de Réunion 2ème Étage',
          'Salle TD'
        ]
      }
    }, {});
  }
};
