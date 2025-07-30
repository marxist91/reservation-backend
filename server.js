require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de base
app.use(express.json());
app.use(morgan("dev"));




// server.js
const app = require('./app');



// Charger les bonnes variables d'environnement selon le contexte
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config(); // Charge .env par défaut
}



// 🔍 CHARGEMENT SÉQUENTIEL AVEC LOGS DÉTAILLÉS

// ✅ AJOUT : Routes métadonnées (priorité haute - pas d'auth requise)
try {
  console.log("📊 Chargement de meta...");
  const metaRoutes = require('./routes/meta');
  console.log("✅ Meta importé avec succès");
  app.use("/api", metaRoutes);
  console.log("✅ Meta monté sur /api (meta, version, info)");
} catch (error) {
  console.error("❌ ERREUR dans meta:", error.message);
  process.exit(1);
}

// ✅ AJOUT : Routes audit avancé
try {
  console.log("🔍 Chargement de audit...");
  const auditRoutes = require('./routes/audit');
  console.log("✅ Audit importé avec succès");
  app.use("/api/audit", auditRoutes);
  console.log("✅ Audit monté sur /api/audit");
} catch (error) {
  console.error("❌ ERREUR dans audit:", error.message);
  process.exit(1);
}

try {
  console.log("📂 Chargement de notifications...");
  const notificationsRoutes = require("./routes/notifications");
  console.log("✅ Notifications importé avec succès");
  app.use("/api/notifications", notificationsRoutes);
  console.log("✅ Notifications monté sur /api/notifications");
} catch (error) {
  console.error("❌ ERREUR dans notifications:", error.message);
  process.exit(1);
}

try {
  console.log("📂 Chargement de auth...");
  const authRoutes = require("./routes/auth");
  console.log("✅ Auth importé avec succès");
  app.use("/api", authRoutes);
  console.log("✅ Auth monté sur /api");
} catch (error) {
  console.error("❌ ERREUR dans auth:", error.message);
  process.exit(1);
}

try {
  console.log("📂 Chargement de users...");
  const usersRoutes = require("./routes/users");
  console.log("✅ Users importé avec succès");
  app.use("/api/users", usersRoutes);
  console.log("✅ Users monté sur /api/users");
} catch (error) {
  console.error("❌ ERREUR dans users:", error.message);
  process.exit(1);
}

try {
  console.log("📂 Chargement de reservations...");
  const reservationsRoutes = require("./routes/reservations");
  console.log("✅ Reservations importé avec succès");
  app.use("/api/reservations", reservationsRoutes);
  console.log("✅ Reservations monté sur /api/reservations");
} catch (error) {
  console.error("❌ ERREUR dans reservations:", error.message);
  process.exit(1);
}

try {
  console.log("📂 Chargement de rooms...");
  const roomsRoutes = require("./routes/rooms");
  console.log("✅ Rooms importé avec succès");
  app.use("/api/rooms", roomsRoutes);
  console.log("✅ Rooms monté sur /api/rooms");
} catch (error) {
  console.error("❌ ERREUR dans rooms:", error.message);
  process.exit(1);
}

console.log("🎉 Toutes les routes chargées avec succès");

// 📘 Route de santé simple (existante)
app.get("/api/healthcheck", (req, res) => {
  return res.status(200).json({ 
    status: "✅ API opérationnelle", 
    timestamp: new Date().toISOString(),
    service: "Système de Réservation de Salles"
  });
});

// ⛔ Route non reconnue = 404 JSON (CORRIGÉE)
app.use("/*", (req, res) => {
  return res.status(404).json({ error: "⛔ Route inconnue" });
});

// 🔧 Middleware de gestion centralisée des erreurs
app.use((err, req, res, next) => {
  console.error("❌ Erreur middleware :", err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: "Erreur serveur interne" });
});



if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
}
// 🚀 Démarrage du serveur avec authentification DB
sequelize.authenticate()
  .then(() => {
    console.log("✅ Connexion à la base réussie");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📊 ENDPOINTS MÉTADONNÉES (Phase 1) :`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/meta`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/version`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/info`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔍 ENDPOINTS AUDIT AVANCÉ (Phase 2) :`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/audit/entity/:type/:id`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/audit/user/:id`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/audit/actions`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🏥 HEALTH CHECK :`);
      console.log(`   ✅ GET http://localhost:${PORT}/api/healthcheck`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎯 TESTS RAPIDES :`);
      console.log(`   curl http://localhost:${PORT}/api/meta`);
      console.log(`   curl http://localhost:${PORT}/api/info`);
      console.log(`   curl "http://localhost:${PORT}/api/audit/actions?limit=5"`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à la base :", error);
  });