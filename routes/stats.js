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
      const safeStatut = String(statut).replace(/[^a-zA-Z0-9_]/g, '');
      whereClauses.push('(r.statut = :statut)');
      replacements.statut = safeStatut;
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

module.exports = router;
