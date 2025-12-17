(async () => {
  try {
    const { Department } = require('../models');

    const NAMES = [
      'Direction générale',
      'Secrétariat général',
      'Direction des affaires juridiques',
      "Direction des ressources humaines",
      'Direction commerciale',
      "Direction de l'exploitation",
      'Direction technique',
      'Direction financière et comptable',
      'Direction de la capitainerie',
      'Direction du centre médico social',
      "Direction des systèmes d'information",
      'PRMP',
    ];

    for (const name of NAMES) {
      const [dep, created] = await Department.findOrCreate({ where: { name: name.trim() }, defaults: { name: name.trim() } });
      console.log(`${created ? 'Created' : 'Exists'}: ${dep.name} (id=${dep.id})`);
    }

    console.log('Seeding departments done.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding departments:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
