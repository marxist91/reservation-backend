/**
 * Tests du Modèle Reservation
 * 
 * Ce fichier teste toutes les fonctionnalités du modèle Reservation :
 * - Validation des champs
 * - Contraintes de base de données
 * - Règles métier (dates, heures, conflits)
 * - Associations avec d'autres modèles
 * - Gestion des statuts
 * - Opérations CRUD complexes
 */

const { Reservation, User, Room } = require('../../models');
const { Op } = require('sequelize');

describe('📅 Modèle Reservation - Tests Complets', () => {

  describe('Validation des Champs', () => {
    
    test('devrait créer une réservation valide avec tous les champs requis', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      };

      const reservation = await Reservation.create(reservationData);
      
      expect(reservation).toBeDefined();
      expect(reservation.id).toBeDefined();
      expect(reservation.user_id).toBe(reservationData.user_id);
      expect(reservation.room_id).toBe(reservationData.room_id);
      expect(reservation.date).toBe(reservationData.date);
      expect(reservation.heure_debut).toBe(reservationData.heure_debut);
      expect(reservation.heure_fin).toBe(reservationData.heure_fin);
      expect(reservation.statut).toBe(reservationData.statut);
    });

    test('devrait rejeter une réservation sans user_id', async () => {
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait rejeter une réservation sans room_id', async () => {
      const user = await global.testUtils.createTestUser();
      
      const reservationData = {
        user_id: user.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait rejeter une réservation sans date', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait rejeter une réservation sans heure_debut', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_fin: '10:00',
        statut: 'en_attente'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait rejeter une réservation sans heure_fin', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        statut: 'en_attente'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait accepter une réservation sans statut (valeur par défaut)', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
        // pas de statut spécifié
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.statut).toBe('en_attente'); // valeur par défaut
    });
  });

  describe('Validation des Formats', () => {
    
    test('devrait accepter une date au format YYYY-MM-DD', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-25',
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.date).toBe('2025-12-25');
    });

    test('devrait rejeter une date au mauvais format', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '25/12/2025', // mauvais format
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait accepter une heure au format HH:MM', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '14:30',
        heure_fin: '16:45'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.heure_debut).toBe('14:30');
      expect(reservation.heure_fin).toBe('16:45');
    });

    test('devrait rejeter une heure au mauvais format', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '2:30 PM', // mauvais format
        heure_fin: '10:00'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });
  });

  describe('Validation des Statuts', () => {
    
    test('devrait accepter tous les statuts valides', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      const statuts = ['en_attente', 'confirmee', 'annulee', 'terminee'];
      
      for (const statut of statuts) {
        const reservationData = {
          user_id: user.id,
          room_id: room.id,
          date: `2025-12-0${statuts.indexOf(statut) + 1}`,
          heure_debut: '09:00',
          heure_fin: '10:00',
          statut: statut
        };

        const reservation = await Reservation.create(reservationData);
        expect(reservation.statut).toBe(statut);
      }
    });

    test('devrait rejeter un statut invalide', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'statut_inexistant'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });
  });

  describe('Contraintes de Base de Données', () => {
    
    test('devrait valider la clé étrangère user_id', async () => {
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: 99999, // ID inexistant
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait valider la clé étrangère room_id', async () => {
      const user = await global.testUtils.createTestUser();
      
      const reservationData = {
        user_id: user.id,
        room_id: 99999, // ID inexistant
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow();
    });

    test('devrait permettre plusieurs réservations pour le même utilisateur', async () => {
      const user = await global.testUtils.createTestUser();
      const room1 = await global.testUtils.createTestRoom();
      const room2 = await global.testUtils.createTestRoom();
      
      const reservation1 = await Reservation.create({
        user_id: user.id,
        room_id: room1.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservation2 = await Reservation.create({
        user_id: user.id,
        room_id: room2.id,
        date: '2025-12-02',
        heure_debut: '14:00',
        heure_fin: '15:00'
      });

      expect(reservation1.user_id).toBe(user.id);
      expect(reservation2.user_id).toBe(user.id);
    });

    test('devrait permettre plusieurs réservations pour la même salle à des moments différents', async () => {
      const user1 = await global.testUtils.createTestUser();
      const user2 = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation1 = await Reservation.create({
        user_id: user1.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservation2 = await Reservation.create({
        user_id: user2.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '11:00',
        heure_fin: '12:00'
      });

      expect(reservation1.room_id).toBe(room.id);
      expect(reservation2.room_id).toBe(room.id);
    });
  });

  describe('Règles Métier - Validation des Heures', () => {
    
    test('devrait rejeter une réservation où heure_fin <= heure_debut', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '10:00',
        heure_fin: '09:00' // fin avant début
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow(/heure_fin doit être après heure_debut/);
    });

    test('devrait rejeter une réservation où heure_fin = heure_debut', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '10:00',
        heure_fin: '10:00' // même heure
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow(/heure_fin doit être après heure_debut/);
    });

    test('devrait accepter une réservation d\'une minute', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '10:00',
        heure_fin: '10:01'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation).toBeDefined();
    });

    test('devrait accepter une réservation de plusieurs heures', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '17:00'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation).toBeDefined();
    });
  });

  describe('Règles Métier - Validation des Dates', () => {
    
    test('devrait rejeter une réservation dans le passé', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const hier = new Date();
      hier.setDate(hier.getDate() - 1);
      const dateHier = hier.toISOString().split('T')[0];
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: dateHier,
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      await expect(Reservation.create(reservationData)).rejects.toThrow(/La date de réservation ne peut pas être dans le passé/);
    });

    test('devrait accepter une réservation pour aujourd\'hui', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const aujourd_hui = new Date().toISOString().split('T')[0];
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: aujourd_hui,
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.date).toBe(aujourd_hui);
    });

    test('devrait accepter une réservation pour demain', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const demain = new Date();
      demain.setDate(demain.getDate() + 1);
      const dateDemain = demain.toISOString().split('T')[0];
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: dateDemain,
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.date).toBe(dateDemain);
    });
  });

  describe('Associations avec d\'autres Modèles', () => {
    
    test('devrait avoir une association avec l\'utilisateur', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationWithUser = await Reservation.findByPk(reservation.id, {
        include: [{ model: User, as: 'user' }]
      });

      expect(reservationWithUser.user).toBeDefined();
      expect(reservationWithUser.user.id).toBe(user.id);
      expect(reservationWithUser.user.email).toBe(user.email);
    });

    test('devrait avoir une association avec la salle', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationWithRoom = await Reservation.findByPk(reservation.id, {
        include: [{ model: Room, as: 'room' }]
      });

      expect(reservationWithRoom.room).toBeDefined();
      expect(reservationWithRoom.room.id).toBe(room.id);
      expect(reservationWithRoom.room.nom).toBe(room.nom);
    });

    test('devrait pouvoir charger les deux associations en même temps', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationComplete = await Reservation.findByPk(reservation.id, {
        include: [
          { model: User, as: 'user' },
          { model: Room, as: 'room' }
        ]
      });

      expect(reservationComplete.user).toBeDefined();
      expect(reservationComplete.room).toBeDefined();
      expect(reservationComplete.user.id).toBe(user.id);
      expect(reservationComplete.room.id).toBe(room.id);
    });
  });

  describe('Opérations CRUD', () => {
    
    test('devrait pouvoir lire une réservation par ID', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });
      
      const foundReservation = await Reservation.findByPk(reservation.id);
      
      expect(foundReservation).toBeDefined();
      expect(foundReservation.id).toBe(reservation.id);
      expect(foundReservation.user_id).toBe(user.id);
    });

    test('devrait pouvoir mettre à jour le statut d\'une réservation', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      });
      
      await reservation.update({ statut: 'confirmee' });
      
      expect(reservation.statut).toBe('confirmee');
      
      // Vérifier en base
      const updatedReservation = await Reservation.findByPk(reservation.id);
      expect(updatedReservation.statut).toBe('confirmee');
    });

    test('devrait pouvoir supprimer une réservation', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });
      
      const reservationId = reservation.id;
      
      await reservation.destroy();
      
      const deletedReservation = await Reservation.findByPk(reservationId);
      expect(deletedReservation).toBeNull();
    });

    test('devrait pouvoir lister toutes les réservations', async () => {
      const user = await global.testUtils.createTestUser();
      const room1 = await global.testUtils.createTestRoom();
      const room2 = await global.testUtils.createTestRoom();
      
      const reservation1 = await Reservation.create({
        user_id: user.id,
        room_id: room1.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservation2 = await Reservation.create({
        user_id: user.id,
        room_id: room2.id,
        date: '2025-12-02',
        heure_debut: '14:00',
        heure_fin: '15:00'
      });
      
      const reservations = await Reservation.findAll();
      
      expect(reservations.length).toBeGreaterThanOrEqual(2);
      const reservationIds = reservations.map(r => r.id);
      expect(reservationIds).toContain(reservation1.id);
      expect(reservationIds).toContain(reservation2.id);
    });
  });

  describe('Requêtes Avancées', () => {
    
    test('devrait pouvoir filtrer les réservations par statut', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationConfirmee = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'confirmee'
      });

      const reservationAnnulee = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-02',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'annulee'
      });

      const reservationsConfirmees = await Reservation.findAll({
        where: { statut: 'confirmee' }
      });

      const reservationIds = reservationsConfirmees.map(r => r.id);
      expect(reservationIds).toContain(reservationConfirmee.id);
      expect(reservationIds).not.toContain(reservationAnnulee.id);
    });

    test('devrait pouvoir filtrer les réservations par utilisateur', async () => {
      const user1 = await global.testUtils.createTestUser();
      const user2 = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationUser1 = await Reservation.create({
        user_id: user1.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationUser2 = await Reservation.create({
        user_id: user2.id,
        room_id: room.id,
        date: '2025-12-02',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationsUser1 = await Reservation.findAll({
        where: { user_id: user1.id }
      });

      const reservationIds = reservationsUser1.map(r => r.id);
      expect(reservationIds).toContain(reservationUser1.id);
      expect(reservationIds).not.toContain(reservationUser2.id);
    });

    test('devrait pouvoir filtrer les réservations par salle', async () => {
      const user = await global.testUtils.createTestUser();
      const room1 = await global.testUtils.createTestRoom();
      const room2 = await global.testUtils.createTestRoom();
      
      const reservationRoom1 = await Reservation.create({
        user_id: user.id,
        room_id: room1.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationRoom2 = await Reservation.create({
        user_id: user.id,
        room_id: room2.id,
        date: '2025-12-02',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationsRoom1 = await Reservation.findAll({
        where: { room_id: room1.id }
      });

      const reservationIds = reservationsRoom1.map(r => r.id);
      expect(reservationIds).toContain(reservationRoom1.id);
      expect(reservationIds).not.toContain(reservationRoom2.id);
    });

    test('devrait pouvoir filtrer les réservations par date', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation1 = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservation2 = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-15',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationsDecembre = await Reservation.findAll({
        where: {
          date: {
            [Op.between]: ['2025-12-01', '2025-12-31']
          }
        }
      });

      const reservationIds = reservationsDecembre.map(r => r.id);
      expect(reservationIds).toContain(reservation1.id);
      expect(reservationIds).toContain(reservation2.id);
    });

    test('devrait pouvoir détecter les conflits d\'horaires', async () => {
      const user1 = await global.testUtils.createTestUser();
      const user2 = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      // Première réservation
      await Reservation.create({
        user_id: user1.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '11:00'
      });

      // Chercher les conflits pour une nouvelle réservation
      const nouvelleReservation = {
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '10:00',
        heure_fin: '12:00'
      };

      const conflits = await Reservation.findAll({
        where: {
          room_id: nouvelleReservation.room_id,
          date: nouvelleReservation.date,
          statut: {
            [Op.in]: ['en_attente', 'confirmee']
          },
          [Op.or]: [
            {
              heure_debut: {
                [Op.lt]: nouvelleReservation.heure_fin
              },
              heure_fin: {
                [Op.gt]: nouvelleReservation.heure_debut
              }
            }
          ]
        }
      });

      expect(conflits.length).toBeGreaterThan(0);
    });
  });

  describe('Cas Limites et Gestion d\'Erreurs', () => {
    
    test('devrait retourner null pour une réservation inexistante', async () => {
      const nonExistentReservation = await Reservation.findByPk(99999);
      expect(nonExistentReservation).toBeNull();
    });

    test('devrait gérer les heures limites (00:00 et 23:59)', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '00:00',
        heure_fin: '23:59'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.heure_debut).toBe('00:00');
      expect(reservation.heure_fin).toBe('23:59');
    });

    test('devrait gérer les dates limites', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationData = {
        user_id: user.id,
        room_id: room.id,
        date: '2099-12-31', // date très future
        heure_debut: '09:00',
        heure_fin: '10:00'
      };

      const reservation = await Reservation.create(reservationData);
      expect(reservation.date).toBe('2099-12-31');
    });

    test('devrait gérer la suppression en cascade quand l\'utilisateur est supprimé', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationId = reservation.id;
      
      // Supprimer l'utilisateur
      await user.destroy();
      
      // Vérifier que la réservation a été supprimée aussi
      const deletedReservation = await Reservation.findByPk(reservationId);
      expect(deletedReservation).toBeNull();
    });

    test('devrait gérer la suppression en cascade quand la salle est supprimée', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00'
      });

      const reservationId = reservation.id;
      
      // Supprimer la salle
      await room.destroy();
      
      // Vérifier que la réservation a été supprimée aussi
      const deletedReservation = await Reservation.findByPk(reservationId);
      expect(deletedReservation).toBeNull();
    });
  });

  describe('Transitions de Statut', () => {
    
    test('devrait pouvoir passer de en_attente à confirmee', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      });

      await reservation.update({ statut: 'confirmee' });
      expect(reservation.statut).toBe('confirmee');
    });

    test('devrait pouvoir passer de en_attente à annulee', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      });

      await reservation.update({ statut: 'annulee' });
      expect(reservation.statut).toBe('annulee');
    });

    test('devrait pouvoir passer de confirmee à terminee', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'confirmee'
      });

      await reservation.update({ statut: 'terminee' });
      expect(reservation.statut).toBe('terminee');
    });

    test('devrait pouvoir passer de confirmee à annulee', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'confirmee'
      });

      await reservation.update({ statut: 'annulee' });
      expect(reservation.statut).toBe('annulee');
    });
  });

  describe('Méthodes Utilitaires', () => {
    
    test('devrait pouvoir calculer la durée d\'une réservation', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '11:30'
      });

      // Calculer la durée en minutes
      const [heureDebut, minuteDebut] = reservation.heure_debut.split(':').map(Number);
      const [heureFin, minuteFin] = reservation.heure_fin.split(':').map(Number);
      
      const minutesDebut = heureDebut * 60 + minuteDebut;
      const minutesFin = heureFin * 60 + minuteFin;
      const dureeMinutes = minutesFin - minutesDebut;
      
      expect(dureeMinutes).toBe(150); // 2h30 = 150 minutes
    });

    test('devrait pouvoir vérifier si une réservation est active', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservationActive = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'confirmee'
      });

      const reservationAnnulee = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-02',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'annulee'
      });

      const statutsActifs = ['en_attente', 'confirmee'];
      
      expect(statutsActifs.includes(reservationActive.statut)).toBe(true);
      expect(statutsActifs.includes(reservationAnnulee.statut)).toBe(false);
    });
  });
});