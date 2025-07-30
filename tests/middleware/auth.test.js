const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin, hasPermission } = require('../../middleware/auth');

describe('Middleware Auth', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('authenticateToken', () => {
    test('devrait accepter un token JWT valide', async () => {
      // Créer un token de test
      const payload = { id: 1, email: 'test@example.com', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'test_secret');
      
      // Route de test
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ user: req.user, message: 'Accès autorisé' });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user).toMatchObject(payload);
      expect(response.body.message).toBe('Accès autorisé');
    });

    test('devrait rejeter une requête sans token', async () => {
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.error).toBe('Token d\'accès requis');
    });

    test('devrait rejeter un token invalide', async () => {
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid_token')
        .expect(403);

      expect(response.body.error).toBe('Token invalide');
    });

    test('devrait rejeter un token expiré', async () => {
      // Créer un token expiré
      const payload = { id: 1, email: 'test@example.com', role: 'user' };
      const expiredToken = jwt.sign(
        payload, 
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '-1h' } // Expiré depuis 1 heure
      );
      
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body.error).toBe('Token invalide');
    });

    test('devrait gérer un header Authorization mal formaté', async () => {
      app.get('/protected', authenticateToken, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      // Test sans "Bearer "
      const response1 = await request(app)
        .get('/protected')
        .set('Authorization', 'invalid_format_token')
        .expect(401);

      expect(response1.body.error).toBe('Token d\'accès requis');

      // Test avec juste "Bearer"
      const response2 = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer')
        .expect(401);

      expect(response2.body.error).toBe('Token d\'accès requis');
    });
  });

  describe('requireAdmin', () => {
    test('devrait accepter un utilisateur admin', async () => {
      app.get('/admin', (req, res, next) => {
        req.user = { id: 1, email: 'admin@test.com', role: 'admin' };
        next();
      }, requireAdmin, (req, res) => {
        res.json({ message: 'Accès admin autorisé' });
      });

      const response = await request(app)
        .get('/admin')
        .expect(200);

      expect(response.body.message).toBe('Accès admin autorisé');
    });

    test('devrait rejeter un utilisateur non-admin', async () => {
      app.get('/admin', (req, res, next) => {
        req.user = { id: 2, email: 'user@test.com', role: 'user' };
        next();
      }, requireAdmin, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/admin')
        .expect(403);

      expect(response.body.error).toBe('Accès administrateur requis');
    });

    test('devrait rejeter une requête sans utilisateur', async () => {
      app.get('/admin', requireAdmin, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/admin')
        .expect(403);

      expect(response.body.error).toBe('Accès administrateur requis');
    });
  });

  describe('hasPermission', () => {
    test('devrait accepter un utilisateur avec la permission requise', async () => {
      const permissionMiddleware = hasPermission('read');
      
      app.get('/resource', (req, res, next) => {
        req.user = { 
          id: 1, 
          email: 'user@test.com', 
          permissions: ['read', 'write'] 
        };
        next();
      }, permissionMiddleware, (req, res) => {
        res.json({ message: 'Permission accordée' });
      });

      const response = await request(app)
        .get('/resource')
        .expect(200);

      expect(response.body.message).toBe('Permission accordée');
    });

    test('devrait rejeter un utilisateur sans la permission', async () => {
      const permissionMiddleware = hasPermission('delete');
      
      app.get('/resource', (req, res, next) => {
        req.user = { 
          id: 1, 
          email: 'user@test.com', 
          permissions: ['read', 'write'] 
        };
        next();
      }, permissionMiddleware, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/resource')
        .expect(403);

      expect(response.body.error).toBe('Permission requise: delete');
    });

    test('devrait rejeter un utilisateur sans permissions', async () => {
      const permissionMiddleware = hasPermission('read');
      
      app.get('/resource', (req, res, next) => {
        req.user = { id: 1, email: 'user@test.com' }; // Pas de permissions
        next();
      }, permissionMiddleware, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/resource')
        .expect(403);

      expect(response.body.error).toBe('Permission requise: read');
    });

    test('devrait rejeter une requête sans utilisateur', async () => {
      const permissionMiddleware = hasPermission('read');
      
      app.get('/resource', permissionMiddleware, (req, res) => {
        res.json({ message: 'Ne devrait pas arriver ici' });
      });

      const response = await request(app)
        .get('/resource')
        .expect(403);

      expect(response.body.error).toBe('Permission requise: read');
    });
  });

  describe('Intégration des middlewares', () => {
    test('devrait combiner authenticateToken et requireAdmin', async () => {
      const adminToken = jwt.sign(
        { id: 1, email: 'admin@test.com', role: 'admin' },
        process.env.JWT_SECRET || 'test_secret'
      );

      app.get('/admin-resource', authenticateToken, requireAdmin, (req, res) => {
        res.json({ message: 'Accès admin authentifié' });
      });

      const response = await request(app)
        .get('/admin-resource')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Accès admin authentifié');
    });

    test('devrait combiner authenticateToken et hasPermission', async () => {
      const userToken = jwt.sign(
        { 
          id: 1, 
          email: 'user@test.com', 
          role: 'user',
          permissions: ['read', 'write']
        },
        process.env.JWT_SECRET || 'test_secret'
      );

      const permissionMiddleware = hasPermission('read');

      app.get('/protected-resource', authenticateToken, permissionMiddleware, (req, res) => {
        res.json({ message: 'Accès avec permission' });
      });

      const response = await request(app)
        .get('/protected-resource')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Accès avec permission');
    });
  });
});