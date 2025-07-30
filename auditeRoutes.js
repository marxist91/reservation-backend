const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "routes");

const fichiers = fs.readdirSync(folder).filter(f => f.endsWith(".js"));

fichiers.forEach((file) => {
  const chemin = path.join(folder, file);
  const contenu = fs.readFileSync(chemin, "utf-8");
  const lignes = contenu.split("\n");

  let alerts = [];

  lignes.forEach((ligne, index) => {
    const line = ligne.trim();

    const isResponse = /res\.(json|send|status\(.+\)\.json)/.test(line);
    const isLoop = /(forEach|map|for\s*\(|while)/.test(line);

    if (isResponse) {
      // 🔎 Vérifie présence de return ou niveau de bloc
      if (!line.includes("return") && !line.startsWith("return")) {
        alerts.push(`⛔ ligne ${index + 1}: réponse HTTP sans return → "${line}"`);
      }
    }

    if (isLoop && /res\.(json|send)/.test(line)) {
      alerts.push(`⚠️ ligne ${index + 1}: réponse dans une boucle → "${line}"`);
    }
  });

  if (alerts.length > 0) {
    console.log(`\n📁 Fichier : ${file}`);
    alerts.forEach(a => console.log(a));
  }
});