#!/usr/bin/env node

console.log(`
🏨 PLATEFORME DE RÉSERVATION - AIDE COMPLÈTE
${'='.repeat(50)}

📚 COMMANDES DE DÉMARRAGE
▶️  npm run quick-start     - Installation et démarrage complet
▶️  npm start              - Démarrer le serveur (production)
▶️  npm run dev            - Mode développement avec rechargement
▶️  npm run setup          - Configuration initiale

📖 COMMANDES DE DOCUMENTATION  
▶️  npm run docs-all       - Générer toute la documentation
▶️  npm run docs:generate  - Script principal de génération
▶️  npm run docs:routes    - Analyser et documenter les routes
▶️  npm run docs:permissions - Inventaire des permissions
▶️  npm run docs:watch     - Surveillance des changements

🗄️  COMMANDES DE BASE DE DONNÉES
▶️  npm run db:create      - Créer la base de données
▶️  npm run db:migrate     - Exécuter les migrations
▶️  npm run db:seed        - Peupler avec des données de test
▶️  npm run db:reset       - Reset complet (drop + create + migrate + seed)

🧪 COMMANDES DE TEST ET VALIDATION
▶️  npm run test-all       - Suite complète de tests
▶️  npm run test:unit      - Tests unitaires
▶️  npm run test:integration - Tests d'intégration
▶️  npm run test:e2e       - Tests end-to-end
▶️  npm run validate-api   - Validation complète du système

❓ AIDE
▶️  npm run help           - Afficher cette aide

${'='.repeat(50)}

🔧 STRUCTURE DES DOSSIERS:
├── routes/                # Définition des routes API
├── models/               # Modèles Sequelize  
├── controllers/          # Logique métier
├── middleware/           # Middleware personnalisés
├── config/              # Fichiers de configuration
├── docs/                # Documentation et scripts
├── scripts/             # Scripts utilitaires
└── .env                 # Variables d'environnement

📋 ÉTAPES DE DÉMARRAGE RAPIDE:
1. Installer MySQL et créer la base de données
2. Configurer le fichier .env avec vos paramètres
3. Exécuter: npm run quick-start
4. Accéder à: http://localhost:3000

🆘 DÉPANNAGE:
- Vérifiez que MySQL est démarré
- Vérifiez les paramètres dans .env
- Consultez les logs en mode développement
- Utilisez npm run db:reset en cas de problème de DB

📧 DOCUMENTATION:
- Routes API: docs/generated/routes-summary.md
- Permissions: docs/generated/permissions-inventory.md
- Configuration: docs/config/

${'='.repeat(50)}
💡 Conseils: Utilisez 'npm run dev' pour le développement quotidien
`);