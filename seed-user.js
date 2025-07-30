const bcrypt = require("bcryptjs");
const { User } = require("./models");

async function createOrUpdateUser() {
  const email = "marcel.admin@portlome.tg";
  const hash = await bcrypt.hash("motdepasse123", 10);

  // 🔎 Vérifie si l'utilisateur existe déjà
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    // 🔁 Mise à jour du mot de passe
    await User.update(
      { mot_de_passe: hash, actif: true },
      { where: { email } }
    );
    console.log("🔁 Utilisateur mis à jour avec succès");
  } else {
    // ✅ Création du nouvel utilisateur
    await User.create({
      nom: "Marcel",
      email,
      mot_de_passe: hash,
      role: "admin",
      actif: true
    });
    console.log("✅ Utilisateur créé avec succès");
  }
}

createOrUpdateUser()
  .then(() => process.exit())
  .catch((err) => {
    console.error("❌ Erreur :", err);
    process.exit(1);
  });