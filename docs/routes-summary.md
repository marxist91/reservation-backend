# 📋 RÉSUMÉ DES ROUTES API
*Généré automatiquement le 2025-07-28T02:35:49.033Z*

## 🎯 Vue d'ensemble
Système de réservation de salles avec 8 modules principaux.

## 📊 Statistiques rapides
- **Total endpoints**: 30
- **Modules**: 8
- **Endpoints publics**: 6
- **Endpoints authentifiés**: 24

---


## 🔹 Module: META
**Préfixe**: `/api`  
**Description**: Métadonnées et informations système  
**Authentification**: 🌐 Public

### Endpoints disponibles


#### GET `/api/meta`
- **Description**: Informations complètes du système
- **Auth**: 🌐 Public
- **Permissions**: `PUBLIC`

#### GET `/api/version`
- **Description**: Version de l'API
- **Auth**: 🌐 Public
- **Permissions**: `PUBLIC`

#### GET `/api/info`
- **Description**: Informations de base
- **Auth**: 🌐 Public
- **Permissions**: `PUBLIC`


---

## 🔹 Module: AUDIT
**Préfixe**: `/api/audit`  
**Description**: Système d'audit avancé et traçabilité  
**Authentification**: 🔒 Requise

### Endpoints disponibles


#### GET `/api/audit/entity/:type/:id`
- **Description**: Audit d'une entité spécifique
- **Auth**: 🔒 Requise
- **Permissions**: `ADMIN`

#### GET `/api/audit/user/:id`
- **Description**: Historique des actions d'un utilisateur
- **Auth**: 🔒 Requise
- **Permissions**: `ADMIN`

#### GET `/api/audit/actions`
- **Description**: Liste paginée des actions système
- **Auth**: 🔒 Requise
- **Permissions**: `ADMIN`


---

## 🔹 Module: NOTIFICATIONS
**Préfixe**: `/api/notifications`  
**Description**: Système de notifications en temps réel  
**Authentification**: 🔒 Requise

### Endpoints disponibles


#### GET `/api/notifications/`
- **Description**: Récupérer les notifications utilisateur
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### POST `/api/notifications/`
- **Description**: Créer une nouvelle notification
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### PUT `/api/notifications/:id/read`
- **Description**: Marquer comme lue
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`

#### DELETE `/api/notifications/:id`
- **Description**: Supprimer une notification
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`


---

## 🔹 Module: AUTH
**Préfixe**: `/api`  
**Description**: Authentification et gestion des sessions  
**Authentification**: 🌐 Public

### Endpoints disponibles


#### POST `/api/register`
- **Description**: Inscription d'un nouvel utilisateur
- **Auth**: 🌐 Public
- **Permissions**: `PUBLIC`

#### POST `/api/login`
- **Description**: Connexion utilisateur
- **Auth**: 🌐 Public
- **Permissions**: `PUBLIC`

#### POST `/api/logout`
- **Description**: Déconnexion utilisateur
- **Auth**: 🌐 Public
- **Permissions**: `USER, ADMIN`

#### GET `/api/profile`
- **Description**: Profil utilisateur connecté
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`


---

## 🔹 Module: USERS
**Préfixe**: `/api/users`  
**Description**: Gestion des utilisateurs  
**Authentification**: 🔒 Requise

### Endpoints disponibles


#### GET `/api/users/`
- **Description**: Liste des utilisateurs
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### GET `/api/users/:id`
- **Description**: Détails d'un utilisateur
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`

#### PUT `/api/users/:id`
- **Description**: Modifier un utilisateur
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`

#### DELETE `/api/users/:id`
- **Description**: Supprimer un utilisateur
- **Auth**: 🔒 Requise
- **Permissions**: `ADMIN`


---

## 🔹 Module: RESERVATIONS
**Préfixe**: `/api/reservations`  
**Description**: Gestion des réservations de salles  
**Authentification**: 🔒 Requise

### Endpoints disponibles


#### GET `/api/reservations/`
- **Description**: Liste des réservations
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### GET `/api/reservations/:id`
- **Description**: Détails d'une réservation
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`

#### POST `/api/reservations/`
- **Description**: Créer une réservation
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### PUT `/api/reservations/:id`
- **Description**: Modifier une réservation
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`

#### DELETE `/api/reservations/:id`
- **Description**: Annuler une réservation
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`


---

## 🔹 Module: ROOMS
**Préfixe**: `/api/rooms`  
**Description**: Gestion des salles  
**Authentification**: 🔒 Requise

### Endpoints disponibles


#### GET `/api/rooms/`
- **Description**: Liste des salles disponibles
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### GET `/api/rooms/:id`
- **Description**: Détails d'une salle
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`

#### POST `/api/rooms/`
- **Description**: Créer une nouvelle salle
- **Auth**: 🔒 Requise
- **Permissions**: `NON_DÉFINI`

#### PUT `/api/rooms/:id`
- **Description**: Modifier une salle
- **Auth**: 🔒 Requise
- **Permissions**: `ADMIN`

#### DELETE `/api/rooms/:id`
- **Description**: Supprimer une salle
- **Auth**: 🔒 Requise
- **Permissions**: `ADMIN`

#### GET `/api/rooms/:id/availability`
- **Description**: Vérifier la disponibilité
- **Auth**: 🔒 Requise
- **Permissions**: `USER, ADMIN`


---

## 🔹 Module: SYSTEM
**Préfixe**: `/api`  
**Description**: Endpoints système  
**Authentification**: 🌐 Public

### Endpoints disponibles


#### GET `/api/healthcheck`
- **Description**: Vérification de l'état du serveur
- **Auth**: 🌐 Public
- **Permissions**: `PUBLIC`



## 🧪 Tests rapides

```bash
# Métadonnées système
curl http://localhost:3000/api/meta
curl http://localhost:3000/api/version

# Health check
curl http://localhost:3000/api/healthcheck

# Audit (nécessite authentification admin)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/audit/actions?limit=5

# Inscription/Connexion
curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"123456","firstName":"Test","lastName":"User"}'
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"123456"}'
```

---
*Documentation générée automatiquement par le script de documentation*
