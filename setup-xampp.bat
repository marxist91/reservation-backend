@echo off
REM ========================================
REM Script de configuration initiale XAMPP
REM ========================================

echo.
echo ========================================
echo Configuration Backend Reservation XAMPP
echo ========================================
echo.

REM Vérifier si XAMPP MySQL est démarré
echo [1/5] Verification MySQL...
netstat -an | find "3306" >nul
if %errorlevel%==0 (
    echo    [OK] MySQL est en cours d'execution
) else (
    echo    [ERREUR] MySQL n'est pas demarre
    echo    Veuillez demarrer MySQL dans XAMPP Control Panel
    pause
    exit /b 1
)

REM Vérifier Node.js
echo.
echo [2/5] Verification Node.js...
node --version >nul 2>&1
if %errorlevel%==0 (
    node --version
    echo    [OK] Node.js est installe
) else (
    echo    [ERREUR] Node.js n'est pas installe
    echo    Telechargez-le sur https://nodejs.org
    pause
    exit /b 1
)

REM Installer les dépendances
echo.
echo [3/5] Installation des dependances...
if not exist "node_modules" (
    echo    Installation en cours...
    call npm install
    if %errorlevel%==0 (
        echo    [OK] Dependances installees
    ) else (
        echo    [ERREUR] Echec installation
        pause
        exit /b 1
    )
) else (
    echo    [OK] Dependances deja installees
)

REM Créer la base de données
echo.
echo [4/5] Creation de la base de donnees...
echo    Execution du script SQL...

cd /d C:\xampp\mysql\bin
mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS reservation_salles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
REM User creation for 'marcel_admin' removed per cleanup

if %errorlevel%==0 (
    echo    [OK] Base de donnees creee
) else (
    echo    [ATTENTION] Verifiez manuellement dans phpMyAdmin
)

cd /d %~dp0

REM Exécuter les migrations
echo.
echo [5/5] Execution des migrations...
if exist "migrations" (
    call npx sequelize-cli db:migrate
    if %errorlevel%==0 (
        echo    [OK] Migrations executees
    ) else (
        echo    [ATTENTION] Erreur migrations - Continuez quand meme
    )
) else (
    echo    [INFO] Pas de migrations a executer
)

echo.
echo ========================================
echo CONFIGURATION TERMINEE !
echo ========================================
echo.
echo Prochaines etapes :
echo   1. Verifiez phpMyAdmin : http://localhost/phpmyadmin
echo   2. Demarrez le serveur : npm run dev
echo   3. Testez l'API : http://localhost:3000/api/healthcheck
echo.
pause
