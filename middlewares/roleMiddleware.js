module.exports = function verifyRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `⛔ Accès réservé au rôle '${role}'` });
    }
    next();
  };
};