/**
 * Script pour initialiser les données de production
 * Usage: node scripts/seed-production.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

// Forcer l'environnement production pour utiliser DATABASE_URL
process.env.NODE_ENV = 'production';

const { sequelize, User, Room, Department, Setting } = require('../models');

async function seedProduction() {
  try {
    console.log('🚀 Initialisation des données de production...');
    console.log('📦 DATABASE_URL:', process.env.DATABASE_URL ? 'DÉFINI' : 'NON DÉFINI');
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Synchroniser les tables (sans supprimer les données existantes)
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées');

    // 1. Créer le département par défaut
    const [dept, deptCreated] = await Department.findOrCreate({
      where: { name: 'Direction Générale' },
      defaults: {
        name: 'Direction Générale',
        description: 'Direction Générale du Port Autonome de Lomé'
      }
    });
    console.log(deptCreated ? '✅ Département créé' : '⚠️ Département existant');

    // 2. Créer l'admin
    const adminPassword = await bcrypt.hash('Admin2025!', 12);
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@pal.tg' },
      defaults: {
        email: 'admin@pal.tg',
        password: adminPassword,
        nom: 'Administrateur',
        prenom: 'PAL',
        role: 'admin',
        department_id: dept.id,
        telephone: '+228 22 27 47 42',
        actif: true
      }
    });
    console.log(adminCreated ? '✅ Admin créé' : '⚠️ Admin existant');

    // 3. Créer quelques salles
    const salles = [
      { nom: 'Salle du Conseil', capacite: 30, equipements: 'Vidéoprojecteur, Climatisation, Wifi', localisation: 'Bâtiment A - 1er étage', disponible: true },
      { nom: 'Salle de Conférence', capacite: 50, equipements: 'Vidéoprojecteur, Système audio, Wifi', localisation: 'Bâtiment B - RDC', disponible: true },
      { nom: 'Salle de Réunion 1', capacite: 12, equipements: 'Écran TV, Tableau blanc, Wifi', localisation: 'Bâtiment A - 2ème étage', disponible: true },
      { nom: 'Salle de Réunion 2', capacite: 8, equipements: 'Écran TV, Wifi', localisation: 'Bâtiment A - 2ème étage', disponible: true },
    ];

    for (const salle of salles) {
      const [room, created] = await Room.findOrCreate({
        where: { nom: salle.nom },
        defaults: salle
      });
      console.log(created ? `✅ Salle "${salle.nom}" créée` : `⚠️ Salle "${salle.nom}" existante`);
    }

    // 4. Créer les settings par défaut
    const [settings, settingsCreated] = await Setting.findOrCreate({
      where: { id: 1 },
      defaults: {
        site_name: 'Système de Réservation - Port Autonome de Lomé',
        admin_email: 'admin@pal.tg',
        working_days: JSON.stringify(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']),
        working_hours_start: '08:00',
        working_hours_end: '17:00',
        max_reservation_days: 30,
        auto_reject_hours: 24
      }
    });
    console.log(settingsCreated ? '✅ Settings créés' : '⚠️ Settings existants');

    console.log('\n========================================');
    console.log('🎉 INITIALISATION TERMINÉE !');
    console.log('========================================');
    console.log('\n📧 Compte Admin:');
    console.log('   Email: admin@pal.tg');
    console.log('   Mot de passe: Admin2025!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedProduction();
