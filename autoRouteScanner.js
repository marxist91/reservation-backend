import fs from "fs";
import path from "path";

const routesDir = path.join(__dirname, "routes");
const files = fs.readdirSync(routesDir).filter(f => f.endsWith(".js"));

console.log("\n🔍 Audit dynamique des routeurs Express dans /routes\n");

files.forEach(file => {
  const fullPath = path.join(routesDir, file);

  try {
    const router = require(fullPath);

    if (!router || typeof router !== "function" || !router.stack) {
      console.warn(`⚠️ ${file} : Le module n'exporte pas un routeur Express valide\n`);
      return;
    }

    console.log(`📄 ${file} → ${router.stack.length} middleware(s)`);

    router.stack.forEach((layer, index) => {
      const path = layer.route?.path;
      const method = Object.keys(layer.route?.methods || {}).join(", ").toUpperCase();

      if (path) {
        // 🚫 Paramètre Express mal formé
        if (/^\/:\s*$/.test(path) || /^\/:$/.test(path)) {
          console.log(`   ❌ [${index}] Route invalide → ${method} ${path}`);
        } else {
          console.log(`   ✅ [${index}] ${method} ${path}`);
        }
      } else {
        console.log(`   ⚠️ [${index}] Middleware sans route associée`);
      }
    });

    console.log("");
  } catch (err) {
    console.error(`❌ Erreur lors du require("${fullPath}") → ${err.message}\n`);
  }
});

console.log("✅ Audit terminé.\n");