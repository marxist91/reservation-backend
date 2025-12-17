# 📧 Différences entre Emails Utilisateur et Responsable

## Problème résolu

**Avant :** Les responsables recevaient le **même email** que l'utilisateur, ce qui créait de la confusion.  
Exemple : *"Bonjour Mars PETIT, nous regrettons de vous informer que **votre** demande..."*  
→ Le responsable n'est pas Mars PETIT et ce n'est pas SA demande !

**Après :** Les responsables reçoivent maintenant un **email FYI distinct** adapté à leur rôle.  
Exemple : *"Bonjour, une demande de réservation de Mars PETIT vient d'être refusée."*  
→ Le responsable est informé sans confusion !

---

## Comparaison des Templates

### 1. Email de Validation

#### 📱 Email Utilisateur (Personnel)

```
De: Port Autonome de Lomé - Réservations <noreply@reservation-pal.com>
À: mars.petit@togoport.tg
Sujet: ✅ Réservation validée - Port Autonome de Lomé

╔════════════════════════════════════════╗
║   [Logo du Port]                       ║
║   Port Autonome de Lomé                ║
║   Système de Réservation               ║
╚════════════════════════════════════════╝

✅ Réservation validée avec succès

Bonjour Mars PETIT,

Excellente nouvelle ! Votre demande de réservation a été 
approuvée par notre équipe administrative.

┌─────────────────────────────────────┐
│ 📋 Détails de votre réservation     │
├─────────────────────────────────────┤
│ Salle : Salle de Conférence A       │
│ 📅 Date : lundi 22 décembre 2025    │
│ 🕐 Horaire : 09:00 - 12:00          │
│ 📝 Motif : formation                │
└─────────────────────────────────────┘

ℹ️ Informations importantes
• Présentez-vous 10 minutes avant le début
• En cas d'empêchement, annulez via l'app
• Pour toute modification, contactez le service

      [ 📱 Voir mes réservations ]

Nous vous souhaitons une excellente utilisation.
```

#### 👔 Email Responsable (FYI)

```
De: Port Autonome de Lomé - Réservations <noreply@reservation-pal.com>
À: jean.dupont@port-autonome.com, sophie.martin@port-autonome.com, ...
Sujet: ℹ️ FYI: Réservation validée - Port Autonome de Lomé

╔════════════════════════════════════════╗
║   [Logo du Port]                       ║
║   Port Autonome de Lomé                ║
║   Système de Réservation               ║
╚════════════════════════════════════════╝

ℹ️ Réservation validée

Bonjour,

Une réservation vient d'être validée dans le système.

┌─────────────────────────────────────┐
│ 📋 Détails de la réservation        │
├─────────────────────────────────────┤
│ 👤 Utilisateur : Mars PETIT         │
│ 🏢 Salle : Salle de Conférence A    │
│ 📅 Date : lundi 22 décembre 2025    │
│ 🕐 Horaire : 09:00 - 12:00          │
│ 📝 Motif : formation                │
└─────────────────────────────────────┘

✅ Statut
• La réservation est maintenant active
• L'utilisateur a été notifié par email
• La salle apparaît réservée dans le calendrier

      [ 📊 Voir toutes les réservations ]

Ceci est une notification d'information - 
aucune action requise.
```

---

### 2. Email de Refus

#### 📱 Email Utilisateur (Personnel)

```
Sujet: ❌ Réservation refusée - Port Autonome de Lomé

❌ Décision concernant votre réservation

Bonjour Mars PETIT,

Nous regrettons de vous informer que votre demande 
de réservation n'a pas pu être approuvée.

┌─────────────────────────────────────┐
│ 📋 Détails de la demande            │
├─────────────────────────────────────┤
│ Salle demandée : Salle inconnue     │
│ 📅 Date : lundi 22 décembre 2025    │
│ 🕐 Horaire : 09:00 - 12:00          │
│ 📝 Motif : formation                │
└─────────────────────────────────────┘

💬 Motif du refus
La salle est déjà réservée pour un événement 
prioritaire à cette date.

Que faire maintenant ?
• Consultez la disponibilité pour d'autres créneaux
• Vérifiez si une autre salle correspond à vos besoins
• Contactez le service de réservation

      [ 🔄 Faire une nouvelle demande ]
```

