#!/bin/bash

# Script d'assistant de configuration email
# Usage: bash email-setup-wizard.sh

echo "=================================================="
echo "📧 Assistant de Configuration Email"
echo "=================================================="
echo ""

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env non trouvé!"
    echo "   Copiez .env.example vers .env d'abord:"
    echo "   cp .env.example .env"
    exit 1
fi

echo "Choisissez votre fournisseur email:"
echo "1) Gmail"
echo "2) Office 365 / Outlook"
echo "3) Yahoo Mail"
echo "4) Serveur SMTP personnalisé"
echo "5) Test local (MailHog)"
echo ""
read -p "Votre choix (1-5): " choice

case $choice in
    1)
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_PORT="587"
        EMAIL_SECURE="false"
        echo ""
        echo "Configuration Gmail sélectionnée"
        echo ""
        echo "⚠️  IMPORTANT: Utilisez un mot de passe d'application!"
        echo "   1. Activez la validation en 2 étapes: https://myaccount.google.com/security"
        echo "   2. Générez un mot de passe d'application: https://myaccount.google.com/apppasswords"
        echo ""
        read -p "Votre adresse Gmail: " EMAIL_USER
        read -sp "Mot de passe d'application (16 caractères): " EMAIL_PASSWORD
        echo ""
        ;;
    2)
        EMAIL_HOST="smtp.office365.com"
        EMAIL_PORT="587"
        EMAIL_SECURE="false"
        echo ""
        echo "Configuration Office 365 sélectionnée"
        echo ""
        read -p "Votre adresse email: " EMAIL_USER
        read -sp "Mot de passe: " EMAIL_PASSWORD
        echo ""
        ;;
    3)
        EMAIL_HOST="smtp.mail.yahoo.com"
        EMAIL_PORT="587"
        EMAIL_SECURE="false"
        echo ""
        echo "Configuration Yahoo Mail sélectionnée"
        echo ""
        echo "⚠️  Utilisez un mot de passe d'application depuis les paramètres de sécurité"
        read -p "Votre adresse Yahoo: " EMAIL_USER
        read -sp "Mot de passe d'application: " EMAIL_PASSWORD
        echo ""
        ;;
    4)
        echo ""
        echo "Configuration SMTP personnalisée"
        echo ""
        read -p "Hôte SMTP (ex: smtp.example.com): " EMAIL_HOST
        read -p "Port (587 ou 465): " EMAIL_PORT
        read -p "SSL activé? (true/false): " EMAIL_SECURE
        read -p "Utilisateur: " EMAIL_USER
        read -sp "Mot de passe: " EMAIL_PASSWORD
        echo ""
        ;;
    5)
        EMAIL_HOST="localhost"
        EMAIL_PORT="1025"
        EMAIL_SECURE="false"
        EMAIL_USER=""
        EMAIL_PASSWORD=""
        echo ""
        echo "Configuration MailHog (test local)"
        echo ""
        echo "⚠️  Assurez-vous que MailHog est installé et démarré:"
        echo "   brew install mailhog   # macOS"
        echo "   mailhog               # démarrer"
        echo "   Interface web: http://localhost:8025"
        echo ""
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

read -p "Nom d'expéditeur (ex: Port Autonome de Lomé): " EMAIL_FROM_NAME
EMAIL_FROM="noreply@reservation-pal.com"

echo ""
echo "=================================================="
echo "📝 Configuration générée"
echo "=================================================="
echo ""
echo "EMAIL_HOST=$EMAIL_HOST"
echo "EMAIL_PORT=$EMAIL_PORT"
echo "EMAIL_SECURE=$EMAIL_SECURE"
echo "EMAIL_USER=$EMAIL_USER"
echo "EMAIL_PASSWORD=****** (masqué)"
echo "EMAIL_FROM=$EMAIL_FROM"
echo "EMAIL_FROM_NAME=$EMAIL_FROM_NAME"
echo ""

read -p "Mettre à jour le fichier .env? (o/n): " update

if [ "$update" = "o" ] || [ "$update" = "O" ]; then
    # Backup du .env
    cp .env .env.backup
    echo "✅ Backup créé: .env.backup"
    
    # Supprimer les anciennes lignes EMAIL_*
    sed -i.tmp '/^EMAIL_/d' .env
    rm -f .env.tmp
    
    # Ajouter les nouvelles configurations
    echo "" >> .env
    echo "# ========================================" >> .env
    echo "# CONFIGURATION EMAIL (SMTP)" >> .env
    echo "# ========================================" >> .env
    echo "EMAIL_HOST=$EMAIL_HOST" >> .env
    echo "EMAIL_PORT=$EMAIL_PORT" >> .env
    echo "EMAIL_SECURE=$EMAIL_SECURE" >> .env
    echo "EMAIL_USER=$EMAIL_USER" >> .env
    echo "EMAIL_PASSWORD=$EMAIL_PASSWORD" >> .env
    echo "EMAIL_FROM=$EMAIL_FROM" >> .env
    echo "EMAIL_FROM_NAME=$EMAIL_FROM_NAME" >> .env
    
    echo "✅ Fichier .env mis à jour"
    echo ""
    echo "🧪 Test de la configuration..."
    echo ""
    
    node test-email.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=================================================="
        echo "✅ Configuration terminée avec succès!"
        echo "=================================================="
        echo ""
        echo "Prochaines étapes:"
        echo "1. Redémarrer le serveur: npm run dev"
        echo "2. Les emails seront automatiquement envoyés"
        echo ""
    else
        echo ""
        echo "⚠️  Des erreurs se sont produites lors du test"
        echo "   Vérifiez votre configuration et réessayez"
        echo "   Restauration: mv .env.backup .env"
    fi
else
    echo ""
    echo "Configuration non appliquée."
    echo "Vous pouvez copier les lignes ci-dessus manuellement dans .env"
fi
