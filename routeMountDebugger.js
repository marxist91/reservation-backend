const express = require("express");
const app = express();

const routesToMount = [
  { path: "/api/notifications", file: "./routes/notifications" },
  { path: "/api", file: "./routes/auth" },
  { path: "/api/users", file: "./routes/users" },
  { path: "/api/reservations", file: "./routes/reservations" },
  { path: "/api/rooms", file: "./routes/rooms" }
];

console.log("\n🧪 Débogage des montages Express app.use(...)");

routesToMount.forEach(({ path, file }) => {
  try {
    const router = require(file);
    if (!router || typeof router !== "function" || !router.stack) {
      console.warn(`⚠️ Le module ${file} n'est pas un routeur Express valide.`);
    } else {
      app.use(path, router);
      console.log(`✅ Montage réussi : app.use("${path}", "${file}")`);
    }
  } catch (err) {
    console.error(`❌ Erreur sur app.use("${path}")`);
    console.error(`   → Fichier : ${file}`);
    console.error(`   → Détail :`, err.message);
  }
});

console.log("\n✅ Analyse terminée. Vérifie les erreurs ci-dessus.\n");