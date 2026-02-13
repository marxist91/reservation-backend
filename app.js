/*
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log des routes critiques (middleware de debug)
app.use((req, res, next) => {
  if (req.path.includes('/reservations/validate') || 
      req.path.includes('/reservations/delete') || 
      req.path.includes('/reservations/assign')) {
    console.log(`🔴 Route critique accédée: ${req.method} ${req.path} par ${req.user?.email || 'anonyme'} - IP: ${req.ip}`);
  }
  next();
});

// ================================
// 🚀 CONFIGURATION DES ROUTES
// ================================

// Routes d'authentification
app.use('/api/auth', require('./routes/auth'));

// Routes des utilisateurs
if (require('fs').existsSync('./routes/users.js')) {
  app.use('/api/users', require('./routes/users'));
}

// Routes des salles
if (require('fs').existsSync('./routes/rooms.js')) {
  app.use('/api/rooms', require('./routes/rooms'));
}

// Routes des réservations
if (require('fs').existsSync('./routes/reservations.js')) {
  app.use('/api/reservations', require('./routes/reservations'));
}

// Routes des notifications
if (require('fs').existsSync('./routes/notifications.js')) {
  app.use('/api/notifications', require('./routes/notifications'));
}

// Routes de l'historique
if (require('fs').existsSync('./routes/history.js')) {
  app.use('/api/history', require('./routes/history'));
}

// Route de métadonnées
app.use('/api/meta', (req, res) => {
  res.json({
    name: 'reservation-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected' // TODO: vérifier la connexion DB
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de réservation de salles',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/users', 
      '/api/rooms',
      '/api/reservations',
      '/api/meta',
      '/health'
    ]
  });
});

// Route API racine
app.get('/api', (req, res) => {
  res.json({
    message: 'API Routes disponibles',
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/profile',
      'GET /api/users',
      'GET /api/rooms',
      'GET /api/reservations',
      'GET /api/meta'
    ]
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`
  });
});

// Middleware de gestion des erreurs générales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// ================================
// 🚀 DÉMARRAGE DU SERVEUR
// ================================
const PORT = process.env.PORT || 3000;

// Ne pas démarrer le serveur en mode test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('🎉 ======================================');
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API disponible sur: http://localhost:${PORT}`);
    console.log('🎉 ======================================');
  });
}

module.exports = app;
*/

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

dotenv.config();

// 🔧 Initialisation de l'application Express
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth')); // Route d'authentification
app.use('/api/meta', require('./routes/meta')); // Route metadata
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/stats', require('./routes/stats'));

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API de réservation de salles' });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});




// 📁 Création du dossier logs si il n'existe pas
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 🛡️ Middlewares de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// 🌐 Configuration CORS
// Autoriser le frontend local (Vite sur 5173) et l'ancien 3000 en dev
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📊 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting spécial pour les routes critiques
const criticalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Maximum 10 requêtes critiques par 5 minutes
  message: {
    error: 'Limite de requêtes critiques dépassée. Contactez un administrateur.',
    code: 'CRITICAL_RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => {
    // Appliquer uniquement aux routes DELETE et PUT critiques
    const isCritical = req.method === 'DELETE' || 
                      (req.method === 'PUT' && req.path.includes('/validate/')) ||
                      (req.method === 'PUT' && req.path.includes('/assign/'));
    return !isCritical;
  }
});

app.use(limiter);

// 📝 Logging avec Morgan
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat, {
  stream: fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' })
}));
app.use(morgan(logFormat)); // Console également

// 🔧 Middlewares de base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📊 Middleware d'injection des métadonnées d'audit
app.use((req, res, next) => {
  req.auditMetadata = {
    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path
  };
  next();
});

// 🔍 Middleware de monitoring des routes critiques
app.use((req, res, next) => {
  const routeKey = `${req.method} ${req.route?.path || req.path}`;
  
  // Routes critiques définies localement
  const criticalRoutes = {
    'DELETE /api/users': { critical: true, sensitivity: 'high' },
    'DELETE /api/reservations': { critical: true, sensitivity: 'high' },
    'PUT /api/users/role': { critical: true, sensitivity: 'high' },
    'POST /api/users': { critical: true, sensitivity: 'medium' },
    'GET /api/audit': { critical: true, sensitivity: 'high' }
  };
  
  // Vérifier si la route est critique
  if (criticalRoutes[routeKey] || req.path.includes('/api/audit') || req.path.includes('/validate/')) {
    req.criticalRoute = {
      route_key: routeKey,
      monitoring_required: true,
      critical: true
    };
    
    // Log spécial pour les routes critiques
    console.log(`🔴 Route critique accédée: ${routeKey} par ${req.user?.email || 'anonyme'} - IP: ${req.ip}`);
  }
  
  next();
});

