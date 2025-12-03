Write-Host "`n=== RECHARGEMENT DES SEEDERS ===" -ForegroundColor Cyan

# Charger utilisateurs
Write-Host "`n[1/3] Chargement utilisateurs..." -ForegroundColor Yellow
npx sequelize-cli db:seed --seed 20251202000001-demo-users.js

# Charger salles
Write-Host "`n[2/3] Chargement des 4 salles du port..." -ForegroundColor Yellow
npx sequelize-cli db:seed --seed 20251202110000-real-port-rooms.js

# Charger réservations
Write-Host "`n[3/3] Chargement réservations..." -ForegroundColor Yellow
npx sequelize-cli db:seed --seed 20251202110001-real-reservations.js

Write-Host "`n=== TERMINE ===" -ForegroundColor Green
Write-Host "Demarrez le serveur : npm start" -ForegroundColor Cyan
