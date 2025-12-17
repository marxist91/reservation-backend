const { Sequelize } = require('sequelize');

// Timeout plus long pour les tests d'intégration
jest.setTimeout(30000);

// Configuration globale pour les tests
global.testConfig = {
  db: null,
  server: null,
  jwtSecret: process.env.JWT_SECRET || 'test_secret_key_for_jest'
};

// Configuration de la base de données de test
const setupTestDatabase = async () => {
  // Utiliser une base de données de test séparée
  const sequelize = new Sequelize(
    process.env.TEST_DB_NAME || 'reservation_test_db', // Base différente pour les tests
    // Default to root without password if env not set
    process.env.TEST_DB_USER || 'root',
    process.env.TEST_DB_PASSWORD || '',
    {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT ? parseInt(process.env.TEST_DB_PORT, 10) : 3309,
      dialect: 'mysql',
      logging: false, // Désactiver les logs SQL pendant les tests
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  global.testConfig.db = sequelize;
  
  // Tester la connexion
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de test établie');
    
    // Synchroniser les modèles si nécessaire (pour les tests)
    if (process.env.SYNC_TEST_DB === 'true') {
      await sequelize.sync({ force: true });
      console.log('✅ Tables de test synchronisées');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de test:', error.message);
    console.log('💡 Astuce: Créez une base "reservation_test_db" ou configurez TEST_DB_* dans .env.test');
    throw error; // Arrêter les tests si pas de connexion DB
  }
};

// Nettoyage avant chaque test
const cleanupDatabase = async () => {
  try {
    // Utiliser les modèles principaux au lieu de ceux de testConfig.db
    const { User, Room, Reservation, AuditLog, ActionLog } = require('../models');
    
    // Désactiver les contraintes de clés étrangères temporairement
    await global.testConfig.db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Vider les tables dans l'ordre correct (relations)
    if (Reservation) await Reservation.destroy({ where: {}, force: true });
    if (AuditLog) await AuditLog.destroy({ where: {}, force: true });
    if (ActionLog) await ActionLog.destroy({ where: {}, force: true });
    if (Room) await Room.destroy({ where: {}, force: true });
    if (User) await User.destroy({ where: {}, force: true });
    
    // Réactiver les contraintes
    await global.testConfig.db.query('SET FOREIGN_KEY_CHECKS = 1');
    
  } catch (error) {
    console.warn('⚠️  Nettoyage de la base:', error.message);
    // Ne pas faire échouer les tests pour un problème de nettoyage
  }
};

// Données de test communes - Version améliorée
global.testData = {
  users: {
    admin: {
      nom: 'Admin',
      prenom: 'Test',
      email: 'admin@test.com',
      mot_de_passe: 'AdminPassword123!',
      role: 'admin',
      telephone: '0123456789'
    },
    user: {
      nom: 'User',
      prenom: 'Test',
      email: 'user@test.com',
      mot_de_passe: 'UserPassword123!',
      role: 'utilisateur',
      telephone: '0987654321'
    },
    client: {
      nom: 'Client',
      prenom: 'Test',
      email: 'client@test.com',
      mot_de_passe: 'ClientPassword123!',
      role: 'client',
      telephone: '0147258369'
    }
  },
  rooms: {
    meeting: {
      nom: 'Salle de réunion A',
      capacite: 10,
      description: 'Grande salle pour réunions',
      equipements: ['Projecteur', 'Écran', 'WiFi']
    },
    office: {
      nom: 'Bureau individuel',
      capacite: 1,
      description: 'Bureau calme pour travail individuel',
      equipements: ['Bureau', 'Chaise', 'WiFi']
    },
    conference: {
      nom: 'Salle de conférence',
      capacite: 50,
      description: 'Grande salle pour conférences',
      equipements: ['Micro', 'Projecteur', 'Sonorisation']
    }
  },
  reservations: {
    upcoming: {
      date_debut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      date_fin: new Date(Date.now() + 25 * 60 * 60 * 1000),   // Demain + 1h
      statut: 'confirmee',
      // prix_total: 50.00,  // commenté par nettoyage
      notes: 'Réservation de test'
    },
    past: {
      date_debut: new Date(Date.now() - 48 * 60 * 60 * 1000), // Il y a 2 jours
      date_fin: new Date(Date.now() - 47 * 60 * 60 * 1000),   // Il y a 2 jours + 1h
      statut: 'terminee',
      // prix_total: 30.00,  // commenté par nettoyage
      notes: 'Réservation passée'
    },
    pending: {
      date_debut: new Date(Date.now() + 48 * 60 * 60 * 1000), // Dans 2 jours
      date_fin: new Date(Date.now() + 49 * 60 * 60 * 1000),   // Dans 2 jours + 1h
      statut: 'en_attente',
      // prix_total: 75.00,  // commenté par nettoyage
      notes: 'En attente de confirmation'
    }
  }
};

// Utilitaires de test améliorés
global.testUtils = {
  // Créer un utilisateur de test
  createTestUser: async (userData = global.testData.users.user) => {
    const { User } = require('../models');
    
    try {
      // Générer un email unique pour éviter les conflits
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const uniqueEmail = `test_${timestamp}_${randomId}@test.com`;
      
      const user = await User.create({
        ...userData,
        email: uniqueEmail
        // Le mot de passe sera automatiquement hashé par le hook beforeCreate
      });
      
      console.log(`👤 Utilisateur test créé: ${user.email} (ID: ${user.id})`);
      return user;
    } catch (error) {
      console.error('❌ Erreur création utilisateur test:', error.message);
      if (error.errors) {
        error.errors.forEach(err => {
          console.error(`  - ${err.path}: ${err.message}`);
        });
      }
      throw error; // Propager l'erreur pour les tests
    }
  },

  // Créer une salle de test
  createTestRoom: async (roomData = global.testData.rooms.meeting, responsableUser = null) => {
    const { Room } = require('../models');
    
    try {
      // Créer un responsable si pas fourni
      if (!responsableUser) {
        responsableUser = await global.testUtils.createTestUser(global.testData.users.admin);
      }
      
      const room = await Room.create({
        ...roomData,
        responsable_id: responsableUser.id
      });
      
      console.log(`🏠 Salle test créée: ${room.nom} (ID: ${room.id})`);
      return room;
    } catch (error) {
      console.error('❌ Erreur création salle test:', error.message);
      throw error;
    }
  },

  // Créer une réservation de test
  createTestReservation: async (userId, roomId, reservationData = global.testData.reservations.upcoming) => {
    const { Reservation } = require('../models');
    
    try {
      const reservation = await Reservation.create({
        ...reservationData,
        user_id: userId,
        room_id: roomId
      });
      
      console.log(`📅 Réservation test créée: User ${userId} -> Room ${roomId} (ID: ${reservation.id})`);
      return reservation;
    } catch (error) {
      console.error('❌ Erreur création réservation test:', error.message);
      throw error;
    }
  },

  // Générer un token JWT de test
  generateTestToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      global.testConfig.jwtSecret,
      { expiresIn: '1h' }
    );
  },

  // Créer un scénario complet de test (utilisateur + salle + réservation)
  createTestScenario: async (scenarioType = 'basic') => {
    const scenario = {};
    
    try {
      // Créer les utilisateurs
      scenario.admin = await global.testUtils.createTestUser(global.testData.users.admin);
      scenario.user = await global.testUtils.createTestUser(global.testData.users.user);
      scenario.client = await global.testUtils.createTestUser(global.testData.users.client);
      
      // Créer les salles
      scenario.meetingRoom = await global.testUtils.createTestRoom(
        global.testData.rooms.meeting, 
        scenario.admin
      );
      scenario.office = await global.testUtils.createTestRoom(
        global.testData.rooms.office, 
        scenario.admin
      );
      
      // Créer des réservations selon le scénario
      if (scenarioType === 'withReservations') {
        scenario.upcomingReservation = await global.testUtils.createTestReservation(
          scenario.user.id,
          scenario.meetingRoom.id,
          global.testData.reservations.upcoming
        );
        
        scenario.pastReservation = await global.testUtils.createTestReservation(
          scenario.client.id,
          scenario.office.id,
          global.testData.reservations.past
        );
      }
      
      // Générer les tokens
      scenario.tokens = {
        admin: global.testUtils.generateTestToken(scenario.admin),
        user: global.testUtils.generateTestToken(scenario.user),
        client: global.testUtils.generateTestToken(scenario.client)
      };
      
      console.log(`✅ Scénario de test "${scenarioType}" créé avec succès`);
      return scenario;
    } catch (error) {
      console.error(`❌ Erreur création scénario "${scenarioType}":`, error.message);
      throw error;
    }
  },

  // Nettoyer une table spécifique
  cleanTable: async (tableName) => {
    try {
      await global.testConfig.db.query(`DELETE FROM ${tableName}`);
      await global.testConfig.db.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
      console.log(`🧹 Table ${tableName} nettoyée`);
    } catch (error) {
      console.warn(`⚠️  Erreur nettoyage table ${tableName}:`, error.message);
    }
  }
};

