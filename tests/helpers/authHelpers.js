// tests/helpers/authHelpers.js

const jwt = require('jsonwebtoken');
const { User } = require('../../models');

/**
 * Crée des utilisateurs de test avec différents rôles
 */
async function createTestUsers() {
  const users = {};

  try {
    // Admin
    users.admin = await User.create({
      nom: 'Admin',
      prenom: 'Test',
      email: `admin-${Date.now()}@test.com`,
      password: 'hashedpassword123',
      role: 'admin'
    });

    // Responsable salle
    users.responsable = await User.create({
      nom: 'Responsable',
      prenom: 'Salle',
      email: `responsable-${Date.now()}@test.com`,
      password: 'hashedpassword123',
      role: 'responsable_salle'
    });

    // Utilisateur simple
    users.user = await User.create({
      nom: 'User',
      prenom: 'Simple',
      email: `user-${Date.now()}@test.com`,
      password: 'hashedpassword123',
      role: 'utilisateur'
    });

    console.log('✅ Utilisateurs de test créés');
    return users;

  } catch (error) {
    console.error('❌ Erreur création utilisateurs test:', error);
    throw error;
  }
}

/**
 * Génère les tokens JWT pour les utilisateurs
 */
function generateTokens(users) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  const tokens = {};

  Object.keys(users).forEach(role => {
    const user = users[role];
    tokens[role] = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      secret,
      { expiresIn: '1h' }
    );
  });

  console.log('✅ Tokens JWT générés');
  return tokens;
}

/**
 * Nettoie les utilisateurs de test
 */
async function cleanupTestUsers(users) {
  try {
    for (const user of Object.values(users)) {
      if (user && user.destroy) {
        await user.destroy();
      }
    }
    console.log('✅ Utilisateurs de test nettoyés');
  } catch (error) {
    console.error('⚠️ Erreur nettoyage utilisateurs:', error);
  }
}

/**
 * Crée une salle de test
 */
async function createTestRoom(responsableId, overrides = {}) {
  const { Room } = require('../../models');
  
  const roomData = {
    nom: `Salle Test ${Date.now()}`,
    description: 'Salle pour les tests automatisés',
    capacite: 20,
    equipements: ['video', 'wifi'],
    responsable_id: responsableId,
    ...overrides
  };

  try {
    const room = await Room.create(roomData);
    console.log('✅ Salle de test créée:', room.nom);
    return room;
  } catch (error) {
    console.error('❌ Erreur création salle test:', error);
    throw error;
  }
}

/**
 * Headers d'authentification pour les requêtes
 */
function authHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Données de salle valides pour les tests
 */
function validRoomData(responsableId) {
  return {
    nom: `Salle Valid ${Date.now()}`,
    description: 'Salle avec données valides',
    capacite: 15,
    equipements: ['tableau', 'wifi', 'video'],
    responsable_id: responsableId
  };
}

/**
 * Données de salle invalides pour les tests de validation
 */
function invalidRoomData() {
  return [
    {
      name: 'capacité négative',
      data: { nom: 'Salle Invalid', capacite: -5, responsable_id: 1 }
    },
    {
      name: 'nom manquant',
      data: { capacite: 10, responsable_id: 1 }
    },
    {
      name: 'capacité manquante',
      data: { nom: 'Salle Sans Capacité', responsable_id: 1 }
    },
    {
      name: 'responsable manquant',
      data: { nom: 'Salle Sans Responsable', capacite: 10 }
    },
    {
      name: 'responsable inexistant',
      data: { nom: 'Salle Responsable Fake', capacite: 10, responsable_id: 99999 }
    }
  ];
}

module.exports = {
  createTestUsers,
  generateTokens,
  cleanupTestUsers,
  createTestRoom,
  authHeaders,
  validRoomData,
  invalidRoomData
};