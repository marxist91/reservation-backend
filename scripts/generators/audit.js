// scripts/generators/audit.js
const fs = require('fs');
const path = require('path');

async function generateAuditReport() {
  const auditMap = {
    criticalMutations: [
      { path: '/api/users/update', method: 'PATCH', secured: true, testCovered: true },
      { path: '/api/users/delete', method: 'DELETE', secured: true, testCovered: false }
    ],
    warnings: [
      { path: '/api/users/delete', message: 'Mutation critique sans test de couverture' }
    ]
  };

  const outPath = path.join(__dirname, '../..', 'artifacts/audit/auditMap.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(auditMap, null, 2));
  console.log('📘 Rapport d’audit des mutations critiques généré');
}

module.exports = { generateAuditReport };