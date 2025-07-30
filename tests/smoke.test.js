/**
 * Smoke Test - Verify basic testing infrastructure works
 * This test ensures that:
 * - Database connection works
 * - Models load correctly
 * - Basic CRUD operations function
 * - Test utilities are available
 */

const { User, Room, Reservation } = require('../models');

describe('🧪 Smoke Tests - Testing Infrastructure', () => {
  
  describe('Database Connection', () => {
    test('should connect to test database', async () => {
      expect(global.testConfig.db).toBeDefined();
      
      try {
        await global.testConfig.db.authenticate();
        expect(true).toBe(true); // Connection successful
      } catch (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    });

    test('should have correct test database name', async () => {
      const dbName = global.testConfig.db.config.database;
      expect(dbName).toBe('reservation_salles');
    });
  });

  describe('Model Loading', () => {
    test('should load User model', () => {
      expect(User).toBeDefined();
      expect(typeof User.create).toBe('function');
      expect(typeof User.findAll).toBe('function');
    });

    test('should load Room model', () => {
      expect(Room).toBeDefined();
      expect(typeof Room.create).toBe('function');
      expect(typeof Room.findAll).toBe('function');
    });

    test('should load Reservation model', () => {
      expect(Reservation).toBeDefined();
      expect(typeof Reservation.create).toBe('function');
      expect(typeof Reservation.findAll).toBe('function');
    });
  });

  describe('Test Utilities', () => {
    test('should have test data available', () => {
      expect(global.testData).toBeDefined();
      expect(global.testData.users).toBeDefined();
      expect(global.testData.rooms).toBeDefined();
      expect(global.testData.reservations).toBeDefined();
    });

    test('should have test utilities available', () => {
      expect(global.testUtils).toBeDefined();
      expect(typeof global.testUtils.createTestUser).toBe('function');
      expect(typeof global.testUtils.createTestRoom).toBe('function');
      expect(typeof global.testUtils.createTestReservation).toBe('function');
      expect(typeof global.testUtils.generateTestToken).toBe('function');
    });
  });

  describe('Basic CRUD Operations', () => {
    test('should create and find a test user', async () => {
      const uniqueEmail = `smoke_test_${Date.now()}@test.com`;
      const userData = {
        nom: 'Test User',
        prenom: 'Smoke',
        email: uniqueEmail,
        mot_de_passe: 'password123', // Will be automatically hashed by beforeCreate hook
        role: 'utilisateur'
      };

      const user = await User.create(userData);
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.nom).toBe(userData.nom);

      const foundUser = await User.findByPk(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
    });

    test('should create and find a test room', async () => {
      // First create a user to be the responsable
      const user = await global.testUtils.createTestUser();
      expect(user).toBeDefined();

      const roomData = {
        nom: 'Salle Test Smoke',
        capacite: 10,
        responsable_id: user.id
      };

      const room = await Room.create(roomData);
      expect(room).toBeDefined();
      expect(room.id).toBeDefined();
      expect(room.nom).toBe(roomData.nom);
      expect(room.capacite).toBe(roomData.capacite);

      const foundRoom = await Room.findByPk(room.id);
      expect(foundRoom).toBeDefined();
      expect(foundRoom.nom).toBe(roomData.nom);
    });

    test('should create a test reservation with associations', async () => {
      // Create user and room first
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      expect(user).toBeDefined();
      expect(room).toBeDefined();

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
      expect(reservation.user_id).toBe(user.id);
      expect(reservation.room_id).toBe(room.id);
      expect(reservation.statut).toBe('en_attente');

      // Test associations
      const reservationWithAssociations = await Reservation.findByPk(reservation.id, {
        include: [
          { model: User, as: 'utilisateur' },
          { model: Room, as: 'salle' }
        ]
      });

      expect(reservationWithAssociations).toBeDefined();
      expect(reservationWithAssociations.utilisateur).toBeDefined();
      expect(reservationWithAssociations.salle).toBeDefined();
      expect(reservationWithAssociations.utilisateur.email).toBe(user.email);
      expect(reservationWithAssociations.salle.nom).toBe(room.nom);
    });
  });

  describe('Test Utilities Functions', () => {
    test('should create test user with utility function', async () => {
      const user = await global.testUtils.createTestUser();
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toContain('@test.com');
    });

    test('should create test room with utility function', async () => {
      const room = await global.testUtils.createTestRoom();
      expect(room).toBeDefined();
      expect(room.id).toBeDefined();
      expect(room.nom).toBeDefined();
    });

    test('should generate JWT token', async () => {
      const user = await global.testUtils.createTestUser();
      const token = global.testUtils.generateTestToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('Environment Configuration', () => {
    test('should be in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    test('should have test-specific configurations', () => {
      expect(process.env.EMAIL_ENABLED).toBe('false');
      expect(process.env.JWT_SECRET).toBeDefined();
    });
  });
});