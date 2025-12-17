/**
 * Script de test pour vérifier la configuration email
 * Usage: node test-email.js
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailConfiguration() {
  console.log('\n========================================');
  console.log('🧪 TEST DE CONFIGURATION EMAIL');
  console.log('========================================\n');

  // Vérifier les variables d'environnement
  console.log('📋 Configuration détectée:');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || '❌ Non défini');
  console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || '❌ Non défini');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ Non défini');
  console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Défini (masqué)' : '❌ Non défini');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Non défini');
  console.log('  EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Par défaut');
  console.log('  EMAIL_SECURE:', process.env.EMAIL_SECURE || 'false');
  console.log('');

  // Vérifier si le service est prêt
  console.log('🔍 Vérification du service email...');
  if (!emailService.isReady()) {
    console.error('❌ Le service email n\'est pas configuré correctement.');
    console.error('   Veuillez vérifier votre fichier .env');
    console.log('\n📝 Configuration requise dans .env:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_SECURE=false');
    console.log('   EMAIL_USER=votre.email@gmail.com');
    console.log('   EMAIL_PASSWORD=votre_mot_de_passe_application');
    console.log('   EMAIL_FROM=noreply@reservation-pal.com');
    console.log('   EMAIL_FROM_NAME=Port Autonome de Lomé - Réservations');
    process.exit(1);
  }

  console.log('✅ Service email configuré et prêt\n');

  // Demander l'email de test
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('📧 Entrez l\'adresse email de test (ou appuyez sur Entrée pour annuler): ', async (testEmail) => {
    rl.close();

    if (!testEmail || testEmail.trim() === '') {
      console.log('❌ Test annulé');
      process.exit(0);
    }

    console.log(`\n🚀 Envoi d'un email de test à: ${testEmail}`);

    try {
      // Test 1: Email de validation de réservation
      console.log('\n📝 Test 1: Email de validation de réservation...');
      await emailService.sendEmail({
        to: testEmail,
        subject: '✅ [TEST] Réservation validée - Port Autonome de Lomé',
        html: emailService.getReservationValidatedTemplate({
          userName: 'Jean Dupont',
          roomName: 'Salle de Conférence A',
          date: new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          startTime: '09:00',
          endTime: '11:00',
          motif: 'Réunion d\'équipe'
        })
      });
      console.log('✅ Email de validation envoyé');

      // Test 2: Email de refus
      console.log('\n📝 Test 2: Email de refus de réservation...');
      await emailService.sendEmail({
        to: testEmail,
        subject: '❌ [TEST] Réservation refusée - Port Autonome de Lomé',
        html: emailService.getReservationRejectedTemplate({
          userName: 'Jean Dupont',
          roomName: 'Salle de Conférence B',
          date: new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          startTime: '14:00',
          endTime: '16:00',
          motif: 'Formation',
          reason: 'La salle est déjà réservée pour un événement prioritaire'
        })
      });
      console.log('✅ Email de refus envoyé');

      // Test 3: Email de proposition alternative
      console.log('\n📝 Test 3: Email de proposition alternative...');
      await emailService.sendEmail({
        to: testEmail,
        subject: '🔄 [TEST] Proposition alternative - Port Autonome de Lomé',
        html: emailService.getAlternativeProposedTemplate({
          userName: 'Jean Dupont',
          originalRoom: 'Salle de Conférence A',
          originalDate: '15 janvier 2025',
          originalTime: '09:00 - 11:00',
          proposedRoom: 'Salle de Conférence B',
          proposedDate: '15 janvier 2025',
          proposedTime: '14:00 - 16:00',
          proposerName: 'Marie Martin (Administrateur)',
          reason: 'Conflit avec une réunion prioritaire'
        })
      });
      console.log('✅ Email de proposition alternative envoyé');

      // Test 4: Email de nouvelle réservation (admin)
      console.log('\n📝 Test 4: Email de nouvelle réservation (pour admin)...');
      await emailService.sendEmail({
        to: testEmail,
        subject: '📝 [TEST] Nouvelle demande de réservation - Port Autonome de Lomé',
        html: emailService.getNewReservationTemplate({
          userName: 'Jean Dupont',
          userEmail: 'jean.dupont@example.com',
          roomName: 'Salle de Formation',
          date: new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          startTime: '10:00',
          endTime: '12:00',
          motif: 'Session de formation annuelle',
          department: 'Département Informatique'
        })
      });
      console.log('✅ Email de nouvelle réservation envoyé');

      console.log('\n========================================');
      console.log('✅ TOUS LES TESTS RÉUSSIS');
      console.log('========================================');
      console.log(`\n📬 Vérifiez votre boîte email: ${testEmail}`);
      console.log('   Vous devriez avoir reçu 4 emails de test.');
      console.log('   ⚠️  Vérifiez aussi vos spams/courrier indésirable\n');

      process.exit(0);
    } catch (error) {
      console.error('\n❌ ERREUR lors de l\'envoi des emails:');
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      
      console.log('\n💡 Conseils de dépannage:');
      console.log('   1. Pour Gmail, utilisez un "mot de passe d\'application":');
      console.log('      - Activez la validation en 2 étapes');
      console.log('      - Générez un mot de passe d\'application');
      console.log('      - Utilisez ce mot de passe dans EMAIL_PASSWORD');
      console.log('   2. Vérifiez que EMAIL_HOST et EMAIL_PORT sont corrects');
      console.log('   3. Vérifiez votre connexion Internet');
      console.log('   4. Essayez avec EMAIL_PORT=465 et EMAIL_SECURE=true pour SSL');

      process.exit(1);
    }
  });
}

// Lancer le test
testEmailConfiguration();
