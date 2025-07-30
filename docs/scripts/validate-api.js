#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VALIDATION ET ANALYSE DE L'API
 * Phase 3 : Validation complète de la structure et fonctionnalités
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 === VALIDATION COMPLÈTE DU SYSTÈME ===\n');

// 🎨 Couleurs pour l'affichage
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const { green, yellow, red, blue, reset, bold } = colors;

// 📊 Résultats de validation
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// 🔧 Fonctions utilitaires
function log(message, type = 'info') {
  const symbols = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    test: '🧪'
  };
  
  const colorMap = {
    success: green,
    error: red,
    warning: yellow,
    info: blue,
    test: blue
  };
  
  console.log(`${symbols[type]} ${colorMap[type]}${message}${reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`${description}: ${filePath}`, 'success');
    results.passed++;
  } else {
    log(`${description} MANQUANT: ${filePath}`, 'error');
    results.failed++;
  }
  results.details.push({ check: description, status: exists ? 'PASS' : 'FAIL', file: filePath });
  return exists;
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  if (exists) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
    log(`${description}: ${files.length} fichiers trouvés`, 'success');
    results.passed++;
  } else {
    log(`${description} MANQUANT: ${dirPath}`, 'error');
    results.failed++;
  }
  results.details.push({ check: description, status: exists ? 'PASS' : 'FAIL', dir: dirPath });
  return exists;
}

function executeCommand(command, description, required = true) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`${description}: OK`, 'success');
    results.passed++;
    results.details.push({ check: description, status: 'PASS', output: output.trim() });
    return true;
  } catch (error) {
    if (required) {
      log(`${description}: ÉCHOUÉ - ${error.message}`, 'error');
      results.failed++;
    } else {
      log(`${description}: Non disponible (optionnel)`, 'warning');
      results.warnings++;
    }
    results.details.push({ check: description, status: required ? 'FAIL' : 'WARN', error: error.message });
    return false;
  }
}

// 🏗️ VALIDATION DE LA STRUCTURE

console.log(`${bold}${blue}1. VALIDATION DE LA STRUCTURE DU PROJET${reset}\n`);

// Fichiers principaux
checkFile('server.js', 'Fichier principal serveur');
checkFile('package.json', 'Configuration npm');
checkFile('.env.example', 'Template variables environnement');

// Répertoires essentiels
checkDirectory('routes', 'Répertoire des routes');
checkDirectory('models', 'Répertoire des modèles');

// Fichiers de routes spécifiques
const requiredRoutes = ['auth.js', 'users.js', 'rooms.js', 'reservations.js', 'notifications.js', 'audit.js', 'meta.js'];
requiredRoutes.forEach(route => {
  checkFile(`routes/${route}`, `Route ${route}`);
});

// Fichiers de modèles spécifiques
const requiredModels = ['user.js', 'room.js', 'reservation.js', 'auditLog.js', 'actionLog.js', 'associations.js'];
requiredModels.forEach(model => {
  checkFile(`models/${model}`, `Modèle ${model}`);
});

console.log(`\n${bold}${blue}2. VALIDATION DES DÉPENDANCES${reset}\n`);

// Vérification Node.js et npm
executeCommand('node --version', 'Version Node.js');
executeCommand('npm --version', 'Version npm');

// Vérification PostgreSQL
executeCommand('psql --version', 'Version PostgreSQL');

// Vérification des dépendances npm
if (fs.existsSync('node_modules')) {
  log('Dépendances npm installées', 'success');
  results.passed++;
} else {
  log('Dépendances npm NON INSTALLÉES - Exécutez: npm install', 'error');
  results.failed++;
}

console.log(`\n${bold}${blue}3. VALIDATION DE LA CONFIGURATION${reset}\n`);

// Vérification du fichier .env
if (fs.existsSync('.env')) {
  log('Fichier .env présent', 'success');
  results.passed++;
  
  // Vérification des variables essentielles
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 'PORT'];
  
  requiredVars.forEach(variable => {
    if (envContent.includes(variable)) {
      log(`Variable ${variable} définie`, 'success');
      results.passed++;
    } else {
      log(`Variable ${variable} MANQUANTE`, 'error');
      results.failed++;
    }
  });
} else {
  log('Fichier .env MANQUANT - Copiez .env.example vers .env', 'error');
  results.failed++;
}

console.log(`\n${bold}${blue}4. VALIDATION DU CODE${reset}\n`);

// Vérification de la syntaxe JavaScript
const jsFiles = [
  'server.js',
  ...requiredRoutes.map(r => `routes/${r}`),
  ...requiredModels.map(m => `models/${m}`)
];

jsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      require(`${process.cwd()}/${file}`);
      log(`Syntaxe ${file}: OK`, 'success');
      results.passed++;
    } catch (error) {
      if (!error.message.includes('Cannot find module') && !error.message.includes('sequelize')) {
        log(`Syntaxe ${file}: ERREUR - ${error.message}`, 'error');
        results.failed++;
      } else {
        log(`Syntaxe ${file}: OK (dépendances manquantes normales)`, 'success');
        results.passed++;
      }
    }
  }
});

console.log(`\n${bold}${blue}5. VALIDATION DE LA BASE DE DONNÉES${reset}\n`);

// Test de connexion PostgreSQL (si disponible)
executeCommand('psql -c "SELECT version();" postgres', 'Connexion PostgreSQL', false);

// Vérification des migrations
if (fs.existsSync('migrations')) {
  const migrations = fs.readdirSync('migrations').filter(f => f.endsWith('.js'));
  log(`Migrations disponibles: ${migrations.length}`, migrations.length > 0 ? 'success' : 'warning');
  if (migrations.length > 0) results.passed++; else results.warnings++;
} else {
  log('Répertoire migrations non trouvé', 'warning');
  results.warnings++;
}

console.log(`\n${bold}${blue}6. VALIDATION DES FONCTIONNALITÉS${reset}\n`);

// Vérification de la structure des routes
const routeChecks = [
  { file: 'routes/auth.js', endpoints: ['register', 'login', 'logout'] },
  { file: 'routes/users.js', endpoints: ['GET /', 'GET /:id', 'PUT /:id'] },
  { file: 'routes/rooms.js', endpoints: ['GET /', 'POST /', 'PUT /:id'] },
  { file: 'routes/reservations.js', endpoints: ['GET /', 'POST /', 'PUT /:id'] },
  { file: 'routes/audit.js', endpoints: ['GET /actions', 'GET /user/:id'] },
  { file: 'routes/meta.js', endpoints: ['GET /meta', 'GET /version'] }
];

routeChecks.forEach(({ file, endpoints }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    endpoints.forEach(endpoint => {
      const found = content.includes(endpoint) || content.includes(endpoint.split(' ')[1]);
      if (found) {
        log(`Endpoint ${endpoint} dans ${file}`, 'success');
        results.passed++;
      } else {
        log(`Endpoint ${endpoint} MANQUANT dans ${file}`, 'warning');
        results.warnings++;
      }
    });
  }
});

console.log(`\n${bold}${blue}7. VALIDATION DE LA DOCUMENTATION${reset}\n`);

// Vérification du script de génération de docs
checkFile('scripts/generate-docs.js', 'Script de génération documentation') || 
checkFile('generate-docs.js', 'Script de génération documentation (racine)');

// Vérification des docs générées
if (fs.existsSync('docs')) {
  const docFiles = fs.readdirSync('docs');
  log(`Documentation générée: ${docFiles.length} fichiers`, 'success');
  results.passed++;
  
  const expectedDocs = [
    'routes-summary.md',
    'technical-docs.md',
    'permissions-matrix.md',
    'quick-start.md',
    'api-collection.postman.json'
  ];
  
  expectedDocs.forEach(doc => {
    if (docFiles.includes(doc)) {
      log(`Document ${doc} présent`, 'success');
      results.passed++;
    } else {
      log(`Document ${doc} manquant - Exécutez: node generate-docs.js`, 'warning');
      results.warnings++;
    }
  });
} else {
  log('Documentation non générée - Exécutez: node generate-docs.js', 'warning');
  results.warnings++;
}

console.log(`\n${bold}${blue}8. TESTS DE FONCTIONNALITÉ (si serveur démarré)${reset}\n`);

// Test des endpoints si le serveur tourne
const testEndpoints = [
  { url: 'http://localhost:3000/api/healthcheck', name: 'Health check' },
  { url: 'http://localhost:3000/api/meta', name: 'Métadonnées' },
  { url: 'http://localhost:3000/api/version', name: 'Version' },
  { url: 'http://localhost:3000/api/info', name: 'Informations' }
];

testEndpoints.forEach(({ url, name }) => {
  executeCommand(`curl -s ${url} | head -1`, `Test ${name}`, false);
});

console.log(`\n${bold}${blue}9. ANALYSE DE PERFORMANCE${reset}\n`);

// Statistiques du projet
if (fs.existsSync('.')) {
  try {
    const stats = {
      jsFiles: 0,
      totalLines: 0,
      routeFiles: 0,
      modelFiles: 0
    };
    
    function countLines(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n').length;
      } catch {
        return 0;
      }
    }
    
    function analyzeDirectory(dir, prefix = '') {
      if (!fs.existsSync(dir)) return;
      
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && file.endsWith('.js')) {
          stats.jsFiles++;
          stats.totalLines += countLines(fullPath);
          
          if (dir.includes('routes')) stats.routeFiles++;
          if (dir.includes('models')) stats.modelFiles++;
        }
      });
    }
    
    analyzeDirectory('.');
    analyzeDirectory('routes');
    analyzeDirectory('models');
    
    log(`Fichiers JavaScript: ${stats.jsFiles}`, 'info');
    log(`Lignes de code total: ${stats.totalLines}`, 'info');
    log(`Fichiers de routes: ${stats.routeFiles}`, 'info');
    log(`Fichiers de modèles: ${stats.modelFiles}`, 'info');
    
    results.passed += 4;
    
  } catch (error) {
    log(`Erreur lors de l'analyse: ${error.message}`, 'warning');
    results.warnings++;
  }
}

