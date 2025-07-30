/**
 * 🔔 Notifications API
 * Base path : /api/notifications
 *
 * Endpoints :
 * - GET /self                  → Liste des notifications du user connecté
 * - GET /user/:userId         → Liste des notifications d’un utilisateur donné
 * - POST /read/:notificationId → Marquer comme lue
 * - DELETE /delete/:notificationId → Supprimer une notification
 *
 * Sécurité :
 * - authMiddleware obligatoire
 * - verifyRole selon ROLES_NOTIFICATION_VIEW
 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");
const { ROLES_NOTIFICATION_VIEW,ROLES_ADMIN } = require("../constants/permissions");
const autoAudit = require("../middlewares/autoAudit");

const { Notification } = require("../models");
const ACTIONS = require("../constants/actions");

autoAudit({ action: ACTIONS.DELETE_NOTIFICATIONS_BY_ROOM, cibleType: "Room" })

// 📘 GET /api/notifications/self
router.get("/self", authMiddleware, verifyRole(ROLES_NOTIFICATION_VIEW), async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { destinataire_id: userId },
      order: [["createdAt", "DESC"]]
    });
    res.json(notifications);
  } catch (error) {
    console.error("❌ Erreur GET /notifications/self :", error);
    res.status(500).json({ error: "Erreur serveur notifications" });
  }
});

// 📘 GET /api/notifications/user/:userId
router.get("/user/:userId", authMiddleware, verifyRole(ROLES_NOTIFICATION_VIEW), async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.findAll({
      where: { destinataire_id: userId },
      order: [["createdAt", "DESC"]]
    });
    res.json(notifications);
  } catch (error) {
    console.error("❌ Erreur GET /notifications/user/:userId :", error);
    res.status(500).json({ error: "Erreur serveur notifications ciblées" });
  }
});

// 📘 POST /api/notifications/read/:notificationId
router.post(
  "/read/:notificationId",
  authMiddleware,
  autoAudit({
    action: "READ_NOTIFICATION",
    cibleType: "Notification"
  }),
  verifyRole(ROLES_NOTIFICATION_VIEW),
  async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notif = await Notification.findByPk(notificationId);

      if (!notif) {
        return res.status(404).json({ error: "Notification introuvable" });
      }

      req.auditSnapshot = notif.toJSON(); // 🧠 état avant mutation

      notif.lue = true;
      await notif.save();

      return res.json({ success: true, updated: notif }); // ✅ intercepté par autoAudit
    } catch (error) {
      console.error("❌ Erreur POST /notifications/read/:id :", error);
      res.status(500).json({ error: "Impossible de marquer comme lue" });
    }
  }
);




router.get("/", authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  const { date } = req.query;
  const logPath = path.join(__dirname, "..", "logs", "notifications.log");

  try {
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

    // 📅 Filtre optionnel par date YYYY-MM-DD
    const filtrés = date
      ? notifications.filter(n => n.horodatage.startsWith(date))
      : notifications;

    res.json(filtrés);
  } catch (error) {
    console.error("❌ Erreur lecture notifications :", error);
    res.status(500).json({ error: "Impossible de lire les logs de notification" });
  }
});

router.delete(
  "/by-room/:roomId",
  authMiddleware,
  autoAudit({ action: "DELETE_NOTIFICATIONS_BY_ROOM", cibleType: "Room" }),
  verifyRole("admin"),
  async (req, res) => {
    const { roomId } = req.params;

    try {
      const notifications = await Notification.findAll({
        where: { salle_id: roomId }
      });

      if (!notifications.length) {
        return res.status(404).json({ error: "Aucune notification liée à cette salle" });
      }

      req.auditSnapshot = notifications.map(n => n.toJSON()); // 🧠 snapshot des notifications

      await Notification.destroy({ where: { salle_id: roomId } });

      return res.json({
        success: true,
        message: `✅ ${notifications.length} notification(s) supprimée(s) pour salle #${roomId}`,
        deletedCount: notifications.length
      });
    } catch (error) {
      console.error("❌ Erreur DELETE /notifications/by-room/:roomId :", error);
      res.status(500).json({ error: "Impossible de supprimer les notifications" });
    }
  }
);


// 📘 DELETE /api/notifications/delete/:notificationId
router.delete("/delete/:notificationId",authMiddleware,autoAudit({action: "DELETE_NOTIFICATION",cibleType: "Notification"}),verifyRole("admin"),async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notif = await Notification.findByPk(notificationId);

      if (!notif) {
        return res.status(404).json({ error: "Notification introuvable" });
      }

      req.auditSnapshot = notif.toJSON(); // 🧠 état avant suppression
      await notif.destroy();

      return res.json({ success: true, deletedId: notificationId }); // ✅ intercepté par autoAudit
    } catch (error) {
      console.error("❌ Erreur DELETE /notifications/delete/:id :", error);
      return res.status(500).json({ error: "Impossible de supprimer la notification" });
    }
  }
);


module.exports = router;