import fs from "fs";
import path from "path";

const routeDir = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routeDir).filter(f => f.endsWith(".js"));

console.log("\n🔍 Scan des fichiers de routes pour paramètres Express invalides\n");

routeFiles.forEach(file => {
  const fullPath = path.join(routeDir, file);
  const lines = fs.readFileSync(fullPath, "utf-8").split("\n");
  let corrections = 0;

  const fixedLines = lines.map((line, idx) => {
    const regex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]\/:\s*['"`]/;
    if (regex.test(line.trim())) {
      corrections++;
      const fixed = line.replace(/\/:\s*['"`]/, "/:param\""); // Remplace /:" ou /:' par /:param"
      console.log(`🛠️ Corrigé dans ${file} ligne ${idx + 1} → ${line.trim()} → ${fixed.trim()}`);
      return fixed;
    }
    return line;
  });

  if (corrections > 0) {
    fs.writeFileSync(fullPath, fixedLines.join("\n"), "utf-8");
    console.log(`✅ ${corrections} correction(s) appliquée(s) dans ${file}\n`);
  }
});

console.log("✅ Scan et correctifs terminés.\n");