// tests/integration/routes/roomsBasic.test.js
const request = require('supertest');
const { createTestApp, closeTestServer } = require('../../helpers/testServer');

describe('🏢 Tests basiques des salles', () => {
  let testApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    console.log('🔧 Application de test initialisée pour les salles');
  });

  afterAll(async () => {
    if (closeTestServer) {
      await closeTestServer();
    }
  });

  describe('📋 Tests de base sans authentification', () => {
    test('GET /api/rooms - Accès refusé sans token', async () => {
      console.log('🧪 Test: Accès salles sans authentification');

      const response = await request(testApp)
        .get('/api/rooms');

      console.log('📊 Status:', response.status);
      console.log('✅ Réponse:', response.body);

      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toBeDefined();
    });

    test('POST /api/rooms - Création refusée sans token', async () => {
      console.log('🧪 Test: Création salle sans authentification');

      const nouvellesalle = {
        name: 'Salle Test',
        capacity: 20,
        location: 'Bâtiment A'
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .send(nouvellesalle);

      console.log('📊 Status:', response.status);
      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toBeDefined();
    });

    test('GET /api/rooms/1 - Détail salle refusé sans token', async () => {
      console.log('🧪 Test: Détail salle sans authentification');

      const response = await request(testApp)
        .get('/api/rooms/1');

      console.log('📊 Status:', response.status);
      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toBeDefined();
    });
  });

  describe('🔍 Tests des endpoints existants', () => {
    test('Vérification que les routes salles existent', async () => {
      console.log('🧪 Test: Vérification existence des routes salles');

      const routesToTest = [
        { method: 'GET', path: '/api/rooms' },
        { method: 'POST', path: '/api/rooms' },
        { method: 'GET', path: '/api/rooms/1' }
      ];

      const fakeToken = 'Bearer fake-token-for-testing';

      for (const route of routesToTest) {
        console.log(`🔍 Test de ${route.method} ${route.path}`);
        
        let response;
        
        if (route.method === 'GET') {
          response = await request(testApp)
            .get(route.path)
            .set('Authorization', fakeToken);
        } else if (route.method === 'POST') {
          response = await request(testApp)
            .post(route.path)
            .set('Authorization', fakeToken)
            .send({ name: 'Test' });
        }

        console.log(`📊 ${route.method} ${route.path} - Status: ${response.status}`);

        // Status 404 = route n'existe pas (problème)
        // Status 401/403 = route existe mais pas les permissions (bon signe)
        // Status 200/201 = route existe et fonctionne (excellent)
        expect(response.status).not.toBe(404);
      }

      console.log('✅ Routes salles détectées');
    });
  });
});