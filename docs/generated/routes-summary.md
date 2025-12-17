# 📋 Analyse des Routes API

> Rapport généré automatiquement le 28/07/2025

## 📊 Résumé

- **Nombre total de routes**: 44
- **Fichiers analysés**: 7
- **Date d'analyse**: 2025-07-28T02:35:50.325Z

---

## 🎯 Vue d'ensemble des endpoints

| Méthode | Chemin | Fichier | Middleware | Sécurité |
|---------|--------|---------|------------|----------|
| GET | `/` | audit.js | Authentication | JWT Token Required |
| GET | `/filter` | audit.js | Authentication | JWT Token Required |
| GET | `/stats/summary` | audit.js | Authentication | JWT Token Required |
| GET | `/entity/:type/:id` | audit.js | Authentication | JWT Token Required |
| GET | `/user-actions/:id` | audit.js | Authentication | JWT Token Required |
| GET | `/advanced-search` | audit.js | Authentication | JWT Token Required |
| GET | `/:id` | audit.js | Authentication | JWT Token Required |
| POST | `/login` | auth.js | Aucun | Public |
| GET | `/meta` | meta.js | Aucun | Public |
| GET | `/version` | meta.js | Aucun | Public |
| GET | `/info` | meta.js | Aucun | Public |
| GET | `/self` | notifications.js | Authentication | JWT Token Required |
| GET | `/user/:userId` | notifications.js | Authentication | JWT Token Required |
| POST | `/read/:notificationId` | notifications.js | Authentication | JWT Token Required |
| GET | `/` | notifications.js | Authentication | JWT Token Required |
| DELETE | `/by-room/:roomId` | notifications.js | Authentication | JWT Token Required |
| DELETE | `/delete/:notificationId` | notifications.js | Authentication | JWT Token Required |
| GET | `/occupation` | reservations.js | Authentication | JWT Token Required |
| PUT | `/validate/:id` | reservations.js | Authentication | JWT Token Required |
| GET | `/occupation/roles` | reservations.js | Authentication | JWT Token Required |
| GET | `/occupation/semaine` | reservations.js | Authentication | JWT Token Required |
| GET | `/all` | reservations.js | Authentication | JWT Token Required |
| POST | `/create` | reservations.js | Authentication | JWT Token Required |
| DELETE | `/delete/:id` | reservations.js | Authentication | JWT Token Required |
| PUT | `/assign/:id` | reservations.js | Authentication | JWT Token Required |
| PUT | `/update/:id` | reservations.js | Authentication | JWT Token Required |
| GET | `/ping` | rooms.js | Aucun | Public |
| POST | `/admin-only` | rooms.js | Authentication | JWT Token Required |
| GET | `/responsables` | rooms.js | Authentication | JWT Token Required |
| GET | `/overview` | rooms.js | Authentication | JWT Token Required |
| GET | `/:id/planning` | rooms.js | Authentication | JWT Token Required |
| GET | `/disponibles` | rooms.js | Authentication | JWT Token Required |
| GET | `/dashboard` | rooms.js | Authentication | JWT Token Required |
| PUT | `/update/:roomId` | rooms.js | Authentication | JWT Token Required |
| GET | `/stats` | rooms.js | Authentication | JWT Token Required |
| GET | `/stats/by-hour` | rooms.js | Authentication | JWT Token Required |
| GET | `/stats/roles` | rooms.js | Authentication | JWT Token Required |
| GET | `/stats/semaine` | rooms.js | Authentication | JWT Token Required |
| DELETE | `/delete/:roomId` | rooms.js | Authentication | JWT Token Required |
| GET | `/:id` | rooms.js | Authentication | JWT Token Required |
| GET | `/registry` | users.js | Authentication | JWT Token Required |
| POST | `/register` | users.js | Authentication | JWT Token Required |
| PUT | `/update/:userId` | users.js | Authentication | JWT Token Required |
| PUT | `/update/:userId` | users.js | Authentication | JWT Token Required |

---

## 📁 Fichier: `audit.js`

### GET `/`

**Description**: GET /api/audit - Récupérer tous les logs d'audit (ADMIN seulement)

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

### GET `/filter`

**Description**: GET /api/audit/filter - Filtrer les logs d'audit

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

### GET `/stats/summary`

**Description**: GET /api/audit/stats/summary - Statistiques résumées des logs

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

### GET `/entity/:type/:id`

**Description**: /

**Paramètres**:
- `type` (path) - Requis
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

### GET `/user-actions/:id`

**Description**: /

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

### GET `/advanced-search`

**Description**: /

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

### GET `/:id`

**Description**: GET /api/audit/:id - Récupérer un log d'audit spécifique (CONSERVÉ - placé à la fin pour éviter conflits)

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyAdmin`

---

## 📁 Fichier: `auth.js`

### POST `/login`

**Description**: Aucune description disponible

**Handler**: `res`

---

## 📁 Fichier: `meta.js`

### GET `/meta`

**Description**: /

**Handler**: `res`

---

### GET `/version`

**Description**: /

**Handler**: `res`

---

### GET `/info`

**Description**: /

**Handler**: `res`

---

## 📁 Fichier: `notifications.js`

### GET `/self`

**Description**: 📘 GET /api/notifications/self

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/user/:userId`

