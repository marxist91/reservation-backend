const express = require("express");
const router = express.Router();
const fs = require("fs");

const { Reservation, User, Room } = require("../models");
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");
const autoAudit = require("../middlewares/autoAudit");

const verifyMinimumRole = require("../middlewares/verifyMinimumRole");
const { horairesValides, dureeMinimale } = require("../utils/validations");
const {RESERVATION_STATUTS, ROLES_RESERVATION_VALIDATION} = require("../constants/permissions");
const { ROLES_ROOM_VIEW,ROLES_RESERVATION_VIEW , } = require("../constants/permissions");
//const sendEmail = require("../utils/sendEmail"); // utilitaire à créer
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../services/mailer");
const ACTIONS = require("../constants/actions");

import safeResponse from "../utils/safeResponse";

/**
 * @swagger
 * /api/reservations/occupation:
 *   get:
 *     summary: Récupère les statistiques d'occupation des salles
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service"]
 *       action: "VIEW_ROOM_OCCUPATION"
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date pour les statistiques (YYYY-MM-DD)
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [validée, en_attente, annulée]
 *         description: Filtrer par statut de réservation
 *     responses:
 *       200:
 *         description: Statistiques d'occupation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   capacite:
 *                     type: integer
 *                   taux_occupation:
 *                     type: string
 *       400:
 *         description: Statut invalide
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Permissions insuffisantes
 */
