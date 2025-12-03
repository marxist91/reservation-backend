// Test simple
require('dotenv').config();
const app = require('./server');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n✅ SERVEUR TEST ACTIF SUR http://localhost:${PORT}\n`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
