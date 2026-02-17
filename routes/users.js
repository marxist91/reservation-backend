
const { Op } = require("sequelize");
const verifyMinimumRole = require("../middlewares/verifyMinimumRole");
const verifyRole = require("../middlewares/verifyRole");
const express = require("express");
const router = express.Router();
const { Reservation, User, Room, Department, AuditLog, Notification, SupportTicket, RecurringMeeting, ProposedAlternative } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const { horairesValides, dureeMinimale } = require("../utils/validations");
const autoAudit = require("../middlewares/autoAudit");
const {ROLES_USER_UPDATE} = require("../constants/permissions");
const { UPDATE_USER } = require("../constants/actions"); // "UPDATE_USER"
const safeResponse = require("../utils/safeResponse");

// Suppression complète d’un utilisateur et toutes ses dépendances (admin)
router.delete("/:id/full", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    // Supprimer toutes les notifications liées AVANT toute suppression (évite les contraintes)
    if (Notification) {
      await Notification.destroy({ where: { user_id: id } });
    }
    // Supprimer toutes les alternatives proposées par cet utilisateur (clé étrangère proposed_by)
    if (typeof ProposedAlternative !== "undefined" && ProposedAlternative) {
      await ProposedAlternative.destroy({ where: { proposed_by: id } });
    }
    // Suppression des réservations
    await Reservation.destroy({ where: { user_id: id } });
    // Suppression des salles
    if (user.role === "responsable") {
      await Room.destroy({ where: { responsable_id: id } });
    }
    // Suppression des départements
    if (user.role === "responsable") {
      await Department.destroy({ where: { responsable_id: id } });
    }
    // Suppression des logs d’audit
    await AuditLog.destroy({ where: { user_id: id } });
    // Suppression des tickets support
    if (SupportTicket) {
      await SupportTicket.destroy({ where: { user_id: id } });
    }
    // Suppression des réunions récurrentes
    if (RecurringMeeting) {
      await RecurringMeeting.destroy({ where: { responsable_id: id } });
    }
    // Enfin, suppression du user
    await user.destroy();
    return res.json({ success: true, message: "Utilisateur et toutes ses données liées supprimés" });
  } catch (error) {
    console.error("Erreur suppression complète utilisateur:", error);
    return res.status(500).json({ error: "Erreur lors de la suppression complète de l'utilisateur" });
  }
});


//const { Reservation, User } = require("../models");
//const authMiddleware = require("../middlewares/authMiddleware");
//const { horairesValides, dureeMinimale } = require("../utils/validations");
//const autoAudit = require("../middlewares/autoAudit");


// Suppression d’un utilisateur (admin)
router.delete("/:id", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    // Supprimer toutes les notifications liées à cet utilisateur
    if (Notification) {
      await Notification.destroy({ where: { user_id: id } });
    }
    // Supprimer toutes les alternatives proposées par cet utilisateur (clé étrangère proposed_by)
    if (typeof ProposedAlternative !== "undefined" && ProposedAlternative) {
      await ProposedAlternative.destroy({ where: { proposed_by: id } });
    }
    // Supprimer toutes les réservations validées par cet utilisateur (clé étrangère validee_par)
    await Reservation.destroy({ where: { validee_par: id } });
    // (Optionnel) Supprimer d'autres dépendances si besoin ici
    await user.destroy();
    return res.json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// Désactiver ou réactiver un utilisateur (admin)
router.put("/:id/actif", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { actif } = req.body;
  if (typeof actif !== "boolean") {
    return res.status(400).json({ error: "Le champ 'actif' doit être un booléen." });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    user.actif = actif;
    await user.save();
    return res.json({ success: true, id: user.id, actif: user.actif });
  } catch (error) {
    console.error("Erreur désactivation utilisateur:", error);
    return res.status(500).json({ error: "Erreur lors de la désactivation" });
  }
});

// 🔹 GET /api/reservations : Vue filtrée + pagination



router.get("/registry", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  const { role, email, nom, limit, offset } = req.query;
  // Construction du filtre dynamique pour la recherche
  const filtre = {};
  if (role) filtre.role = role;
  if (email) filtre.email = { [Op.like]: `%${email}%` };
  if (nom) {
    // Recherche sur nom OU prénom OU email (fréquent en admin)
    filtre[Op.or] = [
      { nom: { [Op.like]: `%${nom}%` } },
      { prenom: { [Op.like]: `%${nom}%` } },
      { email: { [Op.like]: `%${nom}%` } }
    ];
  }

  try {
    // Pagination sécurisée
    const pageLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100));
    const pageOffset = Math.max(0, parseInt(offset) || 0);

    // Compter le total filtré
    const total = await User.count({ where: filtre });
    // Récupérer les utilisateurs paginés
    const utilisateurs = await User.findAll({
      where: filtre,
      attributes: ["id", "nom", "prenom", "email", "role", "telephone", "actif", "createdAt", "updatedAt"],
      order: [["nom", "ASC"]],
      limit: pageLimit,
      offset: pageOffset
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
      offset: pageOffset,
      limit: pageLimit,
      utilisateurs: formattedUsers
    }, 200, {
      endpoint: "/api/users/registry",
      user: req.user?.email,
      ip: req.ip
    });
  } catch (error) {
    console.error("Erreur /registry:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
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

router.put("/update/:userId", authMiddleware, autoAudit({ action: UPDATE_USER, cibleType: "User" }), verifyRole(ROLES_USER_UPDATE), async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    // Met à jour uniquement les champs présents dans req.body
    const updatableFields = ["role", "nom", "prenom", "email", "telephone", "actif"];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    await user.save();
    return res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Erreur update user:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

module.exports = router;