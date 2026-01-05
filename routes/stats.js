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
        d.id AS department_id,
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
      SELECT COUNT(DISTINCT d.id) AS total
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
      SELECT rm.id AS room_id, rm.nom AS nom, COUNT(r.id) AS count
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
      SELECT d.id AS department_id, COALESCE(d.name, 'Non renseigné') AS department_name, COUNT(r.id) AS count
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

// GET /api/stats/weekly-report
// Rapport hebdomadaire/mensuel pour les réunions des directeurs
// Accepte des paramètres optionnels: startDate, endDate, type (week/month)
router.get('/weekly-report', authMiddleware, async (req, res) => {
  try {
    const { startDate: queryStart, endDate: queryEnd, type = 'week' } = req.query;
    
    let lastWeekStart, lastWeekEnd, prevWeekStart, prevWeekEnd;
    
    if (queryStart && queryEnd) {
      // Utiliser les dates fournies
      lastWeekStart = queryStart;
      lastWeekEnd = queryEnd;
      
      // Calculer la période précédente équivalente
      const start = new Date(queryStart);
      const end = new Date(queryEnd);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - diffDays + 1);
      
      prevWeekStart = prevStart.toISOString().slice(0, 10);
      prevWeekEnd = prevEnd.toISOString().slice(0, 10);
    } else if (type === 'month') {
      // Mois précédent
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      lastWeekStart = lastMonth.toISOString().slice(0, 10);
      lastWeekEnd = lastMonthEnd.toISOString().slice(0, 10);
      
      // Mois d'avant
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      
      prevWeekStart = prevMonth.toISOString().slice(0, 10);
      prevWeekEnd = prevMonthEnd.toISOString().slice(0, 10);
    } else {
      // Calculer les dates de la semaine passée (lundi à dimanche) - comportement par défaut
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      // Semaine actuelle (en cours)
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - diffToLastMonday);
      thisMonday.setHours(0, 0, 0, 0);
      
      // Semaine passée (celle qu'on rapporte)
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      lastSunday.setHours(23, 59, 59, 999);
      
      // Semaine d'avant (pour comparaison)
      const prevMonday = new Date(lastMonday);
      prevMonday.setDate(lastMonday.getDate() - 7);
      const prevSunday = new Date(lastMonday);
      prevSunday.setDate(lastMonday.getDate() - 1);
      
      const formatDate = (d) => d.toISOString().slice(0, 10);
      lastWeekStart = formatDate(lastMonday);
      lastWeekEnd = formatDate(lastSunday);
      prevWeekStart = formatDate(prevMonday);
      prevWeekEnd = formatDate(prevSunday);
    }

    // 1. KPIs de la semaine passée (basé sur date_debut = date de la réservation)
    const kpiQuery = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN r.statut = 'en_attente' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN r.statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejected
      FROM reservations r
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
    `;

    const [lastWeekKpis] = await sequelize.query(kpiQuery, { 
      replacements: { startDate: lastWeekStart, endDate: lastWeekEnd }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    const [prevWeekKpis] = await sequelize.query(kpiQuery, { 
      replacements: { startDate: prevWeekStart, endDate: prevWeekEnd }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    // Calculer l'évolution en pourcentage
    const calcEvolution = (current, previous) => {
      const curr = Number(current) || 0;
      const prev = Number(previous) || 0;
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    // 2. Top 5 salles les plus réservées
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
      replacements: { startDate: lastWeekStart, endDate: lastWeekEnd }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    // 3. Top 5 départements les plus actifs
    const topDeptQuery = `
      SELECT d.id, COALESCE(d.name, 'Non renseigné') AS name, COUNT(r.id) AS reservations,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmees
      FROM reservations r
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
      GROUP BY d.id, d.name
      ORDER BY reservations DESC
      LIMIT 5
    `;
    const topDepartments = await sequelize.query(topDeptQuery, { 
      replacements: { startDate: lastWeekStart, endDate: lastWeekEnd }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    // 4. Évolution jour par jour de la semaine
    const dailyQuery = `
      SELECT 
        DATE(r.date_debut) AS date,
        DAYNAME(r.date_debut) AS jour,
        COUNT(*) AS total,
        SUM(CASE WHEN r.statut IN ('confirmee','validee') THEN 1 ELSE 0 END) AS confirmees,
        SUM(CASE WHEN r.statut = 'en_attente' THEN 1 ELSE 0 END) AS en_attente,
        SUM(CASE WHEN r.statut IN ('rejetee','refusee','annulee') THEN 1 ELSE 0 END) AS rejetees
      FROM reservations r
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
      GROUP BY DATE(r.date_debut), DAYNAME(r.date_debut)
      ORDER BY DATE(r.date_debut) ASC
    `;
    const dailyStats = await sequelize.query(dailyQuery, { 
      replacements: { startDate: lastWeekStart, endDate: lastWeekEnd }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    // 5. Liste détaillée des réservations de la semaine
    const reservationsQuery = `
      SELECT 
        r.id,
        r.motif,
        r.statut,
        DATE_FORMAT(r.date_debut, '%Y-%m-%d') AS date,
        DATE_FORMAT(r.date_debut, '%H:%i') AS heure_debut,
        DATE_FORMAT(r.date_fin, '%H:%i') AS heure_fin,
        rm.nom AS salle,
        CONCAT(u.prenom, ' ', u.nom) AS demandeur,
        d.name AS departement,
        DATE_FORMAT(r.createdAt, '%Y-%m-%d %H:%i') AS date_demande
      FROM reservations r
      LEFT JOIN rooms rm ON r.room_id = rm.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE DATE(r.date_debut) BETWEEN :startDate AND :endDate
      ORDER BY r.date_debut ASC
    `;
    const reservations = await sequelize.query(reservationsQuery, { 
      replacements: { startDate: lastWeekStart, endDate: lastWeekEnd }, 
      type: Sequelize.QueryTypes.SELECT 
    });

    // Construire le rapport
    const report = {
      periode: {
        debut: lastWeekStart,
        fin: lastWeekEnd,
        semainePrecedente: { debut: prevWeekStart, fin: prevWeekEnd }
      },
      resume: {
        total: Number(lastWeekKpis?.total) || 0,
        confirmees: Number(lastWeekKpis?.confirmed) || 0,
        en_attente: Number(lastWeekKpis?.pending) || 0,
        rejetees: Number(lastWeekKpis?.rejected) || 0,
        tauxValidation: lastWeekKpis?.total > 0 
          ? ((Number(lastWeekKpis?.confirmed) / Number(lastWeekKpis?.total)) * 100).toFixed(1) 
          : '0',
      },
      evolution: {
        total: calcEvolution(lastWeekKpis?.total, prevWeekKpis?.total),
        confirmees: calcEvolution(lastWeekKpis?.confirmed, prevWeekKpis?.confirmed),
      },
      topSalles,
      topDepartments,
      dailyStats,
      reservations,
      generatedAt: new Date().toISOString()
    };

    return res.json(report);
  } catch (error) {
    console.error('Erreur GET /api/stats/weekly-report:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;