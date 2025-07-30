const fs = require("fs");
const path = require("path");

const routesDir = path.join(__dirname, "../../routes");
const testsDir = path.join(__dirname, "../../__tests__");

// Expressions régulières utiles
const routeRegex = /(router\.(get|post|put|delete|patch))\(["'`](\/[a-zA-Z0-9/_:-]*)["'`]/g;

// Analyse des routes Express dans chaque fichier
function extractRoutes(fileContent) {
  return [...fileContent.matchAll(routeRegex)].map((m) => ({
    method: m[2].toUpperCase(),
    path: m[3],
  }));
}

// Vérifie si une route a déjà un test
function hasTest(path) {
  const testFiles = fs.readdirSync(testsDir);
  return testFiles.some((file) => {
    const content = fs.readFileSync(path.join(testsDir, file), "utf-8");
    return content.includes(path);
  });
}

// Génère le squelette de test
function generateTestFile(fileName, routes) {
  const content = `const request = require("supertest");
const app = require("../../app");

describe("🧪 Tests auto-générés pour ${fileName}", () => {
${routes
  .map(
    (r) => `  it("${r.method} ${r.path} → doit être testé", async () => {
    // 👉 Remplir avec données mock + JWT
    const res = await request(app)
      .${r.method.toLowerCase()}("${r.path}")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");

    expect(res.statusCode).toBe(200);
    // 👇 Ajouter assertions métier
  });\n`
  )
  .join("")}});`;

  const targetFile = path.join(testsDir, `${fileName}.auto.test.js`);
  fs.writeFileSync(targetFile, content, "utf-8");
  console.log(`✅ Généré : ${targetFile}`);
}

// Génère les tests manquants pour chaque fichier de route
function scanAndGenerate() {
  const routeFiles = fs.readdirSync(routesDir);

  routeFiles.forEach((file) => {
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const allRoutes = extractRoutes(content);

    const missingTests = allRoutes.filter((r) => !hasTest(r.path));

    if (missingTests.length > 0) {
      generateTestFile(file.replace(".js", ""), missingTests);
    }
  });
}

scanAndGenerate();