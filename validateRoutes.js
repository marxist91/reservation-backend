const fs = require("fs");
const path = require("path");

// 📂 Dossier de routes
const routesDir = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith(".js"));

const allEndpoints = new Map();

console.log("\n📘 Audit validateRoutes.js\n");

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let hasExport = content.includes("module.exports = router");
  let detectedRoutes = 0;
  let anomalies = [];

  lines.forEach((line, idx) => {
    const code = line.trim();

    // ❌ route sans méthode : router("/...")
    if (/router\s*\(\s*['"`]/.test(code)) {
      anomalies.push({ type: "Méthode Express manquante", line: idx + 1, code });
    }

    // 🚫 paramètre vide /: (pas /:id)
    if (/\/:\s*['"`]/.test(code)) {
      anomalies.push({ type: "Paramètre vide", line: idx + 1, code });
    }

    // ✅ méthode explicite
    const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]*)['"`]/;
    const match = code.match(routeRegex);
    if (match) {
      detectedRoutes++;
      const method = match[1].toUpperCase();
      const path = match[2];
      const key = `${method} ${path}`;

      if (allEndpoints.has(key)) {
        const prev = allEndpoints.get(key);
        anomalies.push({
          type: "Duplication globale",
          line: idx + 1,
          code,
          conflict: `${prev.file} (ligne ${prev.line})`
        });
      } else {
        allEndpoints.set(key, { file, line: idx + 1 });
      }
    }
  });

  // 📋 Résumé par fichier
  console.log(`📄 ${file}`);
  if (!hasExport) {
    console.log(`   ❌ Export manquant : module.exports = router`);
  }
  console.log(`   ➕ Routes valides détectées : ${detectedRoutes}`);

  if (anomalies.length > 0) {
    console.log(`   ⚠️ ${anomalies.length} anomalie(s) détectée(s) :`);
    anomalies.forEach(a => {
      const conflictInfo = a.conflict ? ` (conflit avec ${a.conflict})` : "";
      console.log(`     ➤ [Ligne ${a.line}] ${a.type}${conflictInfo} → ${a.code}`);
    });
  }

  if (detectedRoutes === 0) {
    console.log(`   ⚠️ Aucun endpoint détecté dans ce fichier`);
  }

  console.log("");
});

console.log("✅ Scan terminé.\n");