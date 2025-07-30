const fs = require("fs");
const pathModule = require("path");

const routesDir = pathModule.join(__dirname, "../../routes");
const testDir = pathModule.join(__dirname, "../../__tests__");
const exportDir = pathModule.join(__dirname, "../../exports");
const controllersDir = pathModule.join(__dirname, "../../controllers");

// 📦 Création des dossiers si absents
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

const routeRegex = /(router\.(get|post|put|delete|patch))\(["'`](\/[a-zA-Z0-9/_:-]*)["'`]/g;
const logRegex = /autoAudit\.log\(|journalisationAudit\(/;
const rbacRegex = /checkPermission\(|authMiddleware\(/;
const namingRegex = /^\/(api)?\/?[a-z0-9\-_/]+$/;

// 🔍 Extraction routes
function extractRoutes(content) {
  return [...content.matchAll(routeRegex)].map((m) => ({
    method: m[2].toUpperCase(),
    path: m[3],
  }));
}

// ✅ Vérifie présence de test
function hasTest(routePath) {
  const testFiles = fs.readdirSync(testDir);
  return testFiles.some((file) => {
    const content = fs.readFileSync(pathModule.join(testDir, file), "utf-8");
    return content.includes(routePath);
  });
}

// 🧪 Génère squelette de test
function genTestFile(fileName, routes) {
  const filePath = pathModule.join(testDir, `${fileName}.auto.test.js`);
  const content = `const request = require("supertest");
const app = require("../../app");

describe("🧪 Tests auto-générés pour ${fileName}", () => {
${routes
  .map(
    (r) => `  it("${r.method} ${r.path} → doit être testé", async () => {
    const res = await request(app)
      .${r.method.toLowerCase()}("${r.path}")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });`
  )
  .join("\n")}
});`;

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Généré : ${filePath}`);
}

// 🧩 Validation contrôleurs
function validateControllers() {
  const controllerFiles = fs.readdirSync(controllersDir);
  let result = [];

  controllerFiles.forEach((file) => {
    const content = fs.readFileSync(pathModule.join(controllersDir, file), "utf-8");
    const fnMatches = [...content.matchAll(/(exports|module\.exports)\.(\w+)/g)];

    fnMatches.forEach((match) => {
      const fnName = match[2];
      const isCamelCase = /^[a-z][a-zA-Z0-9]+$/.test(fnName);
      const base = fnName.split(/(?=[A-Z])/)[0].toLowerCase();
      const isGrouped = file.includes(base);

      result.push({
        file,
        fn: fnName,
        camelCase: isCamelCase,
        grouped: isGrouped,
      });
    });
  });

  console.table(result.map((r) => ({
    CONTROLLER: r.file,
    FONCTION: r.fn,
    CAMEL_CASE: r.camelCase ? "✅" : "❌",
    GROUPÉ_LOGIQUEMENT: r.grouped ? "✅" : "❌",
  })));
}

// 🚀 Scanner principal
function scanAll() {
  const files = fs.readdirSync(routesDir);
  let report = [];

  files.forEach((file) => {
    const content = fs.readFileSync(pathModule.join(routesDir, file), "utf-8");
    const routes = extractRoutes(content);

    const hasAudit = logRegex.test(content);
    const hasRBAC = rbacRegex.test(content);

    const missingTests = routes.filter((r) => !hasTest(r.path));
    if (missingTests.length) genTestFile(file.replace(".js", ""), missingTests);

    routes.forEach((r) => {
      report.push({
        method: r.method,
        route: r.path,
        file,
        hasAudit,
        hasRBAC,
        isTested: !missingTests.some((mt) => mt.path === r.path),
        isNamedOK: namingRegex.test(r.path),
      });
    });
  });

  // 📄 Export JSON
  fs.writeFileSync(
    pathModule.join(exportDir, "auditRoutesReport.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  // 📊 Export CSV
  const csvLines = ["METHOD,ROUTE,FILE,TEST,AUDIT,RBAC,NAMING"];
  report.forEach((r) => {
    csvLines.push(`${r.method},"${r.route}",${r.file},${r.isTested ? "✅" : "❌"},${r.hasAudit ? "✅" : "❌"},${r.hasRBAC ? "✅" : "❌"},${r.isNamedOK ? "✅" : "❌"}`);
  });
  fs.writeFileSync(pathModule.join(exportDir, "auditRoutesReport.csv"), csvLines.join("\n"), "utf-8");

  // 🖥️ Résumé terminal
  console.table(
    report.map((r) => ({
      METHOD: r.method,
      ROUTE: r.route,
      FILE: r.file,
      TEST: r.isTested ? "✅" : "❌",
      AUDIT: r.hasAudit ? "✅" : "❌",
      RBAC: r.hasRBAC ? "✅" : "❌",
      NAMING: r.isNamedOK ? "✅" : "❌",
    }))
  );

  console.log("📦 JSON → exports/auditRoutesReport.json");
  console.log("📊 CSV → exports/auditRoutesReport.csv");

  // 🔍 Analyse des contrôleurs
  validateControllers();
}

scanAll();