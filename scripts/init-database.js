#!/usr/bin/env node

/**
 * Script d'initialisation de la base de données
 * Usage: node scripts/init-database.js [options]
 */

const { sequelize, testConnection, syncDatabase } = require('../config/database');
const readline = require('readline');

// Interface pour les questions interactives
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
};

// Analyse des arguments de ligne de commande
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force') || args.includes('-f'),
  alter: args.includes('--alter') || args.includes('-a'),
  silent: args.includes('--silent') || args.includes('-s'),
  confirm: args.includes('--confirm') || args.includes('-c')
};

console.log('🗄️  Script d\'initialisation de la base de données\n');

const main = async () => {
  try {
    // Test de connexion
    console.log('📡 Test de connexion à la base de données...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Impossible de se connecter à la base de données');
      console.log('\n💡 Suggestions:');
      console.log('   1. Vérifiez que MySQL est démarré');
      console.log('   2. Vérifiez vos variables d\'environnement dans .env');
      console.log('   3. Créez la base de données si elle n\'existe pas:');
      console.log(`      CREATE DATABASE ${process.env.DB_NAME || 'reservation_db'};`);
      process.exit(1);
    }

    // Affichage des options
    console.log('\n⚙️  Options détectées:');
    console.log(`   - Force (supprime les tables existantes): ${options.force ? '✅' : '❌'}`);
    console.log(`   - Alter (modifie les tables existantes): ${options.alter ? '✅' : '❌'}`);
    console.log(`   - Mode silencieux: ${options.silent ? '✅' : '❌'}`);

    // Confirmation si mode dangereux
    if (options.force && !options.confirm && !options.silent) {
      console.log('\n⚠️  ATTENTION: Le mode --force va supprimer toutes les données existantes!');
      const confirm = await askQuestion('Êtes-vous sûr de vouloir continuer? (oui/non): ');
      
      if (confirm !== 'oui' && confirm !== 'o' && confirm !== 'yes' && confirm !== 'y') {
        console.log('❌ Opération annulée');
        rl.close();
        process.exit(0);
      }
    }

    // Synchronisation de la base de données
    console.log('\n🔄 Synchronisation de la base de données...');
    const synced = await syncDatabase({
      force: options.force,
      alter: options.alter,
      logging: !options.silent
    });

    if (!synced) {
      console.error('❌ Erreur lors de la synchronisation');
      process.exit(1);
    }

    // Affichage du résumé
    console.log('\n✅ Initialisation terminée avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   - Base de données: ${process.env.DB_NAME || 'reservation_db'}`);
    console.log(`   - Hôte: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`   - Environnement: ${process.env.NODE_ENV || 'development'}`);
    
    if (options.force) {
      console.log('   - ⚠️  Toutes les données précédentes ont été supprimées');
    }
    
    if (options.alter) {
      console.log('   - 🔄 Les structures de tables ont été mises à jour');
    }

    // Suggestions pour la suite
    console.log('\n🚀 Prochaines étapes:');
    console.log('   1. Démarrez l\'application: npm start ou node app.js');
    console.log('   2. Créez un utilisateur admin: node scripts/create-admin.js');
    console.log('   3. Accédez à la documentation: http://localhost:3000/api-docs');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    if (!options.silent) {
      console.error('\n📊 Détails de l\'erreur:', error);
    }
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
};

// Gestion des signaux d'interruption
process.on('SIGINT', async () => {
  console.log('\n\n🔄 Interruption détectée, nettoyage...');
  rl.close();
  await sequelize.close();
  process.exit(0);
});

// Affichage de l'aide
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/init-database.js [options]

Options:
  --force, -f     Supprime et recrée toutes les tables (⚠️  SUPPRIME LES DONNÉES)
  --alter, -a     Modifie les tables existantes pour les adapter aux modèles
  --silent, -s    Mode silencieux (pas de logs SQL)
  --confirm, -c   Confirme automatiquement les actions dangereuses
  --help, -h      Affiche cette aide

Exemples:
  node scripts/init-database.js                    # Création des tables si elles n'existent pas
  node scripts/init-database.js --alter            # Mise à jour des structures de tables
  node scripts/init-database.js --force --confirm  # Recréation complète (DANGER)

Variables d'environnement importantes:
  DB_HOST         Hôte de la base de données (défaut: localhost)
  DB_PORT         Port de la base de données (défaut: 3306)
  DB_NAME         Nom de la base de données (défaut: reservation_db)
  DB_USERNAME     Nom d'utilisateur (défaut: root)
  DB_PASSWORD     Mot de passe (défaut: vide)
  NODE_ENV        Environnement (development/test/production)
`);
  process.exit(0);
}

// Lancement du script principal
main();