# Script d'assistant de configuration email pour Windows
# Usage: .\email-setup-wizard.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📧 Assistant de Configuration Email" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Fichier .env non trouvé!" -ForegroundColor Red
    Write-Host "   Copiez .env.example vers .env d'abord:" -ForegroundColor Yellow
    Write-Host "   Copy-Item .env.example .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "Choisissez votre fournisseur email:" -ForegroundColor White
Write-Host "1) Gmail" -ForegroundColor White
Write-Host "2) Office 365 / Outlook" -ForegroundColor White
Write-Host "3) Yahoo Mail" -ForegroundColor White
Write-Host "4) Serveur SMTP personnalisé" -ForegroundColor White
Write-Host "5) Test local (MailHog)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (1-5)"

switch ($choice) {
    "1" {
        $EMAIL_HOST = "smtp.gmail.com"
        $EMAIL_PORT = "587"
        $EMAIL_SECURE = "false"
        Write-Host ""
        Write-Host "Configuration Gmail sélectionnée" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Utilisez un mot de passe d'application!" -ForegroundColor Yellow
        Write-Host "   1. Activez la validation en 2 étapes: https://myaccount.google.com/security" -ForegroundColor White
        Write-Host "   2. Générez un mot de passe d'application: https://myaccount.google.com/apppasswords" -ForegroundColor White
        Write-Host ""
        $EMAIL_USER = Read-Host "Votre adresse Gmail"
        $securePassword = Read-Host "Mot de passe d'application (16 caractères)" -AsSecureString
        $EMAIL_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    "2" {
        $EMAIL_HOST = "smtp.office365.com"
        $EMAIL_PORT = "587"
        $EMAIL_SECURE = "false"
        Write-Host ""
        Write-Host "Configuration Office 365 sélectionnée" -ForegroundColor Green
        Write-Host ""
        $EMAIL_USER = Read-Host "Votre adresse email"
        $securePassword = Read-Host "Mot de passe" -AsSecureString
        $EMAIL_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    "3" {
        $EMAIL_HOST = "smtp.mail.yahoo.com"
        $EMAIL_PORT = "587"
        $EMAIL_SECURE = "false"
        Write-Host ""
        Write-Host "Configuration Yahoo Mail sélectionnée" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  Utilisez un mot de passe d'application depuis les paramètres de sécurité" -ForegroundColor Yellow
        $EMAIL_USER = Read-Host "Votre adresse Yahoo"
        $securePassword = Read-Host "Mot de passe d'application" -AsSecureString
        $EMAIL_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    "4" {
        Write-Host ""
        Write-Host "Configuration SMTP personnalisée" -ForegroundColor Green
        Write-Host ""
        $EMAIL_HOST = Read-Host "Hôte SMTP (ex: smtp.example.com)"
        $EMAIL_PORT = Read-Host "Port (587 ou 465)"
        $EMAIL_SECURE = Read-Host "SSL activé? (true/false)"
        $EMAIL_USER = Read-Host "Utilisateur"
        $securePassword = Read-Host "Mot de passe" -AsSecureString
        $EMAIL_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    "5" {
        $EMAIL_HOST = "localhost"
        $EMAIL_PORT = "1025"
        $EMAIL_SECURE = "false"
        $EMAIL_USER = ""
        $EMAIL_PASSWORD = ""
        Write-Host ""
        Write-Host "Configuration MailHog (test local)" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  Assurez-vous que MailHog est installé et démarré:" -ForegroundColor Yellow
        Write-Host "   Télécharger: https://github.com/mailhog/MailHog/releases" -ForegroundColor White
        Write-Host "   Interface web: http://localhost:8025" -ForegroundColor White
        Write-Host ""
    }
    default {
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

$EMAIL_FROM_NAME = Read-Host "Nom d'expéditeur (ex: Port Autonome de Lomé)"
$EMAIL_FROM = "noreply@reservation-pal.com"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📝 Configuration générée" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "EMAIL_HOST=$EMAIL_HOST" -ForegroundColor White
Write-Host "EMAIL_PORT=$EMAIL_PORT" -ForegroundColor White
Write-Host "EMAIL_SECURE=$EMAIL_SECURE" -ForegroundColor White
Write-Host "EMAIL_USER=$EMAIL_USER" -ForegroundColor White
Write-Host "EMAIL_PASSWORD=****** (masqué)" -ForegroundColor White
Write-Host "EMAIL_FROM=$EMAIL_FROM" -ForegroundColor White
Write-Host "EMAIL_FROM_NAME=$EMAIL_FROM_NAME" -ForegroundColor White
Write-Host ""

$update = Read-Host "Mettre à jour le fichier .env? (o/n)"

if ($update -eq "o" -or $update -eq "O") {
    # Backup du .env
    Copy-Item .env .env.backup
    Write-Host "✅ Backup créé: .env.backup" -ForegroundColor Green
    
    # Lire le contenu actuel
    $content = Get-Content .env
    
    # Supprimer les anciennes lignes EMAIL_*
    $newContent = $content | Where-Object { $_ -notmatch '^EMAIL_' }
    
    # Ajouter les nouvelles configurations
    $emailConfig = @"

# ========================================
# CONFIGURATION EMAIL (SMTP)
# ========================================
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_SECURE=$EMAIL_SECURE
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=$EMAIL_FROM
EMAIL_FROM_NAME=$EMAIL_FROM_NAME
"@
    
    $newContent += $emailConfig
    
    # Écrire le nouveau contenu
    $newContent | Set-Content .env
    
    Write-Host "✅ Fichier .env mis à jour" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Test de la configuration..." -ForegroundColor Yellow
    Write-Host ""
    
    node test-email.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==================================================" -ForegroundColor Green
        Write-Host "✅ Configuration terminée avec succès!" -ForegroundColor Green
        Write-Host "==================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prochaines étapes:" -ForegroundColor White
        Write-Host "1. Redémarrer le serveur: npm run dev" -ForegroundColor White
        Write-Host "2. Les emails seront automatiquement envoyés" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠️  Des erreurs se sont produites lors du test" -ForegroundColor Yellow
        Write-Host "   Vérifiez votre configuration et réessayez" -ForegroundColor Yellow
        Write-Host "   Restauration: Copy-Item .env.backup .env" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Configuration non appliquée." -ForegroundColor Yellow
    Write-Host "Vous pouvez copier les lignes ci-dessus manuellement dans .env" -ForegroundColor White
}
