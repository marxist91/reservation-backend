const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { sequelize, Sequelize } = require('../models');

// GET /api/stats/reservations-by-department
// Accepts optional query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), statut
// Pagination: page (1-based) and pageSize OR limit & offset
router.get('/reservations-by-department', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, statut, page, pageSize, limit, offset } = req.query;

    // Build WHERE clauses and replacements to avoid SQL injection
    const whereClauses = [];
    const replacements = {};

    if (startDate && endDate) {
      whereClauses.push('(r.date_debut BETWEEN :startDate AND :endDate)');
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    } else if (startDate) {
      whereClauses.push('(r.date_debut >= :startDate)');
      replacements.startDate = startDate;
    } else if (endDate) {
      whereClauses.push('(r.date_debut <= :endDate)');
      replacements.endDate = endDate;
    }

    if (statut) {
      const s = String(statut).toLowerCase();
      // Map similar status words to groups
      if (s === 'confirmee' || s === 'validee' || s === 'confirm' || s === 'validated') {
        whereClauses.push("(r.statut IN ('confirmee','validee'))");
      } else if (s === 'rejetee' || s === 'refusee' || s === 'annulee' || s === 'rejected') {
        whereClauses.push("(r.statut IN ('rejetee','refusee','annulee'))");
      } else if (s === 'en_attente' || s === 'pending') {
        whereClauses.push("(r.statut = 'en_attente')");
      } else {
        const safeStatut = s.replace(/[^a-zA-Z0-9_]/g, '');
        whereClauses.push('(r.statut = :statut)');
        replacements.statut = safeStatut;
      }
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Pagination defaults
    let limitNum = 100; // default page size
    let offsetNum = 0;
    if (limit) {
      limitNum = Math.max(1, parseInt(limit, 10) || 100);
    } else if (pageSize) {
      limitNum = Math.max(1, parseInt(pageSize, 10) || 100);
    }

    if (typeof offset !== 'undefined') {
      offsetNum = Math.max(0, parseInt(offset, 10) || 0);
    } else if (page) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      offsetNum = (pageNum - 1) * limitNum;
    }

    replacements.limit = limitNum;
    replacements.offset = offsetNum;

    const baseQuery = `
      SELECT 
        COALESCE(d.id, 0) AS department_id,
        COALESCE(d.name, 'Non renseigné') AS department_name,
        COUNT(r.id) AS count
      FROM reservations r
      LEFT JOIN departments d ON r.department_id = d.id
      ${whereSQL}
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `;

    // Limited results with pagination
    const pagedQuery = `${baseQuery} LIMIT :limit OFFSET :offset`;

    const results = await sequelize.query(pagedQuery, { replacements, type: Sequelize.QueryTypes.SELECT });

    // Total count of distinct departments for the same filter (for pagination UI)
    const countQuery = `
      SELECT COUNT(DISTINCT COALESCE(d.id, 0)) AS total
      FROM reservations r
      LEFT JOIN departments d ON r.department_id = d.id
      ${whereSQL}
    `;

    const countRes = await sequelize.query(countQuery, { replacements, type: Sequelize.QueryTypes.SELECT });
    const total = (countRes && countRes[0] && Number(countRes[0].total)) || 0;

    return res.json({ data: results, total });
  } catch (error) {
    console.error('Erreur GET /api/stats/reservations-by-department:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// New endpoint: GET /api/stats/overview
// Returns a consolidated statistics object for the frontend (KPIs, top rooms, evolution, status distribution, departments, room occupancy)
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, statut } = req.query;
    const whereClauses = [];
    const replacements = {};

    if (startDate && endDate) {
      whereClauses.push('(r.date_debut BETWEEN :startDate AND :endDate)');
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    } else if (startDate) {
      whereClauses.push('(r.date_debut >= :startDate)');
      replacements.startDate = startDate;
    } else if (endDate) {
      whereClauses.push('(r.date_debut <= :endDate)');
      replacements.endDate = endDate;
    }

    if (statut) {
      const s = String(statut).toLowerCase();
      if (s === 'confirmee' || s === 'validee' || s === 'confirm' || s === 'validated') {
        whereClauses.push("(r.statut IN ('confirmee','validee'))");
      } else if (s === 'rejetee' || s === 'refusee' || s === 'annulee' || s === 'rejected') {
        whereClauses.push("(r.statut IN ('rejetee','refusee','annulee'))");
      } else if (s === 'en_attente' || s === 'pending') {
        whereClauses.push("(r.statut = 'en_attente')");
      } else {
        const safeStatut = s.replace(/[^a-zA-Z0-9_]/g, '');
        whereClauses.push('(r.statut = :statut)');
        replacements.statut = safeStatut;
      }
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // KPIs: total, confirmed, pending, rejected
    const kpiQuery = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN r.statut = 'en_attente' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN r.statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejected
      FROM reservations r
      ${whereSQL}
    `;

    const kpiRes = await sequelize.query(kpiQuery, { replacements, type: Sequelize.QueryTypes.SELECT });
    const kpis = kpiRes && kpiRes[0] ? kpiRes[0] : { total: 0, confirmed: 0, pending: 0, rejected: 0 };

    // taux validation / rejet
    const totalCount = Number(kpis.total) || 0;
    const tauxValidation = totalCount > 0 ? ((Number(kpis.confirmed) / totalCount) * 100).toFixed(1) : '0';
    const tauxRejet = totalCount > 0 ? ((Number(kpis.rejected) / totalCount) * 100).toFixed(1) : '0';

    // Top salles
    const topSallesQuery = `
      SELECT r.room_id AS room_id, rm.nom AS nom, COUNT(r.id) AS count
      FROM reservations r
      LEFT JOIN rooms rm ON r.room_id = rm.id
      ${whereSQL}
      GROUP BY rm.id, rm.nom
      ORDER BY count DESC
      LIMIT 5
    `;
    const topSalles = await sequelize.query(topSallesQuery, { replacements, type: Sequelize.QueryTypes.SELECT });

    // Evolution per day between startDate and endDate (grouped by DATE(date_debut))
    // If no range provided, default to last 30 days
    let evoStart = replacements.startDate;
    let evoEnd = replacements.endDate;
    if (!evoStart || !evoEnd) {
      const now = new Date();
      const end = now.toISOString().slice(0, 10);
      const start = new Date(now.getTime() - (29 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
      evoStart = evoStart || start;
      evoEnd = evoEnd || end;
    }

    const evoReplacements = { startDate: evoStart, endDate: evoEnd };
    const evolutionQuery = `
      SELECT DATE(r.date_debut) AS day,
        COUNT(*) AS total,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmees,
        SUM(CASE WHEN r.statut = 'en_attente' THEN 1 ELSE 0 END) AS enAttente,
        SUM(CASE WHEN r.statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejetees
      FROM reservations r
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
      GROUP BY DATE(r.date_debut)
      ORDER BY DATE(r.date_debut) ASC
    `;
    const evolutionRows = await sequelize.query(evolutionQuery, { replacements: evoReplacements, type: Sequelize.QueryTypes.SELECT });

    // Status distribution
    const statutQuery = `
      SELECT r.statut AS name, COUNT(r.id) AS value
      FROM reservations r
      ${whereSQL}
      GROUP BY r.statut
    `;
    const statutData = await sequelize.query(statutQuery, { replacements, type: Sequelize.QueryTypes.SELECT });

    // Top departments (reuse existing query logic but limit 5)
    const deptQuery = `
      SELECT COALESCE(d.id, 0) AS department_id, COALESCE(d.name, 'Non renseigné') AS department_name, COUNT(r.id) AS count
      FROM reservations r
      LEFT JOIN departments d ON r.department_id = d.id
      ${whereSQL}
      GROUP BY d.id, d.name
      ORDER BY count DESC
      LIMIT 5
    `;
    const topDepartments = await sequelize.query(deptQuery, { replacements, type: Sequelize.QueryTypes.SELECT });

    // Room occupancy: reservations per room (confirmed) + room capacity
    const roomOccupancyQuery = `
      SELECT rm.id AS room_id, rm.nom AS nom, rm.capacite AS capacite,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS reservations
      FROM rooms rm
      LEFT JOIN reservations r ON r.room_id = rm.id
      ${whereSQL ? whereSQL.replace(/r\./g, 'r.') : ''}
      GROUP BY rm.id, rm.nom, rm.capacite
      ORDER BY reservations DESC
    `;
    const roomOccupancy = await sequelize.query(roomOccupancyQuery, { replacements, type: Sequelize.QueryTypes.SELECT });

    return res.json({
      total: Number(kpis.total) || 0,
      confirmed: Number(kpis.confirmed) || 0,
      pending: Number(kpis.pending) || 0,
      rejected: Number(kpis.rejected) || 0,
      tauxValidation,
      tauxRejet,
      topSalles,
      evolutionData: evolutionRows,
      statutData,
      topDepartments,
      roomOccupancy,
    });
  } catch (error) {
    console.error('Erreur GET /api/stats/overview:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;