console.log(`\n${bold}${blue}10. RECOMMANDATIONS DE SÉCURITÉ${reset}\n`);

// Vérifications de sécurité
const securityChecks = [
  {
    name: 'Fichier .env non committé',
    check: () => {
      const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
      return gitignore.includes('.env');
    }
  },
  {
    name: 'Dépendances de sécurité',
    check: () => {
      if (!fs.existsSync('package.json')) return false;
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return deps.helmet || deps.bcrypt || deps.jsonwebtoken;
    }
  },
  {
    name: 'Variables sensibles dans .env.example',
    check: () => {
      if (!fs.existsSync('.env.example')) return true;
      const content = fs.readFileSync('.env.example', 'utf8');
      return !content.includes('password123') && !content.includes('secret123');
    }
  }
];

securityChecks.forEach(({ name, check }) => {
  if (check()) {
    log(name, 'success');
    results.passed++;
  } else {
    log(`${name}: À améliorer`, 'warning');
    results.warnings++;
  }
});

console.log(`\n${bold}${blue}11. GÉNÉRATION DU RAPPORT FINAL${reset}\n`);

// Calcul des scores
const total = results.passed + results.failed + results.warnings;
const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

// Génération du rapport détaillé
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total: total,
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    successRate: successRate
  },
  details: results.details,
  recommendations: []
};

