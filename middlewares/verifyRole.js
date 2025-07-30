const { USER_ROLES } = require("../constants/enums");

console.log("🔍 Middleware verifyRole lancé");

module.exports = function verifyRole(rolesAutorisés) {
  return (req, res, next) => {
    let roleUtilisateur = req.user?.role;

    // 🔒 Vérifie que le rôle existe et est une chaîne
    if (!roleUtilisateur || typeof roleUtilisateur !== "string") {
      return res.status(403).json({ error: "⛔ Rôle utilisateur manquant ou non valide" });
    }

    // 🧼 Normalise la casse
    roleUtilisateur = roleUtilisateur.toLowerCase();

    // ✅ Transforme rôle autorisé en tableau si nécessaire
    if (typeof rolesAutorisés === "string") {
      rolesAutorisés = [rolesAutorisés];
    }

    // ⚠️ Vérifie que rolesAutorisés est bien un tableau
    if (!Array.isArray(rolesAutorisés)) {
      return res.status(500).json({ error: "⛔ Configuration incorrecte des rôles autorisés" });
    }

    // 📌 Vérifie que le rôle est connu dans le système
    const roleValide = USER_ROLES.includes(roleUtilisateur);
    if (!roleValide) {
      return res.status(403).json({ error: `⛔ Rôle inconnu : ${roleUtilisateur} non défini dans USER_ROLES` });
    }




    // ✅ Vérifie que le rôle est autorisé pour cette route
    if (!rolesAutorisés.includes(roleUtilisateur)) {
      return res.status(403).json({ error: `⛔ Accès refusé : rôle ${roleUtilisateur} non autorisé ici` });
    }
   

    // 🧪 Log dev (à retirer en prod)
    console.log(`🔐 Accès autorisé pour ${roleUtilisateur}`);
    console.log("🔍 Rôle reçu dans verifyRole :", req.user?.role);

    next(); // ✅ UN SEUL APPEL À next()
  };
};