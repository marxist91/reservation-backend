'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const names = [
      'PRMP',
      'Direction des affaires juridiques',
      'Direction commerciale',
      "Direction des systèmes d'information",
      'Direction générale',
      'Secrétariat général',
      'Direction des ressources humaines',
      "Direction de l'exploitation",
      'Direction technique',
      'Direction financière et comptable',
      'Direction de la capitainerie',
      'Direction du centre médico social',
    ];

    // Vérifier les départements déjà présents
    const placeholders = names.map(() => '?').join(',');
    const [existingRows] = await queryInterface.sequelize.query(
      `SELECT name FROM departments WHERE name IN (${placeholders})`,
      { replacements: names }
    );

    const existingNames = existingRows.map(r => r.name);
    const toInsert = names.filter(n => !existingNames.includes(n)).map(name => ({ name, created_at: now, updated_at: now }));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('departments', toInsert, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete('departments', {
      name: {
        [Op.in]: [
          'PRMP',
          'Direction des affaires juridiques',
          'Direction commerciale',
          "Direction des systèmes d'information",
          'Direction générale',
          'Secrétariat général',
          'Direction des ressources humaines',
          "Direction de l'exploitation",
          'Direction technique',
          'Direction financière et comptable',
          'Direction de la capitainerie',
          'Direction du centre médico social',
        ]
      }
    }, {});
  }
};