#### 👔 Email Responsable (FYI)

```
Sujet: ℹ️ FYI: Réservation refusée - Port Autonome de Lomé

ℹ️ Réservation refusée

Bonjour,

Une demande de réservation vient d'être refusée 
dans le système.

┌─────────────────────────────────────┐
│ 📋 Détails de la demande refusée    │
├─────────────────────────────────────┤
│ 👤 Utilisateur : Mars PETIT         │
│ 🏢 Salle demandée : Salle inconnue  │
│ 📅 Date : lundi 22 décembre 2025    │
│ 🕐 Horaire : 09:00 - 12:00          │
│ 📝 Motif initial : formation        │
└─────────────────────────────────────┘

💬 Raison du refus
La salle est déjà réservée pour un événement 
prioritaire à cette date.

✅ Actions effectuées
• La demande a été marquée comme refusée
• L'utilisateur a été notifié par email
• L'historique a été enregistré

      [ 📊 Voir l'historique ]

Ceci est une notification d'information - 
aucune action requise.
```

---

### 3. Email de Proposition Alternative

#### 📱 Email Utilisateur (Personnel)

```
Sujet: 🔄 Proposition de salle alternative

🔄 Nous avons une alternative pour vous

Bonjour Mars PETIT,

Votre demande initiale ne peut être satisfaite, mais 
nous avons une excellente alternative à vous proposer.

⚠️ Votre demande initiale
🏢 Salle : Salle A
📅 Date : 15 janvier 2025
🕐 Horaire : 09:00 - 11:00

        ↓ Proposition alternative ↓

✨ Alternative proposée
🏢 Salle : Salle B
📅 Date : 15 janvier 2025
🕐 Horaire : 14:00 - 16:00

💬 Raison
Conflit avec une réunion prioritaire du conseil

Que souhaitez-vous faire ?
• Accepter cette proposition
• Refuser et chercher une autre option

      [ 👀 Consulter la proposition ]
```

#### 👔 Email Responsable (FYI)

```
Sujet: ℹ️ FYI: Alternative proposée

ℹ️ Alternative proposée

Bonjour,

Admin Système vient de proposer une alternative 
à Mars PETIT.

⚠️ Demande initiale
👤 Utilisateur : Mars PETIT
🏢 Salle : Salle A
📅 Date : 15 janvier 2025
🕐 Horaire : 09:00 - 11:00

        ↓ Proposition alternative ↓

✨ Alternative proposée
🏢 Salle : Salle B
📅 Date : 15 janvier 2025
🕐 Horaire : 14:00 - 16:00

💬 Raison
Conflit avec une réunion prioritaire du conseil

⏳ En attente
• L'utilisateur a été notifié par email
• En attente de sa décision (accepter/refuser)
• Une notification sera envoyée lors de sa réponse

      [ 📊 Voir les alternatives ]

Ceci est une notification d'information - 
aucune action requise.
```

---

## Tableau Récapitulatif

