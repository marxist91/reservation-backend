/**
 * Script de migration des données de MariaDB local vers Railway MySQL
 * Lit les données de XAMPP et les insère dans Railway
 */

const mysql = require('mysql2/promise');

const LOCAL_CONFIG = {
  host: 'localhost',
  port: 3309,
  user: 'root',
  password: '',
  database: 'reservation_salles'
};

const RAILWAY_CONFIG = {
  host: 'crossover.proxy.rlwy.net',
  port: 17952,
  user: 'root',
  password: 'IKqPeAMDKUtyOhKdvOpuUCBXqTqNXPvK',
  database: 'railway'
};

// Tables dans l'ordre (respecter les dépendances FK)
const TABLES = [
  'departments',
  'settings',
  'users',
  'rooms',
  'reservations',
  'notifications',
  'histories',
  'actionlogs',
  'auditlogs',
  'proposedalternatives'
];

async function migrateData() {
  console.log('🔄 Migration des données XAMPP → Railway\n');

  let localConn, railwayConn;

  try {
    // Connexion locale
    console.log('📍 Connexion à XAMPP (localhost:3309)...');
    localConn = await mysql.createConnection(LOCAL_CONFIG);
    console.log('✅ Connecté à XAMPP\n');

    // Connexion Railway
    console.log('☁️  Connexion à Railway...');
    railwayConn = await mysql.createConnection(RAILWAY_CONFIG);
    console.log('✅ Connecté à Railway\n');

    // Désactiver les FK sur Railway
    await railwayConn.query('SET FOREIGN_KEY_CHECKS = 0');
    await railwayConn.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"');

    // Migrer chaque table
    for (const table of TABLES) {
      try {
        // Vérifier si la table existe localement
        const [check] = await localConn.query(`SHOW TABLES LIKE '${table}'`);
        if (check.length === 0) {
          console.log(`⏭️  Table ${table}: n'existe pas localement`);
          continue;
        }

        // Lire les données locales
        const [rows] = await localConn.query(`SELECT * FROM ${table}`);
        
        if (rows.length === 0) {
          console.log(`⏭️  Table ${table}: vide`);
          continue;
        }

        // Vider la table Railway
        await railwayConn.query(`DELETE FROM ${table}`);

        // Récupérer les colonnes qui existent dans Railway
        const [railwayCols] = await railwayConn.query(`SHOW COLUMNS FROM ${table}`);
        const railwayColNames = railwayCols.map(c => c.Field);
        
        // Filtrer les colonnes locales pour ne garder que celles qui existent dans Railway
        const localColumns = Object.keys(rows[0]);
        const validColumns = localColumns.filter(col => railwayColNames.includes(col));
        
        if (validColumns.length === 0) {
          console.log(`⏭️  Table ${table}: aucune colonne compatible`);
          continue;
        }

        const placeholders = validColumns.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${table} (${validColumns.join(', ')}) VALUES (${placeholders})`;

        let inserted = 0;
        for (const row of rows) {
          try {
            const values = validColumns.map(col => row[col]);
            await railwayConn.query(insertSQL, values);
            inserted++;
          } catch (err) {
            if (!err.message.includes('Duplicate')) {
              if (inserted < 3) console.log(`   ⚠️ ${err.message.substring(0, 60)}`);
            }
          }
        }

        console.log(`✅ Table ${table}: ${inserted}/${rows.length} enregistrements migrés`);

      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message.substring(0, 60)}`);
      }
    }

    // Réactiver les FK
    await railwayConn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Statistiques finales
    console.log('\n📊 Vérification finale sur Railway:');
    const [users] = await railwayConn.query('SELECT COUNT(*) as c FROM users');
    const [rooms] = await railwayConn.query('SELECT COUNT(*) as c FROM rooms');
    const [reservations] = await railwayConn.query('SELECT COUNT(*) as c FROM reservations');
    const [departments] = await railwayConn.query('SELECT COUNT(*) as c FROM departments');

    console.log(`   👥 Utilisateurs: ${users[0].c}`);
    console.log(`   🏢 Départements: ${departments[0].c}`);
    console.log(`   🚪 Salles: ${rooms[0].c}`);
    console.log(`   📅 Réservations: ${reservations[0].c}`);

    // Afficher quelques users pour confirmer
    const [userList] = await railwayConn.query('SELECT id, email, role FROM users LIMIT 5');
    console.log('\n👤 Utilisateurs migrés:');
    userList.forEach(u => console.log(`   - ${u.email} (${u.role})`));

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    if (localConn) await localConn.end();
    if (railwayConn) await railwayConn.end();
    process.exit(0);
  }
}

migrateData();
