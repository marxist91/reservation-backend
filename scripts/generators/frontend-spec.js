// scripts/generators/frontend-spec.js
const fs = require('fs');
const path = require('path');

async function generateSpecsFrontend() {
  const dummySpec = { status: 'ok', roles: ['admin', 'user'] };
  fs.writeFileSync(path.join(__dirname, '../..', 'specs/frontend/frontend-api-schema-admin.json'), JSON.stringify(dummySpec, null, 2));
  console.log('🧩 frontend-api-schema-admin.json généré');
}

module.exports = { generateSpecsFrontend };