router.get("/occupation", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { date, statut } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);

  // �??� creneaux d'ouverture configurés
  const heuresOuvertes = [
    "07:00","08:00","09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00","18:00","19:00"
  ];
  const totalcreneaux = heuresOuvertes.length;

  try {
    const rooms = await Room.findAll();
    const stats = [];

    for (const room of rooms) {
      const filtre = {
        room_id: room.id,
        date: dateCible
      };

      // a?? Appliquer le filtre sur le statut si fourni
      if (statut) {
        if (!RESERVATION_STATUTS.includes(statut)) {
          return res.status(400).json({
            error: `a?? Statut invalide. Autorisés : ${RESERVATION_STATUTS.join(", ")}`
          });
        }
        filtre.statut = statut;
      }

      const reservations = await Reservation.findAll({
        where: filtre,
        attributes: ["heure_debut", "heure_fin"]
      });

      let creneauxOccupés = 0;

      for (const r of reservations) {
        const idxDebut = heuresOuvertes.indexOf(r.heure_debut);
        const idxFin = heuresOuvertes.indexOf(r.heure_fin);
        if (idxDebut !== -1 && idxFin !== -1) {
          creneauxOccupés += idxFin - idxDebut;
        }
      }

      const taux = totalcreneaux === 0 ? 0 : Math.round((creneauxOccupés / totalcreneaux) * 100);

      stats.push({
        id: room.id,
        nom: room.nom,
        capacite: room.capacite,
        date: dateCible,
        statut: statut || "tous",
        creneaux_disponibles: totalcreneaux,
        creneaux_occupés: creneauxOccupés,
        taux_occupation: `${taux}%`
      });
    }

    return res.json(stats);
  } catch (error) {
    console.error("a�? Erreur GET /api/reservations/occupation :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/reservations/validate/{id}:
 *   put:
 *     summary: Valide une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service"]
 *       action: "VALIDATE_RESERVATION"
 *       resource: "reservation"
 *     x-audit:
 *       action: "VALIDATE_RESERVATION"
 *       type: "Reservation"
 *       sensitivity: "medium"
 *       requires_snapshot: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à valider
 *     responses:
 *       200:
 *         description: Réservation validée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updated:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
router.put( "/validate/:id",authMiddleware, autoAudit({ action: "VALIDATE_RESERVATION", cibleType: "Reservation" }),verifyRole(ROLES_RESERVATION_VALIDATION), async (req, res) => {
    const { id } = req.params;

    try {
      const reservation = await Reservation.findByPk(id);
      if (!reservation) {
        return res.status(404).json({ error: "�??? Réservation introuvable" });
      }

      req.auditSnapshot = reservation.toJSON(); // état avant validation

      reservation.statut = "validée"; // ou ton statut métier
      await reservation.save();

      return res.json({ success: true, updated: reservation }); // capté par autoAudit
    } catch (error) {
      console.error("a�? Erreur PUT /reservations/validate/:id :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

/**
 * @swagger
 * /api/reservations/occupation/roles:
 *   get:
 *     summary: Statistiques d'occupation par rôle de responsable
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service"]
 *       action: "VIEW_ROOM_OCCUPATION_BY_ROLE"
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [validée, en_attente, annulée]
 *     responses:
 *       200:
 *         description: Statistiques par rôle
 */
router.get("/occupation/roles", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { date, statut } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);

  const heuresOuvertes = [
    "07:00","08:00","09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00","18:00","19:00"
  ];
  const totalcreneaux = heuresOuvertes.length;

  try {
    const rooms = await Room.findAll({
      include: {
        model: User,
        as: "responsable",
        attributes: ["role"]
      }
    });

    const statsParRole = {};

    for (const room of rooms) {
      const role = room.responsable?.role;
      if (!role) continue;

      const filtre = {
        room_id: room.id,
        date: dateCible
      };

      if (statut) {
        filtre.statut = statut;
      }

      const reservations = await Reservation.findAll({
        where: filtre,
        attributes: ["heure_debut", "heure_fin"]
      });

      let creneauxOccupés = 0;
      for (const r of reservations) {
        const idxDebut = heuresOuvertes.indexOf(r.heure_debut);
        const idxFin = heuresOuvertes.indexOf(r.heure_fin);
        if (idxDebut !== -1 && idxFin !== -1) {
          creneauxOccupés += idxFin - idxDebut;
        }
      }

      if (!statsParRole[role]) {
        statsParRole[role] = {
          rôle: role,
          salles: 0,
          capacité_totale: 0,
          occupation_creneaux: 0
        };
      }

      statsParRole[role].salles += 1;
      statsParRole[role].capacité_totale += room.capacite ?? 0;
      statsParRole[role].occupation_creneaux += creneauxOccupés;
    }

    // �?�� Calcul des taux
    for (const role in statsParRole) {
      const { salles, occupation_creneaux } = statsParRole[role];
      const total = salles * totalcreneaux;
      const taux = total > 0 ? Math.round((occupation_creneaux / total) * 100) : 0;
      statsParRole[role].taux_occupation_moyen = `${taux}%`;
    }

    return res.json(Object.values(statsParRole));
  } catch (error) {
    console.error("a�? Erreur GET /api/reservations/occupation/roles :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/reservations/occupation/semaine:
 *   get:
 *     summary: Historique d'occupation sur 7 jours
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service"]
 *       action: "VIEW_WEEKLY_OCCUPATION"
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [validée, en_attente, annulée]
 *     responses:
 *       200:
 *         description: Statistiques hebdomadaires
 */
router.get("/occupation/semaine", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { statut } = req.query;
  const aujourdHui = new Date();
  const heuresOuvertes = [
    "07:00","08:00","09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00","18:00","19:00"
  ];

  try {
    const rooms = await Room.findAll();
    const stats = [];

    for (const room of rooms) {
      const historique = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(aujourdHui);
        d.setDate(aujourdHui.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);

        const conditions = {
          room_id: room.id,
          date: dateStr
        };

        if (statut) {
          conditions.statut = statut;
        }

        const reservations = await Reservation.findAll({ where: conditions, attributes: ["heure_debut", "heure_fin"] });

        let creneauxOccupés = 0;
        for (const r of reservations) {
          const idxDebut = heuresOuvertes.indexOf(r.heure_debut);
          const idxFin = heuresOuvertes.indexOf(r.heure_fin);
          if (idxDebut !== -1 && idxFin !== -1) {
            creneauxOccupés += idxFin - idxDebut;
          }
        }

        const totalcreneaux = heuresOuvertes.length;
        const taux = totalcreneaux === 0 ? 0 : Math.round((creneauxOccupés / totalcreneaux) * 100);

        historique.push({
          date: dateStr,
          creneaux_occupés: creneauxOccupés,
          taux_occupation: `${taux}%`
        });
      }

      stats.push({
        id: room.id,
        nom: room.nom,
        capacite: room.capacite,
        semaine: historique
      });
    }

    return res.json(stats);
  } catch (error) {
    console.error("a�? Erreur GET /api/reservations/occupation/semaine :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// �??� GET /api/reservations : Vue filtrée + pagination
// �??� Statuts UX + classe CSS
const BADGES_STATUT = {
  validée: { emoji: "�??� validée", css: "row-validée" },
  en_attente: { emoji: "�??� en attente", css: "row-attente" },
  annulée: { emoji: "�??� annulée", css: "row-annulée" }
};

// �??� Icônes par rôle
const ICONES_ROLE = {
  admin: "�??�a?��??� admin",
  responsable_salle: "�??�a?��??� responsable",
  utilisateur: "�??� utilisateur",
  chef_service: "�??�a?��??� chef de service"
};

// �?�� Badge moment de la journée
const badgeCreneau = (h) => {
  if (h >= "06:00" && h <= "12:00") return "�??? matin";
  if (h >= "12:01" && h <= "18:00") return "�??? après-midi";
  if (h >= "18:01") return "�??? soir";
  return "a�? inconnu";
};

// a��️ Durée humaine
const calculerDurée = (debut, fin) => {
  const [h1, m1] = debut.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}` : ""}${m > 0 ? "min" : ""}` || "a??";
};

/**
 * @swagger
 * /api/reservations/all:
 *   get:
 *     summary: Liste toutes les réservations avec filtrage
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service", "utilisateur"]
 *       action: "VIEW_RESERVATIONS"
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [validée, en_attente, annulée]
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
router.get("/all", authMiddleware, verifyRole(ROLES_RESERVATION_VIEW), async (req, res) => {
  const { date, room_id, statut } = req.query;

  const filtre = {};
  if (date) filtre.date = date;
  if (room_id) filtre.room_id = room_id;
  if (statut) filtre.statut = statut;

  try {
    const reservations = await Reservation.findAll({
      where: Object.keys(filtre).length > 0 ? filtre : undefined,
      include: [
        { model: Room, as: "salle", attributes: ["id", "nom"] },
        { model: User, as: "utilisateur", attributes: ["id", "nom", "email", "role"] }
      ],
      order: [["date", "ASC"], ["heure_debut", "ASC"]]
    });

    const enrichies = reservations.map(r => {
      const statObj = BADGES_STATUT[r.statut] || { emoji: `a�? ${r.statut}`, css: "row-inconnu" };
      const role = r.utilisateur?.role;
      const icone_role = ICONES_ROLE[role] ?? `�??� ${role || "inconnu"}`;
      return {
        id: r.id,
        date: r.date,
        heure_debut: r.heure_debut,
        heure_fin: r.heure_fin,
        statut: r.statut,
        badge_statut: statObj.emoji,
        html_row_class: statObj.css,
        badge_creneau: badgeCreneau(r.heure_debut),
        durée_humaine: calculerDurée(r.heure_debut, r.heure_fin),
        résumé: `${r.utilisateur?.nom} a réservé ${r.salle?.nom} le ${r.date} à ${r.heure_debut}`,
        icone_role,
        salle: r.salle,
        utilisateur: r.utilisateur
      };
    });

    return safeResponse(res, enrichies, 200, { 
      endpoint: "/api/reservations/list", 
      user: req.user?.email 
    });

  } catch (error) {
    console.error("a�? Erreur GET /api/reservations/list :", error);
    return safeResponse(res, { error: "Erreur serveur" }, 500, {
      endpoint: "/api/reservations/list",
      user: req.user?.email
    });
  }
});

/**
 * @swagger
 * /api/reservations/create:
 *   post:
 *     summary: Crée une nouvelle réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service", "utilisateur"]
 *       action: "CREATE_RESERVATION"
 *       resource: "reservation"
 *     x-audit:
 *       action: "CREATE_RESERVATION"
 *       type: "Reservation"
 *       sensitivity: "medium"
 *       requires_snapshot: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - date
 *               - heure_debut
 *               - heure_fin
 *             properties:
 *               room_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               heure_debut:
 *                 type: string
 *                 format: time
 *               heure_fin:
 *                 type: string
 *                 format: time
 *               statut:
 *                 type: string
 *                 enum: [validée, en_attente, annulée]
 *               equipements_attribues:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Paramètres invalides
 *       409:
 *         description: Conflit - salle déjà réservée
 */
router.post("/create", authMiddleware, verifyMinimumRole("user"), async (req, res) => {
  const { room_id, date, heure_debut, heure_fin, statut, equipements_attribues, motif, nombre_participants } = req.body;
  const user_id = req.user.id;

  try {
    if (!room_id || !date || !heure_debut || !heure_fin) {
      return res.status(400).json({ error: "Paramètres requis manquants" });
    }

    // Construction des objets Date
    const startDateTime = new Date(`${date}T${heure_debut}`);
    const endDateTime = new Date(`${date}T${heure_fin}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: "Format de date ou d'heure invalide" });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        error: "Créneau invalide : l'heure de fin doit être après l'heure de début"
      });
    }

    // Vérification de la durée minimale (30 min)
    const durationMinutes = (endDateTime - startDateTime) / (1000 * 60);
    if (durationMinutes < 30) {
      return res.status(400).json({
        error: "Durée trop courte : minimum 30 minutes requises"
      });
    }

    // Vérification des chevauchements
    const chevauchement = await Reservation.findOne({
      where: {
        room_id,
        statut: { [Op.ne]: 'annulee' },
        [Op.or]: [
          {
            date_debut: {
              [Op.lt]: endDateTime
            },
            date_fin: {
              [Op.gt]: startDateTime
            }
          }
        ]
      }
    });

    if (chevauchement) {
      return res.status(409).json({ error: "La salle est déjà réservée à ce créneau." });
    }

    const nouvelleReservation = await Reservation.create({
      user_id,
      room_id,
      date_debut: startDateTime,
      date_fin: endDateTime,
      statut: statut ?? "en_attente",
      equipements_supplementaires: equipements_attribues,
      motif: motif || "Réunion",
      nombre_participants: nombre_participants || 1
    });

    return res.status(201).json({
      message: "Réservation créée",
      reservation: nouvelleReservation
    });
  } catch (error) {
    console.error("a�? Erreur POST/api/reservations/create :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/reservations/delete/{id}:
 *   delete:
 *     summary: Supprime une réservation (Admin uniquement)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin"]
 *       action: "DELETE_RESERVATION"
 *       resource: "reservation"
 *     x-audit:
 *       action: "DELETE_RESERVATION"
 *       type: "Reservation"
 *       sensitivity: "high"
 *       requires_snapshot: true
 *       critical: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à supprimer
 *     responses:
 *       200:
 *         description: Réservation supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 deletedId:
 *                   type: integer
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Permissions insuffisantes (Admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.delete( "/delete/:id",authMiddleware,autoAudit({ action: "DELETE_RESERVATION", cibleType: "Reservation" }),verifyRole("admin"),async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findByPk(id);

      if (!reservation) {
        return res.status(404).json({ error: "�??? Réservation introuvable" });
      }

      req.auditSnapshot = reservation.toJSON(); // avant suppression
      await reservation.destroy();

      res.json({ success: true, deletedId: id });
    } catch (error) {
      console.error("a�? Erreur DELETE /reservations/delete/:id :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

/**
 * @swagger
 * /api/reservations/assign/{id}:
 *   put:
 *     summary: Assigne un responsable à une réservation (Admin uniquement)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin"]
 *       action: "ASSIGN_RESPONSABLE"
 *       resource: "reservation"
 *     x-audit:
 *       action: "ASSIGN_RESPONSABLE"
 *       type: "Reservation"
 *       sensitivity: "medium"
 *       requires_snapshot: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - responsable_id
 *             properties:
 *               responsable_id:
 *                 type: integer
 *                 description: ID de l'utilisateur à assigner comme responsable
 *     responses:
 *       200:
 *         description: Responsable assigné avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updated:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Permissions insuffisantes (Admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.put("/assign/:id",authMiddleware,autoAudit({ action: "ASSIGN_RESPONSABLE", cibleType: "Reservation" }),verifyRole("admin"),async (req, res) => {
    const { id } = req.params;
    const { responsable_id } = req.body;

    try {
      const reservation = await Reservation.findByPk(id);
      if (!reservation) {
        return res.status(404).json({ error: "�??? Réservation introuvable" });
      }

      req.auditSnapshot = reservation.toJSON(); // avant mutation

      reservation.responsable_id = responsable_id;
      await reservation.save();

      res.json({ success: true, updated: reservation });
    } catch (error) {
      console.error("a�? Erreur PUT /reservations/assign/:id :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

/**
 * @swagger
 * /api/reservations/update/{id}:
 *   put:
 *     summary: Met à jour une réservation et envoie des notifications
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "responsable_salle", "chef_service"]
 *       action: "UPDATE_RESERVATION"
 *       resource: "reservation"
 *     x-audit:
 *       action: "UPDATE_RESERVATION"
 *       type: "Reservation"
 *       sensitivity: "medium"
 *       requires_snapshot: true
 *       notifications: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [validée, en_attente, annulée]
 *                 description: Nouveau statut de la réservation
 *               date:
 *                 type: string
 *                 format: date
 *               heure_debut:
 *                 type: string
 *                 format: time
 *               heure_fin:
 *                 type: string
 *                 format: time
 *               equipements_attribues:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Réservation mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 updated:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */

// PUT /api/reservations/update/:id - Modification avec notifications (MEDIUM)
router.put("/update/:id",authMiddleware,autoAudit({ action: "UPDATE_RESERVATION", cibleType: "Reservation" }),verifyRole(ROLES_RESERVATION_VALIDATION),async (req, res) => {
    const { id } = req.params;
    const { statut, ...autresChamps } = req.body;

    try {
      // Récupérer la réservation avec les relations
      const reservation = await Reservation.findByPk(id, {
        include: [
          { 
            model: User, 
            as: "utilisateur", 
            attributes: ["id", "nom", "email"] 
          },
          { 
            model: Room, 
            as: "salle", 
            attributes: ["id", "nom"] 
          }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ 
          error: "�??? Réservation introuvable" 
        });
      }

      // �??�️ Capturer l'état avant modification pour l'audit
      req.auditSnapshot = reservation.toJSON();

      // Sauvegarder les valeurs actuelles pour les notifications
      const ancienStatut = reservation.statut;
      const ancienneDate = reservation.date;
      const ancienneHeureDebut = reservation.heure_debut;
      const ancienneHeureFin = reservation.heure_fin;

      // Appliquer les modifications
      reservation.set({ ...autresChamps });
      if (statut) {
        reservation.statut = statut;
      }

      // Validation avant sauvegarde
      await reservation.validate();
      await reservation.save();

      // Préparer les données pour les notifications
      const utilisateur = reservation.utilisateur;
      const salle = reservation.salle;
      const notifications = [];

      // �??� Notification pour changement de statut
      if (statut && statut !== ancienStatut) {
        const messageStatut = `�??? Bonjour ${utilisateur.nom},

Votre réservation pour "${salle.nom}" le ${reservation.date} à ${reservation.heure_debut} a été ${statut}.

Statut précédent : ${ancienStatut}
�??? Modifiée le ${new Date().toLocaleString()}`;

        notifications.push({
          type: 'status_change',
          message: messageStatut,
          subject: 'Mise à jour de votre réservation - Changement de statut'
        });

        // Log spécifique pour les changements de statut
        fs.appendFileSync(
          "logs/reservation_notifications.log", 
          `${new Date().toISOString()} | user:${utilisateur.email} | statut:${statut} | id:${reservation.id}\n`
        );
      }

      // �??� Notification pour changement de date
      if (autresChamps.date && autresChamps.date !== ancienneDate) {
        const messageDate = `�??? Bonjour ${utilisateur.nom},

La date de votre réservation pour "${salle.nom}" a été modifiée.

Ancienne date : ${ancienneDate}
Nouvelle date : ${autresChamps.date}
Horaire : ${reservation.heure_debut} - ${reservation.heure_fin}
�??? Modifiée le ${new Date().toLocaleString()}`;

        notifications.push({
          type: 'date_change',
          message: messageDate,
          subject: 'Mise à jour de votre réservation - Changement de date'
        });
      }

      // �??� Notification pour changement d'horaire
      if ((autresChamps.heure_debut && autresChamps.heure_debut !== ancienneHeureDebut) ||
          (autresChamps.heure_fin && autresChamps.heure_fin !== ancienneHeureFin)) {
        const messageHoraire = `�??? Bonjour ${utilisateur.nom},

L'horaire de votre réservation pour "${salle.nom}" le ${reservation.date} a été modifié.

Ancien horaire : ${ancienneHeureDebut} - ${ancienneHeureFin}
Nouvel horaire : ${reservation.heure_debut} - ${reservation.heure_fin}
�??? Modifiée le ${new Date().toLocaleString()}`;

        notifications.push({
          type: 'time_change',
          message: messageHoraire,
          subject: 'Mise à jour de votre réservation - Changement d\'horaire'
        });
      }

      // Envoyer toutes les notifications
      for (const notification of notifications) {
        try {
          // Envoi via le système de notification interne
          await sendNotification({
            to: utilisateur.email,
            subject: notification.subject,
            message: notification.message,
            meta: {
              reservation_id: reservation.id,
              ancien_statut: ancienStatut,
              nouveau_statut: statut,
              ancienne_date: ancienneDate,
              nouvelle_date: reservation.date,
              ancien_horaire: `${ancienneHeureDebut}-${ancienneHeureFin}`,
              nouvel_horaire: `${reservation.heure_debut}-${reservation.heure_fin}`,
              salle: salle.nom,
              date: reservation.date,
              heure: reservation.heure_debut,
              modifié_par: req.user?.email,
              type_modification: notification.type
            }
          });

          // Tentative d'envoi par email
          try {
            await sendEmail(
              utilisateur.email, 
              notification.subject, 
              notification.message
            );
          } catch (emailError) {
            console.warn("�??� Envoi email échoué :", emailError.message);
          }

        } catch (notificationError) {
          console.error("a�? Erreur notification :", notificationError.message);
          // Les erreurs de notification ne doivent pas faire échouer la mise à jour
        }
      }

      // Log général des modifications
      if (notifications.length > 0) {
        fs.appendFileSync(
          "logs/reservation_modifications.log",
          `${new Date().toISOString()} | reservation_id:${reservation.id} | user:${utilisateur.email} | modifications:${notifications.length} | types:[${notifications.map(n => n.type).join(',')}] | modifié_par:${req.user?.email}\n`
        );
      }

      return res.json({
        success: true,
        message: "a?? Réservation mise à jour",
        updated: reservation,
        notifications_sent: notifications.length,
        modifications_detected: notifications.map(n => n.type)
      });

    } catch (error) {
      console.error("a�? Erreur PUT /api/reservations/update/:id :", error);
      
      // Gestion des erreurs de validation Sequelize
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: "�??? Données de réservation invalides",
          details: error.errors.map(e => e.message)
        });
      }

      // Gestion des erreurs de contraintes
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: "�??? Conflit de réservation détecté"
        });
      }

      return res.status(500).json({ 
        error: "a�? Erreur serveur lors de la mise à jour" 
      });
    }
  }
);
module.exports = router;