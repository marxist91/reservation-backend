#!/usr/bin/env node
const path = require('path');
const db = require(path.resolve(__dirname, '..', 'models'));

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion DB OK');

    const Op = db.Sequelize.Op;
    const before = await db.Department.count({ where: { responsable_id: { [Op.not]: null } } });
    console.log(`🔎 Départements avec responsable avant : ${before}`);

    const [affected] = await db.Department.update({ responsable_id: null }, { where: {} });

    const after = await db.Department.count({ where: { responsable_id: { [Op.not]: null } } });
    console.log(`🔎 Départements avec responsable après : ${after}`);
    console.log(`✳️ Lignes affectées (approx): ${affected}`);

    // Écrire un fichier drapeau pour indiquer que la purge a été effectuée
    const fs = require('fs');
    const flagDir = path.resolve(__dirname, '..', 'data');
    try {
      if (!fs.existsSync(flagDir)) fs.mkdirSync(flagDir, { recursive: true });
      const flagFile = path.join(flagDir, 'purge_flags.json');
      const payload = {
        departments_responsables_purged: new Date().toISOString()
      };
      fs.writeFileSync(flagFile, JSON.stringify(payload, null, 2), 'utf8');
      console.log(`📝 Flag file written: ${flagFile}`);
    } catch (fsErr) {
      console.error('Erreur écriture flag file:', fsErr.message || fsErr);
    }

    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la purge :', err);
    process.exit(1);
  }
})();
