# 🚀 DÉMARRAGE RAPIDE - 5 MINUTES

## Étape 1 : Prérequis
- ✅ XAMPP installé
- ✅ Node.js installé
- ✅ MySQL XAMPP démarré

## Étape 2 : Installation Express (30 secondes)

### A. Ouvrir PowerShell dans le dossier du projet
```powershell
cd c:\xampp\htdocs\reservation-backend
```

### B. Exécuter le script de configuration
```powershell
.\setup-xampp.bat
```

Ce script va :
- ✅ Vérifier MySQL
- ✅ Installer les dépendances npm
- ✅ Créer la base de données
- ✅ Créer l'utilisateur `marcel_admin`
- ✅ Exécuter les migrations

---

## Étape 3 : Démarrer le serveur (10 secondes)

```powershell
.\start-xampp.bat
```

OU en mode développement avec auto-reload :
```powershell
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

---

## Étape 4 : Tester l'API (1 minute)

### Test 1 : Healthcheck
```powershell
curl http://localhost:3000/api/healthcheck
```

**Résultat attendu :**
```json
{
  "status": "✅ API opérationnelle",
  "timestamp": "2025-12-02T...",
  "service": "Système de Réservation de Salles",
  "database": "Connected"
}
```

### Test 2 : Inscription d'un utilisateur
```powershell
curl -X POST http://localhost:3000/api/register `
  -H "Content-Type: application/json" `
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "user"
  }'
```

### Test 3 : Connexion
```powershell
curl -X POST http://localhost:3000/api/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 4 : Récupérer le profil (avec le token)
```powershell
$token = "VOTRE_TOKEN_ICI"
curl http://localhost:3000/api/profile `
  -H "Authorization: Bearer $token"
```

---

## 🔧 Commandes Utiles

```powershell
# Démarrer en développement (auto-reload)
npm run dev

# Démarrer en production
npm start

# Lancer les tests
npm test

# Vérifier le code
npm run lint

# Corriger le code automatiquement
npm run lint:fix

# Voir la couverture des tests
npm run test:coverage
```

---

## 📊 Accès phpMyAdmin

Ouvrez : **http://localhost/phpmyadmin**

**Connexion :**
- Utilisateur : `marcel_admin`
- Mot de passe : `Reservation2025!`
- Base de données : `reservation_salles`

**Tables créées :**
- `users`
- `rooms`
- `reservations`
- `audit_logs`
- `action_logs`

---

## 🐛 Problèmes Fréquents

### MySQL n'est pas démarré
```
[ERREUR] MySQL n'est pas demarre
```
**Solution :** Ouvrir XAMPP Control Panel → Démarrer MySQL

### Port 3000 déjà utilisé
```
Error: listen EADDRINUSE :::3000
```
**Solution :** Modifier le port dans `.env`
```env
PORT=3001
```

### Erreur de connexion BDD
```
ER_ACCESS_DENIED_ERROR
```
**Solution :** Vérifier les credentials dans `.env` et recréer l'utilisateur :
```sql
CREATE USER 'marcel_admin'@'localhost' IDENTIFIED BY 'Reservation2025!';
GRANT ALL PRIVILEGES ON reservation_salles.* TO 'marcel_admin'@'localhost';
FLUSH PRIVILEGES;
```

### Module non trouvé
```
Cannot find module 'express'
```
**Solution :**
```powershell
npm install
```

---

## 📚 Documentation Complète

- **Guide détaillé** : `GUIDE_DEMARRAGE_XAMPP.md`
- **Plan de finalisation** : `PLAN_CORRECTIONS_FINALISATION.md`
- **Endpoints API** : Voir console au démarrage du serveur

---

## ✅ Checklist de Démarrage

- [ ] XAMPP MySQL démarré
- [ ] Script `setup-xampp.bat` exécuté avec succès
- [ ] Serveur Node.js démarre sans erreur
- [ ] Healthcheck retourne status OK
- [ ] Inscription utilisateur fonctionne
- [ ] Login retourne un token JWT
- [ ] phpMyAdmin accessible
- [ ] Tables visibles dans la BDD

---

## 🎯 Prochaines Étapes

1. ✅ Créer des données de test (seeders)
2. ✅ Tester tous les endpoints CRUD
3. ✅ Implémenter validation des réservations
4. ✅ Développer le frontend
5. ✅ Déployer en production

**Bon développement ! 🚀**
