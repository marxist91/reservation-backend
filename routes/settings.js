const express = require("express");
const router = express.Router();
const { Setting } = require("../models");
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

    // Ne pas permettre la modification de l'ID
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const settings = await Setting.updateSettings(updates);
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

module.exports = router;
