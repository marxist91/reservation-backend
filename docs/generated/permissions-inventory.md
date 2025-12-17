# 🔐 Inventaire des Permissions

> Rapport généré automatiquement le 28/07/2025

## 📊 Résumé

- **Permissions uniques identifiées**: 1
- **Fichiers middleware analysés**: 1
- **Fichiers routes analysés**: 5
- **Date d'analyse**: 2025-07-28T02:35:51.324Z

---

## 🎯 Liste des permissions

| Permission | Type | Description | Utilisée dans |
|------------|------|-------------|---------------|
| `admin` | role | Accès administrateur complet | middleware/auth.js |

---

## 🛡️ Middleware de permissions

### 📁 `auth.js`

**Permissions détectées**:
- `admin` (role) - Accès administrateur complet

## 🛣️ Permissions dans les routes

### 📁 `audit.js`

- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`

### 📁 `notifications.js`

- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`

### 📁 `reservations.js`

- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`

### 📁 `rooms.js`

- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`

### 📁 `users.js`

- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`
- **UNKNOWN `unknown`** - Middleware: `authMiddleware`

## 📈 Statistiques par type

- **role**: 1 permission(s)

## 🔒 Recommandations de sécurité

### Bonnes pratiques recommandées:
- Utilisez le principe du moindre privilège
- Implémentez une authentification JWT robuste
- Validez les permissions à chaque requête sensible
- Loggez les tentatives d'accès non autorisées
- Effectuez des audits réguliers des permissions

---

*Rapport généré par permissions-inventory.js*