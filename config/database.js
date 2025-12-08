import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Configuration de la base de données selon l'environnement
const config = {
  development: {
    // Commented defaults containing literal credentials
    // username: process.env.DB_USERNAME || 'marcel_admin',
    username: process.env.DB_USERNAME || '',
    // password: process.env.DB_PASSWORD || 'Reservation2025!',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reservation_salles',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Afficher les requêtes SQL en développement
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  
  test: {
    // Commented test DB defaults with literal credentials
    // username: process.env.DB_TEST_USERNAME || 'marcel_admin',
    username: process.env.DB_TEST_USERNAME || '',
    // password: process.env.DB_TEST_PASSWORD || 'Reservation2025!',
    password: process.env.DB_TEST_PASSWORD || '',
    database: process.env.DB_TEST_NAME || 'reservation_salles_test',
    host: process.env.DB_TEST_HOST || 'localhost',
    port: process.env.DB_TEST_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Pas de logs en test
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Pas de logs en production
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 300000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    // Configuration SSL pour la production si nécessaire
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
};

// Récupérer la configuration selon l'environnement
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

if (!currentConfig) {
  throw new Error(`Configuration pour l'environnement "${env}" non trouvée`);
}

// Créer l'instance Sequelize
const sequelize = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  {
    host: currentConfig.host,
    port: currentConfig.port,
    dialect: currentConfig.dialect,
    logging: currentConfig.logging,
    pool: currentConfig.pool,
    define: currentConfig.define,
    dialectOptions: currentConfig.dialectOptions || {},
    
    // Options additionnelles
    retry: {
      max: 3
    },
    
    // Timezone
    timezone: process.env.TZ || '+00:00',
    
    // Hooks globaux pour l'audit
    hooks: {
      beforeCreate: (instance, options) => {
        // Ajouter automatiquement created_at si pas défini
        if (!instance.created_at) {
          instance.created_at = new Date();
        }
      },
      
      beforeUpdate: (instance, options) => {
        // Ajouter automatiquement updated_at
        if (instance.changed()) {
          instance.updated_at = new Date();
        }
      }
    }
  }
);

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connexion à la base de données "${currentConfig.database}" établie (${env})`);
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error.message);
    
    // Suggestions d'aide selon le type d'erreur
    if (error.name === 'ConnectionError') {
      console.error('💡 Vérifiez que MySQL est démarré et que les paramètres de connexion sont corrects');
    } else if (error.name === 'AccessDeniedError') {
      console.error('💡 Vérifiez les identifiants de connexion (username/password)');
    } else if (error.name === 'HostNotFoundError') {
      console.error('💡 Vérifiez l\'adresse du serveur de base de données');
    }
    
    return false;
  }
};

// Fonction pour synchroniser les modèles (à utiliser avec précaution)
const syncDatabase = async (options = {}) => {
  try {
    const {
      force = false,      // Supprime et recrée les tables
      alter = false,      // Modifie les tables existantes
      logging = true
    } = options;
    
    if (env === 'production' && force) {
      throw new Error('🚨 Synchronisation forcée interdite en production !');
    }
    
    await sequelize.sync({ force, alter, logging });
    
    if (force) {
      console.log('⚠️  Base de données synchronisée avec suppression des données existantes');
    } else if (alter) {
      console.log('🔄 Base de données synchronisée avec modification des structures');
    } else {
      console.log('✅ Base de données synchronisée');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    return false;
  }
};

// Fonction pour fermer proprement la connexion
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la connexion:', error.message);
  }
};

// Gestion des signaux pour fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🔄 Fermeture de l\'application...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Arrêt de l\'application...');
  await closeConnection();
  process.exit(0);
});

// Export de l'instance et des utilitaires
module.exports = {
  sequelize,
  config: currentConfig,
  testConnection,
  syncDatabase,
  closeConnection,
  
  // Export de Sequelize pour les types de données
  Sequelize,
  
  // Utilitaires pour les requêtes
  Op: Sequelize.Op,
  
  // Information sur l'environnement
  environment: env
};

// Test automatique de connexion au démarrage
if (require.main !== module) {
  // Ne teste la connexion que si ce fichier n'est pas exécuté directement
  setImmediate(async () => {
    const connected = await testConnection();
    if (!connected && env === 'production') {
      console.error('🚨 Impossible de démarrer en production sans base de données');
      process.exit(1);
    }
  });
}