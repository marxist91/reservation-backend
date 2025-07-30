const { Reservation, Room } = require("../models");

module.exports = function verifyRoleOrOwner() {
  return async function (req, res, next) {
    try {
      const user = req.user;
      const reservationId = req.params.id;

      if (!user) {
        return res.status(401).json({ error: "⛔ Utilisateur non authentifié" });
      }

      // ✅ Admin : accès total
      if (user.role === "admin") return next();

      // ⚙️ Recherche de la réservation
      const reservation = await Reservation.findByPk(reservationId, {
        include: { model: Room, as: "salle" }
      });

      if (!reservation) {
        return res.status(404).json({ error: "📛 Réservation introuvable" });
      }

      // ✅ Responsable de salle : accès si sa salle
      if (user.role === "responsable_salle" && user.id === reservation.salle.responsable_id) {
        return next();
      }

      return res.status(403).json({ error: "⛔ Accès interdit" });
    } catch (error) {
      console.error("❌ Erreur middleware verifyRoleOrOwner :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
};