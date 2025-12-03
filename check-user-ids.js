const { User } = require('./models');

User.findAll({ order: [['id', 'ASC']] })
  .then(users => {
    console.log('\n=== UTILISATEURS EN BASE ===\n');
    users.forEach(u => {
      console.log(`ID${u.id}: ${u.prenom} ${u.nom} (${u.role})`);
    });
    console.log(`\nTotal: ${users.length} utilisateurs`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err.message);
    process.exit(1);
  });
