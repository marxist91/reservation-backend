const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/verifyRole');
const { RecurringMeeting, Room, User, Reservation } = require('../models');
const { Op } = require('sequelize');

const ROLES_ADMIN = ['admin', 'responsable'];

// Jours de la semaine en français
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/**
 * GET /api/recurring-meetings
 * Récupérer toutes les réunions récurrentes
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const meetings = await RecurringMeeting.findAll({
      include: [
        { model: Room, as: 'room', attributes: ['id', 'nom', 'etage'] },
        { model: User, as: 'organizer', attributes: ['id', 'nom', 'prenom'] }
      ],
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });

    // Ajouter le nom du jour en français
    const formattedMeetings = meetings.map(m => {
      const data = m.toJSON();
      return {
        ...data,
        day_name: DAYS_FR[data.day_of_week]
      };
    });

    res.json(formattedMeetings);
  } catch (error) {
    console.error('Erreur récupération réunions récurrentes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/recurring-meetings
 * Créer une nouvelle réunion récurrente
 */
router.post('/', authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const { 
      name, 
      day_of_week, 
      start_time, 
      end_time, 
      room_id, 
      description,
      start_date,
      end_date,
      auto_validate,
      color,
      department_id
    } = req.body;

    // Validation
    if (!name || day_of_week === undefined || !start_time || !end_time || !room_id) {
      return res.status(400).json({ 
        error: 'Champs requis: name, day_of_week, start_time, end_time, room_id' 
      });
    }

    // Vérifier que la salle existe
    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }

    // Vérifier s'il n'y a pas déjà une réunion récurrente au même moment
    const existingMeeting = await RecurringMeeting.findOne({
      where: {
        room_id,
        day_of_week,
        is_active: true,
        [Op.or]: [
          {
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time }
          }
        ]
      }
    });

    if (existingMeeting) {
      return res.status(409).json({ 
        error: `Une réunion récurrente existe déjà à ce créneau: ${existingMeeting.name}` 
      });
    }

    // Créer la réunion récurrente
    const meeting = await RecurringMeeting.create({
      name,
      day_of_week,
      start_time,
      end_time,
      room_id,
      description: description || null,
      organizer_id: req.user.id,
      department_id: department_id || null,
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || null,
      auto_validate: auto_validate !== false,
      color: color || '#1976d2',
      is_active: true
    });

    console.log(`📅 Réunion récurrente créée: ${name} - ${DAYS_FR[day_of_week]} ${start_time}-${end_time}`);

    // Générer les réservations pour les prochains mois
    const generatedCount = await generateReservationsForMeeting(meeting, 12); // 12 mois

    res.status(201).json({
      message: `Réunion récurrente créée avec succès. ${generatedCount} réservations générées.`,
      meeting: meeting.toJSON(),
      reservations_generated: generatedCount
    });
  } catch (error) {
    console.error('❌ Erreur création réunion récurrente:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

/**
 * PUT /api/recurring-meetings/:id
 * Modifier une réunion récurrente
 */
router.put('/:id', authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const meeting = await RecurringMeeting.findByPk(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Réunion récurrente non trouvée' });
    }

    const allowedFields = ['name', 'description', 'end_date', 'is_active', 'auto_validate', 'color'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await meeting.update(updates);

    res.json({
      message: 'Réunion récurrente mise à jour',
      meeting: meeting.toJSON()
    });
  } catch (error) {
    console.error('Erreur modification réunion récurrente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/recurring-meetings/:id
 * Supprimer une réunion récurrente
 */
router.delete('/:id', authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const meeting = await RecurringMeeting.findByPk(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Réunion récurrente non trouvée' });
    }

    const { delete_future_reservations } = req.query;

    // Supprimer les réservations futures si demandé
    if (delete_future_reservations === 'true') {
      const today = new Date().toISOString().split('T')[0];
      const deleted = await Reservation.destroy({
        where: {
          recurring_meeting_id: meeting.id,
          date_debut: { [Op.gte]: today }
        }
      });
      console.log(`🗑️ ${deleted} réservations futures supprimées pour la réunion ${meeting.name}`);
    }

    await meeting.destroy();

    res.json({ message: 'Réunion récurrente supprimée' });
  } catch (error) {
    console.error('Erreur suppression réunion récurrente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/recurring-meetings/:id/generate
 * Régénérer les réservations pour une réunion récurrente
 */
router.post('/:id/generate', authMiddleware, verifyRole(ROLES_ADMIN), async (req, res) => {
  try {
    const meeting = await RecurringMeeting.findByPk(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Réunion récurrente non trouvée' });
    }

    const { months = 12 } = req.body;
    const generatedCount = await generateReservationsForMeeting(meeting, months);

    res.json({
      message: `${generatedCount} réservations générées pour les ${months} prochains mois`,
      count: generatedCount
    });
  } catch (error) {
    console.error('Erreur génération réservations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Fonction utilitaire pour générer les réservations
 */
async function generateReservationsForMeeting(meeting, months = 12) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  // Si la réunion a une date de fin, l'utiliser
  if (meeting.end_date) {
    const meetingEndDate = new Date(meeting.end_date);
    if (meetingEndDate < endDate) {
      endDate.setTime(meetingEndDate.getTime());
    }
  }

  let generatedCount = 0;
  let currentDate = new Date(startDate);

  // Trouver le premier jour correspondant
  while (currentDate.getDay() !== meeting.day_of_week) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Construire les datetime complets
    const startDateTime = new Date(`${dateStr}T${meeting.start_time}`);
    const endDateTime = new Date(`${dateStr}T${meeting.end_time}`);

    // Vérifier si une réservation existe déjà pour ce jour et cette salle
    const existingReservation = await Reservation.findOne({
      where: {
        room_id: meeting.room_id,
        date_debut: {
          [Op.gte]: new Date(`${dateStr}T00:00:00`),
          [Op.lt]: new Date(`${dateStr}T23:59:59`)
        },
        recurring_meeting_id: meeting.id
      }
    });

    if (!existingReservation) {
      try {
        await Reservation.create({
          room_id: meeting.room_id,
          user_id: meeting.organizer_id || 1, // Admin par défaut
          department_id: meeting.department_id || null,
          date_debut: startDateTime,
          date_fin: endDateTime,
          motif: meeting.name,
          statut: meeting.auto_validate ? 'validee' : 'en_attente',
          recurring_meeting_id: meeting.id,
          nombre_participants: 10 // Valeur par défaut pour les réunions
        });
        generatedCount++;
      } catch (createError) {
        console.error(`Erreur création réservation pour ${dateStr}:`, createError.message);
      }
    }

    // Passer à la semaine suivante
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return generatedCount;
}

module.exports = router;
