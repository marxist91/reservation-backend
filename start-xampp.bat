@echo off
REM ========================================
REM Script de démarrage rapide XAMPP
REM ========================================

echo.
echo ========================================
echo Demarrage Serveur Reservation
echo ========================================
echo.

REM Vérifier MySQL
netstat -an | find "3306" >nul
if %errorlevel%==0 (
    echo [OK] MySQL actif
) else (
    echo [ERREUR] MySQL n'est pas demarre !
    echo Demarrez MySQL dans XAMPP Control Panel
    pause
    exit /b 1
)

REM Vérifier les dépendances
if not exist "node_modules" (
    echo [INFO] Installation des dependances...
    call npm install
)

REM Démarrer le serveur
echo.
echo [INFO] Demarrage du serveur...
echo.
echo ========================================
echo.

call npm run dev
