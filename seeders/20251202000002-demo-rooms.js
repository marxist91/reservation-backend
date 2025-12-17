'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('rooms', [
      {
        nom: 'Salle de Conférence A',
        description: 'Grande salle de conférence moderne avec équipement audiovisuel complet. Idéale pour les présentations importantes et réunions plénières.',
        capacite: 50,
        equipements: JSON.stringify([
          'Vidéoprojecteur 4K',
          'Écran géant',
          'Système audio',
          'Microphones sans fil',
          'Visioconférence',
          'Tableau blanc interactif',
          'WiFi haut débit',
          'Climatisation'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '2ème étage',
        superficie: 120.50,
        responsable_id: 2, // Jean Dupont
        statut: 'disponible',
        image_url: '/images/rooms/conference-a.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Réunion B',
        description: 'Salle de réunion de taille moyenne, parfaite pour les réunions d\'équipe et brainstorming.',
        capacite: 20,
        equipements: JSON.stringify([
          'Écran TV 65"',
          'Tableau blanc',
          'WiFi',
          'Climatisation',
          'Téléphone conférence'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '1er étage',
        superficie: 45.00,
        responsable_id: 2,
        statut: 'disponible',
        image_url: '/images/rooms/reunion-b.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Formation',
        description: 'Salle spacieuse équipée pour les formations et ateliers. Disposition modulable.',
        capacite: 30,
        equipements: JSON.stringify([
          'Projecteur',
          'Écran',
          'Tables modulables',
          'WiFi',
          'Tableau blanc',
          'Paperboard',
          'Climatisation'
        ]),
        batiment: 'Bâtiment Annexe',
        etage: 'Rez-de-chaussée',
        superficie: 80.00,
        responsable_id: 3, // Sophie Martin
        statut: 'disponible',
        image_url: '/images/rooms/formation.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Bureau Partagé 1',
        description: 'Espace de travail collaboratif avec postes individuels.',
        capacite: 6,
        equipements: JSON.stringify([
          'WiFi',
          'Prises électriques',
          'Éclairage LED',
          'Casiers sécurisés'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '3ème étage',
        superficie: 25.00,
        responsable_id: 2,
        statut: 'disponible',
        image_url: '/images/rooms/bureau-1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Créativité',
        description: 'Espace créatif avec mobilier design pour sessions de brainstorming.',
        capacite: 12,
        equipements: JSON.stringify([
          'Tableaux blancs muraux',
          'Post-it et marqueurs',
          'Mobilier modulable',
          'WiFi',
          'Ambiance lumineuse réglable',
          'Enceinte Bluetooth'
        ]),
        batiment: 'Bâtiment Annexe',
        etage: '1er étage',
        superficie: 40.00,
        responsable_id: 3,
        statut: 'disponible',
        image_url: '/images/rooms/creativite.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle Multimédia',
        description: 'Salle équipée pour présentations multimédias et vidéoconférences.',
        capacite: 15,
        equipements: JSON.stringify([
          'Écran 85"',
          'Caméra HD',
          'Système audio professionnel',
          'Éclairage studio',
          'WiFi fibre',
          'Climatisation'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '2ème étage',
        superficie: 50.00,
        responsable_id: 2,
        statut: 'disponible',
        image_url: '/images/rooms/multimedia.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle du Conseil',
        description: 'Salle prestigieuse pour réunions de direction et conseils d\'administration.',
        capacite: 25,
        equipements: JSON.stringify([
          'Table en bois massif',
          'Écrans muraux',
          'Système visio haut de gamme',
          'Tableau interactif',
          'WiFi',
          'Service traiteur disponible',
          'Climatisation'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '4ème étage',
        superficie: 70.00,
        responsable_id: 2,
        statut: 'disponible',
        image_url: '/images/rooms/conseil.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Espace Détente',
        description: 'Zone informelle pour pauses et réunions décontractées.',
        capacite: 10,
        equipements: JSON.stringify([
          'Canapés',
          'Tables basses',
          'WiFi',
          'Machine à café',
          'Distributeur'
        ]),
        batiment: 'Bâtiment Annexe',
        etage: 'Rez-de-chaussée',
        superficie: 35.00,
        responsable_id: 3,
        statut: 'disponible',
        image_url: '/images/rooms/detente.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Réunion C',
        description: 'Petite salle pour réunions privées et entretiens.',
        capacite: 8,
        equipements: JSON.stringify([
          'Table ovale',
          'Écran TV',
          'WiFi',
          'Tableau blanc',
          'Climatisation'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '1er étage',
        superficie: 20.00,
        responsable_id: 2,
        statut: 'disponible',
        image_url: '/images/rooms/reunion-c.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Réunion D',
        description: 'Salle équipée en maintenance suite à rénovation.',
        capacite: 15,
        equipements: JSON.stringify([
          'Projecteur',
          'Écran',
          'WiFi'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '3ème étage',
        superficie: 40.00,
        responsable_id: 2,
        statut: 'maintenance',
        image_url: '/images/rooms/reunion-d.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Auditorium',
        description: 'Grand auditorium pour événements, conférences et séminaires.',
        capacite: 150,
        equipements: JSON.stringify([
          'Scène équipée',
          'Système son professionnel',
          'Éclairage scénique',
          'Projection 4K',
          'Gradins',
          'Régie technique',
          'WiFi',
          'Climatisation'
        ]),
        batiment: 'Bâtiment Annexe',
        etage: 'Rez-de-chaussée',
        superficie: 250.00,
        responsable_id: 3,
        statut: 'disponible',
        image_url: '/images/rooms/auditorium.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Salle de Visioconférence',
        description: 'Salle dédiée aux visioconférences avec équipement de pointe.',
        capacite: 10,
        equipements: JSON.stringify([
          'Caméras PTZ',
          'Micros directionnels',
          'Écrans multiples',
          'Connexion fibre dédiée',
          'Insonorisation',
          'Éclairage adapté'
        ]),
        batiment: 'Bâtiment Principal',
        etage: '2ème étage',
        superficie: 30.00,
        responsable_id: 2,
        statut: 'disponible',
        image_url: '/images/rooms/visio.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('rooms', null, {});
  }
};

