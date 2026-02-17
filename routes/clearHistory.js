// Route Express pour supprimer tout l'historique côté backend
const express = require('express');
const router = express.Router();
const { History } = require('../models');

// Suppression totale de l'historique (admin uniquement)
router.delete('/admin/history/clear', async (req, res) => {
  try {
    await History.destroy({ where: {}, truncate: true });
    res.status(200).json({ message: 'Historique supprimé.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
