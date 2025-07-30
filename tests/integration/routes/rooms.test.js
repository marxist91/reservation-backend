// tests/integration/routes/rooms.test.js

const request = require('supertest');
const { app, closeTestServer, createTestApp } = require('../../helpers/testServer');
const { User, Room } = require('../../../models');
const jwt = require('jsonwebtoken');

describe('🏢 Tests des routes salles', () => {
  let testApp;
  let adminToken;
  let userToken;
  let responsableToken;
  let testUser;
  let testAdmin;
  let testResponsable;
  let testRoom;

  beforeAll(async () => {
    testApp = app || createTestApp();
    console.log('🔧 Application de test initialisée pour les salles');

    // Créer des utilisateurs de test
    testAdmin = await User.create({
      nom: 'Admin',
      prenom: 'Test',
      email: 'admin@test.com',
      password: 'hashedpassword123',
      role: 'admin'
    });

    testResponsable = await User.create({
      nom: 'Responsable',
      prenom: 'Salle',
      email: 'responsable@test.com',
      password: 'hashedpassword123',
      role: 'responsable_salle'
    });

    testUser = await User.create({
      nom: 'User',
      prenom: 'Simple',
      email: 'user@test.com',
      password: 'hashedpassword123',
      role: 'utilisateur'
    });

    // Générer les tokens JWT
    adminToken = jwt.sign(
      { id: testAdmin.id, email: testAdmin.email, role: testAdmin.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    responsableToken = jwt.sign(
      { id: testResponsable.id, email: testResponsable.email, role: testResponsable.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Créer une salle de test
    testRoom = await Room.create({
      nom: 'Salle Test',
      description: 'Salle pour les tests automatisés',
      capacite: 20,
      equipements: ['video', 'wifi'],
      responsable_id: testResponsable.id
    });

    console.log('✅ Données de test créées');
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testRoom) await testRoom.destroy();
    if (testAdmin) await testAdmin.destroy();
    if (testResponsable) await testResponsable.destroy();
    if (testUser) await testUser.destroy();
    
    await closeTestServer();
    console.log('✅ Données de test nettoyées');
  });

  describe('📋 Tests CRUD de base', () => {
    
    test('GET /api/rooms - Liste des salles (utilisateur authentifié)', async () => {
      console.log('🧪 Test: Liste des salles');
      
      const response = await request(testApp)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      console.log('📊 Status:', response.status);
      console.log('📋 Nombre de salles:', response.body.length || response.body.rooms?.length || 'Format à vérifier');
      
      expect(response.body).toBeDefined();
      // Adapter selon le format de votre API
      if (Array.isArray(response.body)) {
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        expect(response.body[0]).toHaveProperty('nom');
      } else if (response.body.rooms) {
        expect(response.body.rooms.length).toBeGreaterThanOrEqual(1);
      }
      
      console.log('✅ Liste des salles récupérée');
    });

    test('GET /api/rooms - Accès refusé sans token', async () => {
      console.log('🧪 Test: Accès salles sans authentification');
      
      const response = await request(testApp)
        .get('/api/rooms')
        .expect(401);

      expect(response.body.error).toBeDefined();
      console.log('✅ Accès correctement refusé');
    });

    test('GET /api/rooms/:id - Détail d\'une salle', async () => {
      console.log('🧪 Test: Détail d\'une salle');
      
      const response = await request(testApp)
        .get(`/api/rooms/${testRoom.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.nom || response.body.room?.nom).toBe('Salle Test');
      
      console.log('✅ Détail de la salle récupéré');
    });

    test('POST /api/rooms - Créer salle (admin)', async () => {
      console.log('🧪 Test: Créer salle en tant qu\'admin');
      
      const nouvellesalle = {
        nom: 'Nouvelle Salle Admin',
        description: 'Salle créée par admin',
        capacite: 15,
        equipements: ['tableau', 'wifi'],
        responsable_id: testResponsable.id
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nouvellesalle)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.nom || response.body.room?.nom).toBe(nouvellesalle.nom);
      
      // Nettoyer la salle créée
      if (response.body.id) {
        await Room.destroy({ where: { id: response.body.id } });
      } else if (response.body.room?.id) {
        await Room.destroy({ where: { id: response.body.room.id } });
      }
      
      console.log('✅ Salle créée avec succès par admin');
    });

    test('POST /api/rooms - Créer salle (responsable)', async () => {
      console.log('🧪 Test: Créer salle en tant que responsable');
      
      const nouvellesalle = {
        nom: 'Nouvelle Salle Responsable',
        description: 'Salle créée par responsable',
        capacite: 12,
        equipements: ['video'],
        responsable_id: testResponsable.id
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${responsableToken}`)
        .send(nouvellesalle)
        .expect(201);

      expect(response.body).toBeDefined();
      
      // Nettoyer
      if (response.body.id) {
        await Room.destroy({ where: { id: response.body.id } });
      } else if (response.body.room?.id) {
        await Room.destroy({ where: { id: response.body.room.id } });
      }
      
      console.log('✅ Salle créée avec succès par responsable');
    });

    test('POST /api/rooms - Accès refusé (utilisateur simple)', async () => {
      console.log('🧪 Test: Création salle refusée pour utilisateur simple');
      
      const nouvellesalle = {
        nom: 'Salle Interdite',
        description: 'Cette salle ne devrait pas être créée',
        capacite: 10,
        responsable_id: testResponsable.id
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send(nouvellesalle)
        .expect(403);

      expect(response.body.error || response.body.message).toBeDefined();
      console.log('✅ Création correctement refusée pour utilisateur simple');
    });

  });

  describe('🔍 Tests de filtrage et recherche', () => {
    
    test('GET /api/rooms?capacite=20 - Filtrer par capacité', async () => {
      console.log('🧪 Test: Filtrage par capacité');
      
      const response = await request(testApp)
        .get('/api/rooms?capacite=20')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      console.log('✅ Filtrage par capacité testé');
    });

    test('GET /api/rooms?equipements=video - Filtrer par équipements', async () => {
      console.log('🧪 Test: Filtrage par équipements');
      
      const response = await request(testApp)
        .get('/api/rooms?equipements=video')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      console.log('✅ Filtrage par équipements testé');
    });

    test('GET /api/rooms?responsable_id=' + `${testResponsable.id}` + ' - Filtrer par responsable', async () => {
      console.log('🧪 Test: Filtrage par responsable');
      
      const response = await request(testApp)
        .get(`/api/rooms?responsable_id=${testResponsable.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      console.log('✅ Filtrage par responsable testé');
    });

  });

  describe('✅ Tests de validation', () => {
    
    test('POST /api/rooms - Données invalides (capacité négative)', async () => {
      console.log('🧪 Test: Validation capacité négative');
      
      const salleInvalide = {
        nom: 'Salle Invalide',
        capacite: -5,  // Capacité négative
        responsable_id: testResponsable.id
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(salleInvalide)
        .expect(400);

      expect(response.body.error || response.body.message).toBeDefined();
      console.log('✅ Validation capacité négative correcte');
    });

    test('POST /api/rooms - Nom de salle manquant', async () => {
      console.log('🧪 Test: Validation nom manquant');
      
      const salleInvalide = {
        // nom manquant
        capacite: 10,
        responsable_id: testResponsable.id
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(salleInvalide)
        .expect(400);

      expect(response.body.error || response.body.message).toBeDefined();
      console.log('✅ Validation nom manquant correcte');
    });

    test('POST /api/rooms - Responsable inexistant', async () => {
      console.log('🧪 Test: Validation responsable inexistant');
      
      const salleInvalide = {
        nom: 'Salle Responsable Inexistant',
        capacite: 10,
        responsable_id: 99999  // ID inexistant
      };

      const response = await request(testApp)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(salleInvalide)
        .expect(400);

      expect(response.body.error || response.body.message).toBeDefined();
      console.log('✅ Validation responsable inexistant correcte');
    });

  });

  describe('🔒 Tests de permissions avancées', () => {
    
    test('PUT /api/rooms/:id - Modifier salle (admin)', async () => {
      console.log('🧪 Test: Modification salle par admin');
      
      const modifications = {
        nom: 'Salle Test Modifiée',
        capacite: 25
      };

      const response = await request(testApp)
        .put(`/api/rooms/${testRoom.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(modifications)
        .expect(200);

      expect(response.body).toBeDefined();
      console.log('✅ Modification par admin réussie');
    });

    test('PUT /api/rooms/:id - Accès refusé (utilisateur simple)', async () => {
      console.log('🧪 Test: Modification refusée pour utilisateur simple');
      
      const modifications = {
        nom: 'Tentative Modification'
      };

      const response = await request(testApp)
        .put(`/api/rooms/${testRoom.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(modifications)
        .expect(403);

      expect(response.body.error || response.body.message).toBeDefined();
      console.log('✅ Modification correctement refusée');
    });

    test('DELETE /api/rooms/:id - Supprimer salle (admin uniquement)', async () => {
      console.log('🧪 Test: Suppression salle par admin');
      
      // Créer une salle temporaire pour la supprimer
      const salleTemp = await Room.create({
        nom: 'Salle à Supprimer',
        capacite: 5,
        responsable_id: testResponsable.id
      });

      const response = await request(testApp)
        .delete(`/api/rooms/${salleTemp.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      console.log('✅ Suppression par admin réussie');
    });

    test('DELETE /api/rooms/:id - Accès refusé (responsable salle)', async () => {
      console.log('🧪 Test: Suppression refusée pour responsable salle');
      
      const response = await request(testApp)
        .delete(`/api/rooms/${testRoom.id}`)
        .set('Authorization', `Bearer ${responsableToken}`)
        .expect(403);

      expect(response.body.error || response.body.message).toBeDefined();
      console.log('✅ Suppression correctement refusée pour responsable');
    });

  });

});