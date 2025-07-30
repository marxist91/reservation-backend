// 📁 utils/sendNotification.js

const fs = require("fs");
const path = require("path");
require("dotenv").config(); // charge les variables d’environnement

const MODE = process.env.NOTIFY_MODE || "debug";

const logFolder = path.join(__dirname, "..", "logs");
const logFile = path.join(logFolder, "notifications.log");

// 📦 Création du dossier logs si manquant
if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder);
}

module.exports = async ({ to, subject, message, meta = {} }) => {
  const horodatage = new Date().toISOString();

  // 🔍 Format du bloc à logguer
  const ligne = [
    `🕒 ${horodatage}`,
    `TO: ${to}`,
    `SUBJECT: ${subject}`,
    `MODE: ${MODE}`,
    `META: ${JSON.stringify(meta, null, 2)}`,
    `MESSAGE:\n${message}`,
    `---\n`
  ].join("\n");

  // ✅ Écriture dans le fichier log
  fs.appendFileSync(logFile, ligne, "utf-8");

  // 📢 Affichage terminal (debug ou prod)
  if (MODE === "production") {
    console.log("✉️ (production) Email réel serait envoyé ici.");
    // 👇 Tu pourras plus tard déclencher sendEmail() ici
  } else {
    console.log("📝 (debug) Notification logguée uniquement.");
  }
};