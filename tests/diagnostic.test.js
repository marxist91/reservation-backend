// tests/diagnostic.test.js
const request = require('supertest');
const express = require('express');

describe('🔍 Diagnostic des routes', () => {
  test('Diagnostic complet de l\'application', async () => {
    console.log('=== DIAGNOSTIC COMPLET ===');
    
    try {
      // 1. Vérifier si testServer fonctionne
      const { createTestApp } = require('./helpers/testServer');
      const testApp = await createTestApp();
      
      console.log('✅ testApp créée avec succès');
      console.log('Type de testApp:', typeof testApp);
      console.log('testApp est une fonction Express?', typeof testApp === 'function');
      
      // 2. Lister toutes les routes enregistrées
      console.log('\n📋 Routes enregistrées dans l\'application:');
      if (testApp._router && testApp._router.stack) {
        testApp._router.stack.forEach((layer, index) => {
          console.log(`Route ${index}:`, {
            regexp: layer.regexp.toString(),
            keys: layer.keys,
            methods: layer.route ? Object.keys(layer.route.methods) : 'middleware'
          });
        });
      } else {
        console.log('❌ Aucun router trouvé dans l\'application');
      }
      
      // 3. Test de route de base
      console.log('\n🧪 Test de route de base:');
      const response = await request(testApp)
        .get('/')
        .end();
      
      console.log('Status de la route racine:', response.status);
      
      // 4. Test spécifique /api/rooms
      console.log('\n🧪 Test spécifique /api/rooms:');
      const roomsResponse = await request(testApp)
        .get('/api/rooms')
        .end();
      
      console.log('Status /api/rooms:', roomsResponse.status);
      console.log('Body /api/rooms:', roomsResponse.body);
      
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error.message);
      console.error('Stack:', error.stack);
    }
  });
  
  test('Test d\'une application Express basique', async () => {
    console.log('\n=== TEST APPLICATION EXPRESS BASIQUE ===');
    
    // Créer une app Express simple pour vérifier que les tests fonctionnent
    const app = express();
    app.use(express.json());
    
    // Route de test simple
    app.get('/test', (req, res) => {
      res.json({ message: 'Test OK' });
    });
    
    // Route /api/rooms simulée
    app.get('/api/rooms', (req, res) => {
      res.status(401).json({ error: 'Unauthorized' });
    });
    
    const response = await request(app)
      .get('/api/rooms');
      
    console.log('Status de l\'app de test:', response.status);
    expect(response.status).toBe(401); // Ceci devrait passer
  });
});