const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/verifyRole');
const { ROLES_USER_MANAGEMENT } = require('../constants/permissions');
const { User, Notification, SupportTicket } = require('../models');
const { Op } = require('sequelize');

// Constante pour les admins seulement
const ROLES_ADMIN = ['admin'];

/**
 * @swagger
 * /api/support/tickets:
 *   post:
 *     summary: Créer un nouveau ticket de support
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 */
router.post('/tickets', authMiddleware, async (req, res) => {
  try {
    const { subject, category, message, priority } = req.body;
    const userId = req.user.id;

    // Validation
    if (!subject || !message) {
      return res.status(400).json({ error: 'Le sujet et le message sont requis' });
    }

    // Récupérer les infos de l'utilisateur
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nom', 'prenom', 'email', 'role']
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Créer le ticket en base de données
    const ticket = await SupportTicket.create({
      user_id: userId,
      subject,
      category: category || 'general',
      message,
      priority: priority || 'normal',
      status: 'open',
      responses: []
    });

    // Notifier tous les admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    
    for (const admin of admins) {
      await Notification.create({
        user_id: admin.id,
        type: 'support_ticket',
        titre: `Nouveau signalement: ${subject}`,
        message: `${user.prenom} ${user.nom} a signalé un problème: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
        lu: false
      });
    }

    console.log(`📩 Nouveau ticket de support #${ticket.id} créé par ${user.email}`);

    res.status(201).json({
      message: 'Votre signalement a été envoyé avec succès. Un administrateur vous répondra bientôt.',
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        created_at: ticket.created_at
      }
    });
  } catch (error) {
    console.error('Erreur création ticket support:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du signalement' });
  }
});

/**
 * @swagger
 * /api/support/tickets:
 *   get:
 *     summary: Récupérer les tickets de support
 *     tags: [Support]
 */
router.get('/tickets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};
    if (userRole !== 'admin') {
      // Utilisateur voit seulement ses tickets
      whereClause = { user_id: userId };
    }

    const tickets = await SupportTicket.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    // Formater les tickets pour le frontend
    const formattedTickets = tickets.map(t => {
      const ticketData = t.toJSON();
      return {
        ...ticketData,
        user_name: ticketData.user ? `${ticketData.user.prenom} ${ticketData.user.nom}` : 'Utilisateur inconnu',
        user_email: ticketData.user ? ticketData.user.email : ''
      };
    });

    res.json(formattedTickets);
  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/support/tickets/:id:
 *   get:
 *     summary: Récupérer un ticket spécifique
 */
router.get('/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    // Vérifier l'accès
    if (userRole !== 'admin' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const ticketData = ticket.toJSON();
    res.json({
      ...ticketData,
      user_name: ticketData.user ? `${ticketData.user.prenom} ${ticketData.user.nom}` : 'Utilisateur inconnu',
      user_email: ticketData.user ? ticketData.user.email : ''
    });
  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/support/tickets/:id/respond:
 *   post:
 *     summary: Répondre à un ticket (admin)
 */
router.post('/tickets/:id/respond', authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { response, close_ticket } = req.body;
    const adminId = req.user.id;

    console.log('📩 Réponse ticket:', { ticketId, response: response?.substring(0, 50), adminId });

    const ticket = await SupportTicket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    if (!response) {
      return res.status(400).json({ error: 'La réponse est requise' });
    }

    // Récupérer l'admin
    const admin = await User.findByPk(adminId, {
      attributes: ['id', 'nom', 'prenom', 'email']
    });

    // Ajouter la réponse au tableau JSON (s'assurer que c'est un tableau)
    let currentResponses = [];
    if (Array.isArray(ticket.responses)) {
      currentResponses = [...ticket.responses];
    } else if (typeof ticket.responses === 'string') {
      try {
        currentResponses = JSON.parse(ticket.responses) || [];
      } catch (e) {
        currentResponses = [];
      }
    }
    
    currentResponses.push({
      id: currentResponses.length + 1,
      admin_id: adminId,
      admin_name: admin ? `${admin.prenom} ${admin.nom}` : 'Admin',
      message: response,
      created_at: new Date().toISOString()
    });

    // Mettre à jour le ticket
    await ticket.update({
      responses: currentResponses,
      status: close_ticket ? 'closed' : 'in_progress'
    });

    // Notifier l'utilisateur
    await Notification.create({
      user_id: ticket.user_id,
      type: 'support_response',
      titre: `Réponse à votre signalement: ${ticket.subject}`,
      message: `Un administrateur a répondu: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`,
      lu: false
    });

    // Recharger le ticket avec les infos user
    const updatedTicket = await SupportTicket.findByPk(ticketId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }]
    });

    res.json({
      message: 'Réponse envoyée avec succès',
      ticket: updatedTicket.toJSON()
    });
  } catch (error) {
    console.error('Erreur réponse ticket:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/support/tickets/:id/close:
 *   put:
 *     summary: Fermer un ticket
 */
router.put('/tickets/:id/close', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const ticket = await SupportTicket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    // Seul l'admin ou le créateur peut fermer
    if (userRole !== 'admin' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await ticket.update({ status: 'closed' });

    res.json({
      message: 'Ticket fermé avec succès',
      ticket: ticket.toJSON()
    });
  } catch (error) {
    console.error('Erreur fermeture ticket:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/support/stats:
 *   get:
 *     summary: Statistiques des tickets (admin)
 */
router.get('/stats', authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const allTickets = await SupportTicket.findAll();
    
    const stats = {
      total: allTickets.length,
      open: allTickets.filter(t => t.status === 'open').length,
      in_progress: allTickets.filter(t => t.status === 'in_progress').length,
      resolved: allTickets.filter(t => t.status === 'resolved').length,
      closed: allTickets.filter(t => t.status === 'closed').length,
      by_category: {},
      by_priority: {}
    };

    // Compter par catégorie et priorité
    allTickets.forEach(t => {
      stats.by_category[t.category] = (stats.by_category[t.category] || 0) + 1;
      stats.by_priority[t.priority] = (stats.by_priority[t.priority] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Erreur stats support:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
