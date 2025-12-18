const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: 'crossover.proxy.rlwy.net',
    port: 17952,
    user: 'root',
    password: 'IKqPeAMDKUtyOhKdvOpuUCBXqTqNXPvK',
    database: 'railway'
  });
  
  console.log('📊 Réservations décembre 2025:');
  const [dec] = await c.query(`
    SELECT COUNT(*) as cnt, statut 
    FROM reservations 
    WHERE date_debut BETWEEN '2025-12-01' AND '2025-12-31 23:59:59' 
    GROUP BY statut
  `);
  console.table(dec);
  
  console.log('\n📊 Top 10 réservations récentes:');
  const [recent] = await c.query(`
    SELECT id, date_debut, statut, motif 
    FROM reservations 
    ORDER BY date_debut DESC 
    LIMIT 10
  `);
  console.table(recent);
  
  await c.end();
})();
