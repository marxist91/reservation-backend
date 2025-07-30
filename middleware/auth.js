const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Middleware de vérification du rôle admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Accès administrateur requis' });
    }
};

// Middleware de vérification des permissions
const hasPermission = (permission) => {
    return (req, res, next) => {
        if (req.user && req.user.permissions && req.user.permissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ error: `Permission requise: ${permission}` });
        }
    };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    hasPermission
};