// Setup avant tous les tests
beforeAll(async () => {
  console.log('🚀 Configuration des tests...');
  if (process.env.SKIP_DB_TEST_SETUP === 'true') {
    console.log('⏭️ SKIP_DB_TEST_SETUP=true — saut de la configuration DB pour les tests');
  } else {
    await setupTestDatabase();
  }
});

// Cleanup avant chaque test
beforeEach(async () => {
  await cleanupDatabase();
});

// Cleanup après tous les tests
afterAll(async () => {
  try {
    // Fermer la connexion Sequelize
    if (global.testConfig.db) {
      await global.testConfig.db.close();
      console.log('✅ Connexion à la base de test fermée');
    }
    
    // Fermer le serveur Express si il existe
    if (global.testConfig.server) {
      await new Promise((resolve) => {
        global.testConfig.server.close((err) => {
          if (err) console.warn('⚠️  Erreur fermeture serveur:', err);
          resolve();
        });
      });
      console.log('✅ Serveur de test fermé');
    }

    // Attendre un peu pour que les connexions se ferment
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error) {
    console.warn('⚠️  Erreur lors de la fermeture:', error.message);
  }
});

// Gestion des erreurs non capturées pendant les tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse non gérée dans les tests:', reason);
});

// Mock console en mode silencieux
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn()
  };
}

module.exports = {
  setupTestDatabase,
  cleanupDatabase
};