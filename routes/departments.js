const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/verifyRole');
const { Department, Reservation, User } = require('../models');

// GET /api/departments - lister tous les départements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const deps = await Department.findAll({
      order: [['name', 'ASC']],
      include: [{ model: User, as: 'responsable', attributes: ['id', 'prenom', 'nom', 'email'] }]
    });
    console.log(`GET /api/departments -> found ${deps.length} departments`);
    if (deps.length > 0) {
      console.log('Sample departments:', deps.slice(0, 5).map(d => ({ id: d.id, name: d.name })));
    }
    return res.json({ data: deps });
  } catch (error) {
    console.error('Erreur GET /api/departments:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/departments - créer un département
router.post('/', authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const { name, description, slug, responsable_id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nom requis' });
    }

    const [dep, created] = await Department.findOrCreate({
      where: { name: name.trim() },
      defaults: {
        description: description ?? null,
        slug: slug ?? null,
        responsable_id: responsable_id ?? null,
      }
    });
    // if existed but fields different, ensure they are updated
    if (!created) {
      const needsUpdate = (description && dep.description !== description) || (slug && dep.slug !== slug) || (typeof responsable_id !== 'undefined' && dep.responsable_id !== responsable_id);
      if (needsUpdate) {
        await dep.update({ description: description ?? dep.description, slug: slug ?? dep.slug, responsable_id: responsable_id ?? dep.responsable_id });
      }
    }
    // Re-fetch with responsable included
    const result = await Department.findByPk(dep.id, { include: [{ model: User, as: 'responsable', attributes: ['id', 'prenom', 'nom', 'email'] }] });
    return res.status(created ? 201 : 200).json({ data: result, created });
  } catch (error) {
    console.error('Erreur POST /api/departments:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/departments/:id - mettre à jour un département
router.put('/:id', authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, slug, responsable_id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nom requis' });
    }

    const dep = await Department.findByPk(id);
    if (!dep) return res.status(404).json({ error: 'Département non trouvé' });

    // Vérifier unicité
    const existing = await Department.findOne({ where: { name: name.trim() } });
    if (existing && existing.id !== id) {
      return res.status(409).json({ error: 'Un département avec ce nom existe déjà' });
    }
    await dep.update({ name: name.trim(), description: description ?? dep.description, slug: slug ?? dep.slug, responsable_id: typeof responsable_id !== 'undefined' ? (responsable_id === '' ? null : responsable_id) : dep.responsable_id });
    const updated = await Department.findByPk(dep.id, { include: [{ model: User, as: 'responsable', attributes: ['id', 'prenom', 'nom', 'email'] }] });
    return res.json({ data: updated });
  } catch (error) {
    console.error('Erreur PUT /api/departments/:id:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/departments/:id - supprimer un département (si non utilisé)
router.delete('/:id', authMiddleware, verifyRole(["admin"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dep = await Department.findByPk(id);
    if (!dep) return res.status(404).json({ error: 'Département non trouvé' });

    // Empêcher suppression si des réservations y sont liées
    const linked = await Reservation.count({ where: { department_id: id } });
    if (linked > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer : département utilisé par des réservations' });
    }

    await dep.destroy();
    return res.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/departments/:id:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
