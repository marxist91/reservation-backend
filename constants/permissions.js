// 🔐 Rôles métier définis
exports.USER_ROLES = [
  "admin",
  "responsable_salle",
  "utilisateur"
];

// 📊 Statuts métier des réservations
exports.RESERVATION_STATUTS = [
  "en_attente",
  "validée",
  "annulée"
];
exports.ROLE_LEVEL = {
  super_admin: 5,        // 🔥 Accès total, configuration, audit
  admin: 4,              // 🛡️ Gestion des utilisateurs, validations, stats
  directeur: 3,          // 🎯 Vision globale, accès analytique et stratégique
  chef_service: 2,       // 🧭 Supervision sectorielle, dashboards dédiés
  responsable_salle: 1,  // 🧑‍💼 Opérations, planification, validation de salle
  utilisateur: 0         // 👤 Demandeur, accès limité à ses propres données
};

// Réservations (lecture, validation)
exports.ROLES_RESERVATION_VIEW = ["admin", "responsable_salle"];
exports.ROLES_RESERVATION_VALIDATION = ["admin", "responsable_salle"];
exports.ROLES_RESERVATION_CREATION = ["utilisateur", "responsable_salle", "admin"];
 //exports.ROLES_NOTIFICATION_VIEW= ["admin", "utilisateur"]


// Salles
exports.ROLES_ROOM_VIEW = ["admin", "responsable_salle"];
exports.ROLES_ROOM_ASSIGNMENT = ["admin"];

// Utilisateurs
exports.ROLES_USER_LIST = ["admin"];
exports.ROLES_USER_DETAILS = ["admin"];
exports.ROLES_USER_MANAGEMENT = ["admin"];
exports.ROLES_USER_UPDATE= ["admin", "gestionnaire"]

 
// Dashboard / statistiques (à venir)
exports.ROLES_ANALYTICS_ACCESS = ["admin", "responsable_salle"];






const ROLES_RESERVATION_VALIDATION = ["admin", "responsable_salle"];