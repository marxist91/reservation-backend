const jwt = require("jsonwebtoken");
const { User } = require("../models"); // 🔄 assure-toi d’avoir ce import si tu enrichis avec Sequelize
const SECRET = process.env.JWT_SECRET || "secret-jwt-key"; // 🔐 fallback en dev

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "⛔ Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    const { id, role, email } = decoded;

    if (!id || !role) {
      return res.status(403).json({ error: "⛔ Token invalide ou incomplet" });
    }

    // ✅ Enrichissement optionnel avec Sequelize
    let userData = { id, role, email };

    try {
      const userFromDB = await User.findByPk(id);
      if (userFromDB) {
        userData.nom = userFromDB.nom;
        userData.role = userFromDB.role;
        userData.email = userFromDB.email;
      }
    } catch (dbError) {
      console.warn("⚠️ Impossible d'enrichir l'utilisateur depuis la DB :", dbError.message);
    }

    req.user = userData;

    // 🔎 Log dev — désactiver en prod
    console.log("🔐 Utilisateur connecté :", req.user);

    next();
  } catch (error) {
    console.error("❌ Erreur JWT :", error);
    return res.status(403).json({ error: "⛔ Accès interdit : token non valide" });
  }
};

