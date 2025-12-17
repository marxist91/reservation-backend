const express = require("express");
const router = express.Router();
const fs = require("fs");

const { Reservation, User, Room, Notification, History, Department } = require("../models");
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");
const autoAudit = require("../middlewares/autoAudit");

const verifyMinimumRole = require("../middlewares/verifyMinimumRole");
const { horairesValides, dureeMinimale } = require("../utils/validations");
const {RESERVATION_STATUTS, ROLES_RESERVATION_VALIDATION} = require("../constants/permissions");
const { ROLES_ROOM_VIEW,ROLES_RESERVATION_VIEW , } = require("../constants/permissions");
const emailService = require("../services/emailService");
const sendNotification = require("../utils/sendNotification");
const ACTIONS = require("../constants/actions");

const safeResponse = require("../utils/safeResponse");

// 📋 Route publique - Liste de TOUTES les réservations (pour page d'accueil)
router.get("/all-public", async (req, res) => {
  const { date, room_id } = req.query;

  const filtre = {}; // Pas de filtre sur le statut - afficher TOUTES les réservations
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    filtre.date_debut = {
      [Op.between]: [startOfDay, endOfDay]
    };
  }
  if (room_id) filtre.room_id = room_id;

  try {
    const reservations = await Reservation.findAll({
      where: Object.keys(filtre).length > 0 ? filtre : undefined,
      include: [
        { model: Room, as: "salle", attributes: ["id", "nom", "statut"] },
        { model: User, as: "utilisateur", attributes: ["id", "nom", "prenom"] }
      ],
      order: [["date_debut", "ASC"]]
    });

    console.log(`📊 Route /all-public: ${reservations.length} réservations trouvées`);
    console.log('📋 Statuts:', reservations.map(r => r.statut).filter((v, i, a) => a.indexOf(v) === i));

    const data = reservations.map(r => ({
      id: r.id,
      user_id: r.user_id,
      room_id: r.room_id,
      date: r.date,
      date_debut: r.date_debut,
      date_fin: r.date_fin,
      heure_debut: r.heure_debut,
      heure_fin: r.heure_fin,
      statut: r.statut,
      motif: r.motif,
      group_id: r.group_id,
      rejection_reason: r.rejection_reason,
      salle: r.salle,
      utilisateur: r.utilisateur
    }));

    return res.json({ data });
  } catch (error) {
    console.error("Erreur GET /api/reservations/all-public :", error);
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
});

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
router.put( "/validate/:id",authMiddleware, verifyRole(ROLES_RESERVATION_VALIDATION), async (req, res) => {
    const { id } = req.params;
    const { action, rejection_reason, proposed_alternative } = req.body; // 'valider' ou 'refuser', avec option d'alternative

    try {
      // Récupérer la réservation avec les relations pour les notifications
      const reservation = await Reservation.findByPk(id, {
        include: [
          { 
            model: User, 
            as: "utilisateur", 
            attributes: ["id", "nom", "prenom", "email"] 
          },
          { 
            model: Room, 
            as: "salle", 
            attributes: ["id", "nom"] 
          }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ error: "🚫 Réservation introuvable" });
      }

      // Gérer l'action (valider ou refuser)
      if (action === 'refuser') {
        // Validation : le motif du refus est obligatoire
        if (!rejection_reason || rejection_reason.trim() === '') {
          return res.status(400).json({ 
            error: "Le motif du refus est obligatoire" 
          });
        }

        reservation.statut = "rejetee";
        reservation.rejection_reason = rejection_reason;
        await reservation.save();

        // Si une salle alternative est proposée
        if (proposed_alternative && proposed_alternative.proposed_room_id && proposed_alternative.proposed_date_debut && proposed_alternative.proposed_date_fin) {
          const { ProposedAlternative } = require('../models');
          
          try {
            const alternative = await ProposedAlternative.create({
              original_reservation_id: reservation.id,
              proposed_room_id: proposed_alternative.proposed_room_id,
              proposed_date_debut: proposed_alternative.proposed_date_debut,
              proposed_date_fin: proposed_alternative.proposed_date_fin,
              motif: proposed_alternative.motif || 'Salle alternative proposée',
              proposed_by: req.user.id,
              status: 'pending'
            });

            console.log('✅ Proposition alternative créée:', alternative.id);

            // Notification pour l'utilisateur avec proposition alternative
            await Notification.create({
              user_id: reservation.user_id,
              type: 'alternative_proposed',
              titre: 'Proposition de salle alternative',
              message: `Votre réservation a été refusée. Une salle alternative vous a été proposée. Consultez vos notifications pour accepter ou refuser.`,
              reservation_id: reservation.id,
              lien: '/reservations',
              lue: false
            });
          } catch (altError) {
            console.error("⚠️ Erreur création alternative:", altError);
          }
        } else {
          // Notification normale de refus sans alternative
          await Notification.create({
            user_id: reservation.user_id,
            type: 'reservation_rejected',
            titre: 'Réservation refusée',
            message: `Votre réservation pour la salle "${reservation.salle?.nom || 'N/A'}" le ${reservation.date} a été refusée. Motif: ${rejection_reason}`,
            reservation_id: reservation.id,
            lien: '/reservations',
            lue: false
          });

          // Envoyer email de refus
          try {
            await emailService.sendReservationRejected(reservation.utilisateur, reservation, rejection_reason);
            console.log(`📧 Email de refus envoyé à ${reservation.utilisateur.email}`);
          } catch (emailError) {
            console.error("⚠️ Erreur envoi email de refus:", emailError.message);
          }
        }

        // Créer historique
        try {
          await History.create({
            user_id: req.user.id,
            type: 'REFUS',
            action: 'Refus de réservation',
            description: `La réservation a été refusée par ${req.user.nom || 'un administrateur'}. Motif: ${rejection_reason}${proposed_alternative ? ' (Alternative proposée)' : ''}`,
            reservation_id: reservation.id,
            details: { ancien_statut: 'en_attente', nouveau_statut: 'rejetee', motif_refus: rejection_reason, alternative_proposee: !!proposed_alternative }
          });
        } catch (histError) {
          console.error("⚠️ Erreur création historique:", histError);
        }

        return res.json({ 
          success: true, 
          updated: reservation,
          alternative_proposed: !!proposed_alternative,
          message: proposed_alternative ? "Réservation refusée avec proposition alternative" : "Réservation refusée avec succès"
        });
      } else {
        // Par défaut : validation
        reservation.statut = "validée";
        await reservation.save();

        // Créer notification en BDD
        try {
          const notif = await Notification.create({
            user_id: reservation.user_id,
            type: 'reservation_validated',
            titre: 'Réservation validée',
            message: `Votre réservation pour la salle "${reservation.salle?.nom || 'N/A'}" le ${reservation.date} a été validée.`,
            reservation_id: reservation.id,
            lu: false
          });
          console.log(`✅ Notification créée pour user ${reservation.user_id}:`, notif.id);
        } catch (notifError) {
          console.error("⚠️ Erreur création notification BDD:", notifError);
        }

        // Envoyer email de validation
        try {
          await emailService.sendReservationValidated(reservation.utilisateur, reservation);
          console.log(`📧 Email de validation envoyé à ${reservation.utilisateur.email}`);
        } catch (emailError) {
          console.error("⚠️ Erreur envoi email de validation:", emailError.message);
          // Ne pas bloquer la validation si l'email échoue
        }

        // Créer historique
        try {
          await History.create({
            user_id: req.user.id,
            type: 'VALIDATION',
            action: 'Validation de réservation',
            description: `La réservation a été validée par ${req.user.nom || 'un administrateur'}.`,
            reservation_id: reservation.id,
            details: { ancien_statut: 'en_attente', nouveau_statut: 'validée' }
          });
        } catch (histError) {
          console.error("⚠️ Erreur création historique:", histError);
        }

        return res.json({ 
          success: true, 
          updated: reservation,
          message: "Réservation validée avec succès"
        });
      }
    } catch (error) {
      console.error("⚠️ Erreur PUT /reservations/validate/:id :", error);
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
//  Durée humaine
const calculerDurée = (debut, fin) => {
  if (!debut || !fin) return "N/A";
  
  // Si ce sont des strings de temps (HH:MM ou HH:MM:SS)
  if (typeof debut === 'string' && debut.includes(':')) {
    const [h1, m1] = debut.split(":").map(Number);
    const [h2, m2] = fin.split(":").map(Number);
    const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}min` : ""}` || "0min";
  }
  
  // Si ce sont des objets Date
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  const diffMs = d2 - d1;
  const minutes = Math.floor(diffMs / (1000 * 60));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}min` : ""}` || "0min";
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
  if (date) {
    // Filtre sur la date de début (ignorer l'heure pour la comparaison de date)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    filtre.date_debut = {
      [Op.between]: [startOfDay, endOfDay]
    };
  }
  if (room_id) filtre.room_id = room_id;
  if (statut) filtre.statut = statut;

  try {
    const reservations = await Reservation.findAll({
      where: Object.keys(filtre).length > 0 ? filtre : undefined,
      include: [
        { model: Room, as: "salle", attributes: ["id", "nom"] },
        { model: User, as: "utilisateur", attributes: ["id", "nom", "prenom", "email", "role"] },
        { model: Department, as: 'department', attributes: ['id', 'name'] }
      ],
      order: [["date_debut", "ASC"]]
    });

    const enrichies = reservations.map(r => {
      const statObj = BADGES_STATUT[r.statut] || { emoji: `❌ ${r.statut}`, css: "row-inconnu" };
      const role = r.utilisateur?.role;
      const icone_role = ICONES_ROLE[role] ?? `👤 ${role || "inconnu"}`;
      return {
        id: r.id,
        user_id: r.user_id,
        room_id: r.room_id,
        date: r.date,
        heure_debut: r.heure_debut,
        heure_fin: r.heure_fin,
        statut: r.statut,
        motif: r.motif,
        rejection_reason: r.rejection_reason,
        group_id: r.group_id,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        badge_statut: statObj.emoji,
        html_row_class: statObj.css,
        badge_creneau: badgeCreneau(r.heure_debut),
        durée_humaine: calculerDurée(r.heure_debut, r.heure_fin),
        résumé: `${r.utilisateur?.nom} a réservé ${r.salle?.nom} le ${r.date} à ${r.heure_debut}`,
        icone_role,
        salle: r.salle,
        utilisateur: r.utilisateur
        ,
        department: r.department ? ({ id: r.department.id, name: r.department.name }) : null
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
  console.log("POST /create appelé - Body:", req.body);
  const { room_id, date, heure_debut, heure_fin, statut, equipements_attribues, equipements_supplementaires, motif, nombre_participants, departement, department_id } = req.body;
  const user_id = req.user.id;

  try {
    if (!room_id || !date || !heure_debut || !heure_fin) {
      console.log("âŒ ParamÃ¨tres manquants");
      return res.status(400).json({ error: "ParamÃ¨tres requis manquants" });
    }

    // Construction des objets Date
    const startDateTime = new Date(`${date}T${heure_debut}`);
    const endDateTime = new Date(`${date}T${heure_fin}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.log("âŒ Format de date invalide");
      return res.status(400).json({ error: "Format de date ou d'heure invalide" });
    }

    if (endDateTime <= startDateTime) {
      console.log("âŒ CrÃ©neau invalide");
      return res.status(400).json({
        error: "CrÃ©neau invalide : l'heure de fin doit Ãªtre aprÃ¨s l'heure de dÃ©but"
      });
    }

    // VÃ©rification de la durÃ©e minimale (30 min)
    const durationMinutes = (endDateTime - startDateTime) / (1000 * 60);
    if (durationMinutes < 30) {
      console.log("âŒ DurÃ©e trop courte");
      return res.status(400).json({
        error: "DurÃ©e trop courte : minimum 30 minutes requises"
      });
    }

    // VÃ©rification des chevauchements
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
      console.log("âŒ Chevauchement dÃ©tectÃ©");
      return res.status(409).json({ error: "La salle est dÃ©jÃ  rÃ©servÃ©e Ã  ce crÃ©neau." });
    }

    // Gérer le département (si fourni en texte ou as id)
    let departmentId = null;
    if (department_id) {
      departmentId = department_id;
    } else if (departement && departement.trim()) {
      const [dep] = await require('../models').Department.findOrCreate({ where: { name: departement.trim() } });
      departmentId = dep.id;
    }

    console.log("📝 Création de la réservation...");
    const nouvelleReservation = await Reservation.create({
      user_id,
      room_id,
      date_debut: startDateTime,
      date_fin: endDateTime,
      statut: statut ?? "en_attente",
      equipements_supplementaires: equipements_attribues || equipements_supplementaires,
      motif: motif || "Réunion",
      nombre_participants: nombre_participants || 1,
      department_id: departmentId
    });

    // Notifier les admins
    try {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const createdReservationWithDetails = await Reservation.findByPk(nouvelleReservation.id, {
        include: [
          { model: Room, as: 'salle', attributes: ['id', 'nom'] },
          { model: User, as: 'utilisateur', attributes: ['id', 'nom', 'prenom', 'email'] },
          { model: require('../models').Department, as: 'department', attributes: ['id', 'name'] }
        ]
      });

      for (const admin of admins) {
        // Notification en BDD
        await Notification.create({
          user_id: admin.id,
          type: 'new_reservation',
          titre: 'Nouvelle demande de réservation',
          message: `Nouvelle demande de réservation pour la salle (ID: ${room_id}) le ${date}.`,
          reservation_id: nouvelleReservation.id,
          lu: false
        });

        // Envoyer email
        try {
          await emailService.sendNewReservationToAdmins(admin.email, {
            userName: `${createdReservationWithDetails.utilisateur.prenom} ${createdReservationWithDetails.utilisateur.nom}`,
            userEmail: createdReservationWithDetails.utilisateur.email,
            roomName: createdReservationWithDetails.salle?.nom || `Salle #${room_id}`,
            date: new Date(createdReservationWithDetails.date_debut).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            startTime: new Date(createdReservationWithDetails.date_debut).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            endTime: new Date(createdReservationWithDetails.date_fin).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            motif: createdReservationWithDetails.motif || 'Non spécifié',
            department: createdReservationWithDetails.department?.name || null
          });
          console.log(`📧 Email de nouvelle réservation envoyé à ${admin.email}`);
        } catch (emailError) {
          console.error(`⚠️ Erreur envoi email à admin ${admin.email}:`, emailError.message);
        }
      }
    } catch (notifError) {
      console.error("⚠️ Erreur création notification admin:", notifError);
    }

    // Notifier le responsable de la salle (s'il existe)
    try {
      const salle = await Room.findByPk(room_id, {
        include: [{ model: User, as: 'responsable', attributes: ['id', 'nom', 'prenom', 'email', 'role'] }]
      });
      console.log('🔎 Debug salle (plain):', salle ? salle.get({ plain: true }) : null);

      if (salle && salle.responsable && salle.responsable.id) {
        const resp = salle.responsable;
        // Créer notification en base pour le responsable
        const created = await Notification.create({
          user_id: resp.id,
          type: 'new_reservation',
          titre: 'Nouvelle demande de réservation (salle sous votre responsabilité)',
          message: `Nouvelle demande de réservation pour la salle "${salle.nom || 'ID:'+room_id}" le ${date}.`,
          reservation_id: nouvelleReservation.id,
          lu: false
        });
        console.log(`✅ Notification créée pour responsable (user ${resp.id}):`, created.id);

        // Optionnel: log et/ou appel utilitaire de push
        try {
          await sendNotification({
            to: resp.email || `user:${resp.id}`,
            subject: 'Nouvelle demande de réservation',
            message: `La salle ${salle.nom || 'ID:'+room_id} a une nouvelle demande pour le ${date}.`,
            meta: { reservationId: nouvelleReservation.id, roomId: room_id }
          });
        } catch (pushErr) {
          console.warn('⚠️ Erreur sendNotification pour responsable:', pushErr.message || pushErr);
        }
      } else {
        console.log(`ℹ️ Salle ${room_id} sans responsable attribué (responsable_id=${salle ? salle.responsable_id : 'N/A'})`);
      }
    } catch (errResp) {
      console.error('⚠️ Erreur notification responsable salle:', errResp);
    }
    // Si pas de responsable spécifique, notifier tous les responsables (roles `responsable` ou `responsable_salle`)
    try {
      const salleCheck = await Room.findByPk(room_id);
      const hasResponsable = salleCheck && salleCheck.responsable_id;
      if (!hasResponsable) {
        const responsablesGlobal = await User.findAll({ where: { role: { [Op.in]: ['responsable', 'responsable_salle'] } } });
        console.log(`ℹ️ Pas de responsable attribué pour la salle ${room_id} — notifications globales vers ${responsablesGlobal.length} responsable(s)`);
        for (const r of responsablesGlobal) {
          try {
            const created = await Notification.create({
              user_id: r.id,
              type: 'new_reservation',
              titre: 'Nouvelle demande de réservation',
              message: `Nouvelle demande de réservation pour la salle (ID: ${room_id}) le ${date}.`,
              reservation_id: nouvelleReservation.id,
              lu: false
            });
            console.log(`✅ Notification créée pour responsable global (user ${r.id}):`, created.id);
          } catch (e) {
            console.warn('⚠️ Erreur création notification pour responsable global:', e.message || e);
          }
        }
      }
    } catch (e) {
      console.error('⚠️ Erreur notification responsables globaux:', e);
    }
    console.log("✅ Réservation créée:", nouvelleReservation.id);
    return res.status(201).json({
      message: "RÃ©servation crÃ©Ã©e",
      reservation: nouvelleReservation
    });
  } catch (error) {
    console.error("âŒ Erreur POST/api/reservations/create:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
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
router.delete( "/delete/:id",authMiddleware,verifyRole("admin"),async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findByPk(id);

      if (!reservation) {
        return res.status(404).json({ error: "�??? Réservation introuvable" });
      }

      await reservation.destroy();

      // Créer historique
      try {
        await History.create({
            user_id: req.user.id,
            type: 'SUPPRESSION',
            action: 'Suppression de réservation',
            description: `La réservation #${id} a été supprimée définitivement par l'administrateur.`,
            reservation_id: null, // La réservation n'existe plus
            details: { 
                ancien_id: id,
                salle_id: reservation.room_id,
                date: reservation.date_debut
            }
        });
      } catch (e) {
        console.error("Erreur création historique delete:", e);
      }

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
router.put("/assign/:id",authMiddleware,verifyRole("admin"),async (req, res) => {
    const { id } = req.params;
    const { responsable_id } = req.body;

    try {
      const reservation = await Reservation.findByPk(id);
      if (!reservation) {
        return res.status(404).json({ error: "�??? Réservation introuvable" });
      }

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
router.put("/update/:id",authMiddleware,verifyRole(ROLES_RESERVATION_VALIDATION),async (req, res) => {
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
      let historyAction = "Mise à jour";
      let historyType = "MODIFICATION";

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

        // --- AJOUT: Notification BDD et Historique ---
        let notifType = 'status_change';
        let notifTitre = 'Statut modifié';
        
        if (statut === 'annulee') {
            notifType = 'reservation_cancelled';
            notifTitre = 'Réservation annulée';
            historyType = 'ANNULATION';
            historyAction = 'Annulation de réservation';
        } else if (statut === 'validée') {
            notifType = 'reservation_validated';
            notifTitre = 'Réservation validée';
            historyType = 'VALIDATION';
            historyAction = 'Validation de réservation';
        } else if (statut === 'rejetee') {
            notifType = 'reservation_rejected';
            notifTitre = 'Réservation refusée';
            historyType = 'REFUS';
            historyAction = 'Refus de réservation';
        } else {
             historyAction = `Changement de statut: ${statut}`;
        }

        try {
            await Notification.create({
                user_id: reservation.user_id,
                type: notifType,
                titre: notifTitre,
                message: `Le statut de votre réservation est passé de "${ancienStatut}" à "${statut}".`,
                reservation_id: reservation.id,
                lu: false
            });
        } catch (e) {
            console.error("Erreur création notif BDD update:", e);
        }


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

        // Notif BDD pour date
        try {
            await Notification.create({
                user_id: reservation.user_id,
                type: 'reservation_modified',
                titre: 'Date modifiée',
                message: `La date de votre réservation a été modifiée de ${ancienneDate} à ${autresChamps.date}.`,
                reservation_id: reservation.id,
                lu: false
            });
        } catch (e) { console.error(e); }
        
        historyAction += `, Date modifiée`;
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

         // Notif BDD pour horaire
         try {
            await Notification.create({
                user_id: reservation.user_id,
                type: 'reservation_modified',
                titre: 'Horaire modifié',
                message: `L'horaire de votre réservation a été modifié.`,
                reservation_id: reservation.id,
                lu: false
            });
        } catch (e) { console.error(e); }

        historyAction += `, Horaire modifié`;
      }

      // Création historique GLOBAL pour la modification
      try {
        // Si on a juste changé des champs sans changer le statut, c'est une MODIFICATION
        if (!statut || statut === ancienStatut) {
            historyType = 'MODIFICATION';
        }

        await History.create({
            user_id: req.user.id,
            type: historyType,
            action: historyAction,
            description: `Modification de la réservation ${reservation.id}.`,
            reservation_id: reservation.id,
            details: { 
                ancien_statut: ancienStatut, 
                nouveau_statut: reservation.statut,
                ancienne_date: ancienneDate,
                nouvelle_date: reservation.date,
                ancien_horaire: `${ancienneHeureDebut}-${ancienneHeureFin}`,
                nouvel_horaire: `${reservation.heure_debut}-${reservation.heure_fin}`
            }
        });
      } catch (e) {
        console.error("Erreur création historique update:", e);
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
/**
 * @swagger
 * /api/reservations/create-multiple:
 *   post:
 *     summary: Créer plusieurs réservations (multi-créneaux ou multi-jours)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_id:
 *                 type: integer
 *               motif:
 *                 type: string
 *               description:
 *                 type: string
 *               isMultiDay:
 *                 type: boolean
 *               date_debut:
 *                 type: string
 *                 format: date
 *               date_fin:
 *                 type: string
 *                 format: date
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     heure_debut:
 *                       type: string
 *                     heure_fin:
 *                       type: string
 *     responses:
 *       201:
 *         description: Réservations créées avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Conflit de créneaux
 */
router.post("/create-multiple", authMiddleware, async (req, res) => {
  const { room_id, motif, description, isMultiDay, date_debut, date_fin, timeSlots, departement, department_id } = req.body;
  const userId = req.user.id;
  const crypto = require('crypto');

  if (!room_id || !motif || !timeSlots || timeSlots.length === 0) {
    return res.status(400).json({ error: "Données manquantes (salle, motif, créneaux)" });
  }

  const t = await Reservation.sequelize.transaction();

  try {
    const groupId = crypto.randomUUID();
    const reservationsToCreate = [];
    
    // Calcul des dates
    let dates = [];
    if (isMultiDay && date_debut && date_fin) {
      let current = new Date(date_debut);
      const end = new Date(date_fin);
      // Sécurité pour éviter boucle infinie
      if (current > end) {
         throw new Error("La date de début doit être avant la date de fin");
      }
      
      // Limite de sécurité (ex: 30 jours max)
      const diffTime = Math.abs(end - current);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays > 31) {
          throw new Error("La période de réservation ne peut pas dépasser 31 jours");
      }

      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    } else {
      dates.push(new Date(date_debut));
    }

    // Gérer le département (texte ou id)
    let departmentId = null;
    if (department_id) {
      departmentId = department_id;
    } else if (departement && departement.trim()) {
      const [dep] = await require('../models').Department.findOrCreate({ where: { name: departement.trim() } });
      departmentId = dep.id;
    }

    // Génération des objets de réservation
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      
      for (const slot of timeSlots) {
        // Construction des dates complètes
        // Attention: slot.heure_debut est "HH:mm:ss" ou "HH:mm"
        const startDateTime = new Date(`${dateStr}T${slot.heure_debut}`);
        const endDateTime = new Date(`${dateStr}T${slot.heure_fin}`);

        // Validation basique
        if (endDateTime <= startDateTime) {
           throw new Error(`Heure de fin invalide pour le créneau ${slot.heure_debut} - ${slot.heure_fin} le ${dateStr}`);
        }

        reservationsToCreate.push({
          user_id: userId,
          room_id,
          date_debut: startDateTime,
          date_fin: endDateTime,
          motif: description ? `${motif}\n\n${description}` : motif,
          statut: 'en_attente',
          group_id: groupId
          ,department_id: departmentId
        });
      }
    }

    // Vérification des conflits pour TOUTES les réservations
    for (const resData of reservationsToCreate) {
      const conflict = await Reservation.findOne({
        where: {
          room_id: resData.room_id,
          statut: { [Op.notIn]: ['annulee', 'rejetee'] },
          [Op.or]: [
            {
              date_debut: { [Op.lt]: resData.date_fin },
              date_fin: { [Op.gt]: resData.date_debut }
            }
          ]
        },
        transaction: t
      });

      if (conflict) {
        throw new Error(`Conflit de réservation le ${resData.date_debut.toLocaleString()} avec une réservation existante.`);
      }
    }

    // Création en masse
    const createdReservations = await Reservation.bulkCreate(reservationsToCreate, { transaction: t });

    // Création de la notification pour l'utilisateur
    await Notification.create({
      user_id: userId,
      type: 'reservation_created_group',
      titre: 'Réservation multiple créée',
      message: `Votre demande de réservation multiple (${createdReservations.length} créneaux) pour la salle ${room_id} a été enregistrée et est en attente de validation.`,
      reservation_id: createdReservations[0].id 
    }, { transaction: t });

    // Notification pour les admins (ceux qui ont le rôle 'admin' ou 'responsable')
    // On récupère les admins
    const admins = await User.findAll({
      where: {
        role: { [Op.in]: ['admin', 'responsable'] }
      },
      attributes: ['id', 'email'],
      transaction: t
    });

    // Création des notifications pour les admins
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'admin_new_reservation_group',
      titre: 'Nouvelle demande de réservation multiple',
      message: `Une nouvelle demande de réservation multiple (${createdReservations.length} créneaux) a été créée par l'utilisateur ${userId}.`,
      reservation_id: createdReservations[0].id
    }));

    if (adminNotifications.length > 0) {
      await Notification.bulkCreate(adminNotifications, { transaction: t });
    }

    // Envoi d'emails (hors transaction pour ne pas bloquer)
    // On le fait après le commit idéalement, mais ici on prépare les données
    // Pour simplifier, on envoie un email générique à l'utilisateur
    try {
        const user = await User.findByPk(userId, { transaction: t });
        if (user && user.email) {
            // Utilisation de sendNotification qui loggue ou envoie selon la config
            // Note: sendNotification est asynchrone mais on ne l'attend pas forcément pour ne pas ralentir la réponse
            // Cependant, si on veut être sûr, on peut l'attendre.
            // Ici on utilise sendEmail directement si disponible ou sendNotification
            
            // On utilise sendNotification pour la cohérence avec le reste du projet
            // Mais sendNotification semble juste logger dans un fichier pour l'instant (mode debug)
            // Si on veut un vrai email, il faut utiliser sendEmail (services/mailer.js)
            
            // Envoi email utilisateur
            sendEmail({
                to: user.email,
                subject: 'Confirmation de demande de réservation multiple',
                html: `
                    <h1>Demande enregistrée</h1>
                    <p>Bonjour ${user.prenom} ${user.nom},</p>
                    <p>Votre demande de réservation multiple a bien été prise en compte.</p>
                    <p><strong>Détails :</strong></p>
                    <ul>
                        <li>Nombre de créneaux : ${createdReservations.length}</li>
                        <li>Salle ID : ${room_id}</li>
                        <li>Motif : ${motif}</li>
                    </ul>
                    <p>Vous recevrez une notification dès qu'elle sera traitée.</p>
                `
            }).catch(err => console.error("Erreur envoi email user:", err));

            // Envoi email aux admins
            for (const admin of admins) {
                if (admin.email) {
                    sendEmail({
                        to: admin.email,
                        subject: 'Nouvelle demande de réservation multiple',
                        html: `
                            <h1>Nouvelle demande à valider</h1>
                            <p>L'utilisateur ${user.prenom} ${user.nom} a fait une demande de réservation multiple.</p>
                            <p><strong>Détails :</strong></p>
                            <ul>
                                <li>Nombre de créneaux : ${createdReservations.length}</li>
                                <li>Salle ID : ${room_id}</li>
                            </ul>
                            <p>Merci de vous connecter pour valider ou refuser.</p>
                        `
                    }).catch(err => console.error("Erreur envoi email admin:", err));
                }
            }
        }
    } catch (emailError) {
        console.error("Erreur lors de la préparation des emails:", emailError);
    }

    // Création de l'historique
    const historyRecords = createdReservations.map((r, index) => ({
      user_id: userId,
      type: 'CREATION',
      action: 'Demande de réservation (Groupe)',
      description: `Réservation multiple - Créneau ${index + 1}/${createdReservations.length} : ${r.date} de ${r.heure_debut} à ${r.heure_fin}`,
      reservation_id: r.id,
      details: { group_id: groupId, motif, total_count: createdReservations.length }
    }));
    
    await History.bulkCreate(historyRecords, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: `${createdReservations.length} réservations créées avec succès`,
      group_id: groupId,
      reservations: createdReservations
    });

  } catch (error) {
    await t.rollback();
    console.error("Erreur create-multiple:", error);
    res.status(400).json({ error: error.message || "Erreur lors de la création des réservations multiples" });
  }
});

/**
 * @swagger
 * /api/reservations/cancel/{id}:
 *   put:
 *     summary: Annule une réservation (par le créateur ou admin)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     x-rbac:
 *       roles: ["admin", "utilisateur"]
 *       action: "CANCEL_RESERVATION"
 *       resource: "reservation"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à annuler
 *     responses:
 *       200:
 *         description: Réservation annulée
 *       401:
 *         description: Authentification requise
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Réservation introuvable
 */
router.put('/cancel/:id', authMiddleware, verifyMinimumRole('user'), async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: User, as: 'utilisateur', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Room, as: 'salle', attributes: ['id', 'nom'] }
      ]
    });

    if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });

    // Autoriser uniquement le créateur ou un admin
    if (reservation.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à annuler cette réservation" });
    }

    if (reservation.statut === 'annulee') {
      return res.status(400).json({ error: 'Réservation déjà annulée' });
    }

    const ancienStatut = reservation.statut;
    reservation.statut = 'annulee';
    await reservation.save();

    // Notification à l'utilisateur (si autre que l'initiateur)
    try {
      await Notification.create({
        user_id: reservation.user_id,
        type: 'reservation_cancelled',
        titre: 'Réservation annulée',
        message: `Votre réservation pour la salle "${reservation.salle?.nom || 'N/A'}" le ${reservation.date || ''} a été annulée.`,
        reservation_id: reservation.id,
        lu: false
      });
    } catch (e) {
      console.error('Erreur création notification annulation:', e);
    }

    // Historique
    try {
      await History.create({
        user_id: req.user.id,
        type: 'ANNULATION',
        action: 'Annulation de réservation',
        description: `Réservation ${reservation.id} annulée par ${req.user.email || req.user.id}`,
        reservation_id: reservation.id,
        details: { ancien_statut: ancienStatut, nouveau_statut: 'annulee' }
      });
    } catch (e) {
      console.error('Erreur création historique annulation:', e);
    }

    return res.json({ success: true, updated: reservation });
  } catch (error) {
    console.error('Erreur PUT /reservations/cancel/:id :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;




