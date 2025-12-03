@echo off
echo 🚀 Démarrage rapide de la plateforme de réservation...

REM Arrêter les services existants
echo 🛑 Arrêt des services existants...
docker compose down >nul 2>&1

REM Créer les dossiers nécessaires rapidement
echo 📁 Préparation des dossiers...
if not exist "src" mkdir src
if not exist "data" mkdir data
if not exist "data\mysql" mkdir data\mysql
if not exist "data\redis" mkdir data\redis

REM Créer un app.js minimal si nécessaire
if not exist "src\app.js" (
    echo 📝 Création de l'app de base...
    (
        echo const express = require('express'^);
        echo const app = express(^);
        echo const PORT = process.env.PORT ^|^| 3000;
        echo.
        echo app.get('/health', (req, res^) =^> {
        echo   res.json({ status: 'OK', service: 'reservation-api' }^);
        echo }^);
        echo.
        echo app.get('/', (req, res^) =^> {
        echo   res.json({ message: 'Plateforme de Réservation', status: 'running' }^);
        echo }^);
        echo.
        echo app.listen(PORT, '0.0.0.0', (^) =^> {
        echo   console.log(`🚀 API Réservation démarrée sur le port ${PORT}`^);
        echo }^);
    ) > src\app.js
)

REM Créer package.json minimal
if not exist "package.json" (
    echo 📦 Création du package.json...
    (
        echo {
        echo   "name": "reservation-backend",
        echo   "version": "1.0.0",
        echo   "main": "src/app.js",
        echo   "scripts": {
        echo     "start": "node src/app.js",
        echo     "dev": "node src/app.js"
        echo   },
        echo   "dependencies": {
        echo     "express": "^4.18.2"
        echo   }
        echo }
    ) > package.json
)

echo 🔒 Vérification des secrets...
if not exist "secrets\mysql_password.txt" (
    echo 🔑 Génération des secrets...
    call scripts\setup-secrets.bat production
)

echo 🐳 Démarrage des services Docker...
docker compose up -d --remove-orphans

echo ⏳ Attente du démarrage des services (30 secondes)...
timeout /t 30 >nul

echo 📊 État des services :
docker compose ps

echo.
echo 🎉 Plateforme démarrée !
echo.
echo 🌐 Services disponibles :
echo    📱 API Réservation : http://localhost:3000
echo    ❤️  Health Check   : http://localhost:3000/health
echo    🗄️  MySQL (Adminer): http://localhost:8080
echo    📊 Redis Commander: http://localhost:8081
echo.
echo 🔍 Commandes utiles :
echo    docker compose logs -f     (voir les logs)
echo    docker compose ps          (état des services)
echo    docker compose down        (arrêter tout)
echo.

REM Test rapide de l'API
echo 🧪 Test de l'API...
timeout /t 5 >nul
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  L'API n'est pas encore prête, attendez quelques secondes...
) else (
    echo ✅ API opérationnelle !
)

pause