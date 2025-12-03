import fs from "fs";
import path from "path";

const routesDir = path.join(__dirname, "routes");
const otherDirs = ["middlewares", "helpers", "utils"];
const allFiles = [];

// 📦 Agrège tous les fichiers JS
const collectFiles = (dir) => {
  const fullDir = path.join(__dirname, dir);
  if (!fs.existsSync(fullDir)) return;

  fs.readdirSync(fullDir).forEach(f => {
    const fullPath = path.join(fullDir, f);
    if (fs.statSync(fullPath).isFile() && f.endsWith(".js")) {
      allFiles.push({ file: f, path: fullPath, origin: dir });
    }
  });
};

collectFiles("routes");
otherDirs.forEach(collectFiles);

console.log("\n🚦 Audit complet Express — CLI métier\n");

const allEndpoints = new Map();

// 🔍 1. Audit dynamique Express
console.log("🔍 Audit dynamique des routeurs Express\n");

fs.readdirSync(routesDir).filter(f => f.endsWith(".js")).forEach(file => {
  const fullPath = path.join(routesDir, file);
  try {
    const router = require(fullPath);
    if (!router || typeof router !== "function" || !router.stack) {
      console.warn(`⚠️ ${file} : n'exporte pas un router Express valide\n`);
      return;
    }

    console.log(`📄 ${file} → ${router.stack.length} middleware(s)`);
    router.stack.forEach((layer, idx) => {
      const method = Object.keys(layer.route?.methods || {}).join(", ").toUpperCase();
      const routePath = layer.route?.path;

      if (routePath) {
        if (/^\/:$/.test(routePath) || /^\/:\s*$/.test(routePath)) {
          console.log(`   ❌ [${idx}] Route mal formée → ${method} ${routePath}`);
        } else {
          const key = `${method} ${routePath}`;
          if (allEndpoints.has(key)) {
            const prev = allEndpoints.get(key);
            console.log(`   ⚠️ [${idx}] Duplication globale avec ${prev.file} (${prev.index}) → ${key}`);
          } else {
            allEndpoints.set(key, { file, index: idx });
            console.log(`   ✅ [${idx}] ${method} ${routePath}`);
          }
        }
      } else {
        console.log(`   ⚠️ [${idx}] Middleware sans route`);
      }
    });

    console.log("");
  } catch (err) {
    console.error(`❌ ${file} → Erreur require : ${err.message}\n`);
  }
});


// 🔬 2. Analyse statique regex
console.log("🔬 Analyse statique des fichiers\n");

allFiles.forEach(({ file, path: fullPath, origin }) => {
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (/router\s*\(\s*['"`]\/:/.test(trimmed)) {
      console.log(`❌ [${origin}/${file} ligne ${idx + 1}] Appel Express sans méthode → ${trimmed}`);
    }

    if (/\/:\s*['"`]/.test(trimmed)) {
      console.log(`❌ [${origin}/${file} ligne ${idx + 1}] Paramètre Express vide → ${trimmed}`);
    }

    if (/pathToRegexp\(\s*['"`]\/:\s*['"`]/.test(trimmed)) {
      console.log(`❌ [${origin}/${file} ligne ${idx + 1}] pathToRegexp avec paramètre vide → ${trimmed}`);
    }

    if (/app\.use\s*\(\s*['"`]\/:\s*['"`]/.test(trimmed)) {
      console.log(`❌ [${origin}/${file} ligne ${idx + 1}] app.use route invalide → ${trimmed}`);
    }
  });
});

console.log("\n✅ Audit terminé. Corrige les lignes ❌ signalées.\n");