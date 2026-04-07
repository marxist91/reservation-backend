const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Setting, Reservation, Notification, ActionLog } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRole");
const safeResponse = require("../utils/safeResponse");

// GET /api/settings - Récupérer les paramètres
router.get("/", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    console.log('⚙️ Settings récupérées:', JSON.stringify(settings, null, 2));
    
    // Convertir l'instance Sequelize en objet JSON simple
    const settingsData = settings.toJSON();
    
    return safeResponse(res, settingsData, 200, {
      action: "get_settings",
      userId: req.user?.id
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres:", error);
    return safeResponse(res, {
      message: "Erreur lors de la récupération des paramètres",
      error: error.message
    }, 500, {
      action: "get_settings",
      userId: req.user?.id,
      errorMessage: error.message
    });
  }
});

// PUT /api/settings - Mettre à jour les paramètres
router.put("/", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const updates = req.body;
    console.log('💾 PUT /api/settings - Données reçues:', JSON.stringify(updates, null, 2));
    
    // Valider que les données ne sont pas vides
    if (!updates || Object.keys(updates).length === 0) {
      return safeResponse(res, {
        message: "Aucune donnée à mettre à jour"
      }, 400, {
        action: "update_settings",
        userId: req.user?.id
      });
    }

    // Filtrer les champs envoyés pour n'inclure que ceux existant dans le modèle Setting
    const allowedAttrs = Object.keys(Setting.rawAttributes || {}).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const payload = {};
    for (const key of allowedAttrs) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
    }

    if (Object.keys(payload).length === 0) {
      return safeResponse(res, { message: 'Aucun champ modifiable fourni ou champs non autorisés' }, 400, {
        action: 'update_settings',
        userId: req.user?.id
      });
    }

    const settings = await Setting.updateSettings(payload);
    console.log('✅ Paramètres mis à jour:', JSON.stringify(settings, null, 2));
    
    // Convertir l'instance Sequelize en objet JSON simple
    const settingsData = settings.toJSON();
    
    return safeResponse(res, {
      message: "Paramètres mis à jour avec succès",
      settings: settingsData
    }, 200, {
      action: "update_settings",
      userId: req.user?.id,
      updatedFields: Object.keys(updates)
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des paramètres:", error);
    return safeResponse(res, {
      message: "Erreur lors de la mise à jour des paramètres",
      error: error.message
    }, 500, {
      action: "update_settings",
      userId: req.user?.id,
      errorMessage: error.message
    });
  }
});

// PATCH /api/settings/suppress-admin - activer/désactiver la suppression des notifications admins
router.patch("/suppress-admin", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const { suppress_admin_if_responsable_notified } = req.body;

    if (typeof suppress_admin_if_responsable_notified !== 'boolean') {
      return safeResponse(res, { message: 'Le champ suppress_admin_if_responsable_notified doit être un booléen' }, 400, {
        action: 'update_suppress_admin',
        userId: req.user?.id
      });
    }

    const settings = await Setting.updateSettings({ suppress_admin_if_responsable_notified });
    const settingsData = settings.toJSON();

    return safeResponse(res, { message: 'Paramètre mis à jour', settings: settingsData }, 200, {
      action: 'update_suppress_admin',
      userId: req.user?.id,
      newValue: suppress_admin_if_responsable_notified
    });
  } catch (error) {
    console.error('❌ Erreur update suppress-admin:', error);
    return safeResponse(res, { message: 'Erreur mise à jour paramètre', error: error.message }, 500, {
      action: 'update_suppress_admin',
      userId: req.user?.id,
      errorMessage: error.message
    });
  }
});

// DELETE /api/settings/clear-all-reservations - Vider les réservations passées (hors récurrentes)
router.delete("/clear-all-reservations", authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const now = new Date();

    // Filtre : réservations passées ET non récurrentes
    const whereClause = {
      date_fin: { [Op.lt]: now },
      recurring_meeting_id: { [Op.is]: null }
    };

    // Compter les réservations éligibles
    const count = await Reservation.count({ where: whereClause });

    if (count === 0) {
      return safeResponse(res, { message: "Aucune réservation passée à supprimer", deleted: 0 }, 200, {
        action: "clear_all_reservations",
        userId: req.user?.id
      });
    }

    // Récupérer les IDs des réservations à supprimer pour nettoyer les notifications
    const reservationIds = (await Reservation.findAll({ where: whereClause, attributes: ['id'] }))
      .map(r => r.id);

    // Supprimer les notifications liées à ces réservations
    let notificationsDeleted = 0;
    if (Notification && reservationIds.length > 0) {
      notificationsDeleted = await Notification.destroy({
        where: { reservation_id: { [Op.in]: reservationIds } },
        force: true
      });
    }

    // Supprimer les réservations passées non récurrentes
    const deleted = await Reservation.destroy({ where: whereClause, force: true });

    // Tracer l'action dans les logs
    if (ActionLog) {
      try {
        await ActionLog.create({
          acteur_id: req.user.id,
          action: "CLEAR_ALL_RESERVATIONS",
          cible_type: "Reservation",
          cible_id: null,
          avant: JSON.stringify({ count }),
          apres: JSON.stringify({ deleted, notificationsDeleted }),
        });
      } catch (logError) {
        console.error("Erreur log action:", logError);
      }
    }

    console.log(`🗑️ Admin ${req.user.id} a supprimé ${deleted} réservations et ${notificationsDeleted} notifications`);

    return safeResponse(res, {
      message: `${deleted} réservation(s) supprimée(s) avec succès`,
      deleted,
      notificationsDeleted
    }, 200, {
      action: "clear_all_reservations",
      userId: req.user?.id,
      deletedCount: deleted
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des réservations:", error);
    return safeResponse(res, {
      message: "Erreur lors de la suppression des réservations",
      error: error.message
    }, 500, {
      action: "clear_all_reservations",
      userId: req.user?.id,
      errorMessage: error.message
    });
  }
});
module.exports = router;

