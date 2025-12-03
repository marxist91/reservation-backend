import fs from "fs";
import path from "path";

const routeDir = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routeDir).filter(f => f.endsWith(".js"));

console.log("\n🔍 Scan des routes Express malformées dans /routes\n");

routeFiles.forEach(file => {
  const fullPath = path.join(routeDir, file);
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  let modified = false;
  const updatedLines = lines.map((line, idx) => {
    const regex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]\/:\s*['"`]/;

    if (regex.test(line.trim())) {
      const fixedLine = line.replace(/\/:\s*(['"`])/, "/:param$1");
      console.log(`🛠️ Correction dans ${file} [Ligne ${idx + 1}]`);
      console.log(`   Avant : ${line.trim()}`);
      console.log(`   Après : ${fixedLine.trim()}\n`);
      modified = true;
      return fixedLine;
    }
    return line;
  });

  if (modified) {
    fs.writeFileSync(fullPath, updatedLines.join("\n"), "utf-8");
    console.log(`✅ Fichier mis à jour : ${file}\n`);
  }
});

console.log("✅ Scan terminé.\n");