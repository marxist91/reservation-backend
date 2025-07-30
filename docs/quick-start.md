# 🚀 GUIDE DE DÉMARRAGE RAPIDE
*Généré automatiquement le 2025-07-28T02:35:49.033Z*

## ⚡ Installation en 5 minutes

### 1. Prérequis
```bash
# Vérifier Node.js (version 16+)
node --version

# Vérifier PostgreSQL
psql --version

# Cloner le projet
git clone <repository-url>
cd room-booking-api
```

### 2. Configuration de la base de données
```sql
-- Créer la base de données
CREATE DATABASE room_booking;
CREATE USER booking_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE room_booking TO booking_user;
```

### 3. Variables d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables
nano .env
```

```env
# Configuration minimale
DB_HOST=localhost
DB_PORT=5432
DB_NAME=room_booking
DB_USER=booking_user
DB_PASSWORD=secure_password
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
```

### 4. Installation et démarrage
```bash
# Installation des dépendances
npm install

# Migrations de la base de données
npm run db:migrate

# (Optionnel) Données de test
npm run db:seed

# Démarrage du serveur
npm run dev
```

✅ **Serveur prêt sur http://localhost:3000**

---

## 🧪 TESTS IMMÉDIATS

### Vérification du serveur
```bash
# Health check
curl http://localhost:3000/api/healthcheck

# Réponse attendue:
# {"status":"✅ API opérationnelle","timestamp":"2025-07-27T...","service":"Système de Réservation de Salles"}
```

### Métadonnées du système
```bash
# Informations complètes
curl http://localhost:3000/api/meta | jq

# Version de l'API
curl http://localhost:3000/api/version | jq
```

### Création d'un compte administrateur
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "ADMIN"
  }'
```

### Connexion et récupération du token
```bash
# Connexion
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!"
  }' | jq

# Sauvegarder le token retourné
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test des fonctionnalités principales
```bash
# Créer une salle
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salle de réunion principale",
    "capacity": 12,
    "description": "Grande salle avec projecteur",
    "equipment": ["projecteur", "tableau", "wifi", "visioconférence"]
  }'

# Lister les salles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/rooms | jq

# Créer une réservation
curl -X POST http://localhost:3000/api/reservations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "ROOM_ID_FROM_PREVIOUS_RESPONSE",
    "startTime": "2025-08-01T09:00:00.000Z",
    "endTime": "2025-08-01T11:00:00.000Z",
    "purpose": "Réunion équipe développement"
  }'
```

---

## 📊 ENDPOINTS ESSENTIELS

### 🌐 Accès public (sans authentification)
```bash
GET  /api/meta          # Métadonnées système
GET  /api/version       # Version API
GET  /api/info          # Informations de base
GET  /api/healthcheck   # Status serveur
POST /api/register      # Inscription
POST /api/login         # Connexion
```

### 🔒 Accès utilisateur (avec token)
```bash
GET  /api/profile           # Profil personnel
GET  /api/rooms             # Liste des salles
GET  /api/reservations      # Mes réservations
POST /api/reservations      # Créer réservation
PUT  /api/reservations/:id  # Modifier réservation
GET  /api/notifications     # Mes notifications
```

### 🛡️ Accès administrateur uniquement
```bash
GET  /api/users             # Tous les utilisateurs
POST /api/rooms             # Créer une salle
GET  /api/audit/actions     # Log des actions
GET  /api/audit/user/:id    # Audit utilisateur
```

---

## 🔧 CONFIGURATION AVANCÉE

### Logs détaillés
```bash
# Démarrage avec logs debug
DEBUG=* npm run dev

# Logs en production
NODE_ENV=production npm start
```

### Base de données
```bash
# Reset complet de la DB
npm run db:reset

# Nouvelle migration
npm run db:migrate:undo
npm run db:migrate

# Backup de la DB
pg_dump room_booking > backup.sql
```

### Variables d'environnement complètes
```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=room_booking
DB_USER=booking_user
DB_PASSWORD=secure_password
DB_DIALECT=postgres
DB_LOGGING=false

# Authentification JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d

# Serveur
PORT=3000
NODE_ENV=development

# Logs
LOG_LEVEL=info
LOG_FORMAT=combined

# Emails (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Uploads (optionnel)
UPLOAD_MAX_SIZE=5mb
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,pdf
```

---

## 🚨 DÉPANNAGE RAPIDE

### Erreurs communes

**Port 3000 déjà utilisé**
```bash
# Tuer le processus
sudo lsof -ti:3000 | xargs kill -9

# Ou changer le port
PORT=3001 npm run dev
```

**Erreur de connexion PostgreSQL**
```bash
# Vérifier que PostgreSQL fonctionne
sudo service postgresql status
sudo service postgresql start

# Tester la connexion
psql -h localhost -U booking_user -d room_booking
```

**Token JWT invalide**
```bash
# Vérifier que JWT_SECRET est défini et > 32 caractères
echo $JWT_SECRET | wc -c

# Reconnecter pour obtenir un nouveau token
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"Admin123!"}'
```

### Vérification complète du système
```bash
#!/bin/bash
echo "🔍 Diagnostic complet du système..."

# 1. Serveur
echo "1. Test du serveur:"
curl -s http://localhost:3000/api/healthcheck | jq '.status'

# 2. Base de données
echo "2. Test de la base de données:"
curl -s http://localhost:3000/api/meta | jq '.database.status'

# 3. Authentification
echo "3. Test d'authentification:"
curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin123!"}' | jq '.token'

echo "✅ Diagnostic terminé"
```

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Documentation complète
- **routes-summary.md**: Inventaire complet des endpoints
- **technical-docs.md**: Documentation technique détaillée
- **permissions-matrix.md**: Matrice des autorisations
- **openapi-spec.yaml**: Spécification OpenAPI
- **api-collection.postman.json**: Collection Postman

### Outils recommandés
- **Postman**: Import de la collection générée
- **Insomnia**: Alternative à Postman
- **pgAdmin**: Interface graphique PostgreSQL
- **VS Code**: Extensions REST Client

### Support
- **Issues GitHub**: Signaler les bugs
- **Documentation**: Consultez les fichiers .md
- **Logs**: Vérifiez les logs serveur en cas d'erreur

---

*Guide de démarrage généré automatiquement - 2025-07-28T02:35:49.033Z*
