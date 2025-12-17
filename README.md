# 🏢 Système de Réservation de Salles

> **Phase 3 Terminée** : Documentation automatique et validation complète ✅

## 🎯 Vue d'ensemble

Système complet de réservation de salles avec API REST, authentification JWT, audit avancé et documentation automatique. Développé en Node.js avec Express et PostgreSQL.

### ✨ Fonctionnalités principales

- 🔐 **Authentification JWT** avec rôles utilisateur/admin
- 🏢 **Gestion des salles** avec équipements et capacités
- 📅 **Réservations intelligentes** avec vérification de disponibilité
- 🔍 **Système d'audit complet** avec traçabilité des actions
- 🔔 **Notifications en temps réel** pour les utilisateurs
- � **Notifications par email** avec templates HTML professionnels
- �📚 **Documentation automatique** avec génération multi-format
- 🧪 **Validation et tests** automatisés
- 🎛️ **Interface d'administration** avancée

## 🚀 Démarrage rapide (5 minutes)

### 1. Installation

```bash
# Cloner le projet
git clone <repository-url>
cd room-booking-api

# Installation automatique avec Make
make quick-start

# OU installation manuelle
npm install
cp .env.example .env
nano .env  # Configurer les variables
npm run db:migrate
npm run db:seed
npm run dev
```

### 2. Test immédiat

```bash
# Vérifier que tout fonctionne
curl http://localhost:3000/api/healthcheck

# Réponse attendue:
# {"status":"✅ API opérationnelle","timestamp":"...","service":"Système de Réservation de Salles"}
```

### 3. Génération de la documentation

```bash
# Générer toute la documentation
make docs-all

# OU manuellement
node generate-docs.js
npm run docs:serve
```

**🌐 Accès**: http://localhost:3000 (API) | http://localhost:8080 (Documentation)

### 4. Configuration des notifications email (Optionnel mais recommandé)

```bash
# Configuration rapide (5 minutes)
# Voir EMAIL_SETUP.md pour le guide complet

# 1. Éditer .env
nano .env

# 2. Ajouter vos identifiants Gmail (ou autre)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx  # Mot de passe d'application

# 3. Tester
node test-email.js

# 4. Redémarrer le serveur
npm run dev
```

📚 **Documentation complète**: [EMAIL_SETUP.md](EMAIL_SETUP.md) | [docs/CONFIGURATION_EMAIL.md](docs/CONFIGURATION_EMAIL.md)

## 📋 Structure du projet

```
├── server.js                 # Point d'entrée principal
├── routes/                   # Routes API organisées par module
│   ├── auth.js              # Authentification (register, login, logout)
│   ├── users.js             # Gestion des utilisateurs
│   ├── rooms.js             # Gestion des salles
│   ├── reservations.js      # Gestion des réservations
│   ├── notifications.js     # Système de notifications
│   ├── audit.js             # Audit et traçabilité avancée
│   └── meta.js              # Métadonnées système
├── models/                   # Modèles Sequelize
│   ├── user.js              # Utilisateurs
│   ├── room.js              # Salles
│   ├── reservation.js       # Réservations
│   ├── auditLog.js          # Logs d'audit
│   ├── actionLog.js         # Actions utilisateurs
│   └── associations.js      # Relations entre modèles
├── docs/                     # Documentation générée automatiquement
│   ├── routes-summary.md         # Résumé des endpoints
│   ├── technical-docs.md         # Documentation technique
│   ├── permissions-matrix.md     # Matrice des autorisations
│   ├── quick-start.md           # Guide de démarrage
│   ├── api-collection.postman.json # Collection Postman
│   └── openapi-spec.yaml        # Spécification OpenAPI
├── scripts/                  # Scripts d'automatisation
│   ├── generate-docs.js     # Générateur de documentation
│   └── validate-api.js      # Validation complète du système
├── Makefile                  # Automatisation des tâches
└── README.md                # Ce fichier
```

## 🔗 API Endpoints

### 🌐 Endpoints publics (sans authentification)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/healthcheck` | GET | Status du serveur |
| `/api/meta` | GET | Métadonnées complètes du système |
| `/api/version` | GET | Version de l'API |
| `/api/info` | GET | Informations de base |
| `/api/register` | POST | Inscription utilisateur |
| `/api/login` | POST | Connexion utilisateur |

