const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  try {
    const db = require('../models');
    await db.sequelize.authenticate();
    const Setting = db.Setting;
    const settings = await Setting.getSettings();
    console.log('Avant:', settings.suppress_admin_if_responsable_notified);
    await settings.update({ suppress_admin_if_responsable_notified: true });
    const updated = await Setting.getSettings();
    console.log('Après:', updated.suppress_admin_if_responsable_notified);
    process.exit(0);
  } catch (err) {
    console.error('Erreur set_suppress_admin_local:', err);
    process.exit(1);
  }
}

main();
