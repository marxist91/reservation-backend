const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  try {
    const db = require('../models');
    await db.sequelize.authenticate();
    console.log('✅ Connexion DB OK');

    const Setting = db.Setting;
    const Notification = db.Notification;
    const User = db.User;

    const settings = await Setting.getSettings();
    console.log('--- SETTING ---');
    console.log(JSON.stringify(settings.toJSON(), null, 2));

    console.log('\n--- 20 DERNIERES NOTIFICATIONS ---');
    const notifs = await Notification.findAll({
      limit: 20,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'destinataire', attributes: ['id', 'email'] }]
    });

    const simplified = notifs.map(n => ({ id: n.id, user_id: n.user_id, user_email: n.destinataire ? n.destinataire.email : null, type: n.type, titre: n.titre, reservation_id: n.reservation_id, created_at: n.created_at }));
    console.log(JSON.stringify(simplified, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Erreur script check_setting_local:', err);
    process.exit(1);
  }
}

main();
