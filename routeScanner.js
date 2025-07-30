const fs = require("fs");
const path = require("path");

// 📂 Dossier des routes
const routeFolder = path.join(__dirname, "routes");
const files = fs.readdirSync(routeFolder).filter(f => f.endsWith(".js"));

// 🔧 Config audit
const routeMethods = ["get", "post", "put", "delete", "patch"];
const middlewareAudit = ["authMiddleware", "verifyRole"];

const allEndpoints = new Map();

console.log("\n📘 Audit des fichiers de route Express\n");

files.forEach(file => {
  const filePath = path.join(routeFolder, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const stats = {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0,
    PATCH: 0,
    middlewares: [],
    danger: [],
    endpoints: [],
    hasExport: content.includes("module.exports = router")
  };

  lines.forEach((line, index) => {
    const code = line.trim();

    // ✅ Détection méthode Express
    routeMethods.forEach(m => {
      const regex = new RegExp(`router\\.${m}\\s*\\(\\s*['"\`](.+?)['"\`]`);
      const match = code.match(regex);
      if (match) {
        const path = match[1];
        stats[m.toUpperCase()]++;

        if (stats.endpoints.includes(path)) {
          stats.danger.push({
            line: index + 1,
            type: "Duplication interne",
            code
          });
        } else {
          stats.endpoints.push(path);
          const key = `${m.toUpperCase()} ${path}`;
          if (allEndpoints.has(key)) {
            stats.danger.push({
              line: index + 1,
              type: "Duplication globale",
              code
            });
          } else {
            allEndpoints.set(key, { file, line: index + 1 });
          }
        }

        // ⚠️ Paramètre vide
        if (/\/:\s*$/.test(path)) {
          stats.danger.push({
            line: index + 1,
            type: "Paramètre Express vide",
            code
          });
        }
      }
    });

    // 🚫 route sans méthode
    if (/router\s*\(\s*['"`]/.test(code)) {
      stats.danger.push({
        line: index + 1,
        type: "Appel Express sans méthode",
        code
      });
    }

    // 🔐 Audit middleware
    middlewareAudit.forEach(mw => {
      if (code.includes(mw) && !stats.middlewares.includes(mw)) {
        stats.middlewares.push(mw);
      }
    });
  });

  // 🧩 Résumé fichier
  console.log(`📄 ${file}`);
  console.log(`   ➕ GET: ${stats.GET}, POST: ${stats.POST}, PUT: ${stats.PUT}, DELETE: ${stats.DELETE}, PATCH: ${stats.PATCH}`);
  if (stats.middlewares.length > 0) {
    console.log(`   🔐 Middleware détecté : ${stats.middlewares.join(", ")}`);
  } else {
    console.log("   🔓 Aucune protection détectée !");
  }

  if (!stats.hasExport) {
    console.log("   ❌ Export manquant : module.exports = router");
  }

  if (stats.danger.length > 0) {
    console.log("   ⚠️ Anomalies détectées :");
    stats.danger.forEach(d => {
      console.log(`     ➤ [Ligne ${d.line}] ${d.type} → ${d.code}`);
    });
  }

  if (stats.GET + stats.POST + stats.PUT + stats.DELETE + stats.PATCH === 0) {
    console.log("   ⚠️ Aucun endpoint défini dans ce fichier !");
  }

  console.log("");
});

console.log("✅ Audit terminé.\n");