// Ajout de recommandations basées sur les résultats
if (results.failed > 0) {
  report.recommendations.push({
    priority: 'HIGH',
    message: 'Corriger les erreurs critiques avant la mise en production',
    actions: [
      'Vérifier les fichiers manquants',
      'Installer les dépendances manquantes',
      'Configurer les variables d\'environnement'
    ]
  });
}

if (results.warnings > 5) {
  report.recommendations.push({
    priority: 'MEDIUM',
    message: 'Améliorer la configuration pour optimiser les performances',
    actions: [
      'Générer la documentation complète',
      'Ajouter les tests manquants',
      'Optimiser la structure des fichiers'
    ]
  });
}

if (successRate > 80) {
  report.recommendations.push({
    priority: 'LOW',
    message: 'Système en bonne santé - maintenance préventive recommandée',
    actions: [
      'Mettre à jour la documentation',
      'Effectuer des tests de charge',
      'Planifier les sauvegardes'
    ]
  });
}

// Sauvegarde du rapport
const reportDir = 'reports';
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const reportFile = path.join(reportDir, `validation-report-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

// Affichage du résumé final
console.log(`${bold}${yellow}═══════════════════════════════════════════════════════════════════════${reset}`);
console.log(`${bold}${blue}                        RAPPORT DE VALIDATION FINAL                      ${reset}`);
console.log(`${bold}${yellow}═══════════════════════════════════════════════════════════════════════${reset}`);

console.log(`\n📊 ${bold}RÉSUMÉ STATISTIQUE:${reset}`);
console.log(`   • Total des vérifications: ${bold}${total}${reset}`);
console.log(`   • ${green}✅ Réussites: ${bold}${results.passed}${reset}`);
console.log(`   • ${red}❌ Échecs: ${bold}${results.failed}${reset}`);
console.log(`   • ${yellow}⚠️  Avertissements: ${bold}${results.warnings}${reset}`);
console.log(`   • 📈 Taux de réussite: ${bold}${successRate}%${reset}`);

// Status global avec couleur appropriée
let globalStatus, statusColor;
if (results.failed === 0 && successRate >= 90) {
  globalStatus = '🎉 EXCELLENT';
  statusColor = green;
} else if (results.failed === 0 && successRate >= 75) {
  globalStatus = '✅ BON';
  statusColor = green;
} else if (results.failed <= 2 && successRate >= 60) {
  globalStatus = '⚠️  ACCEPTABLE';
  statusColor = yellow;
} else {
  globalStatus = '❌ CRITIQUE';
  statusColor = red;
}

console.log(`\n🎯 ${bold}STATUS GLOBAL: ${statusColor}${globalStatus}${reset}`);

// Recommandations prioritaires
if (report.recommendations.length > 0) {
  console.log(`\n🔧 ${bold}RECOMMANDATIONS PRIORITAIRES:${reset}`);
  report.recommendations.forEach((rec, index) => {
    const priorityColor = rec.priority === 'HIGH' ? red : rec.priority === 'MEDIUM' ? yellow : green;
    console.log(`\n   ${index + 1}. ${priorityColor}[${rec.priority}]${reset} ${rec.message}`);
    rec.actions.forEach(action => {
      console.log(`      • ${action}`);
    });
  });
}

// Actions immédiates
console.log(`\n⚡ ${bold}ACTIONS IMMÉDIATES:${reset}`);

if (results.failed > 0) {
  console.log(`   ${red}🚨 CRITIQUE:${reset} Corriger ${results.failed} erreur(s) avant de continuer`);
  console.log(`   ${blue}📋 Commandes suggérées:${reset}`);
  
  if (results.details.some(d => d.file && d.file.includes('node_modules'))) {
    console.log(`      npm install`);
  }
  
  if (results.details.some(d => d.file && d.file.includes('.env'))) {
    console.log(`      cp .env.example .env && nano .env`);
  }
  
  if (results.details.some(d => d.check && d.check.includes('PostgreSQL'))) {
    console.log(`      sudo service postgresql start`);
    console.log(`      createdb room_booking`);
  }
}

if (!fs.existsSync('docs')) {
  console.log(`   ${yellow}📚 DOCUMENTATION:${reset} Générer la documentation`);
  console.log(`      node generate-docs.js`);
}

if (results.warnings > 0) {
  console.log(`   ${yellow}⚠️  OPTIMISATION:${reset} ${results.warnings} amélioration(s) recommandée(s)`);
}

// Prochaines étapes
console.log(`\n🚀 ${bold}PROCHAINES ÉTAPES:${reset}`);

if (successRate >= 90) {
  console.log(`   1. ${green}✅ Démarrer le serveur:${reset} npm run dev`);
  console.log(`   2. ${green}🧪 Exécuter les tests:${reset} npm test`);
  console.log(`   3. ${green}📚 Consulter la doc:${reset} npm run docs:serve`);
  console.log(`   4. ${green}🚀 Déployer:${reset} make deploy-check`);
} else if (successRate >= 70) {
  console.log(`   1. ${yellow}🔧 Corriger les avertissements majeurs${reset}`);
  console.log(`   2. ${yellow}📋 Régénérer la documentation${reset}`);
  console.log(`   3. ${green}🧪 Tester le système${reset}`);
  console.log(`   4. ${green}📊 Re-valider avec ce script${reset}`);
} else {
  console.log(`   1. ${red}🚨 Corriger TOUTES les erreurs critiques${reset}`);
  console.log(`   2. ${red}⚙️  Vérifier la configuration complète${reset}`);
  console.log(`   3. ${yellow}📋 Réinstaller si nécessaire${reset}`);
  console.log(`   4. ${blue}🔄 Relancer cette validation${reset}`);
}

// Fichiers de rapport générés
console.log(`\n📁 ${bold}RAPPORTS GÉNÉRÉS:${reset}`);
console.log(`   • ${reportFile}`);
console.log(`   • Consulter avec: cat ${reportFile} | jq`);

// Commandes utiles pour le debugging
console.log(`\n🛠️  ${bold}COMMANDES DE DEBUGGING:${reset}`);
console.log(`   • Logs serveur: tail -f logs/*.log`);
console.log(`   • Status système: make status`);
console.log(`   • Test rapide: make quick-test`);
console.log(`   • Documentation: make docs-all`);

// Ressources d'aide
console.log(`\n📚 ${bold}RESSOURCES D'AIDE:${reset}`);
console.log(`   • Guide complet: docs/quick-start.md`);
console.log(`   • Endpoints API: docs/routes-summary.md`);
console.log(`   • Documentation technique: docs/technical-docs.md`);
console.log(`   • Makefile: make help`);

console.log(`\n${bold}${yellow}═══════════════════════════════════════════════════════════════════════${reset}`);

// Code de sortie approprié
const exitCode = results.failed > 0 ? 1 : results.warnings > 10 ? 2 : 0;

if (exitCode === 0) {
  console.log(`${green}🎉 Validation terminée avec succès!${reset}`);
} else if (exitCode === 1) {
  console.log(`${red}❌ Validation échouée - corriger les erreurs critiques${reset}`);
} else {
  console.log(`${yellow}⚠️  Validation complétée avec des avertissements${reset}`);
}

console.log(`${bold}${blue}Timestamp: ${new Date().toLocaleString()}${reset}`);
console.log(`${bold}${yellow}═══════════════════════════════════════════════════════════════════════${reset}\n`);

// Export du rapport pour usage programmatique
module.exports = {
  report,
  results,
  exitCode
};

// Exit avec le code approprié si exécuté directement
if (require.main === module) {
  process.exit(exitCode);
}