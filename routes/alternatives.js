const express = require('express');
const router = express.Router();
const { ProposedAlternative, Reservation, Room, User, Notification, sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

// GET /api/alternatives/pending - Récupérer les propositions en attente pour l'utilisateur connecté
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 GET /alternatives/pending - User ID:', req.user.id);
    
    // Récupérer les IDs des réservations de l'utilisateur
    const userReservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      attributes: ['id']
    });
    
    const reservationIds = userReservations.map(r => r.id);
    console.log('🔍 Reservation IDs de l\'utilisateur:', reservationIds);

    if (reservationIds.length === 0) {
      console.log('⚠️ Aucune réservation trouvée pour cet utilisateur');
      return res.json([]);
    }

    // Récupérer les propositions alternatives en attente
    const alternatives = await ProposedAlternative.findAll({
      where: {
        original_reservation_id: reservationIds,
        status: 'pending'
      },
      include: [
        {
          model: Reservation,
          as: 'originalReservation',
          include: [
            {
              model: Room,
              as: 'salle'
            }
          ]
        },
        {
          model: Room,
          as: 'proposedRoom'
        },
        {
          model: User,
          as: 'proposer',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Propositions alternatives trouvées:', alternatives.length);
    res.json(alternatives);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des propositions alternatives:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// POST /api/alternatives/:id/accept - Accepter une proposition alternative
router.post('/:id/accept', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const alternativeId = parseInt(req.params.id);

    // Récupérer la proposition avec les détails
    const alternative = await ProposedAlternative.findByPk(alternativeId, {
      include: [
        {
          model: Reservation,
          as: 'originalReservation'
        },
        {
          model: Room,
          as: 'proposedRoom'
        },
        {
          model: User,
          as: 'proposer',
          attributes: ['id', 'prenom', 'nom', 'email', 'role']
        }
      ],
      transaction
    });

    if (!alternative) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Proposition non trouvée' });
    }

    // Vérifier que l'utilisateur est bien le propriétaire de la réservation originale
    if (alternative.originalReservation.user_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Non autorisé à accepter cette proposition' });
    }

    // Vérifier que la proposition est toujours en attente
    if (alternative.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cette proposition a déjà été traitée' });
    }

    // Créer une nouvelle réservation avec la salle alternative
    const newReservation = await Reservation.create({
      user_id: req.user.id,
      room_id: alternative.proposed_room_id,
      date_debut: alternative.proposed_date_debut,
      date_fin: alternative.proposed_date_fin,
      statut: 'validee', // Directement validée car c'est une proposition administrative
      motif: alternative.originalReservation.motif || 'Réservation alternative acceptée',
      nombre_participants: alternative.originalReservation.nombre_participants,
      department_id: alternative.originalReservation.department_id
    }, { transaction });

    // Mettre à jour le statut de la proposition
    alternative.status = 'accepted';
    alternative.responded_at = new Date();
    await alternative.save({ transaction });

    // Charger l'utilisateur complet pour les notifications
    const currentUser = await User.findByPk(req.user.id, { transaction });

    // Créer des notifications
    // 1. Pour l'utilisateur
    await Notification.create({
      user_id: req.user.id,
      type: 'alternative_accepted',
      titre: 'Alternative acceptée',
      message: `Votre nouvelle réservation a été créée automatiquement. Salle: ${alternative.proposedRoom.nom}, Date: ${new Date(alternative.proposed_date_debut).toLocaleDateString('fr-FR')}`,
      reservation_id: newReservation.id,
      lu: false
    }, { transaction });

    // 2. Pour l'admin qui a proposé l'alternative
    if (alternative.proposed_by && alternative.proposer) {
      await Notification.create({
        user_id: alternative.proposed_by,
        type: 'alternative_accepted',
        titre: 'Proposition alternative acceptée',
        message: `${currentUser.prenom} ${currentUser.nom} a accepté votre proposition alternative pour la salle ${alternative.proposedRoom.nom}`,
        reservation_id: newReservation.id,
        lu: false
      }, { transaction });

      // Envoyer email à l'admin qui a proposé l'alternative
      try {
        await emailService.sendAlternativeAccepted(alternative.proposer.email, {
          proposerName: `${alternative.proposer.prenom} ${alternative.proposer.nom}`,
          userName: `${currentUser.prenom} ${currentUser.nom}`,
          roomName: alternative.proposedRoom.nom,
          date: new Date(alternative.proposed_date_debut).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: `${new Date(alternative.proposed_date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(alternative.proposed_date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
        });
        console.log(`📧 Email d'acceptation envoyé à ${alternative.proposer.email}`);
      } catch (emailError) {
        console.error("⚠️ Erreur envoi email d'acceptation:", emailError.message);
      }
    }

    await transaction.commit();

    res.json({
      message: 'Proposition acceptée avec succès',
      newReservation
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'acceptation de la proposition:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// POST /api/alternatives/:id/reject - Refuser une proposition alternative
router.post('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const alternativeId = parseInt(req.params.id);

    // Récupérer la proposition
    const alternative = await ProposedAlternative.findByPk(alternativeId, {
      include: [
        {
          model: Reservation,
          as: 'originalReservation'
        }
      ]
    });

    if (!alternative) {
      return res.status(404).json({ message: 'Proposition non trouvée' });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (alternative.originalReservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à refuser cette proposition' });
    }

    // Vérifier que la proposition est toujours en attente
    if (alternative.status !== 'pending') {
      return res.status(400).json({ message: 'Cette proposition a déjà été traitée' });
    }

    // Mettre à jour le statut
    alternative.status = 'rejected';
    alternative.responded_at = new Date();
    await alternative.save();

    // Notifier l'admin qui a proposé l'alternative
    if (alternative.proposed_by) {
      await Notification.create({
        user_id: alternative.proposed_by,
        type: 'alternative_rejected',
        titre: 'Proposition alternative refusée',
        message: `${req.user.prenom} ${req.user.nom} a refusé votre proposition alternative`,
        lu: false
      });
    }

    res.json({
      message: 'Proposition refusée'
    });
  } catch (error) {
    console.error('Erreur lors du refus de la proposition:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET /api/alternatives/available-rooms - Récupérer les salles disponibles pour une date/heure donnée
router.get('/available-rooms', authenticateToken, async (req, res) => {
  try {
    const { date, startTime, endTime, excludeReservationId } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, heure de début et heure de fin sont obligatoires' });
    }

    // Construire les timestamps
    const dateDebut = `${date} ${startTime}`;
    const dateFin = `${date} ${endTime}`;

    // Récupérer toutes les salles
    const allRooms = await Room.findAll({
      where: { statut: 'disponible' }
    });

    // Récupérer les réservations qui chevauchent cette période
    const { Op } = require('sequelize');
    const conflictingReservations = await Reservation.findAll({
      where: {
        id: excludeReservationId ? { [Op.ne]: excludeReservationId } : undefined,
        statut: {
          [Op.in]: ['en_attente', 'validee']
        },
        [Op.or]: [
          {
            // Cas 1: La réservation commence pendant notre créneau
            date_debut: {
              [Op.between]: [dateDebut, dateFin]
            }
          },
          {
            // Cas 2: La réservation se termine pendant notre créneau
            date_fin: {
              [Op.between]: [dateDebut, dateFin]
            }
          },
          {
            // Cas 3: La réservation englobe totalement notre créneau
            [Op.and]: [
              { date_debut: { [Op.lte]: dateDebut } },
              { date_fin: { [Op.gte]: dateFin } }
            ]
          }
        ]
      },
      attributes: ['room_id']
    });

    // Extraire les IDs de salles occupées
    const occupiedRoomIds = conflictingReservations.map(r => r.room_id);

    // Filtrer les salles disponibles
    const availableRooms = allRooms.filter(room => !occupiedRoomIds.includes(room.id));

    res.json(availableRooms);
  } catch (error) {
    console.error('Erreur lors de la récupération des salles disponibles:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

module.exports = router;
