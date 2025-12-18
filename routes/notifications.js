const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");
const { ROLES_NOTIFICATION_VIEW, ROLES_ADMIN } = require("../constants/permissions");
const autoAudit = require("../middlewares/autoAudit");

const { Notification } = require("../models");
const ACTIONS = require("../constants/actions");

// GET /api/notifications (Liste des notifications - Admin/Responsable voient tout, User voit les siennes)
router.get("/", authMiddleware, verifyRole(ROLES_NOTIFICATION_VIEW), async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let whereClause = { user_id: userId };
    
    // Admin et responsables voient TOUTES les notifications (globales)
    if (userRole === 'admin' || userRole === 'responsable' || userRole === 'responsable_salle') {
      whereClause = {}; // Pas de filtre = toutes les notifications
    }
    
    const notifications = await Notification.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]]
    });
    console.log(`📧 Notifications renvoyées pour user ${userId} (${userRole}):`, notifications.length, 'notification(s)');
    res.json(notifications);
  } catch (error) {
    console.error("❌ Erreur GET /notifications :", error);
    res.status(500).json({ error: "Erreur serveur notifications" });
  }
});

// GET /api/notifications/mine (Alias pour /)
router.get("/mine", authMiddleware, verifyRole(ROLES_NOTIFICATION_VIEW), async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]] // Utilisation de created_at (snake_case)
    });
    res.json(notifications);
  } catch (error) {
    console.error(" Erreur GET /notifications/mine :", error);
    res.status(500).json({ error: "Erreur serveur notifications" });
  }
});

// POST /api/notifications (Créer une notification - Admin ou interne)
router.post("/", authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const { user_id, type, titre, message, reservation_id } = req.body;
    
    if (!user_id || !type || !titre || !message) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const notif = await Notification.create({
      user_id,
      type,
      titre,
      message,
      reservation_id,
      lu: false
    });

    res.status(201).json(notif);
  } catch (error) {
    console.error(" Erreur POST /notifications :", error);
    res.status(500).json({ error: "Erreur création notification" });
  }
});

// DELETE /api/notifications/:id (Supprimer une notification)
router.delete("/:id", authMiddleware, verifyRole(ROLES_NOTIFICATION_VIEW), async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);

    if (!notif) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    if (notif.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    await notif.destroy();
    res.json({ success: true, message: "Notification supprimée" });
  } catch (error) {
    console.error(" Erreur DELETE /notifications/:id :", error);
    res.status(500).json({ error: "Erreur suppression notification" });
  }
});


// GET /api/notifications/logs (Ancien GET / pour les admins - lecture des logs)
router.get("/logs", authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  const { date } = req.query;
  const logPath = path.join(__dirname, "..", "logs", "notifications.log");

  try {
    if (!fs.existsSync(logPath)) {
        return res.json([]);
    }
    const contenu = fs.readFileSync(logPath, "utf-8");
    const lignes = contenu.split("\n\n").filter(Boolean);

    const notifications = lignes.map(block => {
      const [header, ...reste] = block.split("\n");
      const horodatage = header.split(" | ")[0];
      const to = header.match(/TO: ([^|]+)/)?.[1]?.trim();
      const subject = header.match(/SUBJECT: ([^|]+)/)?.[1]?.trim();
      const meta = JSON.parse(reste.find(l => l.startsWith("META: "))?.slice(6) || "{}");
      const message = reste.slice(2).join("\n");

      return {
        horodatage,
        destinataire: to,
        objet: subject,
        reservation_id: meta.reservation_id,
        ancien_statut: meta.ancien_statut,
        nouveau_statut: meta.nouveau_statut,
        salle: meta.salle,
        modifié_par: meta.modifié_par,
        message
      };
    });

    const filtrés = date
      ? notifications.filter(n => n.horodatage.startsWith(date))
      : notifications;

    res.json(filtrés);
  } catch (error) {
    console.error(" Erreur lecture notifications logs :", error);
    res.status(500).json({ error: "Impossible de lire les logs de notification" });
  }
});

// PUT /api/notifications/:notificationId/read
router.put(
    "/:notificationId/read",
    authMiddleware,
    verifyRole(ROLES_NOTIFICATION_VIEW),
    async (req, res) => {
      try {
        const { notificationId } = req.params;
        const userRole = req.user.role;
        const notif = await Notification.findByPk(notificationId);
  
        if (!notif) {
          return res.status(404).json({ error: "Notification introuvable" });
        }
        
        // Admin et responsables peuvent marquer n'importe quelle notification
        const isAdminOrResponsable = userRole === 'admin' || userRole === 'responsable' || userRole === 'responsable_salle';
        if (notif.user_id !== req.user.id && !isAdminOrResponsable) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }
  
        notif.lu = true;
        await notif.save();
  
        return res.json({ success: true, updated: notif });
      } catch (error) {
        console.error(" Erreur PUT /notifications/:id/read :", error);
        res.status(500).json({ error: "Impossible de marquer comme lue" });
      }
    }
  );

// PUT /api/notifications/read-all
router.put(
    "/read-all",
    authMiddleware,
    verifyRole(ROLES_NOTIFICATION_VIEW),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        let whereClause = { user_id: userId, lu: false };
        
        // Admin et responsables marquent TOUTES les notifications comme lues
        if (userRole === 'admin' || userRole === 'responsable' || userRole === 'responsable_salle') {
          whereClause = { lu: false };
        }
        
        await Notification.update({ lu: true }, { where: whereClause });
        console.log(`✅ Notifications marquées comme lues pour ${userRole}`);
        return res.json({ success: true });
      } catch (error) {
        console.error(" Erreur PUT /notifications/read-all :", error);
        res.status(500).json({ error: "Impossible de tout marquer comme lu" });
      }
    }
  );

// DELETE /api/notifications/:notificationId
router.delete("/:notificationId", authMiddleware, verifyRole(ROLES_NOTIFICATION_VIEW), async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notif = await Notification.findByPk(notificationId);

      if (!notif) {
        return res.status(404).json({ error: "Notification introuvable" });
      }

      if (notif.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Accès non autorisé" });
      }

      await notif.destroy();

      return res.json({ success: true, deletedId: notificationId });
    } catch (error) {
      console.error(" Erreur DELETE /notifications/:id :", error);
      return res.status(500).json({ error: "Impossible de supprimer la notification" });
    }
  }
);

module.exports = router;
