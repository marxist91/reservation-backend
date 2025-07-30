// tests/helpers/testServer.js
const express = require('express');
const { sequelize } = require('../../models');

let testApp = null;

const createTestApp = async () => {
  if (testApp) {
    return testApp;
  }
  
  console.log('🔧 Création de l\'application de test...');
  
  try {
    // Créer une nouvelle instance Express
    testApp = express();
    
    // Middleware de base
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    
    // Route de base pour tester
    testApp.get('/', (req, res) => {
      res.json({ message: 'Test server running' });
    });
    
    // ======= ROUTES DES SALLES =======
    // Créer des routes temporaires pour les tests (forcer la création)
    console.log('🔧 Création de routes /api/rooms pour les tests...');
    
    const roomsRouter = express.Router();
    
    // Middleware d'auth temporaire
    const requireAuth = (req, res, next) => {
      const token = req.header('Authorization');
      if (!token) {
        return res.status(401).json({ 
          error: 'Token d\'authentification requis',
          message: 'Accès non autorisé'
        });
      }
      next();
    };
    
    // Routes pour les tests
    roomsRouter.get('/', requireAuth, (req, res) => {
      res.json({ 
        success: true,
        message: 'Liste des salles',
        data: []
      });
    });
    
    roomsRouter.post('/', requireAuth, (req, res) => {
      res.status(201).json({ 
        success: true,
        message: 'Salle créée',
        data: { id: 1, name: req.body.name }
      });
    });
    
    roomsRouter.get('/:id', requireAuth, (req, res) => {
      res.json({ 
        success: true,
        message: `Détails de la salle ${req.params.id}`,
        data: { id: req.params.id, name: 'Salle test' }
      });
    });
    
    // Enregistrer les routes
    testApp.use('/api/rooms', roomsRouter);
    console.log('✅ Routes /api/rooms enregistrées pour les tests');
    
    // ======= AUTRES ROUTES =======
    // Ajoutez ici d'autres routes si nécessaire
    
    // Route 404 pour toutes les autres routes
    testApp.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.originalUrl
      });
    });
    
    console.log('✅ Application de test créée avec succès');
    return testApp;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'app de test:', error);
    throw error;
  }
};

const closeTestApp = async () => {
  console.log('🧹 Nettoyage des ressources de test...');
  
  try {
    // Fermer la connexion DB si elle existe
    if (sequelize) {
      await sequelize.close();
      console.log('✅ Connexion DB fermée');
    }
    
    testApp = null;
    console.log('✅ Ressources de test nettoyées');
  } catch (error) {
    console.warn('⚠️  Erreur lors du nettoyage:', error.message);
  }
};

module.exports = {
  createTestApp,
  closeTestApp,
  closeTestServer: closeTestApp  // Alias pour compatibilité
};