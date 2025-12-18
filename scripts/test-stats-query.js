// Test direct de la requête stats avec la DB Railway
process.env.DATABASE_URL = 'mysql://root:IKqPeAMDKUtyOhKdvOpuUCBXqTqNXPvK@crossover.proxy.rlwy.net:17952/railway';
process.env.NODE_ENV = 'production';

const { sequelize, Sequelize } = require('../models');

(async () => {
  try {
    const startDate = '2025-12-01';
    const endDate = '2025-12-31';
    
    const kpiQuery = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejected
      FROM reservations
      WHERE date_debut BETWEEN :startDate AND :endDate
    `;
    
    console.log('📊 Test de la requête stats sur Railway...\n');
    
    const result = await sequelize.query(kpiQuery, {
      replacements: { startDate, endDate },
      type: Sequelize.QueryTypes.SELECT
    });
    
    console.log('Résultat:');
    console.table(result);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
  
  process.exit(0);
})();
