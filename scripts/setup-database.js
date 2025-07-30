#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de la base de données...\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Création du fichier .env...');
    const envTemplate = `# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reservation_db
DB_USER=root
DB_PASSWORD=

# Configuration JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Configuration serveur
PORT=3000
NODE_ENV=development

# Configuration email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Configuration de sécurité
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Fichier .env créé avec les paramètres par défaut');
    console.log('⚠️  IMPORTANT: Modifiez les valeurs dans .env selon votre configuration\n');
}

// Vérifier la structure des dossiers
const requiredDirs = [
    'routes',
    'models', 
    'middleware',
    'controllers',
    'config',
    'docs/scripts',
    'docs/config',
    'docs/generated'
];

console.log('📁 Vérification de la structure des dossiers...');
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Dossier créé: ${dir}`);
    } else {
        console.log(`✓ Dossier existe: ${dir}`);
    }
});

// Créer le fichier de configuration Sequelize si nécessaire
const sequelizeConfigPath = path.join(__dirname, '..', 'config', 'config.json');
if (!fs.existsSync(sequelizeConfigPath)) {
    console.log('\n📝 Création de la configuration Sequelize...');
    const sequelizeConfig = {
        "development": {
            "username": "root",
            "password": null,
            "database": "reservation_db",
            "host": "127.0.0.1",
            "dialect": "mysql",
            "logging": false
        },
        "test": {
            "username": "root", 
            "password": null,
            "database": "reservation_test_db",
            "host": "127.0.0.1",
            "dialect": "mysql",
            "logging": false
        },
        "production": {
            "use_env_variable": "DATABASE_URL",
            "dialect": "mysql",
            "logging": false
        }
    };
    
    fs.writeFileSync(sequelizeConfigPath, JSON.stringify(sequelizeConfig, null, 2));
    console.log('✅ Configuration Sequelize créée');
}

// Créer un fichier index.js basique s'il n'existe pas
const indexPath = path.join(__dirname, '..', 'index.js');
if (!fs.existsSync(indexPath)) {
    console.log('\n📝 Création du fichier index.js...');
    const indexContent = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de base
app.get('/', (req, res) => {
    res.json({
        message: 'API de réservation - Backend',
        version: '1.0.0',
        status: 'OK'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(\`🚀 Serveur démarré sur le port \${PORT}\`);
    console.log(\`📍 URL: http://localhost:\${PORT}\`);
});

module.exports = app;
`;
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Fichier index.js créé');
}

console.log('\n🎉 Configuration terminée!');
console.log('\n📋 Prochaines étapes:');
console.log('1. Modifiez le fichier .env avec vos paramètres de base de données');
console.log('2. Assurez-vous que MySQL est installé et en cours d\'exécution');
console.log('3. Créez la base de données: npm run db:create');
console.log('4. Lancez le serveur: npm run dev');
console.log('\n💡 Utilisez "npm run help" pour voir toutes les commandes disponibles');