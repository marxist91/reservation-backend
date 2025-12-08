const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware d'authentification
const { Room, Reservation, User,ActionLog } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const autoAudit = require("../middlewares/autoAudit");

const verifyRole = require("../middlewares/verifyRole");
const { ROLES_ROOM_VIEW, RESERVATION_STATUTS, ROLES_ROOM_UPDATE } = require("../constants/permissions");
const { Op } = require("sequelize");
const safeResponse = require("../utils/safeResponse");
;
router.get("/ping", (req, res) => {
  return res.send("✅ Route rooms opérationnelle !");
});

// 📋 Liste de toutes les salles
router.get("/", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: {
        model: User,
        as: "responsable",
        attributes: ["id", "nom", "prenom", "email"]
      },
      order: [["nom", "ASC"]]
    });

    return res.json(rooms);
  } catch (error) {
    console.error("Erreur récupération salles:", error);
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
});

// ➕ Créer une nouvelle salle (admin/responsable uniquement)
router.post("/", authMiddleware, verifyRole(["admin", "responsable"]), async (req, res) => {
  try {
    const { nom, description, capacite, equipements, batiment, etage, superficie, prix_heure, responsable_id, statut, image_url } = req.body;

    // Validation minimale
    if (!nom || !capacite || !prix_heure) {
      return res.status(400).json({
        error: "Champs requis manquants",
        required: ["nom", "capacite", "prix_heure"]
      });
    }

    const newRoom = await Room.create({
      nom,
      description,
      capacite,
      equipements,
      batiment,
      etage,
      superficie,
      prix_heure,
      responsable_id: responsable_id || req.user.id,
      statut: statut || 'disponible',
      image_url
    });

    return res.status(201).json(newRoom);
  } catch (error) {
    console.error("Erreur création salle:", error);
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
});

// 🔧 Fonction utilitaire : regroupe les réservations en créneaux horaires
const classerParCreneaux = (reservations) => {
  const planning = { matin: [], apres_midi: [], soir: [] };
  for (const r of reservations) {
    const h = r.heure_debut;
    if (h >= "06:00" && h <= "12:00") planning.matin.push(r);
    else if (h >= "12:01" && h <= "18:00") planning.apres_midi.push(r);
    else if (h >= "18:01" && h <= "23:59") planning.soir.push(r);
  }
  return planning;
};

// 🔒 Test accès admin-only
router.post("/admin-only", authMiddleware, verifyRole(["admin"]), (req, res) => {
   return res.send("✅ Accès admin OK");
});

// 🔍 Liste des salles avec leur responsable
router.get("/responsables", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: {
        model: User,
        as: "responsable",
        attributes: ["id", "nom", "email", "role"]
      }
    });
    // ERREUR CORRIGÉE : res.status() était utilisé avec les données au lieu du code de statut
    return res.status(200).json(rooms);
  } catch (error) {
    console.error("❌ Erreur fetch rooms + responsables :", error);
    // ERREUR CORRIGÉE : res.status() était utilisé avec un objet au lieu du code de statut
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Vue planning par salle — toutes les salles
router.get("/overview", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { date } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);

  try {
    const rooms = await Room.findAll({
      order: [["nom", "ASC"]],
      include: {
        model: Reservation,
        as: "reservations",
        where: { date: dateCible },
        required: false,
        include: {
          model: User,
          as: "utilisateur",
          attributes: ["id", "nom", "email", "role"]
        },
        order: [["heure_debut", "ASC"]]
      }
    });

    const planning = rooms.map(room => {
      const reservations = room.reservations || [];

      return {
        id: room.id,
        nom: room.nom,
        capacite: room.capacite,
        date: dateCible,
        total_reservations: reservations.length,
        créneaux: reservations.map(r => ({
          id: r.id,
          heure_debut: r.heure_debut,
          heure_fin: r.heure_fin,
          statut: r.statut,
          utilisateur: r.utilisateur
        }))
      };
    });

    return safeResponse(res, planning, 200, {
      endpoint: "/api/rooms/list",
      user: req.user?.email,
      ip: req.ip
    });

  } catch (error) {
    console.error("❌ Erreur GET /api/rooms (planning) :", error);

    return safeResponse(res, {
      error: "Erreur serveur planning salles"
    }, 500, {
      endpoint: "/api/rooms",
      user: req.user?.email,
      ip: req.ip
    });
  }
});

