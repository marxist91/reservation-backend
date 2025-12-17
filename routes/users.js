const express = require("express");
const router = express.Router();
const { Reservation, User, Room } = require("../models");
const { Op } = require("sequelize");

const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");
const verifyMinimumRole = require("../middlewares/verifyMinimumRole");

const { horairesValides, dureeMinimale } = require("../utils/validations");
const autoAudit = require("../middlewares/autoAudit");
const {RESERVATION_STATUTS,ROLES_RESERVATION_VALIDATION,ROLES_USER_UPDATE} = require("../constants/permissions");
const { UPDATE_USER } = require("../constants/actions"); // "UPDATE_USER"
const safeResponse = require("../utils/safeResponse");

// 🔹 GET /api/reservations : Vue filtrée + pagination



router.get("/registry", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  const { role, email, nom, limit, offset } = req.query;

  const filtre = {};
  if (role) filtre.role = role;
  if (email) filtre.email = email;
  if (nom) filtre.nom = { [Op.like]: `%${nom}%` };

  try {
    const pagination = {
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0
    };

    const total = await User.count({ where: filtre });

    const utilisateurs = await User.findAll({
      where: filtre,
      attributes: ["id", "nom", "prenom", "email", "role", "telephone", "actif", "createdAt", "updatedAt"],
      order: [["nom", "ASC"]],
      limit: pagination.limit,
      offset: pagination.offset
    });

    // Mapper les noms de champs Sequelize vers le format attendu par le frontend
    const formattedUsers = utilisateurs.map(user => ({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      actif: user.actif,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));

    return safeResponse(res, {
      total,
      count: utilisateurs.length,
      offset: pagination.offset,
      limit: pagination.limit,
      utilisateurs: formattedUsers
    }, 200, {
      endpoint: "/api/users/list",
      user: req.user?.email,
      ip: req.ip
    });

  } catch (error) {
    console.error("❌ Erreur filtre paginé :", error);

    return safeResponse(res, { error: "Erreur serveur" }, 500, {
      endpoint: "/api/users/list",
      user: req.user?.email,
      ip: req.ip
    });
  }
});
// 🔹 POST /api/reservations : Création sécurisée avec hiérarchie de rôles
router.post("/register", authMiddleware, verifyMinimumRole("utilisateur"), async (req, res) => {
  const { room_id, date, heure_debut, heure_fin, statut, equipements_attribues } = req.body;
  const user_id = req.user.id;

  try {
    if (!room_id || !date || !heure_debut || !heure_fin) {
      // ERREUR CORRIGÉE : res.status() avec objet au lieu du code de statut
      return res.status(400).json({ error: "⛔ Paramètres requis manquants" });
    }

    if (!horairesValides(heure_debut, heure_fin)) {
      return res.status(400).json({
        error: "⛔ Créneau invalide : l'heure de fin doit être après l'heure de début"
      });
    }

    if (!dureeMinimale(heure_debut, heure_fin)) {
      return res.status(400).json({
        error: "⛔ Durée trop courte : minimum 30 minutes requises"
      });
    }

    const chevauchement = await Reservation.findOne({
      where: {
        room_id,
        date,
        [Op.or]: [
          { heure_debut: { [Op.between]: [heure_debut, heure_fin] } },
          { heure_fin: { [Op.between]: [heure_debut, heure_fin] } },
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_debut } },
              { heure_fin: { [Op.gte]: heure_fin } }
            ]
          }
        ]
      }
    });

    if (chevauchement) {
      return res.status(409).json({ error: "⛔ La salle est déjà réservée à ce créneau." });
    }

    const nouvelleReservation = await Reservation.create({
      user_id,
      room_id,
      date,
      heure_debut,
      heure_fin,
      statut: statut ?? "en_attente",
      equipements_attribues
    });

    return res.status(201).json({
      message: "✅ Réservation créée",
      reservation: nouvelleReservation
    });
  } catch (error) {
    console.error("❌ GET api/users/:id/reservations :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/update/:userId", authMiddleware,autoAudit({ action: UPDATE_USER, cibleType: "User" }), verifyRole(ROLES_USER_UPDATE),async (req, res) => {
    const { userId } = req.params;
    const { nom, email, role } = req.body;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "📛 Utilisateur introuvable" });
      }

      req.auditSnapshot = user.toJSON(); // 🧠 état avant modif

      if (nom) user.nom = nom;
      if (email) user.email = email;
      if (role) user.role = role;

      await user.save();

      return res.json({ success: true, updated: user }); // ✅ capté par autoAudit
    } catch (error) {
      console.error("❌ Erreur PUT /users/update/:userId :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }
);


// 🔧 PUT /api/reservations/:id : Mise à jour du statut
router.put( "/update/:userId",authMiddleware,autoAudit({ action: "UPDATE_RESERVATION", cibleType: "Reservation" }),verifyRole(ROLES_RESERVATION_VALIDATION),async (req, res) => {
    const { userId } = req.params;
    const { statut } = req.body;

    if (!RESERVATION_STATUTS.includes(statut)) {
      return res.status(400).json({
        error: `⛔ Statut invalide. Autorisés : ${RESERVATION_STATUTS.join(", ")}`
      });
    }

    try {
      const reservation = await Reservation.findOne({ where: { user_id: userId } });

      if (!reservation) {
        return res.status(404).json({ error: "📛 Réservation introuvable" });
      }

      req.auditSnapshot = reservation.toJSON(); // 👁️ état avant modification

      reservation.statut = statut;
      await reservation.save();

      return res.status(200).json({
        message: "✅ Réservation mise à jour",
        updated: reservation // ✅ capté par autoAudit
      });
    } catch (error) {
      console.error("❌ Erreur mise à jour réservation :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }
);


module.exports = router;