// scripts/dashboard.js
const fs = require('fs');
const path = require('path');

function load(file) {
  const fullPath = path.join(__dirname, '../artifacts', file);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function showSection(title, content) {
  console.log(`\n🔷 ${title}`);
  console.log(JSON.stringify(content, null, 2));
}

function dashboard() {
  const rbac = load('rbac/rbacMap.json');
  const usedUI = load('ui/used-actions.json');
  const audit = load('audit/auditMap.json');
  const coverage = load('ui/coverage-report.json');
  const specUI = load('ui/spec-ui-by-role.json');

  console.log(`\n📊 DASHBOARD MÉTIER DU BACKEND (${new Date().toLocaleString()})`);

  if (rbac) showSection('🛂 RBAC Map', rbac);
  if (usedUI) showSection('🧩 Actions UI utilisées', usedUI);
  if (audit) showSection('🔒 Audit des mutations critiques', audit);
  if (coverage) showSection('📉 Couverture UI (backend vs interface)', coverage);
  if (specUI) showSection('🖥️ Spec UI filtrée par rôle', specUI);

  console.log(`\n✅ Rapport complet généré`);
}

module.exports = { dashboard };