### 🔒 Endpoints utilisateur (authentification requise)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/profile` | GET | Profil utilisateur connecté |
| `/api/logout` | POST | Déconnexion |
| `/api/rooms` | GET | Liste des salles |
| `/api/rooms/:id` | GET | Détails d'une salle |
| `/api/reservations` | GET | Mes réservations |
| `/api/reservations` | POST | Créer une réservation |
| `/api/reservations/:id` | PUT | Modifier ma réservation |
| `/api/reservations/:id` | DELETE | Annuler ma réservation |
| `/api/notifications` | GET | Mes notifications |

### 🛡️ Endpoints administrateur

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/users` | GET | Tous les utilisateurs |
| `/api/users/:id` | PUT/DELETE | Gestion utilisateurs |
| `/api/rooms` | POST/PUT/DELETE | Gestion des salles |
| `/api/audit/actions` | GET | Log global des actions |
| `/api/audit/user/:id` | GET | Audit d'un utilisateur |
| `/api/audit/entity/:type/:id` | GET | Audit d'une entité |

## 🧪 Tests et validation

### Validation automatique complète

```bash
# Validation complète du système
node scripts/validate-api.js

# Avec Make
make test-all
```

### Tests des endpoints

```bash
# Test rapide des endpoints principaux
make quick-test

# Tests avec Postman/Newman
newman run docs/api-collection.postman.json
```

### Exemples de tests manuels

```bash
# Inscription d'un admin
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "ADMIN"
  }'

# Connexion et récupération du token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!"
  }'

# Utilisation du token pour créer une salle
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salle de réunion A",
    "capacity": 10,
    "description": "Salle avec projecteur",
    "equipment": ["projecteur", "tableau", "wifi"]
  }'
```

## 📚 Documentation

### 📖 Documentation générée automatiquement

La documentation complète est générée automatiquement via `node generate-docs.js` :

- **`routes-summary.md`** : Inventaire complet de tous les endpoints
- **`technical-docs.md`** : Documentation technique détaillée
- **`permissions-matrix.md`** : Matrice des autorisations par rôle
- **`quick-start.md`** : Guide de démarrage rapide
- **`api-collection.postman.json`** : Collection Postman importable
- **`openapi-spec.yaml`** : Spécification OpenAPI 3.0

### 🔧 Génération de la documentation

```bash
# Génération complète
make docs-all

# Génération seule
node generate-docs.js

# Service de la documentation
npm run docs:serve  # http://localhost:8080
```

### 📮 Import Postman

1. Ouvrir Postman
2. File > Import
3. Sélectionner `docs/api-collection.postman.json`
4. Configurer les variables d'environnement (baseUrl, tokens)

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=room_booking
DB_USER=booking_user
DB_PASSWORD=secure_password
DB_DIALECT=postgres

# Authentification JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Serveur
PORT=3000
NODE_ENV=development

# Logs (optionnel)
LOG_LEVEL=info
LOG_FORMAT=combined
```

### Configuration de la base de données

```bash
# Création de la base PostgreSQL
createdb room_booking
createuser booking_user

# Migrations et données de test
npm run db:migrate
npm run db:seed

# Reset complet si nécessaire
make db-reset
```

## 🛠️ Commandes Make disponibles

Le `Makefile` fournit une interface unifiée pour toutes les opérations :

```bash
# Afficher toutes les commandes disponibles
make help

# Installation et setup
make install          # Installer les dépendances
make setup           # Setup complet (env + db)
make quick-start     # Installation + démarrage rapide

# Développement
make dev             # Démarrage en mode développement
make start           # Démarrage en production
make restart         # Redémarrage du serveur

# Documentation
make docs-generate   # Générer la documentation
make docs-serve      # Servir la documentation
make docs-all        # Générer + servir

# Tests et validation
make test            # Tests unitaires
make test-api        # Tests API avec Newman
make test-all        # Tests complets
make validate-structure # Validation de la structure

# Base de données
make db-reset        # Reset complet de la DB
make db-migrate      # Migrations
make db-seed         # Données de test
make db-backup       # Sauvegarde

# Utilitaires
make clean           # Nettoyage du projet
make analyze         # Analyse de la structure
make status          # Status du système
make monitor         # Surveillance des logs
```

