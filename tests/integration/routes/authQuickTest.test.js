// tests/integration/routes/authQuickTest.test.js

const request = require('supertest');
const { app, closeTestServer, createTestApp } = require('../../helpers/testServer');

describe('🔐 Test rapide des routes d\'authentification', () => {
  let testApp;
  
  beforeAll(async () => {
    // S'assurer que nous avons une app fonctionnelle
    testApp = app || createTestApp();
    console.log('🔧 Application de test initialisée pour les tests');
  });
  
  afterAll(async () => {
    await closeTestServer();
  });

  test('GET /api/auth/profile sans token devrait retourner 401', async () => {
    console.log('🧪 Test: /api/auth/profile sans token');
    
    if (!testApp) {
      throw new Error('Application de test non disponible');
    }
    
    const response = await request(testApp)
      .get('/api/auth/profile')
      .expect(401);

    console.log('📊 Status:', response.status);
    console.log('✅ Réponse:', response.body);
    expect(response.body.error).toBe('⛔ Token manquant ou invalide');
  });

  test('POST /api/auth/login avec données manquantes devrait retourner 400', async () => {
    console.log('🧪 Test: /api/auth/login avec données manquantes');
    
    const response = await request(testApp)
      .post('/api/auth/login')
      .send({})
      .expect(400);

    console.log('📊 Status:', response.status);
    console.log('✅ Réponse:', response.body);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email et mot de passe requis');
  });

  test('POST /api/auth/register avec données manquantes devrait retourner 400', async () => {
    console.log('🧪 Test: /api/auth/register avec données manquantes');
    
    const response = await request(testApp)
      .post('/api/auth/register')
      .send({})
      .expect(400);

    console.log('📊 Status:', response.status);
    console.log('✅ Réponse:', response.body);
    
    // Correction : l'API retourne un objet, pas une string
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Tous les champs sont requis');
  });

  test('GET /api/auth/verify sans token devrait retourner 401', async () => {
    console.log('🧪 Test: /api/auth/verify sans token');
    
    const response = await request(testApp)
      .get('/api/auth/verify')
      .expect(401);

    console.log('📊 Status:', response.status);
    console.log('✅ Réponse:', response.body);
    expect(response.body.error).toBe('⛔ Token manquant ou invalide');
  });

  test('GET /api/meta devrait fonctionner', async () => {
    console.log('🧪 Test: /api/meta (route de base)');
    
    const response = await request(testApp)
      .get('/api/meta')
      .expect(200);

    console.log('📊 Status:', response.status);
    console.log('📋 Réponse complète:', JSON.stringify(response.body, null, 2));
    
    // Vérifications basées sur la structure réelle de votre route meta
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toBeInstanceOf(Object);
    
    // Vérifier les propriétés principales de votre structure meta
    expect(response.body.système).toBeDefined();
    expect(response.body.base_données).toBeDefined();
    expect(response.body.environnement).toBeDefined();
    expect(response.body.performance).toBeDefined();
    expect(response.body.horodatage).toBeDefined();
    
    // Vérifications plus spécifiques
    expect(response.body.système.nom).toBeDefined();
    expect(response.body.système.version).toBeDefined();
    expect(response.body.base_données.statut).toBeDefined();
    expect(response.body.environnement.mode).toBeDefined();
    
    console.log('✅ API Meta fonctionnelle - Structure système validée');
    console.log(`📍 Version: ${response.body.système.version}`);
    console.log(`📍 DB Status: ${response.body.base_données.statut}`);
    console.log(`📍 Environment: ${response.body.environnement.mode}`);
  });

});