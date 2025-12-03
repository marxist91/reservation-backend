const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const report = {
  timestamp: new Date().toISOString(),
  errors: [],
  status: 'OK'
};

// 🚦 Validation des variables
const rootPassword = process.env.MYSQL_ROOT_PASSWORD;
const passwordFile = process.env.MYSQL_PASSWORD_FILE;

// ✅ Vérifie que MYSQL_ROOT_PASSWORD est défini
if (!rootPassword || rootPassword.trim() === '') {
  report.errors.push('MYSQL_ROOT_PASSWORD est manquant ou vide.');
}

// 🚫 Vérifie qu’il n’y a pas de conflit avec MYSQL_PASSWORD_FILE
if (rootPassword && passwordFile) {
  report.errors.push('Conflit détecté : MYSQL_ROOT_PASSWORD et MYSQL_PASSWORD_FILE sont définis simultanément.');
}

// 🔍 Statut final
if (report.errors.length > 0) {
  report.status = 'ERROR';
}

// 📝 Écrit le rapport JSON
const outputPath = path.resolve(__dirname, '../reports/mysql-env-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(`[MYSQL ENV VALIDATION] Status: ${report.status}`);
if (report.errors.length > 0) {
  console.error(report.errors.join('\n'));
}