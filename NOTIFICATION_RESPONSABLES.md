# 📧 Système de Notifications Email pour les Responsables

## Vue d'ensemble

Le système de réservation de salles du Port Autonome de Lomé envoie désormais automatiquement **toutes les notifications par email** aux administrateurs ET aux responsables de salle.

## 🎯 Qui reçoit les emails ?

Tous les utilisateurs ayant le rôle **`admin`** ou **`responsable`** dans la base de données recevront automatiquement des **emails informatifs (FYI)** pour chaque action.

### ⚠️ Important: Emails différenciés

Le système envoie **2 types d'emails différents**:

1. **Email personnel** à l'utilisateur concerné → "Votre réservation...", "Bonjour [Nom]"
2. **Email FYI (informatif)** aux responsables → "ℹ️ FYI: Une réservation...", "Bonjour," (générique)

Les responsables reçoivent des emails **d'information uniquement**, pas les emails personnels destinés aux utilisateurs.

### Actuellement dans le système

D'après le test du **12 décembre 2025**, les responsables suivants reçoivent les emails :

| Nom | Email | Rôle |
|-----|-------|------|
| Système AGBO | admin@port-autonome.com | Admin |
| Jean Dupont | jean.dupont@port-autonome.com | Responsable |
| Sophie Martin | sophie.martin@port-autonome.com | Responsable |
| petit MARX | marxist1991@gmail.com | Responsable |

## 📬 Types de notifications envoyées

### 1. ✅ Validation de réservation

**Déclencheur :** Un admin/responsable valide une demande de réservation

**Destinataires :**
- L'utilisateur qui a fait la demande → **Email personnel** : "✅ Réservation validée"
- Tous les admins/responsables → **Email FYI** : "ℹ️ FYI: Réservation validée"

**Contenu email utilisateur :**
- "Excellente nouvelle ! **Votre** demande a été approuvée"
- Détails de SA réservation
- Instructions personnalisées
- Bouton "Voir mes réservations"

**Contenu email responsables (FYI) :**
- "Une réservation vient d'être validée"
- Nom de l'utilisateur concerné
- Détails de la réservation
- Statut du système
- "Aucune action requise"

---

### 2. ❌ Refus de réservation

**Déclencheur :** Un admin/responsable refuse une demande

**Destinataires :**
- L'utilisateur qui a fait la demande → **Email personnel** : "❌ Réservation refusée"
- Tous les admins/responsables → **Email FYI** : "ℹ️ FYI: Réservation refusée"

**Contenu email utilisateur :**
- "Nous regrettons... **votre** demande n'a pas pu être approuvée"
- Détails de SA demande
- Motif du refus
- Actions recommandées
- Bouton "Faire une nouvelle demande"

**Contenu email responsables (FYI) :**
- "Une demande vient d'être refusée"
- Nom de l'utilisateur concerné
- Détails de la demande
- Raison du refus
- Actions effectuées dans le système
- "Aucune action requise"

---

### 3. 🔄 Proposition alternative

**Déclencheur :** Un admin/responsable propose une salle/créneau alternatif

**Destinataires :**
- L'utilisateur qui a fait la demande → **Email personnel** : "🔄 Proposition alternative"
- Tous les admins/responsables → **Email FYI** : "ℹ️ FYI: Alternative proposée"

**Contenu email utilisateur :**
- "Nous vous proposons une alternative pour **votre** demande"
- Comparaison : SA demande → alternative proposée
- Raison de la proposition
- Choix: accepter ou refuser
- Bouton "Consulter la proposition"

**Contenu email responsables (FYI) :**
- "[Nom responsable] vient de proposer une alternative à [Nom utilisateur]"
- Demande initiale de l'utilisateur
- Alternative proposée
- Raison
- Statut: En attente de décision
- "Aucune action requise"

---

### 4. 📝 Nouvelle demande de réservation

**Déclencheur :** Un utilisateur soumet une nouvelle demande

**Destinataires :**
- Tous les admins/responsables (notification uniquement)

**Contenu :**
- Informations du demandeur (nom, email, département)
- Salle demandée
- Date, horaires et motif
- Actions requises (valider/refuser/proposer alternative)
- Bouton d'action vers le panneau admin

---

### 5. ✅ Acceptation d'alternative

**Déclencheur :** Un utilisateur accepte une proposition alternative

**Destinataires :**
- Le responsable qui a proposé l'alternative
- Tous les autres admins/responsables

**Contenu :**
- Confirmation de l'acceptation
- Détails de la nouvelle réservation créée
- Statut actuel dans le système
- Bouton d'action vers le panneau admin

---

## 🎨 Design des emails

Tous les emails sont conçus avec :

- ✅ **Logo du Port Autonome de Lomé** intégré
- 🎨 **Design moderne** avec dégradés bleus professionnels
- 📱 **Responsive** - s'adapte aux mobiles et tablettes
- 🔗 **Liens directs** vers les actions dans l'application
- 📋 **Informations structurées** avec des boîtes visuelles

### Exemple de structure

```
┌─────────────────────────────────────┐
│ 🏢 En-tête avec logo du Port        │
│    Port Autonome de Lomé            │
│    Système de Réservation           │
├─────────────────────────────────────┤
│ Titre de la notification            │
│                                      │
│ ┌─────────────────────────────┐    │
│ │ Boîte d'information         │    │
│ │ Détails de la réservation   │    │
│ └─────────────────────────────┘    │
│                                      │
│ [Bouton d'action]                   │
├─────────────────────────────────────┤
│ Pied de page avec adresse           │
│ Lien vers l'application             │
└─────────────────────────────────────┘
```

---

## ⚙️ Configuration technique

### Pour ajouter un nouveau responsable

