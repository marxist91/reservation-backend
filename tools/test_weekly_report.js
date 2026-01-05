/**
 * Test du rapport hebdomadaire
 */
const db = require('../models');
const { sequelize } = db;
const { Sequelize } = require('sequelize');

async function testWeeklyReport() {
  try {
    const startDate = '2025-12-29';
    const endDate = '2026-01-04';
    
    console.log(`\n📊 Test rapport hebdomadaire: ${startDate} - ${endDate}\n`);

    // Test 1: Compter les réservations avec les bons statuts
    const kpiQuery = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN r.statut = 'en_attente' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN r.statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejected
      FROM reservations r
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
    `;
    
    const [kpis] = await sequelize.query(kpiQuery, { 
      replacements: { startDate, endDate }, 
      type: Sequelize.QueryTypes.SELECT 
    });
    console.log('📈 KPIs:', kpis);

    // Test 2: Top salles avec les bons statuts
    const topSallesQuery = `
      SELECT rm.id, rm.nom, COUNT(r.id) AS reservations,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmees,
        SUM(CASE WHEN r.statut = 'en_attente' THEN 1 ELSE 0 END) AS en_attente,
        SUM(CASE WHEN r.statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejetees
      FROM reservations r
      LEFT JOIN rooms rm ON r.room_id = rm.id
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
      GROUP BY rm.id, rm.nom
      ORDER BY reservations DESC
      LIMIT 5
    `;
    const topSalles = await sequelize.query(topSallesQuery, { 
      replacements: { startDate, endDate }, 
      type: Sequelize.QueryTypes.SELECT 
    });
    console.log('\n🏢 Top Salles:', topSalles);

    // Test 3: Top départements
    const topDeptsQuery = `
      SELECT d.id, d.name, COUNT(r.id) AS reservations,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmees
      FROM reservations r
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
      GROUP BY d.id, d.name
      ORDER BY reservations DESC
      LIMIT 5
    `;
    const topDepts = await sequelize.query(topDeptsQuery, { 
      replacements: { startDate, endDate }, 
      type: Sequelize.QueryTypes.SELECT 
    });
    console.log('\n🏛️ Top Départements:', topDepts);

    // Test 4: Statuts uniques
    const statusQuery = `SELECT DISTINCT statut FROM reservations`;
    const statuts = await sequelize.query(statusQuery, { type: Sequelize.QueryTypes.SELECT });
    console.log('\n📋 Statuts existants:', statuts.map(s => s.statut));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

testWeeklyReport();
