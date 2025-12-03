'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Dates pour les réservations (exemples)
    const demain = new Date(now);
    demain.setDate(demain.getDate() + 1);
    demain.setHours(9, 0, 0, 0);
    
    const apresdemain = new Date(now);
    apresdemain.setDate(apresdemain.getDate() + 2);
    apresdemain.setHours(14, 0, 0, 0);
    
    const semaineProchaine = new Date(now);
    semaineProchaine.setDate(semaineProchaine.getDate() + 7);
    semaineProchaine.setHours(10, 0, 0, 0);
    
    return queryInterface.bulkInsert('reservations', [
      // Réservation validée - Réunion direction
      {
        user_id: 4, // Pierre Bernard
        room_id: 1, // Salle Administration Générale
        date_debut: demain,
        date_fin: new Date(demain.getTime() + 2 * 60 * 60 * 1000), // +2h
        statut: 'validee',
        motif: 'Réunion de direction mensuelle',
        nombre_participants: 20,
        equipements_supplementaires: JSON.stringify(['Café', 'Viennoiseries']),
        commentaire_admin: 'Réservation approuvée',
        validee_par: 1, // Admin
        validee_le: now,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation en attente - Formation sécurité
      {
        user_id: 5, // Marie Dubois
        room_id: 4, // Salle TD
        date_debut: new Date(demain.getTime() + 3 * 60 * 60 * 1000), // Demain 12h
        date_fin: new Date(demain.getTime() + 6 * 60 * 60 * 1000), // Demain 15h
        statut: 'en_attente',
        motif: 'Formation sécurité portuaire',
        nombre_participants: 12,
        equipements_supplementaires: JSON.stringify(['Vidéoprojecteur', 'Supports papier']),
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation confirmée - Point hebdomadaire pêche
      {
        user_id: 6, // Thomas Laurent
        room_id: 2, // Salle Port de Pêche
        date_debut: apresdemain,
        date_fin: new Date(apresdemain.getTime() + 1.5 * 60 * 60 * 1000), // +1h30
        statut: 'confirmee',
        motif: 'Point hebdomadaire exploitation port de pêche',
        nombre_participants: 8,
        equipements_supplementaires: null,
        validee_par: 2, // Jean Dupont (responsable)
        validee_le: now,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation annulée - Report météo
      {
        user_id: 7, // Sophie Martin
        room_id: 3, // Salle Réunion 2ème étage
        date_debut: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        date_fin: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        statut: 'annulee',
        motif: 'Comité météo et sécurité navigation',
        nombre_participants: 10,
        equipements_supplementaires: null,
        commentaire_admin: 'Annulée à la demande de l\'organisateur - report prévu',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: now
      },
      
      // Réservation terminée - Formation terminée
      {
        user_id: 4,
        room_id: 4, // Salle TD
        date_debut: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        date_fin: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4h
        statut: 'terminee',
        motif: 'Formation ISPS - Sûreté portuaire',
        nombre_participants: 15,
        equipements_supplementaires: JSON.stringify(['Supports de cours', 'Attestations']),
        validee_par: 1,
        validee_le: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      
      // Réservation future - Réunion coordination
      {
        user_id: 6,
        room_id: 1, // Salle Administration Générale
        date_debut: semaineProchaine,
        date_fin: new Date(semaineProchaine.getTime() + 3 * 60 * 60 * 1000), // +3h
        statut: 'validee',
        motif: 'Réunion de coordination des services',
        nombre_participants: 25,
        equipements_supplementaires: JSON.stringify(['Déjeuner léger']),
        validee_par: 1,
        validee_le: now,
        createdAt: now,
        updatedAt: now
      },
      
      // Réservation rejetée - Conflit planning
      {
        user_id: 8, // David Michel
        room_id: 2, // Salle Port de Pêche
        date_debut: new Date(demain.getTime() + 5 * 60 * 60 * 1000), // Demain 14h
        date_fin: new Date(demain.getTime() + 8 * 60 * 60 * 1000), // Demain 17h
        statut: 'rejetee',
        motif: 'Audit criées et ventes',
        nombre_participants: 5,
        equipements_supplementaires: null,
        commentaire_admin: 'Salle indisponible - maintenance prévue',
        validee_par: 2,
        validee_le: now,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: now
      },
      
      // Réservation validée - Comité de pilotage
      {
        user_id: 5,
        room_id: 3, // Salle Réunion 2ème étage
        date_debut: new Date(semaineProchaine.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 9 jours
        date_fin: new Date(semaineProchaine.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        statut: 'validee',
        motif: 'Comité de pilotage projet modernisation',
        nombre_participants: 18,
        equipements_supplementaires: JSON.stringify(['Vidéoprojection', 'Visioconférence']),
        validee_par: 1,
        validee_le: now,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('reservations', null, {});
  }
};
