# 🔐 MATRICE DES PERMISSIONS
*Généré automatiquement le 2025-07-28T02:35:49.033Z*

## 🎯 Vue d'ensemble des permissions

### Rôles définis
- **PUBLIC**: Accès libre, sans authentification
- **USER**: Utilisateur connecté standard
- **ADMIN**: Administrateur avec privilèges étendus

---

## 📋 MATRICE COMPLÈTE DES PERMISSIONS

| Endpoint | Méthode | Rôles autorisés | Description |
|----------|---------|-----------------|-------------|
| `/api/meta` | **GET** | `PUBLIC` | Accès libre aux métadonnées |
| `/api/version` | **GET** | `PUBLIC` | Version publique |
| `/api/info` | **GET** | `PUBLIC` | Informations publiques |
| `/api/healthcheck` | **GET** | `PUBLIC` | Health check public |
| `/api/register` | **POST** | `PUBLIC` | Inscription ouverte |
| `/api/login` | **POST** | `PUBLIC` | Connexion ouverte |
| `/api/logout` | **POST** | `USER, ADMIN` | Déconnexion authentifiée |
| `/api/profile` | **GET** | `USER, ADMIN` | Profil personnel |
| `/api/users` | **GET** | `ADMIN` | Liste complète (admin) |
| `/api/users/:id` | **GET** | `USER, ADMIN` | Détails utilisateur |
| `/api/users/:id` | **PUT** | `USER, ADMIN` | Modification (propriétaire ou admin) |
| `/api/users/:id` | **DELETE** | `ADMIN` | Suppression (admin uniquement) |
| `/api/rooms` | **GET** | `USER, ADMIN` | Consultation des salles |
| `/api/rooms/:id` | **GET** | `USER, ADMIN` | Détails d'une salle |
| `/api/rooms` | **POST** | `ADMIN` | Création de salle (admin) |
| `/api/rooms/:id` | **PUT** | `ADMIN` | Modification de salle (admin) |
| `/api/rooms/:id` | **DELETE** | `ADMIN` | Suppression de salle (admin) |
| `/api/rooms/:id/availability` | **GET** | `USER, ADMIN` | Vérification disponibilité |
| `/api/reservations` | **GET** | `USER, ADMIN` | Ses réservations ou toutes (admin) |
| `/api/reservations/:id` | **GET** | `USER, ADMIN` | Détails réservation |
| `/api/reservations` | **POST** | `USER, ADMIN` | Création de réservation |
| `/api/reservations/:id` | **PUT** | `USER, ADMIN` | Modification (propriétaire ou admin) |
| `/api/reservations/:id` | **DELETE** | `USER, ADMIN` | Annulation (propriétaire ou admin) |
| `/api/audit/entity/:type/:id` | **GET** | `ADMIN` | Audit d'entité (admin) |
| `/api/audit/user/:id` | **GET** | `ADMIN` | Audit utilisateur (admin) |
| `/api/audit/actions` | **GET** | `ADMIN` | Actions système (admin) |
| `/api/notifications` | **GET** | `USER, ADMIN` | Ses notifications |
| `/api/notifications` | **POST** | `ADMIN` | Création notification (admin) |
| `/api/notifications/:id/read` | **PUT** | `USER, ADMIN` | Marquer comme lue |
| `/api/notifications/:id` | **DELETE** | `USER, ADMIN` | Supprimer notification |

---

## 🔍 ANALYSE PAR RÔLE

### 🌐 Endpoints PUBLIC (6 endpoints)
Accessibles sans authentification:

- **GET /api/meta**: Accès libre aux métadonnées
- **GET /api/version**: Version publique
- **GET /api/info**: Informations publiques
- **GET /api/healthcheck**: Health check public
- **POST /api/register**: Inscription ouverte
- **POST /api/login**: Connexion ouverte

### 👤 Endpoints USER (15 endpoints)
Nécessitent une authentification utilisateur:

