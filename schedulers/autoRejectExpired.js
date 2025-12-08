const { Reservation, Room, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Annule automatiquement les réservations en attente dont l'heure est dépassée
 * 
 * NOTE: Les notifications et l'historique sont gérés côté frontend (Zustand stores)
 * Les utilisateurs verront les changements au prochain chargement de la page
 */
const autoRejectExpiredReservations = async () => {
  try {
    const now = new Date();

    // Trouver toutes les réservations en attente dont date_debut est passée
    const expiredReservations = await Reservation.findAll({
      where: {
        statut: 'en_attente',
        date_debut: {
          [Op.lt]: now // Comparaison directe avec la date/heure actuelle
        }
      },
      include: [
        {
          model: Room,
          as: 'salle',
          attributes: ['id', 'nom']
        },
        {
          model: User,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ]
    });

    if (expiredReservations.length > 0) {
      console.log(`🕐 [AUTO-REJECT] ${expiredReservations.length} réservation(s) expirée(s) trouvée(s)`);

      // Mettre à jour chaque réservation
      for (const reservation of expiredReservations) {
        await reservation.update({
          statut: 'annulee',
          motif: reservation.motif ? `${reservation.motif} (Annulée automatiquement - délai de validation dépassé)` : 'Annulation automatique - délai de validation dépassé'
        });

        console.log(`   ✅ Réservation #${reservation.id} annulée automatiquement`);
        console.log(`      - Utilisateur: ${reservation.utilisateur?.prenom} ${reservation.utilisateur?.nom}`);
        console.log(`      - Salle: ${reservation.salle?.nom}`);
        console.log(`      - Date: ${reservation.date_debut}`);
        
        // TODO: Implémenter système de notifications backend pour informer l'utilisateur en temps réel
      }

      console.log(`🎯 [AUTO-REJECT] ${expiredReservations.length} réservation(s) annulée(s) avec succès`);
    }

    return expiredReservations.length;
  } catch (error) {
    console.error('❌ [AUTO-REJECT] Erreur lors de l\'annulation automatique:', error);
    return 0;
  }
};

/**
 * Démarre le scheduler pour vérifier toutes les 5 minutes
 */
const startAutoRejectScheduler = () => {
  // Exécuter immédiatement au démarrage
  autoRejectExpiredReservations();

  // Puis toutes les 5 minutes (300000 ms)
  const interval = setInterval(autoRejectExpiredReservations, 5 * 60 * 1000);

  console.log('⏰ [AUTO-REJECT] Scheduler démarré - vérification toutes les 5 minutes');

  return interval;
};

module.exports = {
  autoRejectExpiredReservations,
  startAutoRejectScheduler
};
