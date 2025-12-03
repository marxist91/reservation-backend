# 🔧 GUIDE DE RÉINITIALISATION - SUPPRESSION DES PRIX

## ⚠️ PROBLÈME ACTUEL
Les migrations échouent car certaines colonnes existent déjà. Les terminaux VS Code sont bloqués.

## ✅ SOLUTION MANUELLE (à exécuter dans un NOUVEAU terminal PowerShell)

### Étape 1 : Ouvrir un nouveau terminal
Dans VS Code : **Terminal → New Terminal** (ou Ctrl+Shift+`)

### Étape 2 : Naviguer vers le dossier
```powershell
cd C:\xampp\htdocs\reservation-backend
```

### Étape 3 : Supprimer les migrations dupliquées
```powershell
Remove-Item .\migrations\202507200147-add-createdAt-updatedAt-to-rooms.js -ErrorAction SilentlyContinue
Remove-Item .\migrations\202507202350-fill-responsable-id-in-rooms.js -ErrorAction SilentlyContinue
Remove-Item .\migrations\202507210848-add-role-enum-to-users.js -ErrorAction SilentlyContinue
Remove-Item .\migrations\202507210851-add-statut-enum-to-reservations.js -ErrorAction SilentlyContinue
```

### Étape 4 : Réinitialiser la base de données
```powershell
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

### Étape 5 : Charger les données
```powershell
npx sequelize-cli db:seed --seed 20251202000001-demo-users.js
npx sequelize-cli db:seed --seed 20251202110000-real-port-rooms.js
npx sequelize-cli db:seed --seed 20251202110001-real-reservations.js
```

### Étape 6 : Démarrer le serveur
```powershell
npm start
```

### Étape 7 : Tester l'API
```powershell
# Login
$body = @{ email = "admin@port-autonome.com"; password = "Admin123!" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/login" -Method POST -Body $body -ContentType "application/json"
$global:token = $response.data.token
Write-Host "✅ Connecté en tant que $($response.data.user.prenom) $($response.data.user.nom)"

# Lister les salles (SANS PRIX)
$headers = @{ Authorization = "Bearer $global:token" }
$rooms = Invoke-RestMethod -Uri "http://localhost:3000/api/rooms" -Method GET -Headers $headers
$rooms | Select-Object id, nom, capacite, statut | Format-Table
```

---

## 📋 RÉSULTAT ATTENDU

### Base de données sans prix
- ❌ Colonne `prix_heure` supprimée de `rooms`
- ❌ Colonne `prix_total` supprimée de `reservations`

### 4 salles du Port Autonome
1. **Salle Administration Générale** - 30 personnes
2. **Salle Port de Pêche** - 20 personnes
3. **Salle de Réunion 2ème Étage** - 25 personnes
4. **Salle TD** - 15 personnes

### 8 utilisateurs
- 1 admin, 2 responsables, 5 utilisateurs standard

### 8 réservations d'exemple
- Statuts variés (validée, en_attente, confirmée, annulée, terminée, rejetée)
- **AUCUN PRIX** nulle part

---

## 🚨 SI LES MIGRATIONS ÉCHOUENT ENCORE

### Option A : Supprimer manuellement via phpMyAdmin
1. Ouvrir phpMyAdmin : http://localhost/phpmyadmin
2. Sélectionner la base `reservation_salles`
3. Onglet "SQL"
4. Exécuter :
```sql
DROP DATABASE reservation_salles;
CREATE DATABASE reservation_salles;
```

Puis relancer les étapes 4-5-6.

### Option B : Script batch automatique
Double-cliquer sur `reset-db.bat` dans l'explorateur Windows.

---

## ✅ VÉRIFICATION FINALE

Une fois le serveur démarré, les salles devraient s'afficher **SANS** champ `prix_heure` :

```json
{
  "id": 18,
  "nom": "Salle Administration Générale",
  "description": "Salle de réunion principale...",
  "capacite": 30,
  "equipements": ["Vidéoprojecteur", "Écran", "Tableau blanc"],
  "batiment": "Bâtiment Administratif",
  "etage": "Rez-de-chaussée",
  "superficie": 80.00,
  "responsable_id": 19,
  "statut": "disponible"
  // ❌ PAS DE prix_heure !
}
```

---

## 📞 EN CAS DE PROBLÈME

Si les étapes ci-dessus ne fonctionnent pas, partagez le message d'erreur complet.
