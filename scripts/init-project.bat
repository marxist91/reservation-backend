@echo off
echo 🚀 Initialisation complète de la plateforme de réservation...
echo.

REM Vérifier que Docker fonctionne
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas disponible
    echo 💡 Assurez-vous que Docker Desktop est démarré
    pause
    exit /b 1
)

echo ✅ Docker détecté

REM Créer les dossiers nécessaires
echo 📁 Création de la structure de dossiers...
if not exist "src" mkdir src
if not exist "public" mkdir public
if not exist "views" mkdir views
if not exist "data" mkdir data
if not exist "data\mysql" mkdir data\mysql
if not exist "data\redis" mkdir data\redis
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs

echo ✅ Dossiers créés

REM Générer les secrets
echo 🔒 Génération des secrets...
if not exist "secrets\mysql_password.txt" (
    call scripts\setup-secrets.bat production
) else (
    echo ⚠️  Secrets déjà existants, ignorés
)

REM Créer un fichier app.js basique si inexistant
if not exist "src\app.js" (
    echo 📝 Création de l'application Node.js de base...
    echo const express = require('express'^); > src\app.js
    echo const app = express('^); >> src\app.js
    echo const PORT = process.env.PORT ^|^| 3000; >> src\app.js
    echo. >> src\app.js
    echo app.get('/health', (req, res^) =^> { >> src\app.js
    echo   res.json({ status: 'OK', timestamp: new Date(^).toISOString(^) }^); >> src\app.js
    echo }^); >> src\app.js
    echo. >> src\app.js
    echo app.get('/', (req, res^) =^> { >> src\app.js
    echo   res.json({ message: 'Plateforme de Réservation API', version: '1.0.0' }^); >> src\app.js
    echo }^); >> src\app.js
    echo. >> src\app.js
    echo app.listen(PORT, (^) =^> { >> src\app.js
    echo   console.log(`🚀 Serveur démarré sur le port ${PORT}`^); >> src\app.js
    echo }^); >> src\app.js
    
    echo ✅ Application de base créée
)

REM Créer un package.json basique si inexistant
if not exist "package.json" (
    echo 📦 Création du package.json...
    echo { > package.json
    echo   "name": "reservation-backend", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "description": "Plateforme de réservation avec Node.js, MySQL et Redis", >> package.json
    echo   "main": "src/app.js", >> package.json
    echo   "scripts": { >> package.json
    echo     "start": "node src/app.js", >> package.json
    echo     "dev": "nodemon src/app.js", >> package.json
    echo     "test": "jest" >> package.json
    echo   }, >> package.json
    echo   "dependencies": { >> package.json
    echo     "express": "^4.18.2" >> package.json
    echo   }, >> package.json
    echo   "devDependencies": { >> package.json
    echo     "nodemon": "^3.0.1" >> package.json
    echo   } >> package.json
    echo } >> package.json
    
    echo ✅ package.json créé
)

REM Créer le health check script
if not exist "scripts\docker-healthcheck.sh" (
    echo 📋 Création du script de health check...
    echo #!/bin/sh > scripts\docker-healthcheck.sh
    echo curl -f http://localhost:3000/health ^|^| exit 1 >> scripts\docker-healthcheck.sh
    echo ✅ Health check créé
)

echo.
echo 🎉 Initialisation terminée !
echo.
echo 📋 Récapitulatif :
echo    ✅ Structure de dossiers créée
echo    ✅ Secrets générés
echo    ✅ Application Node.js de base
echo    ✅ Configuration Docker prête
echo.
echo 🚀 Prochaines étapes :
echo    1. Développement : docker compose up -d
echo    2. Logs : docker compose logs -f
echo    3. Interface DB : http://localhost:8080 (adminer)
echo    4. Application : http://localhost:3000
echo.
echo 🛠️  Pour personnaliser :
echo    - Modifier src/app.js pour votre logique
echo    - Ajouter vos routes dans src/routes/
echo    - Configurer votre base de données
echo.

pause