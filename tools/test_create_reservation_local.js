const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0] ? Number(args[0]) : 6;
  const roomId = args[1] ? Number(args[1]) : 3;

  try {
    const db = require('../models');
    const { Reservation, User, Room, Setting, Notification } = db;
    const emailService = require('../services/emailService');

    await db.sequelize.authenticate();
    console.log('✅ Connexion DB OK');

    // Create reservation
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const newRes = await Reservation.create({
      user_id: userId,
      room_id: roomId,
      date_debut: start,
      date_fin: end,
      statut: 'en_attente',
      motif: 'Test automatique'
    });
    console.log('✅ Réservation créée id=', newRes.id);

    // Notifications logic (copié du route)
    let settings = null;
    try { settings = await Setting.getSettings(); } catch (e) { console.warn('⚠️ Impossible de lire settings', e && e.message); }

    const salle = await Room.findByPk(roomId, { include: [{ model: User, as: 'responsable', attributes: ['id', 'email'] }] });
    const admins = await User.findAll({ where: { role: 'admin' } });

    const recipientIds = new Set();
    if (salle && salle.responsable && salle.responsable.id) {
      if (!(settings && settings.suppress_admin_if_responsable_notified)) {
        for (const admin of admins) recipientIds.add(admin.id);
      }
      recipientIds.add(salle.responsable.id);
    } else {
      const responsablesGlobal = await User.findAll({ where: { role: { [require('sequelize').Op.in]: ['responsable', 'responsable_salle'] } } });
      for (const r of responsablesGlobal) recipientIds.add(r.id);
      for (const admin of admins) recipientIds.add(admin.id);
    }

    // Create notifications and attempt to send emails to admins only
    for (const userIdDest of recipientIds) {
      await Notification.create({
        user_id: userIdDest,
        type: 'new_reservation',
        titre: 'Nouvelle demande de réservation',
        message: `Test: réservation ${newRes.id}`,
        reservation_id: newRes.id,
        lu: false
      }).catch(e => console.warn('Erreur création notification', e && e.message));

      try {
        const user = await User.findByPk(userIdDest);
        if (user && user.role === 'admin') {
          // send email via emailService but ignore errors
          await emailService.sendNewReservationToAdmins(user.email, {
            userName: 'Test User',
            userEmail: 'test@example.com',
            roomName: salle?.nom || `Salle #${roomId}`,
            date: newRes.date_debut,
            startTime: newRes.date_debut,
            endTime: newRes.date_fin,
            motif: newRes.motif,
            department: null
          }).catch(err => console.warn('Erreur envoi email (ok en test):', err && err.message));
        }
      } catch (e) {
        console.warn('Erreur lookup user/email:', e && e.message);
      }
    }

    const notifs = await Notification.findAll({ where: { reservation_id: newRes.id }, order: [['created_at', 'ASC']] });
    console.log('Notifications créées pour reservation', newRes.id, notifs.map(n => ({ id: n.id, user_id: n.user_id, type: n.type, titre: n.titre })) );

    process.exit(0);
  } catch (err) {
    console.error('Erreur script test_create_reservation_local:', err);
    process.exit(1);
  }
}

main();
