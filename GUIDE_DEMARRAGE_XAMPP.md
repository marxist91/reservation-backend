# ========================================
# 🚀 GUIDE DE DÉMARRAGE - XAMPP
# ========================================

## PRÉREQUIS

1. **XAMPP installé** avec MySQL et Apache
2. **Node.js** installé (v14+)
3. **Git** (optionnel)

---

## ÉTAPE 1 : DÉMARRER XAMPP

1. Ouvrez **XAMPP Control Panel**
2. Démarrez **Apache** (pour phpMyAdmin)
3. Démarrez **MySQL**

---

## ÉTAPE 2 : CRÉER LA BASE DE DONNÉES

### Option A : Via phpMyAdmin (Recommandé)

1. Ouvrez `http://localhost/phpmyadmin`
2. Créez un utilisateur :
   <!-- - **Nom** : `marcel_admin` -->
   - **Hôte** : `localhost`
   <!-- - **Mot de passe** : `Reservation2025!` -->
   - **Privilèges** : Cocher "Accorder tous les privilèges"

3. Créez la base de données :
   - **Nom** : `reservation_salles`
   - **Interclassement** : `utf8mb4_unicode_ci`

### Option B : Via ligne de commande

```bash
# Ouvrir MySQL dans XAMPP shell
cd C:\xampp\mysql\bin
mysql.exe -u root

# Créer la base
CREATE DATABASE reservation_salles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

---

## ÉTAPE 3 : INSTALLER LES DÉPENDANCES

```bash
cd c:\xampp\htdocs\reservation-backend
npm install
```

---

## ÉTAPE 4 : CONFIGURER L'ENVIRONNEMENT

Le fichier `.env` est déjà configuré pour XAMPP :

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reservation_salles
DB_USERNAME=root
DB_PASSWORD=
```

---

## ÉTAPE 5 : INITIALISER LA BASE DE DONNÉES

```bash
# Exécuter les migrations Sequelize
npx sequelize-cli db:migrate

# OU exécuter le script SQL manuellement
# Via phpMyAdmin : Importer init-scripts/01-init-reservation-salles.sql
```

---

## ÉTAPE 6 : DÉMARRER LE SERVEUR

```bash
# Mode développement (avec rechargement auto)
npm run dev

# OU mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## ÉTAPE 7 : TESTER L'API

### Test de santé
```bash
curl http://localhost:3000/api/healthcheck
```

### Inscription d'un utilisateur
```bash
curl -X POST http://localhost:3000/api/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Doe\",\"prenom\":\"John\",\"email\":\"john@example.com\",\"password\":\"Password123!\"}"
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"Password123!\"}"
```

---

## 🔧 SCRIPTS DISPONIBLES

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer avec nodemon (auto-reload)
npm test           # Exécuter les tests
npm run lint       # Vérifier le code
npm run lint:fix   # Corriger automatiquement
```

---

## 🐛 DÉPANNAGE

### Erreur de connexion MySQL

**Symptôme** : `ER_ACCESS_DENIED_ERROR`

**Solutions** :
1. Vérifiez que MySQL XAMPP est démarré
2. Vérifiez les credentials dans `.env`
3. Testez la connexion MySQL :
   ```bash
   cd C:\xampp\mysql\bin
   # mysql.exe -u root
   ```

### Port 3000 déjà utilisé

**Solution** : Modifier le PORT dans `.env`
```env
PORT=3001
```

### Erreur "Cannot find module"

**Solution** :
```bash
npm install
```

---

## 📦 STRUCTURE DU PROJET

```
reservation-backend/
├── server.js              # Point d'entrée
├── .env                   # Configuration XAMPP
├── config/
│   ├── config.json        # Config Sequelize
│   └── database.js        # Connexion DB
├── models/                # Modèles Sequelize
│   ├── user.js
│   ├── room.js
│   └── reservation.js
├── routes/                # Routes API
├── controllers/           # Logique métier
├── middlewares/           # Auth, validation
└── migrations/            # Migrations DB
```

---

## 📚 PROCHAINES ÉTAPES

1. ✅ Tester tous les endpoints
2. ✅ Créer des données de test (seeders)
3. ✅ Configurer RBAC (permissions)
4. ✅ Développer le frontend
5. ✅ Déployer en production

---

## 🆘 SUPPORT

En cas de problème :
1. Vérifiez les logs du serveur Node.js
2. Vérifiez les logs MySQL XAMPP (`C:\xampp\mysql\data\*.err`)
3. Consultez la documentation
