/**
 * Test de validation réelle d'une réservation
 * Pour vérifier que le nom de la salle s'affiche correctement dans les emails
 */

require('dotenv').config();
const { Reservation, User, Room, sequelize } = require('./models');
const emailService = require('./services/emailService');

async function testRealValidation() {
  try {
    console.log('\n🧪 TEST - Validation réelle de réservation\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données\n');

    // Initialiser le service email
    emailService.setUserModel(User);
    console.log('✅ Service email initialisé\n');

    // Récupérer une réservation en attente (ou la plus récente)
    console.log('🔍 Recherche d\'une réservation dans la base...\n');
    
    const reservation = await Reservation.findOne({
      where: { statut: 'validée' }, // On prend une validée pour tester
      include: [
        { 
          model: User, 
          as: "utilisateur", 
          attributes: ["id", "nom", "prenom", "email"] 
        },
        { 
          model: Room, 
          as: "salle", 
          attributes: ["id", "nom"] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!reservation) {
      console.log('⚠️  Aucune réservation trouvée dans la base!');
      console.log('💡 Créez une réservation via l\'interface pour tester\n');
      return;
    }

    console.log('✅ Réservation trouvée:\n');
    console.log(`   📋 ID: ${reservation.id}`);
    console.log(`   👤 Utilisateur: ${reservation.utilisateur.prenom} ${reservation.utilisateur.nom}`);
    console.log(`   📧 Email: ${reservation.utilisateur.email}`);
    console.log(`   🏢 Salle (via .salle): ${reservation.salle?.nom || 'NON CHARGÉE'}`);
    console.log(`   🏢 Salle (via .Room): ${reservation.Room?.nom || 'NON CHARGÉE'}`);
    console.log(`   📅 Date début: ${reservation.date_debut}`);
    console.log(`   📅 Date fin: ${reservation.date_fin}`);
    console.log(`   📝 Motif: ${reservation.motif}`);
    console.log(`   ⚡ Statut: ${reservation.statut}\n`);

    // Test d'envoi d'email
    console.log('📧 Test d\'envoi d\'email de validation...\n');
    
    try {
      await emailService.sendReservationValidated(reservation.utilisateur, reservation);
      console.log('✅ Emails envoyés avec succès!\n');
      
      console.log('🔍 Vérification des données envoyées:');
      console.log(`   • Nom utilisateur: ${reservation.utilisateur.prenom} ${reservation.utilisateur.nom}`);
      console.log(`   • Nom salle utilisé: ${reservation.salle?.nom || reservation.Room?.nom || 'ERREUR: Salle inconnue'}`);
      console.log(`   • Date: ${new Date(reservation.date_debut).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
      console.log(`   • Horaire: ${new Date(reservation.date_debut).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${new Date(reservation.date_fin).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`);
      
      if (reservation.salle?.nom) {
        console.log('\n✅ SUCCESS: La salle est correctement chargée!');
      } else {
        console.log('\n❌ ERREUR: La salle n\'est pas chargée! Le nom affichera "Salle inconnue"');
      }
      
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST TERMINÉ\n');
    console.log('💡 Vérifiez votre boîte email pour confirmer que le nom de la salle');
    console.log('   s\'affiche correctement (et non "Salle inconnue")\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ ERREUR GLOBALE:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion fermée\n');
  }
}

testRealValidation();