// 🔹 Vue planning d'une seule salle
router.get("/:id/planning", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { id } = req.params;
  const { date, statut } = req.query;

  try {
    const filtreReservation = { room_id: id };
    if (date) filtreReservation.date = date;
    if (statut) {
      if (!RESERVATION_STATUTS.includes(statut)) {
        return res.status(400).json({ error: `⛔ Statut invalide. Autorisés : ${RESERVATION_STATUTS.join(", ")}` });
      }
      filtreReservation.statut = statut;
    }

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "📛 Salle introuvable" });
    }

    const reservations = await Reservation.findAll({
      where: filtreReservation,
      include: {
        model: User,
        as: "utilisateur",
        attributes: ["id", "nom", "email"]
      },
      order: [["heure_debut", "ASC"]]
    });

    return res.json({
      id: room.id,
      nom: room.nom,
      capacite: room.capacite,
      planning: classerParCreneaux(reservations)
    });
  } catch (error) {
    console.error("❌ Erreur GET /api/rooms/:id/planning :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ROUTE DÉPLACÉE : /disponibles doit être avant /:id pour éviter les conflits
router.get("/disponibles", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { date, après } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);
  const heureCible = après || "08:00";

  try {
    // 🔍 Toutes les salles
    const rooms = await Room.findAll({ order: [["nom", "ASC"]] });
    const sallesDisponibles = [];

    for (const room of rooms) {
      // 🔍 Vérifie s'il y a une réservation chevauchante après l'heure donnée
      const blocage = await Reservation.findOne({
        where: {
          room_id: room.id,
          date: dateCible,
          [Op.or]: [
            {
              heure_debut: { [Op.lt]: heureCible },
              heure_fin: { [Op.gt]: heureCible }
            },
            {
              heure_debut: { [Op.gte]: heureCible }
            }
          ]
        }
      });

      if (!blocage) {
        sallesDisponibles.push({
          id: room.id,
          nom: room.nom,
          capacite: room.capacite
        });
      }
    }

    return res.json({
      date: dateCible,
      après: heureCible,
      disponibles: sallesDisponibles
    });
  } catch (error) {
    console.error("❌ Erreur GET /api/rooms/disponibles :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/dashboard", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const dateCible = new Date().toISOString().slice(0, 10);
  const heureActuelle = new Date().toTimeString().slice(0, 5);

  try {
    const rooms = await Room.findAll({
      include: {
        model: User,
        as: "responsable",
        attributes: ["id", "nom", "email"]
      },
      order: [["nom", "ASC"]]
    });

    const tableauDashboard = [];

    for (const room of rooms) {
      const reservations = await Reservation.findAll({
        where: {
          room_id: room.id,
          date: dateCible
        },
        include: {
          model: User,
          as: "utilisateur",
          attributes: ["id", "nom", "email"]
        },
        order: [["heure_debut", "ASC"]]
      });

      const occupée = reservations.length > 0;

      let créneau_libre = "06:00";
      for (const r of reservations) {
        if (r.heure_fin > heureActuelle) {
          créneau_libre = r.heure_fin;
          break;
        }
      }

      tableauDashboard.push({
        id: room.id,
        nom: room.nom,
        capacite: room.capacite,
        responsable: room.responsable ?? null,
        date: dateCible,
        reservations_du_jour: reservations.length,
        occupée,
        créneau_libre
      });
    }

    return res.json(tableauDashboard);
  } catch (error) {
    console.error("❌ Erreur GET /api/rooms/dashboard :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put( "/update/:roomId", authMiddleware, verifyRole(["admin", "responsable"]), // admin ou responsable
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const salle = await Room.findByPk(roomId);

      if (!salle) {
        return res.status(404).json({ error: "📛 Salle introuvable" });
      }

      const { nom, capacite, responsable_id, description, statut, batiment, etage, superficie, equipements } = req.body;
      
      // Mettre à jour tous les champs fournis
      if (nom !== undefined) salle.nom = nom;
      if (capacite !== undefined) salle.capacite = capacite;
      if (responsable_id !== undefined) salle.responsable_id = responsable_id;
      if (description !== undefined) salle.description = description;
      if (statut !== undefined) salle.statut = statut;
      if (batiment !== undefined) salle.batiment = batiment;
      if (etage !== undefined) salle.etage = etage;
      if (superficie !== undefined) salle.superficie = superficie;
      if (equipements !== undefined) salle.equipements = equipements;

      await salle.save();

      return res.json({ success: true, updated: salle });
    } catch (error) {
      console.error("❌ Erreur PUT /rooms/update/:id :", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }
);



router.get("/stats", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { date } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);

  try {
    const totalSalles = await Room.count();

    // 📦 Récupère toutes les IDs de salles occupées ce jour-là
    const reservations = await Reservation.findAll({
      where: { date: dateCible },
      attributes: ["room_id"]
    });

    const idsOccupés = [...new Set(reservations.map(r => r.room_id))];
    const occupées = idsOccupés.length;
    const libres = totalSalles - occupées;

    const roomsAvecResponsable = await Room.findAll({
      include: {
        model: User,
        as: "responsable",
        attributes: ["role"]
      }
    });

    const répartition = {};
    for (const room of roomsAvecResponsable) {
      const role = room.responsable?.role;
      if (role) {
        répartition[role] = (répartition[role] || 0) + 1;
      }
    }

    return res.json({
      date: dateCible,
      total_salles: totalSalles,
      salles_occupées: occupées,
      salles_libres: libres,
      responsables_par_rôle: répartition
    });
  } catch (error) {
    console.error("❌ Erreur GET /api/rooms/stats :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/stats/by-hour", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { date } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);

  const tranches = {
    matin: { start: "06:00", end: "12:00" },
    apres_midi: { start: "12:01", end: "18:00" },
    soir: { start: "18:01", end: "23:59" }
  };

  try {
    const résultats = {};

    for (const [tranche, { start, end }] of Object.entries(tranches)) {
      const reservations = await Reservation.findAll({
        where: {
          date: dateCible,
          [Op.or]: [
            { heure_debut: { [Op.between]: [start, end] } },
            { heure_fin: { [Op.between]: [start, end] } }
          ]
        },
        attributes: ["room_id"]
      });

      const sallesOccupées = [...new Set(reservations.map(r => r.room_id))];
      résultats[tranche] = {
        salles_occupées: sallesOccupées.length
      };
    }

    const totalSalles = await Room.count();

    // Ajout du total de salles pour ratio horaire
    for (const tranche of Object.keys(tranches)) {
      résultats[tranche].salles_libres = totalSalles - résultats[tranche].salles_occupées;
    }

    return res.json({
      date: dateCible,
      total_salles: totalSalles,
      horaires: résultats
    });
  } catch (error) {
    console.error("❌ Erreur stats par heure :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/stats/roles", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
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
      if (role) {
        if (!statsParRole[role]) {
          statsParRole[role] = { salles: 0, capacité_totale: 0 };
        }
        statsParRole[role].salles += 1;
        statsParRole[role].capacité_totale += room.capacite ?? 0;
      }
    }

    return res.json(statsParRole);
  } catch (error) {
    console.error("❌ Erreur stats par rôle responsable :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/stats/semaine", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const aujourdHui = new Date();
  const stats = [];

  try {
    const totalSalles = await Room.count();

    for (let i = 0; i < 7; i++) {
      const d = new Date(aujourdHui);
      d.setDate(aujourdHui.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      const reservations = await Reservation.findAll({
        where: { date: dateStr },
        attributes: ["room_id"]
      });

      const idsOccupés = [...new Set(reservations.map(r => r.room_id))];
      const occupées = idsOccupés.length;
      const libres = totalSalles - occupées;

      stats.push({
        date: dateStr,
        salles_occupées: occupées,
        salles_libres: libres
      });
    }

    return res.json({ total_salles: totalSalles, semaine: stats });
  } catch (error) {
    console.error("❌ Erreur GET /api/rooms/stats/semaine :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});


router.delete("/delete/:roomId",authMiddleware,autoAudit({ action: "DELETE_ROOM", cibleType: "Room" }),verifyRole("admin"),async (req, res) => {
    try {
      const { roomId } = req.params;
      const salle = await Room.findByPk(roomId);

      if (!salle) {
        return res.status(404).json({ error: "📛 Salle introuvable" });
      }

      req.auditSnapshot = salle.toJSON(); // 🧠 avant suppression

      await salle.destroy();

      return res.json({ success: true, deletedId: roomId }); // ✅ intercepté par autoAudit
    } catch (error) {
      console.error("❌ Erreur DELETE /rooms/delete/:id :", error);
      res.status(500).json({ error: "Impossible de supprimer la salle" });
    }
  }
);
// ROUTE DÉPLACÉE EN DERNIER : /:id doit être après toutes les routes spécifiques
router.get("/:id", authMiddleware, verifyRole(ROLES_ROOM_VIEW), async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  const dateCible = date || new Date().toISOString().slice(0, 10);
  const heureActuelle = new Date().toTimeString().slice(0, 5); // "HH:MM"

  try {
    const room = await Room.findByPk(id, {
      include: {
        model: User,
        as: "responsable",
        attributes: ["id", "nom", "email", "role"]
      }
    });

    if (!room) {
      return res.status(404).json({ error: "📛 Salle introuvable" });
    }

    const reservations = await Reservation.findAll({
      where: {
        room_id: id,
        date: dateCible
      },
      include: {
        model: User,
        as: "utilisateur",
        attributes: ["id", "nom", "email"]
      },
      order: [["heure_debut", "ASC"]]
    });

    // 🔍 Liste unique des utilisateurs du jour
    const utilisateurs_du_jour = [];
    const emailsDéjàVu = new Set();
    for (const r of reservations) {
      const u = r.utilisateur;
      if (u && !emailsDéjàVu.has(u.email)) {
        emailsDéjàVu.add(u.email);
        utilisateurs_du_jour.push(u);
      }
    }

//view/:id
//Erreur GET /api/rooms/view/:roomid:
    // 🧠 Détermination du prochain créneau disponible
    let créneau_libre = "06:00"; // par défaut
    for (const r of reservations) {
      if (r.heure_fin > heureActuelle) {
        créneau_libre = r.heure_fin;
        break;
      }
    }
    const occupée = reservations.length > 0;

    return res.json({
      id: room.id,
      nom: room.nom,
      capacite: room.capacite,
      responsable: room.responsable ?? null,
      date: dateCible,
      reservations_du_jour: reservations.length,
      occupée,
      créneau_libre,
      utilisateurs_du_jour
    });
  } catch (error) {
    console.error("❌ Erreur GET /api/rooms/:id :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;