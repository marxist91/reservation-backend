const { ROLE_LEVEL } = require("../constants/permissions");

module.exports = function verifyMinimumRole(minimumRole) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !ROLE_LEVEL[role]) {
      return res.status(403).json({ error: "⛔ Rôle utilisateur inconnu ou non valide" });
    }

    const niveauUtilisateur = ROLE_LEVEL[role];
    const niveauMinimum = ROLE_LEVEL[minimumRole];

    if (niveauUtilisateur < niveauMinimum) {
      return res.status(403).json({
        error: `⛔ Accès réservé aux rôles ${minimumRole} ou supérieur`
      });
    }

    next();
  };
};