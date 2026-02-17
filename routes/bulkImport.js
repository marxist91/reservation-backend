// Route Express pour lancer l'import d'utilisateurs depuis Railway
const express = require('express');
const router = express.Router();

router.post('/admin/bulk-import', async (req, res) => {
  try {
    // Importer le script d'ajout
    await require('../scripts/bulkAddUsers');
    res.status(200).json({ message: 'Import utilisateurs terminé.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
