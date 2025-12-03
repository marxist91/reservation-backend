const { Room } = require('./models');

(async () => {
  try {
    const rooms = await Room.findAll();
    console.log(`Salles en base: ${rooms.length}`);
    rooms.forEach(r => console.log(`  ID${r.id}: ${r.nom} (capacité ${r.capacite})`));
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();