**Description**: 📘 GET /api/notifications/user/:userId

**Paramètres**:
- `userId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### POST `/read/:notificationId`

**Description**: 📘 POST /api/notifications/read/:notificationId

**Paramètres**:
- `notificationId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### GET `/`

**Description**: Aucune description disponible

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### DELETE `/by-room/:roomId`

**Description**: Aucune description disponible

**Paramètres**:
- `roomId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### DELETE `/delete/:notificationId`

**Description**: 📘 DELETE /api/notifications/delete/:notificationId

**Paramètres**:
- `notificationId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

## 📁 Fichier: `reservations.js`

### GET `/occupation`

**Description**: /

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### PUT `/validate/:id`

**Description**: /

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### GET `/occupation/roles`

**Description**: /

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/occupation/semaine`

**Description**: /

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/all`

**Description**: /

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### POST `/create`

**Description**: /

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyMinimumRole`

---

### DELETE `/delete/:id`

**Description**: /

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### PUT `/assign/:id`

**Description**: /

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### PUT `/update/:id`

**Description**: PUT /api/reservations/update/:id - Modification avec notifications (MEDIUM)

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

## 📁 Fichier: `rooms.js`

### GET `/ping`

**Description**: Aucune description disponible

**Handler**: `res`

---

### POST `/admin-only`

**Description**: 🔒 Test accès admin-only

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/responsables`

**Description**: 🔍 Liste des salles avec leur responsable

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/overview`

**Description**: 🔹 Vue planning par salle — toutes les salles

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/:id/planning`

**Description**: 🔹 Vue planning d'une seule salle

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/disponibles`

**Description**: ROUTE DÉPLACÉE : /disponibles doit être avant /:id pour éviter les conflits

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/dashboard`

**Description**: Aucune description disponible

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### PUT `/update/:roomId`

**Description**: Aucune description disponible

**Paramètres**:
- `roomId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### GET `/stats`

**Description**: Aucune description disponible

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/stats/by-hour`

**Description**: Aucune description disponible

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/stats/roles`

**Description**: Aucune description disponible

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### GET `/stats/semaine`

**Description**: Aucune description disponible

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### DELETE `/delete/:roomId`

**Description**: Aucune description disponible

**Paramètres**:
- `roomId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### GET `/:id`

**Description**: ROUTE DÉPLACÉE EN DERNIER : /:id doit être après toutes les routes spécifiques

**Paramètres**:
- `id` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

## 📁 Fichier: `users.js`

### GET `/registry`

**Description**: 🔹 GET /api/reservations : Vue filtrée + pagination

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyRole`

---

### POST `/register`

**Description**: 🔹 POST /api/reservations : Création sécurisée avec hiérarchie de rôles

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `verifyMinimumRole`

---

### PUT `/update/:userId`

**Description**: Aucune description disponible

**Paramètres**:
- `userId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

### PUT `/update/:userId`

**Description**: 🔧 PUT /api/reservations/:id : Mise à jour du statut

**Paramètres**:
- `userId` (path) - Requis

**Middleware**: Authentication

**Sécurité**: JWT Token Required

**Handler**: `autoAudit`

---

## 📈 Statistiques par méthode HTTP

- **GET**: 29 route(s)
- **POST**: 5 route(s)
- **DELETE**: 4 route(s)
- **PUT**: 6 route(s)

## 🔒 Analyse de sécurité

### Routes publiques (5)
- `POST /login`
- `GET /meta`
- `GET /version`
- `GET /info`
- `GET /ping`

### Routes sécurisées (39)
- `GET /`
- `GET /filter`
- `GET /stats/summary`
- `GET /entity/:type/:id`
- `GET /user-actions/:id`
- `GET /advanced-search`
- `GET /:id`
- `GET /self`
- `GET /user/:userId`
- `POST /read/:notificationId`
- `GET /`
- `DELETE /by-room/:roomId`
- `DELETE /delete/:notificationId`
- `GET /occupation`
- `PUT /validate/:id`
- `GET /occupation/roles`
- `GET /occupation/semaine`
- `GET /all`
- `POST /create`
- `DELETE /delete/:id`
- `PUT /assign/:id`
- `PUT /update/:id`
- `POST /admin-only`
- `GET /responsables`
- `GET /overview`
- `GET /:id/planning`
- `GET /disponibles`
- `GET /dashboard`
- `PUT /update/:roomId`
- `GET /stats`
- `GET /stats/by-hour`
- `GET /stats/roles`
- `GET /stats/semaine`
- `DELETE /delete/:roomId`
- `GET /:id`
- `GET /registry`
- `POST /register`
- `PUT /update/:userId`
- `PUT /update/:userId`

---

*Rapport généré par routes-analyzer.js*