// 📈 Endpoint de health check avec informations système
app.get('/health', (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'Connected', // Vous pouvez ajouter une vraie vérification DB
    audit_config: {
      enabled: true,
      critical_routes_monitored: true
    }
  };
  
  res.json(healthData);
});

// 📊 Endpoint pour statistiques d'audit en temps réel
app.get('/api/audit/stats', (req, res) => {
  const stats = {
    message: 'Statistiques d\'audit disponibles',
    total_requests: 'En développement',
    critical_routes_accessed: 'En développement',
    last_updated: new Date().toISOString()
  };
  
  res.json(stats);
});

// 🔐 Import des routes
let reservationsRouter, usersRouter, roomsRouter, auditRouter, authRouter;

try {
  reservationsRouter = require('./routes/reservations');
} catch (error) {
  console.warn('⚠️  Route reservations non trouvée:', error.message);
  reservationsRouter = express.Router();
  reservationsRouter.get('/', (req, res) => res.json({ message: 'Route reservations en développement' }));
}

try {
  usersRouter = require('./routes/users');
} catch (error) {
  console.warn('⚠️  Route users non trouvée:', error.message);
  usersRouter = express.Router();
  usersRouter.get('/', (req, res) => res.json({ message: 'Route users en développement' }));
}

try {
  roomsRouter = require('./routes/rooms');
} catch (error) {
  console.warn('⚠️  Route rooms non trouvée:', error.message);
  roomsRouter = express.Router();
  roomsRouter.get('/', (req, res) => res.json({ message: 'Route rooms en développement' }));
}

try {
  auditRouter = require('./routes/audit');
} catch (error) {
  console.warn('⚠️  Route audit non trouvée:', error.message);
  auditRouter = express.Router();
  auditRouter.get('/', (req, res) => res.json({ message: 'Route audit en développement' }));
}

try {
  authRouter = require('./routes/auth');
} catch (error) {
  console.warn('⚠️  Route auth non trouvée:', error.message);
  authRouter = express.Router();
  authRouter.post('/login', (req, res) => res.json({ message: 'Route auth en développement' }));
}

// 🛣️ Configuration des routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/reservations', criticalLimiter, reservationsRouter);
app.use('/api/audit', auditRouter);

// 📚 Route pour la documentation API (Swagger de base)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Documentation API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      rooms: '/api/rooms',
      reservations: '/api/reservations',
      audit: '/api/audit'
    },
    health_check: '/health',
    timestamp: new Date().toISOString()
  });
});

// 📊 Route de test pour vérifier que tout fonctionne
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement !',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    request_id: req.auditMetadata?.request_id
  });
});

// 🚫 Middleware de gestion d'erreurs global
// IMPORTANT: Ce middleware DOIT avoir 4 paramètres (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err);
  
  // Log d'audit pour les erreurs critiques
  if (req.criticalRoute) {
    console.error(`🔴 Erreur sur route critique ${req.criticalRoute.route_key}:`, {
      error: err.message,
      user: req.user?.email || 'anonyme',
      ip: req.ip,
      timestamp: new Date().toISOString(),
      request_id: req.auditMetadata?.request_id
    });
  }
  
  // Construction de la réponse d'erreur
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : (err ? err.message : 'Erreur inconnue'),
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    request_id: req.auditMetadata?.request_id
  };
  
  // Ajouter des détails supplémentaires en développement
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }
  
  // Déterminer le status code approprié
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json(errorResponse);
});

// 🌐 Route par défaut pour les routes non trouvées
// IMPORTANT: Cette route DOIT être après le middleware d'erreur
app.use('*', (req, res) => {
  const errorResponse = {
    success: false,
    message: 'Route non trouvée',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    request_id: req.auditMetadata?.request_id,
    available_routes: {
      auth: '/api/auth',
      users: '/api/users',
      rooms: '/api/rooms',
      reservations: '/api/reservations',
      audit: '/api/audit',
      health: '/health',
      docs: '/api-docs'
    }
  };
  
  res.status(404).json(errorResponse);
});

// 🚀 Démarrage du serveur
const PORT = process.env.PORT || 3000;


if(process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
  console.log('🎉 ======================================');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Logs: Fichier + Console`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log('🎉 ======================================');
  console.log(`⚡ Ready to handle requests!`);
});
}
// 🛑 Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur demandé...');
  process.exit(0);
});

module.exports = app;