// scripts/generators/ui-used-actions.js
const fs = require('fs');
const path = require('path');

async function generateUIUsedActions() {
  const usedActions = [
    { action: 'login', endpoint: '/api/auth/login', method: 'POST', role: 'public' },
    { action: 'bookSlot', endpoint: '/api/reservations', method: 'POST', role: 'user' }
  ];

  const outputPath = path.join(__dirname, '../..', 'artifacts/ui/used-actions.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(usedActions, null, 2));
  console.log('📘 Mapping des actions UI utilisées généré');
}

module.exports = { generateUIUsedActions };