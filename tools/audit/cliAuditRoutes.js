const fs = require("fs");
const path = require("path");

const routesDir = path.join(__dirname, "../../routes");
const testDir = path.join(__dirname, "../../__tests__");

// ✅ Regex utiles
const routeRegex = /(router\.(get|post|put|delete|patch))\(["'`](\/[a-zA-Z0-9/_:-]*)["'`]/g;
const logRegex = /autoAudit\.log\(|journalisationAudit\(/;
const rbacRegex = /checkPermission\(|authMiddleware\(/;

// 🧠 Détection des routes dans les fichiers route
function scanRoutes(fileContent) {
  const routes = [...fileContent.matchAll(routeRegex)].map((m) => m[3]);
  return routes;
}

// 🔍 Analyse des fichiers de route
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const declaredRoutes = scanRoutes(content);
  return declaredRoutes.map((route) => ({
    route,
    hasAudit: logRegex.test(content),
    hasRBAC: rbacRegex.test(content),
    source: path.basename(filePath),
  }));
}

// 🧪 Vérifie si chaque route a un test associé
function routeHasTest(route) {
  const testFiles = fs.readdirSync(testDir);
  return testFiles.some((file) => {
    const testPath = path.join(testDir, file);
    const content = fs.readFileSync(testPath, "utf-8");
    return content.includes(route);
  });
}

// 🚀 Scanner complet
function scanAllRoutes() {
  const files = fs.readdirSync(routesDir);
  let results = [];

  files.forEach((file) => {
    const filePath = path.join(routesDir, file);
    const fileRoutes = auditFile(filePath);

    fileRoutes.forEach((r) => {
      const isTested = routeHasTest(r.route);
      results.push({
        route: r.route,
        file: r.source,
        hasAudit: r.hasAudit,
        hasRBAC: r.hasRBAC,
        isTested,
      });
    });
  });

  // 📊 Résultat
  console.table(
    results.map((r) => ({
      ROUTE: r.route,
      FILE: r.file,
      TEST: r.isTested ? "✅" : "❌",
      AUDIT: r.hasAudit ? "✅" : "❌",
      RBAC: r.hasRBAC ? "✅" : "❌",
    }))
  );
}

scanAllRoutes();