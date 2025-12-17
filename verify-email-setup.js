/**
 * Script de vérification du système d'email
 * Vérifie que tous les composants sont en place
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🔍 VÉRIFICATION SYSTÈME EMAIL');
console.log('========================================\n');

let errors = 0;
let warnings = 0;
let success = 0;

// Liste des fichiers requis
const requiredFiles = [
  { path: 'services/emailService.js', desc: 'Service email principal' },
  { path: 'test-email.js', desc: 'Script de test' },
  { path: 'EMAIL_SETUP.md', desc: 'Guide rapide' },
  { path: 'docs/CONFIGURATION_EMAIL.md', desc: 'Documentation complète' },
  { path: 'docs/EMAIL_IMPLEMENTATION.md', desc: 'Documentation implémentation' },
  { path: 'email-setup-wizard.ps1', desc: 'Assistant Windows' },
  { path: 'email-setup-wizard.sh', desc: 'Assistant Linux/macOS' },
];

// Liste des fichiers modifiés
const modifiedFiles = [
  { path: 'routes/reservations.js', desc: 'Routes réservations' },
  { path: 'routes/alternatives.js', desc: 'Routes alternatives' },
  { path: '.env', desc: 'Configuration environnement' },
  { path: '.env.example', desc: 'Exemple configuration' },
  { path: 'README.md', desc: 'Documentation principale' },
];

// Vérifier les fichiers requis
console.log('📁 Vérification des fichiers requis:\n');
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ✅ ${file.desc.padEnd(35)} (${sizeKB} KB)`);
    success++;
  } else {
    console.log(`  ❌ ${file.desc.padEnd(35)} MANQUANT!`);
    errors++;
  }
});

// Vérifier les fichiers modifiés
console.log('\n📝 Vérification des fichiers modifiés:\n');
modifiedFiles.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasEmailService = content.includes('emailService');
    const hasEmailConfig = content.includes('EMAIL_');
    
    if (hasEmailService || hasEmailConfig) {
      console.log(`  ✅ ${file.desc.padEnd(35)} (modifié)`);
      success++;
    } else {
      console.log(`  ⚠️  ${file.desc.padEnd(35)} (pas de modif email)`);
      warnings++;
    }
  } else {
    console.log(`  ❌ ${file.desc.padEnd(35)} MANQUANT!`);
    errors++;
  }
});

// Vérifier le service email
console.log('\n🔧 Vérification du service email:\n');
try {
  const emailService = require('./services/emailService');
  
  // Vérifier les méthodes
  const methods = [
    'isReady',
    'sendEmail',
    'sendReservationValidated',
    'sendReservationRejected',
    'sendAlternativeProposed',
    'sendNewReservationToAdmins',
    'sendAlternativeAccepted',
  ];
  
  methods.forEach(method => {
    if (typeof emailService[method] === 'function') {
      console.log(`  ✅ Méthode ${method.padEnd(30)} disponible`);
      success++;
    } else {
      console.log(`  ❌ Méthode ${method.padEnd(30)} MANQUANTE!`);
      errors++;
    }
  });
  
  // Vérifier les templates
  console.log('\n📄 Vérification des templates:\n');
  const templates = [
    'getBaseTemplate',
    'getReservationValidatedTemplate',
    'getReservationRejectedTemplate',
    'getAlternativeProposedTemplate',
    'getNewReservationTemplate',
    'getAlternativeAcceptedTemplate',
  ];
  
  templates.forEach(template => {
    if (typeof emailService[template] === 'function') {
      console.log(`  ✅ Template ${template.padEnd(35)} disponible`);
      success++;
    } else {
      console.log(`  ❌ Template ${template.padEnd(35)} MANQUANT!`);
      errors++;
    }
  });
  
  // Vérifier la configuration
  console.log('\n⚙️  Configuration email:\n');
  require('dotenv').config();
  
  const configVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
  ];
  
  configVars.forEach(varName => {
    if (process.env[varName]) {
      const display = varName === 'EMAIL_PASSWORD' 
        ? '****** (masqué)' 
        : process.env[varName];
      console.log(`  ✅ ${varName.padEnd(20)} = ${display}`);
      success++;
    } else {
      console.log(`  ⚠️  ${varName.padEnd(20)} NON DÉFINI`);
      warnings++;
    }
  });
  
  // Statut du service
  console.log('\n🚀 Statut du service:\n');
  if (emailService.isReady()) {
    console.log('  ✅ Service email CONFIGURÉ et PRÊT');
    success++;
  } else {
    console.log('  ⚠️  Service email NON CONFIGURÉ (mode désactivé)');
    console.log('     → Les notifications en BDD fonctionneront toujours');
    console.log('     → Configurez les variables EMAIL_* dans .env pour activer');
    warnings++;
  }
  
} catch (error) {
  console.log(`  ❌ Erreur lors du chargement du service: ${error.message}`);
  errors++;
}

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances NPM:\n');
try {
  const packageJson = require('./package.json');
  if (packageJson.dependencies.nodemailer) {
    console.log(`  ✅ nodemailer ${packageJson.dependencies.nodemailer.padEnd(10)} installé`);
    success++;
  } else {
    console.log('  ❌ nodemailer MANQUANT dans package.json!');
    errors++;
  }
} catch (error) {
  console.log(`  ❌ Erreur lecture package.json: ${error.message}`);
  errors++;
}

// Vérifier l'intégration dans les routes
console.log('\n🔗 Vérification intégration routes:\n');
try {
  const reservationsContent = fs.readFileSync('routes/reservations.js', 'utf8');
  const alternativesContent = fs.readFileSync('routes/alternatives.js', 'utf8');
  
  const checks = [
    { file: 'reservations.js', code: reservationsContent, search: 'emailService', desc: 'Import emailService' },
    { file: 'reservations.js', code: reservationsContent, search: 'sendReservationValidated', desc: 'Envoi email validation' },
    { file: 'reservations.js', code: reservationsContent, search: 'sendReservationRejected', desc: 'Envoi email refus' },
    { file: 'reservations.js', code: reservationsContent, search: 'sendNewReservationToAdmins', desc: 'Envoi email nouvelle réservation' },
    { file: 'alternatives.js', code: alternativesContent, search: 'emailService', desc: 'Import emailService' },
    { file: 'alternatives.js', code: alternativesContent, search: 'sendAlternativeAccepted', desc: 'Envoi email alternative acceptée' },
  ];
  
  checks.forEach(check => {
    if (check.code.includes(check.search)) {
      console.log(`  ✅ ${check.file.padEnd(20)} - ${check.desc}`);
      success++;
    } else {
      console.log(`  ❌ ${check.file.padEnd(20)} - ${check.desc} MANQUANT!`);
      errors++;
    }
  });
  
} catch (error) {
  console.log(`  ❌ Erreur vérification routes: ${error.message}`);
  errors++;
}

// Résumé
console.log('\n========================================');
console.log('📊 RÉSUMÉ');
console.log('========================================\n');

console.log(`  ✅ Succès:         ${success}`);
console.log(`  ⚠️  Avertissements: ${warnings}`);
console.log(`  ❌ Erreurs:        ${errors}\n`);

if (errors === 0 && warnings === 0) {
  console.log('🎉 PARFAIT! Le système d\'email est complètement configuré!\n');
  console.log('Prochaines étapes:');
  console.log('  1. Configurez les variables EMAIL_* dans .env');
  console.log('  2. Testez avec: node test-email.js');
  console.log('  3. Redémarrez le serveur: npm run dev\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('✅ Installation complète! Quelques avertissements à vérifier.\n');
  console.log('Prochaines étapes:');
  console.log('  1. Configurez les variables EMAIL_* dans .env');
  console.log('  2. Testez avec: node test-email.js\n');
  process.exit(0);
} else {
  console.log('❌ Des erreurs ont été détectées. Veuillez les corriger.\n');
  process.exit(1);
}
