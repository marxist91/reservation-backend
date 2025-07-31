const { generateRBACMap } = require('./generators/rbac');
const { generateUIUsedActions } = require('./generators/ui-used-actions');
const { generateAuditReport } = require('./generators/audit');
const { generateUICoverage } = require('./generators/ui-coverage');
const { generateUISpecByRole } = require('./generators/ui-spec-by-role');

(async () => {
  await generateRBACMap();
  await generateUIUsedActions();
  await generateAuditReport();
  await generateUICoverage();
  await generateUISpecByRole();
})();