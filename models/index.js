'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Charger tous les modèles automatiquement
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file !== 'associations.js' && // Exclure le fichier associations
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    try {
      const modelModule = require(path.join(__dirname, file));
      
      let model;
      
      // Vérifier si c'est une classe qui étend Model
      if (modelModule.prototype && modelModule.prototype instanceof Sequelize.Model) {
        // C'est une classe Sequelize, l'ajouter directement
        model = modelModule;
        db[model.name] = model;
        console.log(`✅ Modèle classe chargé: ${model.name}`);
      } else if (typeof modelModule === 'function') {
        // C'est une fonction qui retourne un modèle
        try {
          model = modelModule(sequelize, Sequelize.DataTypes);
          if (model && model.name) {
            db[model.name] = model;
            console.log(`✅ Modèle fonction chargé: ${model.name}`);
          }
        } catch (funcError) {
          console.error(`❌ Erreur lors de l'appel de la fonction pour ${file}:`, funcError.message);
        }
      } else {
        console.warn(`⚠️ Format de modèle non reconnu pour ${file}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du modèle ${file}:`, error.message);
    }
  });

// Debug: Afficher les modèles chargés
console.log('📋 Modèles chargés:', Object.keys(db));

// Appeler les méthodes associate si elles existent (pour compatibilité)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`🔗 Association trouvée pour ${modelName}`);
    db[modelName].associate(db);
  }
});

// Vérifier que tous les modèles nécessaires sont présents avant les associations
const requiredModels = ['User', 'Room', 'Reservation', 'AuditLog'];
const missingModels = requiredModels.filter(modelName => !db[modelName]);

if (missingModels.length > 0) {
  console.error('❌ Modèles manquants:', missingModels);
  console.log('📋 Modèles disponibles:', Object.keys(db));
} else {
  console.log('✅ Tous les modèles requis sont présents');
  
  // Configurer les associations personnalisées avec audit
  try {
    const { setupAssociations, withAuditUser } = require('./associations');
    setupAssociations(db);
    
    // Ajouter l'utilitaire withAuditUser
    db.withAuditUser = withAuditUser;
  } catch (assocError) {
    console.error('❌ Erreur lors de la configuration des associations:', assocError.message);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;