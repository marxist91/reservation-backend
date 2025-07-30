/**
 * Tests du Modèle Room
 * 
 * Ce fichier teste toutes les fonctionnalités du modèle Room :
 * - Validation des champs
 * - Contraintes de base de données
 * - Associations avec d'autres modèles
 * - Gestion des équipements
 * - Opérations CRUD
 */

const { Room, User, Reservation } = require('../../models');

describe('🏢 Modèle Room - Tests Complets', () => {

  describe('Validation des Champs', () => {
    
    test('devrait créer une salle valide avec tous les champs requis', async () => {
      const responsable = await global.testUtils.createTestUser();
      
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        responsable_id: responsable.id
      };

      const room = await Room.create(roomData);
      
      expect(room).toBeDefined();
      expect(room.id).toBeDefined();
      expect(room.nom).toBe(roomData.nom);
      expect(room.capacite).toBe(roomData.capacite);
      expect(room.responsable_id).toBe(roomData.responsable_id);
      expect(room.disponible).toBe(true); // valeur par défaut
    });

    test('devrait rejeter une salle sans nom', async () => {
      const responsable = await global.testUtils.createTestUser();
      
      const roomData = {
        capacite: 20,
        responsable_id: responsable.id
      };

      await expect(Room.create(roomData)).rejects.toThrow();
    });

    test('devrait rejeter une salle sans capacité', async () => {
      const responsable = await global.testUtils.createTestUser();
      
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        responsable_id: responsable.id
      };

      await expect(Room.create(roomData)).rejects.toThrow();
    });

    test('devrait accepter une salle sans responsable', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 15
        // pas de responsable_id
      };

      const room = await Room.create(roomData);
      expect(room.responsable_id).toBeNull();
    });

    test('devrait rejeter une capacité négative', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: -5
      };

      await expect(Room.create(roomData)).rejects.toThrow(/Validation min/);
    });

    test('devrait rejeter une capacité de zéro', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 0
      };

      await expect(Room.create(roomData)).rejects.toThrow(/Validation min/);
    });

    test('devrait accepter une capacité de 1', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 1
      };

      const room = await Room.create(roomData);
      expect(room.capacite).toBe(1);
    });

    test('devrait accepter une grande capacité', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 1000
      };

      const room = await Room.create(roomData);
      expect(room.capacite).toBe(1000);
    });
  });

  describe('Contraintes de Base de Données', () => {
    
    test('devrait rejeter des noms de salle en double', async () => {
      const nomSalle = `Salle Unique ${Date.now()}`;
      
      const roomData1 = {
        nom: nomSalle,
        capacite: 10
      };

      const roomData2 = {
        nom: nomSalle, // même nom
        capacite: 20
      };

      await Room.create(roomData1);
      await expect(Room.create(roomData2)).rejects.toThrow(/nom must be unique/);
    });

    test('devrait permettre des capacités identiques', async () => {
      const capacite = 25;
      
      const room1 = await Room.create({
        nom: `Salle 1 ${Date.now()}`,
        capacite: capacite
      });

      const room2 = await Room.create({
        nom: `Salle 2 ${Date.now()}`,
        capacite: capacite // même capacité
      });

      expect(room1.capacite).toBe(capacite);
      expect(room2.capacite).toBe(capacite);
    });

    test('devrait valider la clé étrangère responsable_id', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 10,
        responsable_id: 99999 // ID inexistant
      };

      await expect(Room.create(roomData)).rejects.toThrow();
    });
  });

  describe('Gestion des Équipements', () => {
    
    test('devrait accepter une liste d\'équipements valide', async () => {
      const equipements = ['projecteur', 'tableau', 'wifi', 'climatisation'];
      
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        equipements: equipements
      };

      const room = await Room.create(roomData);
      expect(room.equipements).toEqual(equipements);
    });

    test('devrait accepter une liste d\'équipements vide', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        equipements: []
      };

      const room = await Room.create(roomData);
      expect(room.equipements).toEqual([]);
    });

    test('devrait accepter null pour les équipements', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        equipements: null
      };

      const room = await Room.create(roomData);
      expect(room.equipements).toBeNull();
    });

    test('devrait pouvoir mettre à jour les équipements', async () => {
      const room = await global.testUtils.createTestRoom();
      const nouveauxEquipements = ['ordinateur', 'imprimante', 'scanner'];
      
      await room.update({ equipements: nouveauxEquipements });
      
      expect(room.equipements).toEqual(nouveauxEquipements);
      
      // Vérifier en base
      const updatedRoom = await Room.findByPk(room.id);
      expect(updatedRoom.equipements).toEqual(nouveauxEquipements);
    });
  });

  describe('Valeurs par Défaut', () => {
    
    test('devrait définir disponible à true par défaut', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 15
        // pas de disponible spécifié
      };

      const room = await Room.create(roomData);
      expect(room.disponible).toBe(true);
    });

    test('devrait permettre de définir disponible à false', async () => {
      const roomData = {
        nom: `Salle Test ${Date.now()}`,
        capacite: 15,
        disponible: false
      };

      const room = await Room.create(roomData);
      expect(room.disponible).toBe(false);
    });

    test('devrait définir les timestamps automatiquement', async () => {
      const room = await global.testUtils.createTestRoom();
      
      expect(room.createdAt).toBeDefined();
      expect(room.updatedAt).toBeDefined();
      expect(room.createdAt).toBeInstanceOf(Date);
      expect(room.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Associations avec d\'autres Modèles', () => {
    
    test('devrait avoir une association avec le responsable (User)', async () => {
      const responsable = await global.testUtils.createTestUser();
      
      const room = await Room.create({
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        responsable_id: responsable.id
      });

      const roomWithResponsable = await Room.findByPk(room.id, {
        include: [{ model: User, as: 'responsable' }]
      });

      expect(roomWithResponsable.responsable).toBeDefined();
      expect(roomWithResponsable.responsable.id).toBe(responsable.id);
      expect(roomWithResponsable.responsable.email).toBe(responsable.email);
    });

    test('devrait avoir une association avec les réservations', async () => {
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

      const roomWithReservations = await Room.findByPk(room.id, {
        include: [{ model: Reservation, as: 'reservations' }]
      });

      expect(roomWithReservations.reservations).toBeDefined();
      expect(roomWithReservations.reservations).toHaveLength(1);
      expect(roomWithReservations.reservations[0].id).toBe(reservation.id);
    });

    test('devrait gérer une salle sans responsable', async () => {
      const room = await Room.create({
        nom: `Salle Test ${Date.now()}`,
        capacite: 20
        // pas de responsable_id
      });

      const roomWithResponsable = await Room.findByPk(room.id, {
        include: [{ model: User, as: 'responsable' }]
      });

      expect(roomWithResponsable.responsable).toBeNull();
    });
  });

  describe('Opérations CRUD', () => {
    
    test('devrait pouvoir lire une salle par ID', async () => {
      const room = await global.testUtils.createTestRoom();
      
      const foundRoom = await Room.findByPk(room.id);
      
      expect(foundRoom).toBeDefined();
      expect(foundRoom.id).toBe(room.id);
      expect(foundRoom.nom).toBe(room.nom);
    });

    test('devrait pouvoir lire une salle par nom', async () => {
      const room = await global.testUtils.createTestRoom();
      
      const foundRoom = await Room.findOne({ where: { nom: room.nom } });
      
      expect(foundRoom).toBeDefined();
      expect(foundRoom.id).toBe(room.id);
      expect(foundRoom.nom).toBe(room.nom);
    });

    test('devrait pouvoir mettre à jour une salle', async () => {
      const room = await global.testUtils.createTestRoom();
      const nouvelleCapacite = 50;
      
      await room.update({ capacite: nouvelleCapacite });
      
      expect(room.capacite).toBe(nouvelleCapacite);
      
      // Vérifier en base
      const updatedRoom = await Room.findByPk(room.id);
      expect(updatedRoom.capacite).toBe(nouvelleCapacite);
    });

    test('devrait pouvoir supprimer une salle', async () => {
      const room = await global.testUtils.createTestRoom();
      const roomId = room.id;
      
      await room.destroy();
      
      const deletedRoom = await Room.findByPk(roomId);
      expect(deletedRoom).toBeNull();
    });

    test('devrait pouvoir lister toutes les salles', async () => {
      const room1 = await global.testUtils.createTestRoom();
      const room2 = await global.testUtils.createTestRoom();
      
      const rooms = await Room.findAll();
      
      expect(rooms.length).toBeGreaterThanOrEqual(2);
      const roomIds = rooms.map(r => r.id);
      expect(roomIds).toContain(room1.id);
      expect(roomIds).toContain(room2.id);
    });

    test('devrait pouvoir filtrer les salles disponibles', async () => {
      const roomDisponible = await Room.create({
        nom: `Salle Disponible ${Date.now()}`,
        capacite: 20,
        disponible: true
      });

      const roomIndisponible = await Room.create({
        nom: `Salle Indisponible ${Date.now()}`,
        capacite: 15,
        disponible: false
      });

      const sallesDisponibles = await Room.findAll({
        where: { disponible: true }
      });

      const roomIds = sallesDisponibles.map(r => r.id);
      expect(roomIds).toContain(roomDisponible.id);
      expect(roomIds).not.toContain(roomIndisponible.id);
    });
  });

  describe('Requêtes Avancées', () => {
    
    test('devrait pouvoir filtrer par capacité minimale', async () => {
      const petiteSalle = await Room.create({
        nom: `Petite Salle ${Date.now()}`,
        capacite: 5
      });

      const grandeSalle = await Room.create({
        nom: `Grande Salle ${Date.now()}`,
        capacite: 50
      });

      const sallesGrandes = await Room.findAll({
        where: {
          capacite: {
            [require('sequelize').Op.gte]: 20
          }
        }
      });

      const roomIds = sallesGrandes.map(r => r.id);
      expect(roomIds).toContain(grandeSalle.id);
      expect(roomIds).not.toContain(petiteSalle.id);
    });

    test('devrait pouvoir rechercher par nom partiel', async () => {
      const room = await Room.create({
        nom: `Salle de Conférence ${Date.now()}`,
        capacite: 30
      });

      const sallesTrouvees = await Room.findAll({
        where: {
          nom: {
            [require('sequelize').Op.like]: '%Conférence%'
          }
        }
      });

      const roomIds = sallesTrouvees.map(r => r.id);
      expect(roomIds).toContain(room.id);
    });

    test('devrait pouvoir compter les réservations par salle', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      // Créer plusieurs réservations pour cette salle
      await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'confirmee'
      });

      await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-02',
        heure_debut: '14:00',
        heure_fin: '15:00',
        statut: 'en_attente'
      });

      const roomWithCount = await Room.findByPk(room.id, {
        include: [{
          model: Reservation,
          as: 'reservations',
          attributes: []
        }],
        attributes: {
          include: [
            [require('sequelize').fn('COUNT', require('sequelize').col('reservations.id')), 'reservation_count']
          ]
        },
        group: ['Room.id']
      });

      expect(parseInt(roomWithCount.dataValues.reservation_count)).toBe(2);
    });
  });

  describe('Cas Limites et Gestion d\'Erreurs', () => {
    
    test('devrait gérer les noms avec des caractères spéciaux', async () => {
      const roomData = {
        nom: `Salle "Spéciale" & Unique #${Date.now()}`,
        capacite: 20
      };

      const room = await Room.create(roomData);
      expect(room.nom).toBe(roomData.nom);
    });

    test('devrait gérer les noms très longs', async () => {
      const longNom = 'A'.repeat(200);
      const roomData = {
        nom: longNom,
        capacite: 20
      };

      const room = await Room.create(roomData);
      expect(room.nom).toBe(longNom);
    });

    test('devrait retourner null pour une salle inexistante', async () => {
      const nonExistentRoom = await Room.findByPk(99999);
      expect(nonExistentRoom).toBeNull();
    });

    test('devrait gérer la suppression en cascade des réservations', async () => {
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

      const reservationId = reservation.id;
      
      // Supprimer la salle
      await room.destroy();
      
      // Vérifier que la réservation a été supprimée aussi
      const deletedReservation = await Reservation.findByPk(reservationId);
      expect(deletedReservation).toBeNull();
    });
  });

  describe('Validation Métier', () => {
    
    test('devrait pouvoir changer le responsable d\'une salle', async () => {
      const responsable1 = await global.testUtils.createTestUser();
      const responsable2 = await global.testUtils.createTestUser();
      
      const room = await Room.create({
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        responsable_id: responsable1.id
      });

      await room.update({ responsable_id: responsable2.id });
      
      expect(room.responsable_id).toBe(responsable2.id);
      
      // Vérifier en base avec l'association
      const updatedRoom = await Room.findByPk(room.id, {
        include: [{ model: User, as: 'responsable' }]
      });
      
      expect(updatedRoom.responsable.id).toBe(responsable2.id);
    });

    test('devrait pouvoir retirer le responsable d\'une salle', async () => {
      const responsable = await global.testUtils.createTestUser();
      
      const room = await Room.create({
        nom: `Salle Test ${Date.now()}`,
        capacite: 20,
        responsable_id: responsable.id
      });

      await room.update({ responsable_id: null });
      
      expect(room.responsable_id).toBeNull();
    });
  });
});