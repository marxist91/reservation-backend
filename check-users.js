const { User } = require('./models');

(async () => {
  try {
    const users = await User.findAll();
    console.log(`Utilisateurs en base: ${users.length}`);
    users.forEach(u => console.log(`  ID${u.id}: ${u.prenom} ${u.nom} (${u.role})`));
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();
