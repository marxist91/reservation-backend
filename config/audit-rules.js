module.exports = {
  Reservation: {
    update: "UPDATE_RESERVATION",
    validate: "VALIDATE_RESERVATION",
    delete: "DELETE_RESERVATION",
    assign: "ASSIGN_RESPONSABLE"
  },
  Room: {
    update: "UPDATE_ROOM",
    delete: "DELETE_ROOM"
  },
  User: {
    update: "UPDATE_USER",
    delete: "DELETE_USER"
  },
  Notification: {
    read: "READ_NOTIFICATION",
    delete: "DELETE_NOTIFICATION",
    deleteByRoom: "DELETE_NOTIFICATIONS_BY_ROOM"
  }
};