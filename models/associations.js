// models/associations.js - Configuration des associations avec audit

// Fonction qui sera appelée après l'initialisation des modèles
const setupAssociations = (models) => {
  const { User, Room, Reservation, AuditLog, Department, ProposedAlternative } = models;

  // ⚠️ IMPORTANT : Les associations principales sont déjà définies dans les modèles individuels
  // On ajoute seulement l'association AuditLog -> User qui n'est pas définie ailleurs

  // Association entre AuditLog et User (seule association supplémentaire nécessaire)
  AuditLog.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'auteur', // Alias unique pour éviter les conflits
    constraints: false // Permet les valeurs nulles pour les actions système
  });

  // Note: ProposedAlternative.associate() est déjà appelé automatiquement par models/index.js
  // Pas besoin de l'appeler ici pour éviter les associations en double

  // Note : Toutes les autres associations sont déjà définies dans :
  // - User.js : User.hasMany(Reservation), User.hasMany(AuditLog), User.hasMany(Room)
  // - Reservation.js : Reservation.belongsTo(User), Reservation.belongsTo(Room)
  // - Room.js devrait avoir : Room.hasMany(Reservation)

  // Hooks d'audit automatique pour les modèles principaux
  // Skip audit hooks in test environment
  if (process.env.NODE_ENV === 'test' && process.env.AUDIT_ENABLED === 'false') {
    console.log('🧪 Audit hooks désactivés pour les tests');
    return;
  }

  // Hooks pour User
  User.addHook('afterCreate', async (user, options) => {
    try {
      await AuditLog.logAction({
        action: 'CREATE_USER',
        user_id: options.user_id || null, // ID de l'admin qui a créé l'utilisateur
        cible_type: 'User',
        cible_id: user.id,
        nouvel_etat: user.toJSON(),
        details: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterCreate User:', error);
    }
  });

  User.addHook('afterUpdate', async (user, options) => {
    try {
      await AuditLog.logAction({
        action: 'UPDATE_USER',
        user_id: options.user_id || user.id,
        cible_type: 'User',
        cible_id: user.id,
        ancien_etat: user._previousDataValues,
        nouvel_etat: user.toJSON(),
        details: {
          champs_modifies: Object.keys(user.changed() || {})
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterUpdate User:', error);
    }
  });

  User.addHook('afterDestroy', async (user, options) => {
    try {
      await AuditLog.logAction({
        action: 'DELETE_USER',
        user_id: options.user_id || null,
        cible_type: 'User',
        cible_id: user.id,
        ancien_etat: user.toJSON(),
        details: {
          email_supprime: user.email,
          nom_supprime: `${user.prenom} ${user.nom}`
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterDestroy User:', error);
    }
  });

  // Hooks pour Room
  Room.addHook('afterCreate', async (room, options) => {
    try {
      await AuditLog.logAction({
        action: 'CREATE_ROOM',
        user_id: options.user_id || null,
        cible_type: 'Room',
        cible_id: room.id,
        nouvel_etat: room.toJSON(),
        details: {
          nom: room.nom,
          capacite: room.capacite
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterCreate Room:', error);
    }
  });

  Room.addHook('afterUpdate', async (room, options) => {
    try {
      await AuditLog.logAction({
        action: 'UPDATE_ROOM',
        user_id: options.user_id || null,
        cible_type: 'Room',
        cible_id: room.id,
        ancien_etat: room._previousDataValues,
        nouvel_etat: room.toJSON(),
        details: {
          champs_modifies: Object.keys(room.changed() || {})
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterUpdate Room:', error);
    }
  });

  // Hooks pour Reservation - CORRIGÉ : utilise user_id et room_id
  Reservation.addHook('afterCreate', async (reservation, options) => {
    try {
      await AuditLog.logAction({
        action: 'CREATE_RESERVATION',
        user_id: reservation.user_id, // CORRIGÉ : user_id au lieu de utilisateur_id
        cible_type: 'Reservation',
        cible_id: reservation.id,
        nouvel_etat: reservation.toJSON(),
        details: {
          salle_id: reservation.room_id, // CORRIGÉ : room_id au lieu de salle_id
          date: reservation.date,
          department_id: reservation.department_id || null,
          horaire: `${reservation.heure_debut}-${reservation.heure_fin}`,
          statut: reservation.statut
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterCreate Reservation:', error);
    }
  });

  Reservation.addHook('afterUpdate', async (reservation, options) => {
    try {
      const changedFields = reservation.changed() || {};
      const details = {
        champs_modifies: Object.keys(changedFields)
      };
      
      // Détails spécifiques pour les changements importants
      if (changedFields.statut) {
        details.ancien_statut = reservation._previousDataValues.statut;
        details.nouveau_statut = reservation.statut;
      }
      
      if (changedFields.date) {
        details.ancienne_date = reservation._previousDataValues.date;
        details.nouvelle_date = reservation.date;
      }
      
      await AuditLog.logAction({
        action: 'UPDATE_RESERVATION',
        user_id: options.user_id || reservation.user_id, // CORRIGÉ : user_id
        cible_type: 'Reservation',
        cible_id: reservation.id,
        ancien_etat: reservation._previousDataValues,
        nouvel_etat: reservation.toJSON(),
        details
      });
    } catch (error) {
      console.error('❌ Erreur audit afterUpdate Reservation:', error);
    }
  });

  Reservation.addHook('afterDestroy', async (reservation, options) => {
    try {
      await AuditLog.logAction({
        action: 'DELETE_RESERVATION',
        user_id: options.user_id || null,
        cible_type: 'Reservation',
        cible_id: reservation.id,
        ancien_etat: reservation.toJSON(),
        details: {
          salle_id: reservation.room_id, // CORRIGÉ : room_id au lieu de salle_id
          date: reservation.date,
          utilisateur_id: reservation.user_id, // CORRIGÉ : user_id
          statut_avant_suppression: reservation.statut
        }
      });
    } catch (error) {
      console.error('❌ Erreur audit afterDestroy Reservation:', error);
    }
  });

  console.log('✅ Associations de modèles avec audit configurées');
};

// Fonction utilitaire pour passer l'ID utilisateur aux hooks
const withAuditUser = (userId) => {
  return { user_id: userId };
};

module.exports = {
  setupAssociations,
  withAuditUser
};