1. **Via l'interface admin :**
   - Aller dans "Gestion des utilisateurs"
   - Créer un nouvel utilisateur
   - Sélectionner le rôle **"Responsable"**
   - Saisir une adresse email valide
   - Enregistrer

2. **Le responsable recevra automatiquement :**
   - Toutes les nouvelles demandes de réservation
   - Toutes les validations/refus effectués
   - Toutes les propositions alternatives
   - Toutes les acceptations d'alternatives

### Base de données

Les emails sont récupérés automatiquement via cette requête :

```sql
SELECT email, role, prenom, nom 
FROM users 
WHERE role IN ('admin', 'responsable') 
  AND email IS NOT NULL
```

---

## 🧪 Tests effectués

**Date :** 12 décembre 2025  
**Script :** `test-email-responsables.js`

### Résultats

✅ **4 responsables** identifiés dans la base  
✅ **3 types d'emails** testés avec succès  
✅ **6 emails différents** envoyés au total:
- 3 emails PERSONNELS à l'utilisateur
- 3 emails FYI (informatifs) aux responsables

### Différences confirmées

| Aspect | Email Utilisateur | Email Responsable (FYI) |
|--------|-------------------|-------------------------|
| **Sujet** | "✅ Réservation validée" | "ℹ️ FYI: Réservation validée" |
| **Salutation** | "Bonjour [Nom complet]" | "Bonjour," (générique) |
| **Ton** | Personnel, direct | Informatif, neutre |
| **Contenu** | "**Votre** réservation..." | "**Une** réservation de [Nom]..." |
| **Perspective** | Première personne | Tierce personne |
| **Action** | "Voir mes réservations" | "Voir toutes les réservations" |
| **Message final** | Encouragement personnel | "Aucune action requise" |  

### Exemples d'IDs de messages

```
Email de validation:
- Utilisateur: <05a13e3e-a732-a36c-0bef-99a7d9ca65ac@reservation-pal.com>
- Responsables: <3bb1208a-8718-d858-c18d-d3aa229c4181@reservation-pal.com>

Email de refus:
- Utilisateur: <9c4f95c2-175a-4b48-395d-18927736a19c@reservation-pal.com>
- Responsables: <21dbf847-93f2-43f4-2a2f-5aa417da4df0@reservation-pal.com>

Email de proposition alternative:
- Utilisateur: <3e38bd38-22c6-8445-1dfb-70a3cd78a421@reservation-pal.com>
- Responsables: <dafac732-8d2a-3fb8-f2c3-13229121420d@reservation-pal.com>
```

---

## 📊 Flux de travail en production

### Scénario type : Nouvelle demande

1. **Utilisateur** crée une demande de réservation via le calendrier
2. **Système** enregistre la demande avec statut "En attente"
3. **📧 Email automatique** envoyé à tous les responsables
4. **Responsable** reçoit l'email et clique sur "Traiter la demande"
5. **Responsable** se connecte et valide/refuse/propose une alternative
6. **📧 Email automatique** envoyé à l'utilisateur + autres responsables
7. **Utilisateur** reçoit la notification et peut agir

### Avantages pour les responsables

✅ **Réactivité accrue** - notification instantanée par email  
✅ **Transparence** - tous les responsables sont informés  
✅ **Traçabilité** - historique des emails pour audit  
✅ **Mobilité** - gestion possible depuis n'importe où via email  
✅ **Coordination** - évite les doublons de traitement

---

## 🔧 Maintenance

### Vérifier les emails des responsables

```bash
cd reservation-backend
node test-email-responsables.js
```

Ce script :
- Liste tous les admins/responsables
- Teste l'envoi de 3 types d'emails
- Affiche un récapitulatif complet
- Vérifie la configuration SMTP

### Logs serveur

Au démarrage du serveur, vous verrez :

```
📧 Initialisation du service email...
✅ Service email configuré avec le modèle User
```

À chaque envoi d'email :

```
✅ Email envoyé à user@example.com: <message-id>
✅ Email envoyé à admin@port-autonome.com,responsable@port-autonome.com: <message-id>
```

### En cas de problème

1. **Vérifier la configuration SMTP** dans `.env` :
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=marxist1991@gmail.com
   EMAIL_PASSWORD=cemj ekug vukr qntb
   ```

2. **Vérifier les responsables** dans la base :
   ```sql
   SELECT id, email, role, CONCAT(prenom, ' ', nom) AS nom_complet
   FROM users
   WHERE role IN ('admin', 'responsable')
     AND email IS NOT NULL;
   ```

3. **Consulter les logs** du serveur pour les erreurs d'envoi

---

## 📞 Support

Pour toute question ou problème :

1. Vérifier les logs du serveur
2. Tester avec `test-email-responsables.js`
3. Vérifier la configuration SMTP
4. Contacter l'équipe technique avec les logs d'erreur

---

## 🚀 Déploiement en production

### Checklist avant mise en production

- [ ] Tous les responsables ont une adresse email valide
- [ ] Configuration SMTP validée avec le serveur de production
- [ ] Test d'envoi effectué depuis l'environnement de production
- [ ] Les responsables ont reçu et confirmé la réception des emails de test
- [ ] Documentation partagée avec toute l'équipe
- [ ] Formation des responsables sur le nouveau système

### Recommandations

1. **Prévoir une période de transition** avec double notification (email + interface)
2. **Former les responsables** à la gestion depuis les emails
3. **Surveiller les premiers jours** pour détecter tout problème
4. **Collecter les retours** des responsables sur l'utilité du système

---

**Dernière mise à jour :** 12 décembre 2025  
**Version du système :** 2.0  
**Responsable technique :** Port Autonome de Lomé - Département IT
