/* eslint-disable no-console, @typescript-eslint/no-require-imports */
// ========================================
// 🚀 SERVEUR PRINCIPAL - Réservation de Salles
// ========================================

// Chargement des variables d'environnement
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { sequelize } = require("./models");
const { startAutoRejectScheduler } = require("./schedulers/autoRejectExpired");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// 🔧 MIDDLEWARES DE BASE
// ========================================
app.use(helmet()); // Sécurité

// Configuration CORS dynamique pour dev/production
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

// Ajouter les URLs frontend si définies
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.APP_URL && !allowedOrigins.includes(process.env.APP_URL)) {
  allowedOrigins.push(process.env.APP_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ========================================
// 📂 CHARGEMENT DES ROUTES
// ========================================

// Routes métadonnées (pas d'auth requise)
try {
  console.log("📊 Chargement routes meta...");
  const metaRoutes = require('./routes/meta');
  app.use("/api", metaRoutes);
  console.log("✅ Meta monté sur /api");
} catch (error) {
  console.error("❌ ERREUR meta:", error.message);
  process.exit(1);
}

// Routes audit
try {
  console.log("🔍 Chargement routes audit...");
  const auditRoutes = require('./routes/audit');
  app.use("/api/audit", auditRoutes);
  console.log("✅ Audit monté sur /api/audit");
} catch (error) {
  console.error("❌ ERREUR audit:", error.message);
  process.exit(1);
}

// Routes notifications
try {
  console.log("📧 Chargement routes notifications...");
  const notificationsRoutes = require("./routes/notifications");
  app.use("/api/notifications", notificationsRoutes);
  console.log("✅ Notifications monté sur /api/notifications");
} catch (error) {
  console.error("❌ ERREUR notifications:", error.message);
  process.exit(1);
}

// Routes historique
try {
  console.log("📜 Chargement routes historique...");
  const historyRoutes = require("./routes/history");
  app.use("/api/history", historyRoutes);
  console.log("✅ Historique monté sur /api/history");
} catch (error) {
  console.error("❌ ERREUR historique:", error.message);
  process.exit(1);
}

// Routes authentification
try {
  console.log("🔐 Chargement routes auth...");
  const authRoutes = require("./routes/auth");
  app.use("/api", authRoutes);
  console.log("✅ Auth monté sur /api");
} catch (error) {
  console.error("❌ ERREUR auth:", error.message);
  process.exit(1);
}

// Routes utilisateurs
try {
  console.log("👥 Chargement routes users...");
  const usersRoutes = require("./routes/users");
  app.use("/api/users", usersRoutes);
  console.log("✅ Users monté sur /api/users");
} catch (error) {
  console.error("❌ ERREUR users:", error.message);
  process.exit(1);
}

// Routes réservations
try {
  console.log("📅 Chargement routes reservations...");
  const reservationsRoutes = require("./routes/reservations");
  app.use("/api/reservations", reservationsRoutes);
  console.log("✅ Reservations monté sur /api/reservations");
} catch (error) {
  console.error("❌ ERREUR reservations:", error.message);
  process.exit(1);
}

// Routes salles
try {
  console.log("🏢 Chargement routes rooms...");
  const roomsRoutes = require("./routes/rooms");
  app.use("/api/rooms", roomsRoutes);
  console.log("✅ Rooms monté sur /api/rooms");
} catch (error) {
  console.error("❌ ERREUR rooms:", error.message);
  process.exit(1);
}

// Routes départements (gestion des départements)
try {
  console.log("🏷️ Chargement routes departments...");
  const departmentsRoutes = require('./routes/departments');
  app.use('/api/departments', departmentsRoutes);
  console.log("✅ Departments monté sur /api/departments");
} catch (error) {
  console.warn("⚠️ Route departments non trouvée ou erreur au chargement:", error.message);
  // Ne pas exit: la suite du serveur peut quand même fonctionner sans cette route
}

// Routes statistiques
try {
  console.log("📈 Chargement routes stats...");
  const statsRoutes = require('./routes/stats');
  app.use('/api/stats', statsRoutes);
  console.log("✅ Stats monté sur /api/stats");
} catch (error) {
  console.warn("⚠️ Route stats non trouvée ou erreur au chargement:", error.message);
}

// Routes paramètres
try {
  console.log("⚙️ Chargement routes settings...");
  const settingsRoutes = require('./routes/settings');
  app.use('/api/settings', settingsRoutes);
  console.log("✅ Settings monté sur /api/settings");
} catch (error) {
  console.warn("⚠️ Route settings non trouvée ou erreur au chargement:", error.message);
}

// Routes alternatives (propositions de salles alternatives)
try {
  console.log("🔄 Chargement routes alternatives...");
  const alternativesRoutes = require('./routes/alternatives');
  app.use('/api/alternatives', alternativesRoutes);
  console.log("✅ Alternatives monté sur /api/alternatives");
} catch (error) {
  console.error("❌ ERREUR DÉTAILLÉE alternatives:", error);
  console.warn("⚠️ Route alternatives non trouvée ou erreur au chargement:", error.message);
}

console.log("🎉 Toutes les routes chargées");

// ========================================
// 🛣️ ROUTES DE SANTÉ ET ERREURS
// ========================================

// Route de santé
app.get("/api/healthcheck", (req, res) => {
  return res.status(200).json({ 
    status: "✅ API opérationnelle", 
    timestamp: new Date().toISOString(),
    service: "Système de Réservation de Salles",
    database: "Connected"
  });
});

// Route 404 - doit être après toutes les routes
app.use("*", (req, res) => {
  return res.status(404).json({ 
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ 
    error: "Erreur serveur interne",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// 🚀 DÉMARRAGE DU SERVEUR
// ========================================

// Ne pas démarrer le serveur en mode test
if (process.env.NODE_ENV !== 'test') {
  // Synchroniser la base de données avant de démarrer
  sequelize.sync({ alter: false }) // Mettre à true si vous voulez que Sequelize mette à jour les tables existantes (attention en prod)
    .then(() => {
      console.log("✅ Base de données synchronisée");
      
      // Initialiser le service email avec le modèle User
      console.log("📧 Initialisation du service email...");
      const emailService = require('./services/emailService');
      const { User } = require('./models');
      emailService.setUserModel(User);
      console.log("✅ Service email configuré avec le modèle User");
      
      // Démarrer le scheduler d'annulation automatique
      console.log("🕐 Démarrage du scheduler d'annulation automatique...");
      startAutoRejectScheduler();
      console.log("✅ Scheduler activé - vérifie toutes les 5 minutes");
      
      // Démarrer le serveur HTTP
      app.listen(PORT, () => {
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SERVEUR DÉMARRÉ SUR http://localhost:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ENDPOINTS DISPONIBLES :

   🔐 Authentification
   POST   http://localhost:${PORT}/api/register
   POST   http://localhost:${PORT}/api/login
   GET    http://localhost:${PORT}/api/profile

   👥 Utilisateurs
   GET    http://localhost:${PORT}/api/users
   GET    http://localhost:${PORT}/api/users/:id
   PUT    http://localhost:${PORT}/api/users/:id
   DELETE http://localhost:${PORT}/api/users/:id

   🏢 Salles
   GET    http://localhost:${PORT}/api/rooms
   POST   http://localhost:${PORT}/api/rooms
   GET    http://localhost:${PORT}/api/rooms/:id
   PUT    http://localhost:${PORT}/api/rooms/:id
   DELETE http://localhost:${PORT}/api/rooms/:id

   📅 Réservations
   GET    http://localhost:${PORT}/api/reservations
   POST   http://localhost:${PORT}/api/reservations
   GET    http://localhost:${PORT}/api/reservations/:id
   PUT    http://localhost:${PORT}/api/reservations/:id
   DELETE http://localhost:${PORT}/api/reservations/:id

   🔍 Audit & Meta
   GET    http://localhost:${PORT}/api/meta
   GET    http://localhost:${PORT}/api/audit/actions

   🏥 Health Check
   GET    http://localhost:${PORT}/api/healthcheck

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
      });
    })
    .catch((error) => {
      console.error("❌ Erreur de connexion MySQL:", error.message);
      console.error("💡 Vérifiez que XAMPP MySQL est démarré");
      console.error("💡 Vérifiez les credentials dans .env");
      process.exit(1);
    });
}

// E/ Expopour les tests
module.exports = app;