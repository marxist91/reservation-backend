@echo off
setlocal EnableDelayedExpansion

REM Script pour configurer les secrets de la plateforme de réservation (Windows)
REM Usage: scripts\setup-secrets.bat [environment]

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set SECRETS_DIR=secrets
set SCRIPTS_DIR=scripts

echo 🔒 Configuration des secrets pour l'environnement: %ENVIRONMENT%

REM Création du dossier secrets
if not exist "%SECRETS_DIR%" (
    mkdir "%SECRETS_DIR%"
    echo ✓ Dossier secrets créé
)

REM Fonction pour générer un mot de passe (utilise PowerShell)
echo 📝 Génération des secrets...

REM Génération des mots de passe avec PowerShell
for /f %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(25, 5)"') do set MYSQL_ROOT_PASSWORD=%%i
for /f %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(25, 5)"') do set MYSQL_PASSWORD=%%i
for /f %%i in ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Web.Security.Membership]::GeneratePassword(32, 8)))"') do set JWT_SECRET=%%i
for /f %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(25, 5)"') do set REDIS_PASSWORD=%%i

REM Création des fichiers secrets
if not exist "%SECRETS_DIR%\mysql_root_password.txt" (
    echo !MYSQL_ROOT_PASSWORD! > "%SECRETS_DIR%\mysql_root_password.txt"
    echo ✓ Secret mysql_root_password créé
) else (
    echo ⚠️  Secret mysql_root_password existe déjà, ignoré
)

if not exist "%SECRETS_DIR%\mysql_password.txt" (
    echo !MYSQL_PASSWORD! > "%SECRETS_DIR%\mysql_password.txt"
    echo ✓ Secret mysql_password créé
) else (
    echo ⚠️  Secret mysql_password existe déjà, ignoré
)

if not exist "%SECRETS_DIR%\jwt_secret.txt" (
    echo !JWT_SECRET! > "%SECRETS_DIR%\jwt_secret.txt"
    echo ✓ Secret jwt_secret créé
) else (
    echo ⚠️  Secret jwt_secret existe déjà, ignoré
)

if not exist "%SECRETS_DIR%\redis_password.txt" (
    echo !REDIS_PASSWORD! > "%SECRETS_DIR%\redis_password.txt"
    echo ✓ Secret redis_password créé
) else (
    echo ⚠️  Secret redis_password existe déjà, ignoré
)

REM Mise à jour de la configuration Redis
if exist "config\redis.conf" (
    powershell -Command "(Get-Content 'config\redis.conf') -replace 'requirepass changeme', 'requirepass !REDIS_PASSWORD!' | Set-Content 'config\redis.conf'"
    echo ✓ Configuration Redis mise à jour
)

REM Mise à jour du .gitignore
findstr /C:"secrets/" .gitignore >nul 2>&1
if errorlevel 1 (
    echo secrets/ >> .gitignore
    echo ✓ secrets/ ajouté au .gitignore
)

echo.
echo 🎉 Configuration des secrets terminée!
echo.
echo 📋 Récapitulatif:
echo    - MySQL root password: ****
echo    - MySQL user password: ****
echo    - JWT secret: ****
echo    - Redis password: ****
echo.
echo ⚠️  IMPORTANT:
echo    - Ne jamais commiter le dossier secrets/
echo    - Faire une sauvegarde sécurisée des secrets
echo.
echo 🚀 Prochaines étapes:
echo    1. Vérifier le fichier .env.production
echo    2. Lancer: docker-compose -f docker-compose.prod.yml up -d
echo    3. Vérifier les logs: docker-compose logs -f

pause