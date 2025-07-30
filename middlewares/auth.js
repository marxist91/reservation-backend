// middlewares/auth.js

// Importer le middleware d'authentification principal
const authMiddleware = require('./authMiddleware');

// Middleware pour vérifier le rôle
const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🔍 Middleware verifyRole lancé pour les rôles:', allowedRoles);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    console.log('👤 Rôle utilisateur:', req.user.role);

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle insuffisant.'
      });
    }

    next();
  };
};

// Middleware optionnel d'authentification (n'interrompt pas si pas de token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwt = require('jsonwebtoken');
      const { User } = require('../models');
      const SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

      const decoded = jwt.verify(token, SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'email', 'role', 'isActive']
      });

      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

// Middlewares de rôles prédéfinis
const verifyAdmin = verifyRole('admin');
const verifyManager = verifyRole('admin', 'manager');
const verifyUser = verifyRole('admin', 'manager', 'user');

// Alias pour compatibilité avec les noms utilisés dans les routes
const authenticateToken = authMiddleware;
const authorizeRoles = verifyRole;

module.exports = {
  // Middleware principal d'authentification
  authMiddleware,           // Votre nom original
  authenticateToken,        // Alias utilisé dans les routes
  verifyToken: authMiddleware, // Autre alias

  // Middlewares de rôles
  verifyRole,
  authorizeRoles,          // Alias
  
  // Rôles prédéfinis
  verifyAdmin,
  verifyManager,
  verifyUser,

  // Authentification optionnelle
  optionalAuth
};