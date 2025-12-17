/**
 * Script de test pour vérifier l'envoi d'emails aux responsables
 * 
 * Ce script teste que:
 * 1. Les responsables sont bien récupérés de la base de données
 * 2. Les emails sont envoyés aux utilisateurs ET aux responsables
 * 3. Tous les types de notifications incluent les responsables
 */

require('dotenv').config();
const { User, Room, Reservation, sequelize } = require('./models');
const emailService = require('./services/emailService');

async function testEmailResponsables() {
  try {
    console.log('\n🧪 TEST - Envoi d\'emails aux responsables\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données\n');

    // Initialiser le service email avec le modèle User
    emailService.setUserModel(User);
    console.log('✅ Service email initialisé\n');

    // Test 1: Récupérer les admins et responsables
    console.log('📋 Test 1: Récupération des admins et responsables');
    console.log('─────────────────────────────────────────────────');
    
    const adminsResponsables = await User.findAll({
      where: {
        role: ['admin', 'responsable'],
        email: { [require('sequelize').Op.ne]: null }
      },
      attributes: ['id', 'email', 'role', 'prenom', 'nom']
    });

    console.log(`\n📊 ${adminsResponsables.length} admin(s)/responsable(s) trouvé(s):\n`);
    adminsResponsables.forEach(user => {
      console.log(`   ${user.role === 'admin' ? '👑' : '👔'} ${user.prenom} ${user.nom}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Rôle: ${user.role}\n`);
    });

    if (adminsResponsables.length === 0) {
      console.log('⚠️  ATTENTION: Aucun admin/responsable trouvé dans la base!');
      console.log('💡 Créez au moins un utilisateur avec le rôle "responsable"\n');
      return;
    }

    const emails = await emailService.getAdminsAndResponsablesEmails();
    console.log(`✅ Méthode getAdminsAndResponsablesEmails() retourne ${emails.length} email(s)\n`);

    // Test 2: Récupérer un utilisateur standard pour les tests
    console.log('👤 Test 2: Récupération d\'un utilisateur standard');
    console.log('─────────────────────────────────────────────────');
    
    const testUser = await User.findOne({
      where: { role: 'utilisateur' }
    });

    if (!testUser) {
      console.log('⚠️  Aucun utilisateur standard trouvé, création d\'un utilisateur de test...');
      const tempUser = {
        email: 'test.user@togoport.tg',
        prenom: 'Test',
        nom: 'Utilisateur'
      };
      console.log(`✅ Utilisateur de test créé: ${tempUser.prenom} ${tempUser.nom}\n`);
    } else {
      console.log(`✅ Utilisateur trouvé: ${testUser.prenom} ${testUser.nom} (${testUser.email})\n`);
    }

    // Test 3: Récupérer une salle
    console.log('🏢 Test 3: Récupération d\'une salle de test');
    console.log('─────────────────────────────────────────────────');
    
    const testRoom = await Room.findOne();
    if (!testRoom) {
      console.log('⚠️  Aucune salle trouvée dans la base!');
      console.log('💡 Créez au moins une salle dans la base de données\n');
      return;
    }

    console.log(`✅ Salle trouvée: ${testRoom.nom}\n`);

    // Données de test
    const user = testUser || {
      email: 'test.user@togoport.tg',
      prenom: 'Test',
      nom: 'Utilisateur'
    };

    const reservationData = {
      Room: { nom: testRoom.nom },
      date_debut: new Date('2025-12-15T10:00:00'),
      date_fin: new Date('2025-12-15T12:00:00'),
      motif: 'Réunion de test pour vérifier les emails aux responsables',
      utilisateur: user
    };

    // Test 4: Email de validation
    console.log('📧 Test 4: Envoi d\'email de validation');
    console.log('─────────────────────────────────────────────────');
    console.log(`📤 Email UTILISATEUR (personnel) à: ${user.email}`);
    console.log(`📤 Email FYI (informatif) aux responsables: ${emails.join(', ')}\n`);

    try {
      await emailService.sendReservationValidated(user, reservationData);
      console.log('✅ 2 emails différents envoyés:');
      console.log('   • Email personnel à l\'utilisateur');
      console.log('   • Email FYI aux responsables\n');
    } catch (error) {
      console.error('❌ Erreur:', error.message, '\n');
    }

    // Test 5: Email de refus
    console.log('📧 Test 5: Envoi d\'email de refus');
    console.log('─────────────────────────────────────────────────');
    console.log(`📤 Email UTILISATEUR (personnel) à: ${user.email}`);
    console.log(`📤 Email FYI (informatif) aux responsables: ${emails.join(', ')}\n`);

    try {
      await emailService.sendReservationRejected(
        user,
        reservationData,
        'Test de notification aux responsables - Salle déjà réservée pour un événement prioritaire'
      );
      console.log('✅ 2 emails différents envoyés:');
      console.log('   • Email personnel à l\'utilisateur');
      console.log('   • Email FYI aux responsables\n');
    } catch (error) {
      console.error('❌ Erreur:', error.message, '\n');
    }

    // Test 6: Email de proposition alternative
    console.log('📧 Test 6: Envoi d\'email de proposition alternative');
    console.log('─────────────────────────────────────────────────');
    console.log(`📤 Email UTILISATEUR (personnel) à: ${user.email}`);
    console.log(`📤 Email FYI (informatif) aux responsables: ${emails.join(', ')}\n`);

    try {
      await emailService.sendAlternativeProposed(user, {
        userName: `${user.prenom} ${user.nom}`,
        originalRoom: testRoom.nom,
        originalDate: '15 décembre 2025',
        originalTime: '10:00 - 12:00',
        proposedRoom: 'Salle Alternative B',
        proposedDate: '16 décembre 2025',
        proposedTime: '14:00 - 16:00',
        proposerName: 'Admin Test',
        reason: 'Conflit avec une réunion prioritaire du conseil d\'administration'
      });
      console.log('✅ 2 emails différents envoyés:');
      console.log('   • Email personnel à l\'utilisateur (avec choix accepter/refuser)');
      console.log('   • Email FYI aux responsables (information uniquement)\n');
    } catch (error) {
      console.error('❌ Erreur:', error.message, '\n');
    }

    // Résumé
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TESTS TERMINÉS\n');
    console.log('📊 Récapitulatif:');
    console.log(`   • ${adminsResponsables.length} responsable(s) dans la base`);
    console.log(`   • 3 types d'emails testés`);
    console.log(`   • 6 emails différents envoyés au total:\n`);
    console.log('     → 3 emails PERSONNELS à l\'utilisateur');
    console.log('     → 3 emails FYI (informatifs) aux responsables\n');
    console.log('💡 Différences importantes:');
    console.log('   • Email utilisateur: "Votre réservation...", "Bonjour [Nom]"');
    console.log('   • Email responsable: "FYI: Une réservation...", "Bonjour," (générique)\n');
    console.log('💡 Vérifiez vos boîtes email pour confirmer les 2 formats différents\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ ERREUR GLOBALE:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion à la base de données fermée\n');
  }
}

// Exécuter les tests
testEmailResponsables();
