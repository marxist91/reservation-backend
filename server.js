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

// DEBUG: Afficher les variables DB au démarrage
console.log("========================================");
console.log("🔍 DEBUG Variables d'environnement:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "DÉFINI (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "NON DÉFINI");
console.log("  MYSQL_URL:", process.env.MYSQL_URL ? "DÉFINI" : "NON DÉFINI");
console.log("  DB_HOST:", process.env.DB_HOST || "NON DÉFINI");
console.log("  DB_PORT:", process.env.DB_PORT || "NON DÉFINI");
console.log("  EMAIL_HOST:", process.env.EMAIL_HOST || "NON DÉFINI");
console.log("  EMAIL_USER:", process.env.EMAIL_USER || "NON DÉFINI");
console.log("  EMAIL_FROM:", process.env.EMAIL_FROM || "NON DÉFINI");
console.log("========================================");

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

console.log("🌐 CORS Origins autorisées:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
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

// Route de test email (temporaire pour debug)
app.get("/api/test-email", async (req, res) => {
  try {
    const emailService = require('./services/emailService');
    console.log("📧 Test email - isReady:", emailService.isReady());
    
    if (!emailService.isReady()) {
      return res.json({ 
        success: false, 
        message: "Service email non configuré",
        env: {
          EMAIL_HOST: process.env.EMAIL_HOST || "missing",
          EMAIL_PORT: process.env.EMAIL_PORT || "missing",
          EMAIL_USER: process.env.EMAIL_USER ? "set" : "missing",
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "set" : "missing"
        }
      });
    }
    
    const result = await emailService.sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Test Email Railway - " + new Date().toISOString(),
      html: "<h1>Test réussi!</h1><p>Le service email fonctionne sur Railway.</p>"
    });
    
    return res.json({ success: true, messageId: result?.messageId });
  } catch (error) {
    console.error("❌ Erreur test email:", error);
    return res.json({ success: false, error: error.message });
  }
});

// Route de test Resend (utilise explicitement l'API Resend)
app.get("/api/test-resend", async (req, res) => {
  try {
    const emailService = require('./services/emailService');

    // Vérifier la configuration Resend
    if (!process.env.RESEND_API_KEY && !emailService.resendApiKey) {
      return res.json({ success: false, message: "Clé Resend absente. Définissez RESEND_API_KEY dans les variables d'environnement." });
    }

    // Envoi d'un email de test via Resend
    const to = process.env.EMAIL_USER || process.env.EMAIL_FROM || 'test@local';
    const subject = `Test Resend - ${new Date().toISOString()}`;
    const html = `<h1>Test Resend</h1><p>Envoi via l'API Resend depuis l'application de production.</p>`;

    const result = await emailService.sendViaResend({ to, subject, html });

    if (result && result.status === 'ok') {
      return res.json({ success: true, message: 'Email envoyé via Resend (réponse API)', data: result.data });
    }

    return res.json({ success: false, message: 'Échec appel Resend', details: result });
  } catch (error) {
    console.error('❌ Erreur test Resend:', error);
    return res.json({ success: false, message: 'Erreur interne lors du test Resend', error: error.message });
  }
});

// Route de test SendGrid (utilise explicitement l'API SendGrid)
app.get("/api/test-sendgrid", async (req, res) => {
  try {
    const emailService = require('./services/emailService');

    if (!process.env.SENDGRID_API_KEY && !emailService.sendgridApiKey) {
      return res.json({ success: false, message: "Clé SendGrid absente. Définissez SENDGRID_API_KEY dans les variables d'environnement." });
    }

    const to = process.env.EMAIL_USER || process.env.EMAIL_FROM || 'test@local';
    const subject = `Test SendGrid - ${new Date().toISOString()}`;
    const html = `<h1>Test SendGrid</h1><p>Envoi via l'API SendGrid depuis l'application.</p>`;

    const result = await emailService.sendViaSendGrid({ to, subject, html });

    if (result && result.status === 'ok') {
      return res.json({ success: true, message: 'Email envoyé via SendGrid (réponse API)', data: result });
    }

    return res.json({ success: false, message: 'Échec appel SendGrid', details: result });
  } catch (error) {
    console.error('❌ Erreur test SendGrid:', error);
    return res.json({ success: false, message: 'Erreur interne lors du test SendGrid', error: error.message });
  }
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
      const { User, Setting } = require('./models');
      emailService.setUserModel(User);
      emailService.setSettingModel(Setting);
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
      console.error("❌ Détails:", error);
      console.error("💡 Variables DB:", {
        MYSQL_URL: process.env.MYSQL_URL ? "défini" : "non défini",
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        NODE_ENV: process.env.NODE_ENV
      });
      process.exit(1);
    });
}

// E/ Expopour les tests
module.exports = app;