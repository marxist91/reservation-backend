'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    return queryInterface.bulkInsert('users', [
      {
        nom: 'Admin',
        prenom: 'Système',
        email: 'admin@port-autonome.com',
        password: hashedPassword,
        role: 'admin',
        poste: 'Administrateur Système',
        telephone: '0123456789',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@port-autonome.com',
        password: hashedPassword,
        role: 'responsable',
        poste: 'Responsable des Salles',
        telephone: '0123456790',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@port-autonome.com',
        password: hashedPassword,
        role: 'responsable',
        poste: 'Responsable Logistique',
        telephone: '0123456791',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Bernard',
        prenom: 'Pierre',
        email: 'pierre.bernard@port-autonome.com',
        password: hashedPassword,
        role: 'user',
        poste: 'Chargé de Communication',
        telephone: '0123456792',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Dubois',
        prenom: 'Marie',
        email: 'marie.dubois@port-autonome.com',
        password: hashedPassword,
        role: 'user',
        poste: 'Assistante RH',
        telephone: '0123456793',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Laurent',
        prenom: 'Thomas',
        email: 'thomas.laurent@port-autonome.com',
        password: hashedPassword,
        role: 'user',
        poste: 'Technicien IT',
        telephone: '0123456794',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Simon',
        prenom: 'Julie',
        email: 'julie.simon@port-autonome.com',
        password: hashedPassword,
        role: 'user',
        poste: 'Comptable',
        telephone: '0123456795',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom: 'Michel',
        prenom: 'David',
        email: 'david.michel@port-autonome.com',
        password: hashedPassword,
        role: 'user',
        poste: 'Chef de Projet',
        telephone: '0123456796',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, _Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};

