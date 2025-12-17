const express = require("express");
const router = express.Router();
const { History, User, Reservation } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");

// GET /api/history - Historique (Admin voit tout, User voit le sien + actions sur ses réservations)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let history;
    
    // Si admin ou responsable (y compris variantes), voir tout
    if (userRole === 'admin' || userRole === 'responsable' || userRole === 'responsable_salle') {
      history = await History.findAll({
        order: [["created_at", "DESC"]],
        include: [
          { model: User, as: 'utilisateur', attributes: ['id', 'nom', 'email'] },
          { model: Reservation, as: 'reservation', attributes: ['id', 'date', 'heure_debut', 'heure_fin', 'user_id'] }
        ]
      });
    } else {
      // Pour les utilisateurs normaux : actions faites PAR l'utilisateur OU actions sur SES réservations
      const { Sequelize } = require('sequelize');
      
      history = await History.findAll({
        order: [["created_at", "DESC"]],
        include: [
          { model: User, as: 'utilisateur', attributes: ['id', 'nom', 'email'] },
          { 
            model: Reservation, 
            as: 'reservation', 
            attributes: ['id', 'date', 'heure_debut', 'heure_fin', 'user_id'],
            required: false // LEFT JOIN pour inclure aussi les entrées sans réservation
          }
        ],
        where: {
          [Sequelize.Op.or]: [
            { user_id: userId }, // Actions faites par l'utilisateur
            { '$reservation.user_id$': userId } // Actions sur les réservations de l'utilisateur
          ]
        }
      });
    }
    
    console.log(`📜 Historique renvoyé: ${history.length} entrées pour user ${userId} (role: ${userRole})`);
    res.json(history);
  } catch (error) {
    console.error("Erreur GET /history:", error);
    // Fallback si created_at échoue
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        
        let whereClause = {};
        if (userRole !== 'admin' && userRole !== 'responsable_salle') {
          whereClause = { user_id: userId };
        }
        
        const history = await History.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
            include: [
              { model: User, as: 'utilisateur', attributes: ['id', 'nom', 'email'] },
              { model: Reservation, as: 'reservation', attributes: ['id', 'date', 'heure_debut', 'heure_fin'] }
            ]
          });
          res.json(history);
    } catch (e) {
        res.status(500).json({ error: "Erreur récupération historique global" });
    }
  }
});

// GET /api/history/mine - Historique de l'utilisateur connecté
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      include: ["reservation"] 
    });
    res.json(history);
  } catch (error) {
    console.error("Erreur GET /history/mine:", error);
    res.status(500).json({ error: "Erreur récupération historique" });
  }
});

// GET /api/history/reservation/:id - Historique d'une réservation spécifique
router.get("/reservation/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Ajouter vérification que l'utilisateur a le droit de voir cette réservation
    
    const history = await History.findAll({
      where: { reservation_id: id },
      order: [["created_at", "DESC"]]
    });
    res.json(history);
  } catch (error) {
    console.error("Erreur GET /history/reservation/:id:", error);
    res.status(500).json({ error: "Erreur récupération historique réservation" });
  }
});

module.exports = router;