| Élément | Email Utilisateur | Email Responsable (FYI) |
|---------|-------------------|-------------------------|
| **Sujet** | Action directe | Préfixe "ℹ️ FYI:" |
| **Salutation** | "Bonjour [Prénom Nom]" | "Bonjour," |
| **Perspective** | 2ème personne (vous/votre) | 3ème personne (une/l'utilisateur) |
| **Ton** | Personnel, impliqué | Neutre, informatif |
| **Contenu principal** | Détails de SA réservation | Détails + nom utilisateur |
| **Informations** | Instructions pour l'utilisateur | Statut système |
| **Bouton CTA** | Action personnelle | Action admin |
| **Message final** | Encouragement/aide | "Aucune action requise" |
| **Objectif** | Informer + guider l'utilisateur | Tenir au courant l'équipe |

---

## Code Source

### Templates dans `emailService.js`

```javascript
// Template pour utilisateur (personnel)
getReservationValidatedTemplate(data) {
  // Contenu avec "votre", "vous", salutation personnelle
  return this.getBaseTemplate({
    title: 'Réservation Validée',
    // ...
  });
}

// Template FYI pour responsables (informatif)
getReservationValidatedFYITemplate(data) {
  // Contenu avec "une réservation", "l'utilisateur", ton neutre
  return this.getBaseTemplate({
    title: 'FYI: Réservation Validée',
    // ...
  });
}
```

### Méthode d'envoi

```javascript
async sendReservationValidated(user, reservation) {
  const dataTemplate = {
    userName: `${user.prenom} ${user.nom}`,
    // ... autres données
  };

  // Email PERSONNEL pour l'utilisateur
  const htmlUser = this.getReservationValidatedTemplate(dataTemplate);
  await this.sendEmail({
    to: user.email,
    subject: '✅ Réservation validée',
    html: htmlUser
  });

  // Email FYI pour les responsables
  const htmlFYI = this.getReservationValidatedFYITemplate(dataTemplate);
  const adminsEmails = await this.getAdminsAndResponsablesEmails();
  await this.sendEmail({
    to: adminsEmails.join(','),
    subject: 'ℹ️ FYI: Réservation validée',
    html: htmlFYI
  });
}
```

---

## Avantages de cette Approche

### ✅ Pour les Utilisateurs
- Reçoivent des emails personnalisés et pertinents
- Ton chaleureux et accueillant
- Instructions claires sur les actions à effectuer
- Se sentent pris en charge individuellement

### ✅ Pour les Responsables
- Ne reçoivent plus d'emails confus adressés à d'autres
- Format informatif clair: qui, quoi, quand
- Statut du système et actions déjà effectuées
- Pas de confusion sur le destinataire réel
- Peuvent suivre toutes les activités sans ambiguïté

### ✅ Pour le Système
- Séparation claire des préoccupations
- Traçabilité: qui reçoit quel type d'email
- Évolutif: facile d'ajouter de nouveaux templates
- Maintenable: chaque template a un rôle précis

---

## Tests de Validation

### Script de test : `test-email-responsables.js`

```bash
cd reservation-backend
node test-email-responsables.js
```

**Résultats attendus:**
- 6 emails envoyés au total
- 3 emails personnels à l'utilisateur test
- 3 emails FYI aux 4 responsables
- Formats différents confirmés dans les boîtes email

### Vérification manuelle

1. Consulter l'email reçu par un utilisateur standard
2. Consulter l'email reçu par un responsable
3. Comparer les deux:
   - Sujet différent (avec/sans "FYI:")
   - Salutation différente
   - Contenu adapté au rôle
   - Boutons d'action différents

---

## Maintenance Future

### Pour ajouter un nouveau type d'email

1. Créer 2 templates dans `emailService.js`:
   ```javascript
   getNewActionTemplate(data) { /* template utilisateur */ }
   getNewActionFYITemplate(data) { /* template responsables */ }
   ```

2. Créer la méthode d'envoi:
   ```javascript
   async sendNewAction(user, data) {
     // Email utilisateur
     const htmlUser = this.getNewActionTemplate(data);
     await this.sendEmail({ to: user.email, html: htmlUser });
     
     // Email FYI responsables
     const htmlFYI = this.getNewActionFYITemplate(data);
     const admins = await this.getAdminsAndResponsablesEmails();
     await this.sendEmail({ to: admins.join(','), html: htmlFYI });
   }
   ```

3. Appeler depuis les routes:
   ```javascript
   await emailService.sendNewAction(user, actionData);
   ```

---

**Dernière mise à jour:** 12 décembre 2025  
**Version:** 2.1 (Emails différenciés)  
**Statut:** ✅ Implémenté et testé