## 🔐 Sécurité et permissions

### Système de rôles

- **PUBLIC** : Accès libre (healthcheck, meta, auth)
- **USER** : Utilisateur connecté (profil, réservations personnelles)
- **ADMIN** : Administrateur (gestion complète + audit)

### Authentification JWT

- Token généré à la connexion
- Durée de vie configurable (7 jours par défaut)
- Validation automatique sur les routes protégées
- Logout avec invalidation côté client

### Audit et traçabilité

- Toutes les actions sont loggées automatiquement
- Historique complet par utilisateur et par entité
- Informations collectées : utilisateur, action, IP, timestamp, détails
- Interface d'administration pour consulter les logs

## 🚀 Déploiement

### Vérification avant déploiement

```bash
# Checklist complète
make deploy-check

# Validation du système
node scripts/validate-api.js

# Tests complets
make test-all
```

### Variables de production

```env
NODE_ENV=production
PORT=3000
DB_SSL=true
JWT_SECRET=ultra_secure_production_key_64_characters_minimum
LOG_LEVEL=warn
```

### Docker (optionnel)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Dépannage

### Problèmes courants

**Port 3000 déjà utilisé**
```bash
sudo lsof -ti:3000 | xargs kill -9
# ou changer le port
PORT=3001 npm run dev
```

**Erreur de connexion PostgreSQL**
```bash
sudo service postgresql start
psql -h localhost -U booking_user -d room_booking
```

**Token JWT invalide**
```bash
# Vérifier JWT_SECRET dans .env (minimum 32 caractères)
# Reconnecter pour obtenir un nouveau token
```

### Diagnostic automatique

```bash
# Diagnostic complet
node scripts/validate-api.js

# Status rapide
make status

# Logs en temps réel
make monitor
```

## 📊 Performances et monitoring

### Métriques importantes

- **Temps de réponse** : < 100ms pour les endpoints simples
- **Throughput** : > 1000 req/s en conditions normales
- **Disponibilité** : 99.9% uptime objectif
- **Concurrence** : Support multi-utilisateurs

### Monitoring

```bash
# Status en temps réel
make status

# Analyse des performances
make analyze

# Logs détaillés
tail -f logs/app.log
```

## 🔄 Maintenance

### Sauvegardes

```bash
# Sauvegarde de la base de données
make db-backup

# Sauvegarde complète du projet
tar -czf backup-$(date +%Y%m%d).tar.gz . --exclude=node_modules
```

### Mises à jour

```bash
# Mise à jour des dépendances
npm update

# Audit de sécurité
npm audit

# Régénération de la documentation
make docs-all
```

## 🤝 Contribution

### Structure de développement

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** les modifications (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. **Valider** avec `node scripts/validate-api.js`
5. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
6. **Créer** une Pull Request

### Standards de code

- **ESLint** : `npm run lint`
- **Prettier** : `npm run format`
- **Tests** : Ajouter des tests pour nouvelles fonctionnalités
- **Documentation** : Mettre à jour automatiquement avec `make docs-all`

## 📄 Licence

MIT License - voir le fichier `LICENSE` pour plus de détails.

## 🎉 Remerciements

- **Express.js** pour le framework web
- **Sequelize** pour l'ORM
- **PostgreSQL** pour la base de données
- **JWT** pour l'authentification
- **Postman** pour les tests API

---

## 📈 Roadmap

### Phase 4 (à venir)
- [ ] Interface web React
- [ ] Notifications WebSocket en temps réel
- [ ] Système de calendrier intégré
- [ ] Mobile app (React Native)
- [ ] Intégrations externes (Google Calendar, Outlook)

### Améliorations continues
- [ ] Cache Redis pour les performances
- [ ] Tests de charge automatisés
- [ ] Monitoring avancé avec Prometheus
- [ ] CI/CD avec GitHub Actions
- [ ] Containerisation Docker complète

---

**🚀 Système prêt pour la production | Documentation Phase 3 complète | Généré automatiquement le 28 juillet 2025**