const { createTestServer, closeTestServer, makeRequest } = require('../../helpers/testServer');
const { sequelize, User } = require('../../../models'); // Ajout de User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Auth Routes Tests', () => { // Nom corrigé
  let app;

  beforeAll(async () => {
    ({ app } = await createTestServer());
  });

  afterAll(async () => {
    await closeTestServer();
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    // Nettoyer la table User avant chaque test
    if (User) {
      await User.destroy({ where: {}, force: true });
    }
  });

  const validUserData = {
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@test.com',
    motDePasse: 'TestPassword123!',
    role: 'client'
  };

  describe('POST /api/auth/register', () => {
    test('devrait créer un nouvel utilisateur avec succès', async () => {
      const response = await makeRequest(app) // Correction: makeRequest au lieu de makeRequestt
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Utilisateur créé avec succès',
        user: expect.objectContaining({
          nom: validUserData.nom,
          prenom: validUserData.prenom,
          email: validUserData.email,
          role: 'client'
        })
      });

      // Vérifier que le mot de passe n'est pas retourné
      expect(response.body.user.motDePasse).toBeUndefined();
    });

    test('devrait rejeter un email déjà utilisé', async () => {
      // Créer d'abord un utilisateur
      await User.create({
        ...validUserData,
        motDePasse: await bcrypt.hash(validUserData.motDePasse, 10)
      });

      const response = await makeRequest(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toMatchObject({
        message: 'Un utilisateur avec cet email existe déjà'
      });
    });

    test('devrait rejeter des données invalides', async () => {
      const invalidData = {
        nom: '',
        email: 'invalid-email',
        motDePasse: '123'
      };

      const response = await makeRequest(app) // Correction: makeRequest
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('devrait hacher le mot de passe', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      const user = await User.findOne({ where: { email: validUserData.email } });
      expect(user.motDePasse).not.toBe(validUserData.motDePasse);
      expect(await bcrypt.compare(validUserData.motDePasse, user.motDePasse)).toBe(true);
    });

    test('devrait assigner le rôle client par défaut', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.user.role).toBe('client');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Créer un utilisateur de test
      testUser = await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@test.com',
        motDePasse: await bcrypt.hash('password123', 10),
        role: 'client'
      });
    });

    test('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          motDePasse: 'password123'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Connexion réussie',
        token: expect.any(String),
        user: expect.objectContaining({
          email: 'test@test.com',
          role: 'client'
        })
      });
    });

    test('devrait rejeter un email inexistant', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistant@test.com',
          motDePasse: 'password123'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'Email ou mot de passe incorrect'
      });
    });

    test('devrait rejeter un mot de passe incorrect', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          motDePasse: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'Email ou mot de passe incorrect'
      });
    });

    test('devrait rejeter des données manquantes', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
          // motDePasse manquant
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('devrait rejeter un format d\'email invalide', async () => {
      const response = await makeRequest(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          motDePasse: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('devrait mettre à jour la dernière connexion', async () => {
      const oldLastLogin = testUser.derniereConnexion;

      await makeRequest(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          motDePasse: 'password123'
        })
        .expect(200);

      await testUser.reload();
      expect(testUser.derniereConnexion).not.toEqual(oldLastLogin);
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser;
    let token;

    beforeEach(async () => {
      // Créer un utilisateur et générer un token
      testUser = await User.create({
        nom: 'Profile',
        prenom: 'Test',
        email: 'profile@test.com',
        motDePasse: await bcrypt.hash('password123', 10),
        role: 'client'
      });

      token = jwt.sign(
        { userId: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );
    });

    test('devrait retourner le profil utilisateur avec un token valide', async () => {
      const response = await makeRequest(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user: expect.objectContaining({
          nom: 'Profile',
          prenom: 'Test',
          email: 'profile@test.com',
          role: 'client'
        })
      });

      expect(response.body.user.motDePasse).toBeUndefined();
    });

    test('devrait rejeter sans token', async () => {
      const response = await makeRequest(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'Token d\'authentification requis'
      });
    });

    test('devrait rejeter avec un token invalide', async () => {
      const response = await makeRequest(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'Token invalide'
      });
    });

    test('devrait rejeter avec un token expiré', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '-1h' } // Token expiré
      );

      const response = await makeRequest(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'Token expiré'
      });
    });
  });

  describe('PUT /api/auth/profile', () => {
    let testUser;
    let token;

    beforeEach(async () => {
      testUser = await User.create({
        nom: 'OldName',
        prenom: 'OldFirstName',
        email: 'old@test.com',
        motDePasse: await bcrypt.hash('password123', 10),
        role: 'client'
      });

      token = jwt.sign(
        { userId: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );
    });

    test('devrait mettre à jour le profil utilisateur', async () => {
      const updateData = {
        nom: 'NewName',
        prenom: 'NewFirstName'
      };

      const response = await makeRequest(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Profil mis à jour avec succès',
        user: expect.objectContaining({
          nom: 'NewName',
          prenom: 'NewFirstName',
          email: 'old@test.com'
        })
      });
    });

    test('devrait rejeter la modification de l\'email', async () => {
      const updateData = {
        email: 'newemail@test.com'
      };

      const response = await makeRequest(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'La modification de l\'email n\'est pas autorisée'
      });
    });
  });
});