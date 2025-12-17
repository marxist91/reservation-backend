const { ROLE_LEVEL } = require("../constants/permissions");

module.exports = function verifyMinimumRole(minimumRole) {
  return (req, res, next) => {
    let role = req.user?.role;

    // Normalisation des alias éventuels
    const aliasMap = {
      'responsable_salle': 'responsable',
      'utilisateur': 'user'
    };

    if (!role || typeof role !== 'string') {
      return res.status(403).json({ error: 'Rôle utilisateur inconnu ou non valide' });
    }

    role = role.toLowerCase();
    if (aliasMap[role]) role = aliasMap[role];

    console.log('verifyMinimumRole - role:', role, 'minimumRole:', minimumRole);
    console.log('ROLE_LEVEL:', JSON.stringify(ROLE_LEVEL));
    console.log('ROLE_LEVEL[role]:', ROLE_LEVEL[role]);

    if (ROLE_LEVEL[role] === undefined) {
      return res.status(403).json({ error: 'Rôle utilisateur inconnu ou non valide' });
    }

    const niveauUtilisateur = ROLE_LEVEL[role];
    const niveauMinimum = ROLE_LEVEL[minimumRole];

    if (niveauMinimum === undefined) {
      return res.status(500).json({ error: 'Configuration du rôle minimum invalide' });
    }

    if (niveauUtilisateur < niveauMinimum) {
      return res.status(403).json({
        error: `Accès réservé aux rôles ${minimumRole} ou supérieur`
      });
    }

    next();
  };
};
