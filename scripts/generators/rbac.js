// scripts/generators/rbac.js
const fs = require('fs');
const path = require('path');

async function generateRBACMap() {
  const rbacMap = {
    auth: {
      public: [
        {
          path: '/api/auth/register',
          method: 'POST',
          operation: 'registerUser'
        },
        {
          path: '/api/auth/login',
          method: 'POST',
          operation: 'loginUser'
        }
      ]
    },
    reservations: {
      admin: [
        {
          path: '/api/reservations',
          method: 'POST',
          operation: 'createReservation'
        }
      ]
    }
  };

  const outPath = path.join(__dirname, '../..', 'artifacts/rbac/rbacMap.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rbacMap, null, 2));
  console.log('📘 Mapping RBAC généré');
}

module.exports = { generateRBACMap };