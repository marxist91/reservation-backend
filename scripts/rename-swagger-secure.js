const fs = require('fs');
const path = require('path');

const source = 'swagger-config.js';
const target = 'swagger.json';

if (!fs.existsSync(source)) {
  console.error(`❌ Fichier source introuvable : ${source}`);
  process.exit(1);
}

try {
  fs.renameSync(source, target);
  const sourceSize = fs.statSync(target).size;
  console.log(`✅ Renommage réussi : ${source} → ${target}`);
  console.log(`📦 Nouveau fichier : ${target} (${sourceSize} octets)`);
  console.log(`📍 Chemin : ${path.resolve(target)}`);
} catch (err) {
  console.error(`🚨 Échec du renommage : ${err.message}`);
  process.exit(2);
}