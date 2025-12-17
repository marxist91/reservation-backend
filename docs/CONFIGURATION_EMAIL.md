# 📧 Configuration et Utilisation du Système d'Email

## Vue d'ensemble

Le système de réservation de salles du Port Autonome de Lomé intègre désormais un système complet d'envoi de notifications par email. Ce document explique comment configurer et utiliser ce système.

## 📋 Fonctionnalités

### Types de notifications par email

1. **Validation de réservation** ✅
   - Envoyé à l'utilisateur quand sa réservation est validée
   - Contient tous les détails de la réservation
   - Lien direct vers ses réservations

2. **Refus de réservation** ❌
   - Envoyé à l'utilisateur quand sa réservation est refusée
   - Inclut le motif du refus
   - Lien pour faire une nouvelle demande

3. **Proposition alternative** 🔄
   - Envoyé quand l'admin propose une salle alternative
   - Compare l'ancienne et la nouvelle proposition
   - Lien vers les notifications pour accepter/refuser

4. **Nouvelle réservation** 📝
   - Envoyé aux administrateurs lors d'une nouvelle demande
   - Détails complets de la demande
   - Lien vers l'interface de gestion

5. **Alternative acceptée** ✅
   - Envoyé à l'admin qui a proposé l'alternative
   - Confirme l'acceptation de l'utilisateur

## ⚙️ Configuration

### 1. Configuration Gmail (Recommandé)

#### Étape 1: Activer la validation en 2 étapes
1. Aller sur [myaccount.google.com/security](https://myaccount.google.com/security)
2. Activer la "Validation en deux étapes"

#### Étape 2: Générer un mot de passe d'application
1. Aller dans "Sécurité" > "Mots de passe des applications"
2. Sélectionner "Autre (nom personnalisé)"
3. Nommer: "Réservation PAL"
4. Copier le mot de passe généré (16 caractères)

#### Étape 3: Configurer le fichier .env
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Mot de passe d'application
EMAIL_FROM=noreply@reservation-pal.com
EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations
```

### 2. Configuration Office 365 / Outlook

```bash
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre.email@outlook.com
EMAIL_PASSWORD=votre_mot_de_passe
EMAIL_FROM=noreply@reservation-pal.com
EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations
```

### 3. Configuration Yahoo Mail

```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre.email@yahoo.com
EMAIL_PASSWORD=mot_de_passe_application  # Générer depuis les paramètres de sécurité
EMAIL_FROM=noreply@reservation-pal.com
EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations
```

### 4. Configuration serveur SMTP personnalisé

```bash
EMAIL_HOST=smtp.votre-domaine.com
EMAIL_PORT=587  # Ou 465 avec EMAIL_SECURE=true
EMAIL_SECURE=false  # true pour SSL (port 465)
EMAIL_USER=noreply@votre-domaine.com
EMAIL_PASSWORD=votre_mot_de_passe_smtp
EMAIL_FROM=noreply@votre-domaine.com
EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations
```

### 5. Configuration pour tests locaux (MailHog)

Pour tester sans envoyer de vrais emails:

```bash
# Installer MailHog: https://github.com/mailhog/MailHog
# Puis démarrer: mailhog

EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@reservation-pal.local
EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations (Dev)
```

Interface web: http://localhost:8025

## 🧪 Test de la configuration

### Script de test automatique

```bash
cd reservation-backend
node test-email.js
```

Le script va:
1. Vérifier la configuration
2. Demander un email de test
3. Envoyer 4 emails de démonstration
4. Afficher les résultats

### Test manuel avec Node.js

```javascript
const emailService = require('./services/emailService');

// Vérifier si le service est prêt
console.log('Email configuré:', emailService.isReady());

// Envoyer un email de test
await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  html: '<h1>Email de test</h1>'
});
```

## 🔧 Utilisation dans le code

### Import du service

```javascript
const emailService = require('../services/emailService');
```

### Envoyer une notification de validation

```javascript
// Après validation d'une réservation
await emailService.sendReservationValidated(user, reservation);
```

### Envoyer une notification de refus

```javascript
// Après refus d'une réservation
await emailService.sendReservationRejected(user, reservation, rejectionReason);
```

### Envoyer une proposition alternative

```javascript
// Après création d'une alternative
await emailService.sendAlternativeProposed(user.email, {
  userName: `${user.prenom} ${user.nom}`,
  originalRoom: 'Salle A',
  originalDate: '15 janvier 2025',
  originalTime: '09:00 - 11:00',
  proposedRoom: 'Salle B',
  proposedDate: '15 janvier 2025',
  proposedTime: '14:00 - 16:00',
  proposerName: 'Admin',
  reason: 'Conflit de planning'
});
```

### Notifier les admins d'une nouvelle réservation

```javascript
// Lors de la création d'une réservation
await emailService.sendNewReservationToAdmins(admin.email, {
  userName: 'Jean Dupont',
  userEmail: 'jean@example.com',
  roomName: 'Salle de Conférence',
  date: '15 janvier 2025',
  startTime: '09:00',
  endTime: '11:00',
  motif: 'Réunion',
  department: 'Informatique'
});
```

### Notifier l'acceptation d'une alternative

```javascript
// Quand un utilisateur accepte une alternative
await emailService.sendAlternativeAccepted(proposer.email, {
  proposerName: 'Admin',
  userName: 'Jean Dupont',
  roomName: 'Salle B',
  date: '15 janvier 2025',
  time: '14:00 - 16:00'
});
```

## 🎨 Personnalisation des templates

### Structure des templates HTML

Les templates sont dans `services/emailService.js`:

```javascript
getReservationValidatedTemplate(data) {
  const { userName, roomName, date, startTime, endTime, motif } = data;
  // Retourne HTML complet avec header, content, footer
}
```

### Modifier le style

Les styles CSS sont inline dans les templates pour assurer la compatibilité avec tous les clients email.

Variables de style à personnaliser:
- Couleurs primaires: `#667eea`, `#764ba2`
- Police: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Boutons: Classe `.button`

