/**
 * Script pour importer le backup SQL dans Railway
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importBackup() {
  console.log('📦 Lecture du fichier backup...');
  let sqlFile = fs.readFileSync(path.join(__dirname, '..', 'backup_local.sql'), 'utf8');
  
  // Nettoyage
  sqlFile = sqlFile.replace(/\/\*M!999999.*?\*\/\s*/g, ''); // Sandbox MariaDB
  sqlFile = sqlFile.replace(/^--.*$/gm, ''); // Commentaires --
  sqlFile = sqlFile.replace(/\/\*!.*?\*\//gs, ''); // Commentaires MySQL /*!...*/
  sqlFile = sqlFile.replace(/^\s*$/gm, ''); // Lignes vides
  
  console.log('🔌 Connexion à Railway MySQL...');
  const connection = await mysql.createConnection({
    host: 'crossover.proxy.rlwy.net',
    port: 17952,
    user: 'root',
    password: 'IKqPeAMDKUtyOhKdvOpuUCBXqTqNXPvK',
    database: 'railway',
    multipleStatements: true,
    charset: 'utf8mb4'
  });
  
  console.log('✅ Connecté à Railway');
  
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"');
    
    // Diviser en statements individuels
    const statements = sqlFile.split(';').filter(s => s.trim().length > 10);
    console.log(`📥 ${statements.length} statements à exécuter...`);
    
    let success = 0;
    let errors = 0;
    
    for (const stmt of statements) {
      try {
        await connection.query(stmt + ';');
        success++;
      } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) {
          errors++;
          if (errors <= 3) console.log('⚠️', e.message.substring(0, 80));
        }
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`✅ ${success} statements exécutés, ${errors} erreurs`);
    
    // Vérifier les données
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [rooms] = await connection.query('SELECT COUNT(*) as count FROM rooms');
    const [reservations] = await connection.query('SELECT COUNT(*) as count FROM reservations');
    
    console.log('\n📊 Données importées:');
    console.log(`   - Utilisateurs: ${users[0].count}`);
    console.log(`   - Salles: ${rooms[0].count}`);
    console.log(`   - Réservations: ${reservations[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
  
  await connection.end();
  process.exit(0);
}

importBackup();
