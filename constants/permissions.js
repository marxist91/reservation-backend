//  Rôles métier définis
exports.USER_ROLES = [
  "admin",
  "responsable",
  "user"
];

//  Statuts métier des réservations
exports.RESERVATION_STATUTS = [
  "en_attente",
  "validée",
  "annulée"
];

exports.ROLE_LEVEL = {
  admin: 2,
  responsable: 1,
  user: 0
};

// Réservations (lecture, validation)
exports.ROLES_RESERVATION_VIEW = ["admin", "responsable", "user"];
exports.ROLES_RESERVATION_VALIDATION = ["admin", "responsable"];
exports.ROLES_RESERVATION_CREATION = ["user", "responsable", "admin"];

// Salles
exports.ROLES_ROOM_VIEW = ["admin", "responsable", "user"];
exports.ROLES_ROOM_ASSIGNMENT = ["admin"];
exports.ROLES_ROOM_UPDATE = ["admin", "responsable"];

// Utilisateurs
exports.ROLES_USER_LIST = ["admin"];
exports.ROLES_USER_DETAILS = ["admin"];
exports.ROLES_USER_MANAGEMENT = ["admin"];
exports.ROLES_USER_UPDATE = ["admin"];

// Dashboard / statistiques
exports.ROLES_ANALYTICS_ACCESS = ["admin", "responsable"];
