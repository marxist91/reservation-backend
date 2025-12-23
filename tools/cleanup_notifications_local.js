const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  try {
    const db = require('../models');
    const sequelize = db.sequelize;
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupTable = `notifications_backup_${timestamp}`;

    console.log('Création d\'une sauvegarde:', backupTable);
    await sequelize.query('CREATE TABLE `' + backupTable + '` AS SELECT * FROM notifications;');

    const rowsBefore = await sequelize.query('SELECT COUNT(*) AS count_before FROM notifications', { type: sequelize.QueryTypes.SELECT });
    const count_before = rowsBefore && rowsBefore[0] ? rowsBefore[0].count_before : 0;
    console.log('Nombre de notifications avant purge:', count_before);

    // Supprimer les doublons en gardant la ligne la plus récente (par created_at, puis id)
    const deleteSql = `
DELETE n1 FROM notifications n1
JOIN notifications n2
  ON n1.user_id = n2.user_id
  AND IFNULL(n1.reservation_id, -1) = IFNULL(n2.reservation_id, -1)
  AND IFNULL(n1.type, '') = IFNULL(n2.type, '')
  AND (n1.created_at < n2.created_at OR (n1.created_at = n2.created_at AND n1.id < n2.id));
`;

    const [deleteResult] = await sequelize.query(deleteSql);
    console.log('Purge exécutée. Détails:', deleteResult && deleteResult.affectedRows ? deleteResult.affectedRows : deleteResult);

    const rowsAfter = await sequelize.query('SELECT COUNT(*) AS count_after FROM notifications', { type: sequelize.QueryTypes.SELECT });
    const count_after = rowsAfter && rowsAfter[0] ? rowsAfter[0].count_after : 0;
    console.log('Nombre de notifications après purge:', count_after);

    // Montrer quelques notifications récentes
    const [rows] = await sequelize.query("SELECT id, user_id, type, titre, reservation_id, created_at FROM notifications ORDER BY created_at DESC LIMIT 20");
    console.log('Extrait (20 dernières) après purge:');
    console.log(rows);

    process.exit(0);
  } catch (err) {
    console.error('Erreur cleanup_notifications_local:', err);
    process.exit(1);
  }
}

main();