- **POST /api/logout**: Déconnexion authentifiée
- **GET /api/profile**: Profil personnel
- **GET /api/users/:id**: Détails utilisateur
- **PUT /api/users/:id**: Modification (propriétaire ou admin)
- **GET /api/rooms**: Consultation des salles
- **GET /api/rooms/:id**: Détails d'une salle
- **GET /api/rooms/:id/availability**: Vérification disponibilité
- **GET /api/reservations**: Ses réservations ou toutes (admin)
- **GET /api/reservations/:id**: Détails réservation
- **POST /api/reservations**: Création de réservation
- **PUT /api/reservations/:id**: Modification (propriétaire ou admin)
- **DELETE /api/reservations/:id**: Annulation (propriétaire ou admin)
- **GET /api/notifications**: Ses notifications
- **PUT /api/notifications/:id/read**: Marquer comme lue
- **DELETE /api/notifications/:id**: Supprimer notification

### 🛡️ Endpoints ADMIN (9 endpoints)
Réservés aux administrateurs:

- **GET /api/users**: Liste complète (admin)
- **DELETE /api/users/:id**: Suppression (admin uniquement)
- **POST /api/rooms**: Création de salle (admin)
- **PUT /api/rooms/:id**: Modification de salle (admin)
- **DELETE /api/rooms/:id**: Suppression de salle (admin)
- **GET /api/audit/entity/:type/:id**: Audit d'entité (admin)
- **GET /api/audit/user/:id**: Audit utilisateur (admin)
- **GET /api/audit/actions**: Actions système (admin)
- **POST /api/notifications**: Création notification (admin)

---

## 🔧 RÈGLES DE SÉCURITÉ

### Authentification JWT
- **Token requis**: Header `Authorization: Bearer <token>`
- **Durée de vie**: 7 jours par défaut
- **Refresh**: Reconnexion nécessaire après expiration
- **Validation**: Signature et expiration vérifiées à chaque requête

### Autorisation par ressource
- **Propriétaire**: Un utilisateur peut modifier ses propres données
- **Admin override**: Les admins peuvent accéder à toutes les ressources
- **Isolation**: Les utilisateurs standards ne voient que leurs données

### Exemples de vérifications
```javascript
// Vérification propriétaire ou admin
if (req.user.id !== resourceUserId && req.user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Accès refusé' });
}

// Vérification admin uniquement
if (req.user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Privilèges administrateur requis' });
}
```

---

## 🧪 TESTS D'AUTORISATION

### Script de test des permissions

```bash
#!/bin/bash

# Variables
API_URL="http://localhost:3000"
USER_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
ADMIN_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

echo "🧪 Test des permissions API..."

# Test accès public
echo "✅ Test endpoints publics:"
curl -s $API_URL/api/meta | jq '.status'
curl -s $API_URL/api/healthcheck | jq '.status'

# Test accès utilisateur
echo "👤 Test endpoints utilisateur:"
curl -s -H "Authorization: Bearer $USER_TOKEN" $API_URL/api/profile | jq '.email'
curl -s -H "Authorization: Bearer $USER_TOKEN" $API_URL/api/reservations | jq '.data[0].id'

# Test accès admin
echo "🛡️ Test endpoints admin:"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/api/users | jq '.data | length'
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/api/audit/actions | jq '.data | length'

# Test accès refusé
echo "⛔ Test accès refusé:"
curl -s -H "Authorization: Bearer $USER_TOKEN" $API_URL/api/users
# Doit retourner 403 Forbidden
```

---

## 📊 STATISTIQUES DES PERMISSIONS

- **Total endpoints**: 30
- **Endpoints publics**: 6 (20%)
- **Endpoints utilisateur**: 15 (50%)
- **Endpoints admin**: 24 (80%)

---

*Matrice des permissions générée automatiquement - 2025-07-28T02:35:49.033Z*
