/**
 * Tests du Modèle User
 * 
 * Ce fichier teste toutes les fonctionnalités du modèle User :
 * - Validation des champs
 * - Contraintes de base de données
 * - Hooks (hachage de mot de passe)
 * - Associations avec d'autres modèles
 * - Méthodes personnalisées
 */

const { User, Room, Reservation, AuditLog } = require('../../models');
const bcrypt = require('bcryptjs');

describe('🧪 Modèle User - Tests Complets', () => {

  describe('Validation des Champs', () => {
    
    test('devrait créer un utilisateur valide avec tous les champs requis', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      const user = await User.create(userData);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.nom).toBe(userData.nom);
      expect(user.prenom).toBe(userData.prenom);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.actif).toBe(true); // valeur par défaut
      
      // Le mot de passe doit être hashé
      expect(user.mot_de_passe).not.toBe(userData.mot_de_passe);
      expect(user.mot_de_passe).toMatch(/^\$2[aby]\$\d+\$/); // Format bcrypt
    });

    test('devrait rejeter un utilisateur sans nom', async () => {
      const userData = {
        prenom: 'Jean',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('devrait rejeter un utilisateur sans email', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('devrait rejeter un utilisateur sans mot de passe', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: `test_${Date.now()}@example.com`,
        role: 'utilisateur'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('devrait rejeter un email invalide', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'email-invalide',
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      await expect(User.create(userData)).rejects.toThrow(/Validation isEmail/);
    });

    test('devrait rejeter un rôle invalide', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'role_inexistant'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('devrait accepter tous les rôles valides', async () => {
      const roles = ['admin', 'responsable_salle', 'utilisateur'];
      
      for (const role of roles) {
        const userData = {
          nom: 'Test',
          prenom: 'User',
          email: `test_${role}_${Date.now()}@example.com`,
          mot_de_passe: 'motdepasse123',
          role: role
        };

        const user = await User.create(userData);
        expect(user.role).toBe(role);
      }
    });
  });

  describe('Contraintes de Base de Données', () => {
    
    test('devrait rejeter des emails en double', async () => {
      const email = `duplicate_${Date.now()}@example.com`;
      
      const userData1 = {
        nom: 'User1',
        email: email,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      const userData2 = {
        nom: 'User2',
        email: email, // même email
        mot_de_passe: 'motdepasse456',
        role: 'admin'
      };

      await User.create(userData1);
      await expect(User.create(userData2)).rejects.toThrow(/email must be unique/);
    });

    test('devrait permettre des noms identiques', async () => {
      const nom = 'Dupont';
      
      const user1 = await User.create({
        nom: nom,
        email: `user1_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      });

      const user2 = await User.create({
        nom: nom, // même nom
        email: `user2_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse456',
        role: 'admin'
      });

      expect(user1.nom).toBe(nom);
      expect(user2.nom).toBe(nom);
    });
  });

  describe('Hooks de Mot de Passe', () => {
    
    test('devrait hacher le mot de passe lors de la création', async () => {
      const motDePasseOriginal = 'motdepasse123';
      const userData = {
        nom: 'Test',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: motDePasseOriginal,
        role: 'utilisateur'
      };

      const user = await User.create(userData);
      
      expect(user.mot_de_passe).not.toBe(motDePasseOriginal);
      expect(user.mot_de_passe).toMatch(/^\$2[aby]\$\d+\$/);
      
      // Vérifier que le hash est valide
      const isValid = await bcrypt.compare(motDePasseOriginal, user.mot_de_passe);
      expect(isValid).toBe(true);
    });

    test('devrait hacher le mot de passe lors de la mise à jour', async () => {
      const user = await global.testUtils.createTestUser();
      const nouveauMotDePasse = 'nouveaumotdepasse456';
      const ancienHash = user.mot_de_passe;

      await user.update({ mot_de_passe: nouveauMotDePasse });
      
      expect(user.mot_de_passe).not.toBe(nouveauMotDePasse);
      expect(user.mot_de_passe).not.toBe(ancienHash);
      expect(user.mot_de_passe).toMatch(/^\$2[aby]\$\d+\$/);
      
      // Vérifier que le nouveau hash est valide
      const isValid = await bcrypt.compare(nouveauMotDePasse, user.mot_de_passe);
      expect(isValid).toBe(true);
    });

    test('ne devrait pas re-hacher si le mot de passe n\'a pas changé', async () => {
      const user = await global.testUtils.createTestUser();
      const hashOriginal = user.mot_de_passe;

      await user.update({ nom: 'Nouveau Nom' });
      
      expect(user.mot_de_passe).toBe(hashOriginal);
    });
  });

  describe('Valeurs par Défaut', () => {
    
    test('devrait définir le rôle par défaut à "utilisateur"', async () => {
      const userData = {
        nom: 'Test',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123'
        // pas de rôle spécifié
      };

      const user = await User.create(userData);
      expect(user.role).toBe('utilisateur');
    });

    test('devrait définir actif à true par défaut', async () => {
      const userData = {
        nom: 'Test',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
        // pas de statut actif spécifié
      };

      const user = await User.create(userData);
      expect(user.actif).toBe(true);
    });

    test('devrait permettre de définir actif à false', async () => {
      const userData = {
        nom: 'Test',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur',
        actif: false
      };

      const user = await User.create(userData);
      expect(user.actif).toBe(false);
    });
  });

  describe('Associations avec d\'autres Modèles', () => {
    
    test('devrait avoir une association avec les réservations', async () => {
      const user = await global.testUtils.createTestUser();
      const room = await global.testUtils.createTestRoom();
      
      const reservation = await Reservation.create({
        user_id: user.id,
        room_id: room.id,
        date: '2025-12-01',
        heure_debut: '09:00',
        heure_fin: '10:00',
        statut: 'en_attente'
      });

      const userWithReservations = await User.findByPk(user.id, {
        include: [{ model: Reservation, as: 'reservations' }]
      });

      expect(userWithReservations.reservations).toBeDefined();
      expect(userWithReservations.reservations).toHaveLength(1);
      expect(userWithReservations.reservations[0].id).toBe(reservation.id);
    });

    test('devrait avoir une association avec les salles en tant que responsable', async () => {
      const user = await global.testUtils.createTestUser();
      
      const room = await Room.create({
        nom: `Salle Test ${Date.now()}`,
        capacite: 10,
        responsable_id: user.id
      });

      const userWithSalles = await User.findByPk(user.id, {
        include: [{ model: Room, as: 'salles' }]
      });

      expect(userWithSalles.salles).toBeDefined();
      expect(userWithSalles.salles).toHaveLength(1);
      expect(userWithSalles.salles[0].id).toBe(room.id);
    });

    test('devrait avoir une association avec les logs d\'audit', async () => {
      const user = await global.testUtils.createTestUser();
      
      // Créer un log d'audit pour cet utilisateur
      const auditLog = await AuditLog.logAction({
        action: 'TEST_ACTION',
        user_id: user.id,
        cible_type: 'User',
        cible_id: user.id,
        details: { test: 'data' }
      });

      const userWithAuditLogs = await User.findByPk(user.id, {
        include: [{ model: AuditLog, as: 'audit_logs' }]
      });

      expect(userWithAuditLogs.audit_logs).toBeDefined();
      expect(userWithAuditLogs.audit_logs).toHaveLength(1);
      expect(userWithAuditLogs.audit_logs[0].id).toBe(auditLog.id);
    });
  });

  describe('Opérations CRUD', () => {
    
    test('devrait pouvoir lire un utilisateur par ID', async () => {
      const user = await global.testUtils.createTestUser();
      
      const foundUser = await User.findByPk(user.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.email).toBe(user.email);
    });

    test('devrait pouvoir lire un utilisateur par email', async () => {
      const user = await global.testUtils.createTestUser();
      
      const foundUser = await User.findOne({ where: { email: user.email } });
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.email).toBe(user.email);
    });

    test('devrait pouvoir mettre à jour un utilisateur', async () => {
      const user = await global.testUtils.createTestUser();
      const nouveauNom = 'Nouveau Nom';
      
      await user.update({ nom: nouveauNom });
      
      expect(user.nom).toBe(nouveauNom);
      
      // Vérifier en base
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.nom).toBe(nouveauNom);
    });

    test('devrait pouvoir supprimer un utilisateur', async () => {
      const user = await global.testUtils.createTestUser();
      const userId = user.id;
      
      await user.destroy();
      
      const deletedUser = await User.findByPk(userId);
      expect(deletedUser).toBeNull();
    });

    test('devrait pouvoir lister tous les utilisateurs', async () => {
      const user1 = await global.testUtils.createTestUser();
      const user2 = await global.testUtils.createTestUser();
      
      const users = await User.findAll();
      
      expect(users.length).toBeGreaterThanOrEqual(2);
      const userIds = users.map(u => u.id);
      expect(userIds).toContain(user1.id);
      expect(userIds).toContain(user2.id);
    });
  });

  describe('Cas Limites et Gestion d\'Erreurs', () => {
    
    test('devrait gérer les emails avec des caractères spéciaux', async () => {
      const userData = {
        nom: 'Test',
        email: `test+special.email_${Date.now()}@example-domain.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      const user = await User.create(userData);
      expect(user.email).toBe(userData.email);
    });

    test('devrait gérer les noms avec des caractères accentués', async () => {
      const userData = {
        nom: 'Müller',
        prenom: 'François',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: 'motdepasse123',
        role: 'utilisateur'
      };

      const user = await User.create(userData);
      expect(user.nom).toBe(userData.nom);
      expect(user.prenom).toBe(userData.prenom);
    });

    test('devrait gérer les mots de passe longs', async () => {
      const longPassword = 'a'.repeat(100);
      const userData = {
        nom: 'Test',
        email: `test_${Date.now()}@example.com`,
        mot_de_passe: longPassword,
        role: 'utilisateur'
      };

      const user = await User.create(userData);
      
      // Vérifier que le mot de passe long est correctement hashé
      const isValid = await bcrypt.compare(longPassword, user.mot_de_passe);
      expect(isValid).toBe(true);
    });

    test('devrait retourner null pour un utilisateur inexistant', async () => {
      const nonExistentUser = await User.findByPk(99999);
      expect(nonExistentUser).toBeNull();
    });
  });

  describe('Sécurité', () => {
    
    test('ne devrait jamais exposer le mot de passe en clair', async () => {
      const user = await global.testUtils.createTestUser();
      
      const userJson = user.toJSON();
      expect(userJson.mot_de_passe).toMatch(/^\$2[aby]\$\d+\$/);
      expect(userJson.mot_de_passe).not.toContain('password');
    });

    test('devrait valider la force du hash bcrypt', async () => {
      const user = await global.testUtils.createTestUser();
      
      // Vérifier que le hash utilise au moins 10 rounds (sécurité minimale)
      const hashParts = user.mot_de_passe.split('$');
      const rounds = parseInt(hashParts[2]);
      expect(rounds).toBeGreaterThanOrEqual(10);
    });
  });
});