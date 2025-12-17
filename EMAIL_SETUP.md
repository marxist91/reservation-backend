# 📧 Configuration Rapide - Notifications Email

## 🚀 Démarrage rapide (5 minutes)

### 1. Configuration Gmail

```bash
# 1. Activer la validation en 2 étapes sur votre compte Google
# 2. Générer un mot de passe d'application:
#    https://myaccount.google.com/apppasswords
# 3. Copier le mot de passe (16 caractères)
```

### 2. Éditer le fichier `.env`

```bash
# Ouvrir: reservation-backend/.env
# Ajouter ces lignes (déjà présentes, à compléter):

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre.email@gmail.com          # ← Votre email Gmail
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx        # ← Mot de passe d'application
EMAIL_FROM=noreply@reservation-pal.com
EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations
```

### 3. Tester la configuration

```bash
cd reservation-backend
node test-email.js
```

Entrez votre email pour recevoir 4 emails de test.

### 4. Redémarrer le serveur

```bash
# Le serveur va détecter la nouvelle configuration automatiquement
npm run dev
```

## ✅ Vérification

Quand le serveur démarre, vous devriez voir:
```
✅ Service email configuré avec succès
```

Si vous voyez:
```
⚠️  Configuration email incomplète. Variables manquantes: ...
⚠️  Les notifications par email seront désactivées.
```

→ Vérifiez votre fichier `.env`

## 📝 Quand les emails sont envoyés?

### Automatiquement envoyés:

1. **Validation de réservation** ✅
   - À l'utilisateur: Confirmation avec détails
   
2. **Refus de réservation** ❌
   - À l'utilisateur: Notification avec motif du refus
   
3. **Nouvelle réservation** 📝
   - Aux admins: Alerte de nouvelle demande à traiter
   
4. **Proposition alternative** 🔄
   - À l'utilisateur: Nouvelle salle proposée après refus
   
5. **Alternative acceptée** ✅
   - À l'admin: Confirmation que l'utilisateur a accepté

### Le système continue de fonctionner même si l'email échoue!

Les notifications en base de données et dans l'interface sont toujours créées.

## 🔧 Autres fournisseurs

### Office 365 / Outlook
```bash
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=votre.email@outlook.com
EMAIL_PASSWORD=votre_mot_de_passe
```

### Yahoo Mail
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=votre.email@yahoo.com
EMAIL_PASSWORD=mot_de_passe_application
```

### Serveur SMTP personnalisé
```bash
EMAIL_HOST=smtp.votre-domaine.com
EMAIL_PORT=587
EMAIL_USER=noreply@votre-domaine.com
EMAIL_PASSWORD=votre_mot_de_passe
```

## 🐛 Problèmes courants

### "Invalid login"
→ Utilisez un **mot de passe d'application** (pas votre mot de passe Gmail)

### "Connection timeout"
→ Vérifiez votre pare-feu / antivirus

### Les emails vont dans les spams
→ Normal pour les tests. En production, configurez SPF/DKIM

### Le service ne démarre pas
```bash
# Vérifier les variables
cat .env | grep EMAIL
```

## 📚 Documentation complète

Voir: [docs/CONFIGURATION_EMAIL.md](docs/CONFIGURATION_EMAIL.md)

- Configuration avancée
- Personnalisation des templates
- Monitoring et logs
- Déploiement production
- Dépannage complet
