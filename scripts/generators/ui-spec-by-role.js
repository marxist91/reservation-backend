const fs = require('fs');
const path = require('path');

async function generateUISpecByRole() {
  const usedActions = require('../../artifacts/ui/used-actions.json');
  const rbacMap = require('../../artifacts/rbac/rbacMap.json');

  const spec = {};

  for (const [domain, roles] of Object.entries(rbacMap)) {
    for (const [role, endpoints] of Object.entries(roles)) {
      if (!spec[role]) spec[role] = [];
      endpoints.forEach(({ path, method, operation }) => {
        const match = usedActions.find(
          (ua) => ua.endpoint === path && ua.method === method
        );
        if (match) {
          spec[role].push({
            action: match.action,
            endpoint: path,
            method,
            domain,
            operation
          });
        }
      });
    }
  }

  const outPath = path.join(__dirname, '../..', 'artifacts/ui/spec-ui-by-role.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
  console.log('📘 Spec UI filtrée par rôle générée');
}

module.exports = { generateUISpecByRole };