### Ajouter un nouveau type d'email

1. Créer une méthode template dans `emailService.js`:

```javascript
getCustomTemplate(data) {
  const content = `
    <h2>Titre personnalisé</h2>
    <p>${data.message}</p>
  `;
  
  return this.getBaseTemplate({
    title: 'Titre',
    content,
    actionUrl: data.link,
    actionText: 'Action'
  });
}
```

2. Créer une méthode d'envoi:

```javascript
async sendCustomEmail(user, data) {
  const html = this.getCustomTemplate(data);
  return this.sendEmail({
    to: user.email,
    subject: 'Sujet personnalisé',
    html
  });
}
```

## 🐛 Dépannage

### Erreur: "Invalid login"

**Cause**: Identifiants incorrects ou mot de passe d'application non utilisé

**Solution**:
- Gmail: Utiliser un mot de passe d'application
- Vérifier EMAIL_USER et EMAIL_PASSWORD dans .env

### Erreur: "Connection timeout"

**Cause**: Port bloqué ou serveur SMTP inaccessible

**Solution**:
- Vérifier EMAIL_HOST et EMAIL_PORT
- Essayer port 465 avec EMAIL_SECURE=true
- Vérifier le firewall

### Erreur: "self signed certificate"

**Cause**: Problème de certificat SSL

**Solution**:
```bash
EMAIL_SECURE=false  # Pour port 587
# Ou
EMAIL_SECURE=true   # Pour port 465 SSL
```

### Les emails vont dans les spams

**Solutions**:
1. Configurer SPF/DKIM pour votre domaine
2. Utiliser un service email professionnel (SendGrid, AWS SES)
3. Demander aux utilisateurs d'ajouter l'expéditeur aux contacts

### Le service ne se lance pas

**Diagnostic**:
```javascript
const emailService = require('./services/emailService');
console.log('Service prêt:', emailService.isReady());
```

**Si `false`**:
- Vérifier les variables d'environnement requises
- Consulter les logs de démarrage
- Vérifier les permissions du compte email

## 📊 Monitoring

### Logs d'envoi

Les emails génèrent des logs console:

```
✅ Email envoyé à user@example.com: <message-id>
⚠️  Erreur envoi email à user@example.com: Error message
⚠️  Service email non configuré. Email non envoyé à: user@example.com
```

### Métriques à surveiller

- Taux de succès d'envoi
- Temps de réponse SMTP
- Taux de bounce (emails rejetés)
- Emails en spam

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais commit les credentials**
   - `.env` est dans `.gitignore`
   - Utiliser des variables d'environnement

2. **Utiliser des mots de passe d'application**
   - Ne pas utiliser le mot de passe principal du compte

3. **Limiter les permissions du compte email**
   - Créer un compte dédié aux notifications
   - Restreindre l'accès

4. **Valider les adresses email**
   - Vérifier le format avant envoi
   - Utiliser des listes blanches si nécessaire

5. **Rate limiting**
   - Limiter le nombre d'emails par minute
   - Éviter le spam

### Protection des données

- Les emails contiennent des informations sensibles
- Respecter le RGPD / protection des données
- Permettre aux utilisateurs de se désabonner
- Chiffrer les communications SMTP (TLS)

## 🚀 Déploiement en production

### Checklist

- [ ] Variables d'environnement configurées
- [ ] Test d'envoi réussi
- [ ] SPF/DKIM configurés sur le domaine
- [ ] Compte email dédié créé
- [ ] Monitoring mis en place
- [ ] Logs configurés
- [ ] Rate limiting activé
- [ ] Fallback en cas d'erreur
- [ ] Documentation à jour

### Services recommandés

Pour un usage professionnel:

1. **SendGrid** (12k emails gratuits/mois)
2. **AWS SES** (62k emails gratuits/mois)
3. **Mailgun** (5k emails gratuits/mois)
4. **Postmark** (100 emails gratuits/mois)

Ces services offrent:
- Meilleure délivrabilité
- Statistiques détaillées
- Support professionnel
- Moins de risques de spam

## 📞 Support

Pour toute question ou problème:
1. Consulter les logs du serveur
2. Exécuter `node test-email.js`
3. Vérifier la configuration .env
4. Consulter la documentation du fournisseur SMTP

## 📝 Changelog

### Version 1.0.0 (Décembre 2024)
- ✅ Intégration initiale du système d'email
- ✅ 5 types de notifications
- ✅ Templates HTML responsive
- ✅ Support Gmail, Office 365, Yahoo
- ✅ Script de test automatique
- ✅ Documentation complète
