'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Dates pour les réservations
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setHours(10, 0, 0, 0);
    
    return queryInterface.bulkInsert('reservations', [
      // Réservation validée pour demain
      {
        user_id: 4, // Pierre Bernard
        room_id: 1, // Salle de Conférence A
        date_debut: tomorrow,
        date_fin: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2h
        statut: 'validee',
        motif: 'Présentation trimestrielle des résultats',
        nombre_participants: 45,
        equipements_supplementaires: JSON.stringify(['Micro-cravate', 'Enregistrement vidéo']),
        commentaire_admin: 'Réservation approuvée. Traiteur confirmé.',
        validee_par: 1, // Admin
        validee_le: now,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation en attente
      {
        user_id: 5, // Marie Dubois
        room_id: 3, // Salle de Formation
        date_debut: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // Demain 12h
        date_fin: new Date(tomorrow.getTime() + 7 * 60 * 60 * 1000), // Demain 16h
        statut: 'en_attente',
        motif: 'Formation sur les nouveaux processus RH',
        nombre_participants: 25,
        equipements_supplementaires: JSON.stringify(['Support papier', 'Badges participants']),
        commentaire_admin: null,
        validee_par: null,
        validee_le: null,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation confirmée pour la semaine prochaine
      {
        user_id: 6, // Thomas Laurent
        room_id: 6, // Salle Multimédia
        date_debut: nextWeek,
        date_fin: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000), // +3h
        statut: 'confirmee',
        motif: 'Webinaire technique - Cybersécurité',
        nombre_participants: 12,
        equipements_supplementaires: JSON.stringify(['Streaming en direct']),
        commentaire_admin: 'Streaming autorisé. IT support confirmé.',
        validee_par: 2, // Jean Dupont (responsable)
        validee_le: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: now
      },
      
      // Réservation annulée
      {
        user_id: 7, // Julie Simon
        room_id: 2, // Salle de Réunion B
        date_debut: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        date_fin: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1h
        statut: 'annulee',
        motif: 'Réunion d\'audit comptable',
        nombre_participants: 8,
        equipements_supplementaires: null,
        commentaire_admin: 'Annulée à la demande de l\'utilisateur (report)',
        validee_par: null,
        validee_le: null,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: now
      },
      
      // Réservation pour le mois prochain
      {
        user_id: 8, // David Michel
        room_id: 7, // Salle du Conseil
        date_debut: nextMonth,
        date_fin: new Date(nextMonth.getTime() + 4 * 60 * 60 * 1000), // +4h
        statut: 'validee',
        motif: 'Conseil d\'administration mensuel',
        nombre_participants: 20,
        equipements_supplementaires: JSON.stringify(['Service traiteur', 'Documents confidentiels']),
        commentaire_admin: 'Réservation récurrente approuvée.',
        validee_par: 1,
        validee_le: now,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation en attente pour bureau partagé
      {
        user_id: 4,
        room_id: 4, // Bureau Partagé 1
        date_debut: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        date_fin: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // +5h
        statut: 'en_attente',
        motif: 'Journée de télétravail au bureau',
        nombre_participants: 4,
        equipements_supplementaires: null,
        commentaire_admin: null,
        validee_par: null,
        validee_le: null,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation rejetée
      {
        user_id: 5,
        room_id: 11, // Auditorium
        date_debut: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // Dans 10 jours
        date_fin: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // +6h
        statut: 'rejetee',
        motif: 'Grand séminaire RH',
        nombre_participants: 120,
        equipements_supplementaires: JSON.stringify(['Scène', 'Sonorisation']),
        commentaire_admin: 'Budget non approuvé. Merci de revoir avec la direction.',
        validee_par: 1,
        validee_le: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: now
      },
      
      // Réservation terminée (passée)
      {
        user_id: 6,
        room_id: 5, // Salle de Créativité
        date_debut: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        date_fin: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3h
        statut: 'terminee',
        motif: 'Atelier design thinking',
        nombre_participants: 10,
        equipements_supplementaires: JSON.stringify(['Post-it', 'Marqueurs couleur']),
        commentaire_admin: 'Session réussie. Salle bien rangée.',
        validee_par: 3, // Sophie Martin
        validee_le: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      
      // Réservation salle visio - confirmée
      {
        user_id: 7,
        room_id: 12, // Salle de Visioconférence
        date_debut: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000), // Demain 14h
        date_fin: new Date(tomorrow.getTime() + 6.5 * 60 * 60 * 1000), // Demain 15h30
        statut: 'confirmee',
        motif: 'Visioconférence avec partenaires internationaux',
        nombre_participants: 6,
        equipements_supplementaires: JSON.stringify(['Traduction simultanée']),
        commentaire_admin: 'Service traduction réservé.',
        validee_par: 2,
        validee_le: now,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: now
      },
      
      // Réservation espace détente
      {
        user_id: 8,
        room_id: 8, // Espace Détente
        date_debut: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Demain
        date_fin: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2h
        statut: 'validee',
        motif: 'Pause café équipe projet',
        nombre_participants: 8,
        equipements_supplementaires: null,
        commentaire_admin: 'Café et viennoiseries commandés.',
        validee_par: 3,
        validee_le: now,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('reservations', null, {});
  }
};

