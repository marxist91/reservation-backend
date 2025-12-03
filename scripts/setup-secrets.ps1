# Script PowerShell pour configurer les secrets de la plateforme de réservation
# Usage: .\scripts\setup-secrets.ps1 [environment]

param(
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🔒 Configuration des secrets pour l'environnement: $Environment" -ForegroundColor Cyan

$SecretsDir = "secrets"

# Création du dossier secrets
if (-not (Test-Path $SecretsDir)) {
    New-Item -ItemType Directory -Path $SecretsDir -Force | Out-Null
    Write-Host "✓ Dossier secrets créé" -ForegroundColor Green
}

# Fonction pour générer un mot de passe sécurisé
function New-SecurePassword {
    param([int]$Length = 25)
    
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $password = ""
    $random = New-Object System.Random
    
    for ($i = 0; $i -lt $Length; $i++) {
        $password += $chars[$random.Next(0, $chars.Length)]
    }
    
    return $password
}

# Fonction pour créer un fichier secret
function New-Secret {
    param(
        [string]$SecretName,
        [string]$SecretValue
    )
    
    $secretFile = Join-Path $SecretsDir "$SecretName.txt"
    
    if (-not (Test-Path $secretFile)) {
        $SecretValue | Out-File -FilePath $secretFile -Encoding UTF8 -NoNewline
        Write-Host "✓ Secret $SecretName créé" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Secret $SecretName existe déjà, ignoré" -ForegroundColor Yellow
    }
}

Write-Host "📝 Génération des secrets..." -ForegroundColor Blue

# Génération des secrets
$mysqlRootPassword = New-SecurePassword -Length 32
$mysqlPassword = New-SecurePassword -Length 32
$jwtSecret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-SecurePassword -Length 64)))
$redisPassword = New-SecurePassword -Length 32

# Création des fichiers secrets
New-Secret -SecretName "mysql_root_password" -SecretValue $mysqlRootPassword
New-Secret -SecretName "mysql_password" -SecretValue $mysqlPassword
New-Secret -SecretName "jwt_secret" -SecretValue $jwtSecret
New-Secret -SecretName "redis_password" -SecretValue $redisPassword

# Mise à jour de la configuration Redis
$redisConfigPath = "config\redis.conf"
if (Test-Path $redisConfigPath) {
    $content = Get-Content $redisConfigPath -Raw
    $content = $content -replace "requirepass changeme", "requirepass $redisPassword"
    $content | Set-Content $redisConfigPath -NoNewline
    Write-Host "✓ Configuration Redis mise à jour" -ForegroundColor Green
}

# Mise à jour du .gitignore
$gitignorePath = ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -ErrorAction SilentlyContinue
    if ($gitignoreContent -notcontains "secrets/") {
        Add-Content $gitignorePath "`nsecrets/"
        Write-Host "✓ secrets/ ajouté au .gitignore" -ForegroundColor Green
    }
} else {
    "secrets/" | Out-File $gitignorePath -Encoding UTF8
    Write-Host "✓ .gitignore créé avec secrets/" -ForegroundColor Green
}

# Affichage des informations
Write-Host ""
Write-Host "🎉 Configuration des secrets terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Récapitulatif:" -ForegroundColor Cyan
Write-Host "   - MySQL root password: ****"
Write-Host "   - MySQL user password: ****"
Write-Host "   - JWT secret: ****"
Write-Host "   - Redis password: ****"
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "   - Ne jamais commiter le dossier secrets/"
Write-Host "   - Faire une sauvegarde sécurisée des secrets"
Write-Host "   - Vérifier que secrets/ est dans .gitignore"
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Vérifier le fichier .env.production"
Write-Host "   2. Lancer: docker-compose -f docker-compose.prod.yml up -d"
Write-Host "   3. Vérifier les logs: docker-compose logs -f"

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
Read-Host