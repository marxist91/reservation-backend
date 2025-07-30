// Configuration des variables d'environnement pour les tests
require('dotenv').config();

// Variables spécifiques aux tests
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.TEST_PORT || '3001';

// Base de données de test - Aligné avec config/config.json
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'reservation_salles';
process.env.TEST_DB_USER = process.env.TEST_DB_USER || 'marcel_admin';
process.env.TEST_DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'Reservation2025!';
process.env.TEST_DB_HOST = process.env.TEST_DB_HOST || 'localhost';

// Variables pour Sequelize config.json
process.env.NODE_ENV = 'test';

// Configuration JWT pour les tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_2025';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Configuration email désactivée pour les tests
process.env.EMAIL_ENABLED = 'false';

// Désactiver l'audit pendant les tests pour éviter les conflits de connexion
process.env.AUDIT_ENABLED = 'false';

// Désactiver les logs en mode test
if (process.env.NODE_ENV === 'test') {
  console.log('🧪 Mode test activé - Logs minimaux');
}

// Timeout plus élevé pour les tests
process.env.REQUEST_TIMEOUT = '10000';

// Configuration de sécurité allégée pour les tests
process.env.RATE_LIMIT_WINDOW_MS = '60000'; // 1 minute
process.env.RATE_LIMIT_MAX_REQUESTS = '1000'; // Plus permissif

console.log('✅ Configuration des tests chargée');