const nodemailer = require("nodemailer");
const https = require('https');
const fs = require("fs");
const path = require("path");

/**
 * Service d'envoi d'emails pour le système de réservation
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.logoBase64 = null;
    this.User = null; // Modèle User pour récupérer les responsables
    this.Setting = null; // Modèle Setting pour récupérer le réglage
    this.loadLogo();
    this.initializeTransporter();
  }

  /**
   * Initialise le modèle User (appelé au démarrage du serveur)
   */
  setUserModel(UserModel) {
    this.User = UserModel;
  }

  setSettingModel(SettingModel) {
    this.Setting = SettingModel;
  }

  /**
   * Récupère tous les emails des admins et responsables
   */
  async getAdminsAndResponsablesEmails(roomId = null) {
    if (!this.User) {
      console.warn('⚠️  Modèle User non initialisé. Impossible de récupérer les responsables.');
      return [];
    }

    try {
      // Charger les settings si disponibles
      let settings = null;
      try {
        if (this.Setting && typeof this.Setting.getSettings === 'function') {
          settings = await this.Setting.getSettings();
        }
      } catch (sErr) {
        console.warn('⚠️ Impossible de lire les settings:', sErr.message);
      }

      // Si suppression activée et roomId fourni, tenter de récupérer le responsable de la salle
      if (settings && settings.suppress_admin_if_responsable_notified && roomId) {
        try {
          const { Room, User } = require('../models');
          const room = await Room.findByPk(roomId, {
            include: [{ model: User, as: 'responsable', attributes: ['id', 'email'] }]
          });
          if (room && room.responsable && room.responsable.email) {
            return [room.responsable.email];
          }
        } catch (err) {
          console.warn('⚠️ Erreur récupération responsable de salle:', err.message);
        }
      }

      const users = await this.User.findAll({
        where: {
          role: ['admin', 'responsable'],
          email: { [require('sequelize').Op.ne]: null }
        },
        attributes: ['email', 'role', 'prenom', 'nom']
      });

      return users.map(u => u.email).filter(email => email);
    } catch (error) {
      console.error('❌ Erreur récupération admins/responsables:', error.message);
      return [];
    }
  }

  /**
   * Charge le logo du Port en base64
   */
  loadLogo() {
    try {
      const logoPath = path.join(__dirname, '../../reservation-frontend/public/images/lome.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        this.logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        console.log('✅ Logo du Port Autonome de Lomé chargé');
      } else {
        console.warn('⚠️  Logo non trouvé:', logoPath);
      }
    } catch (error) {
      console.error('⚠️  Erreur chargement logo:', error.message);
    }
  }

  /**
   * Initialise le transporteur nodemailer
   */
  initializeTransporter() {
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn(`⚠️  Configuration email incomplète. Variables manquantes: ${missingVars.join(', ')}`);
      console.warn('⚠️  Les notifications par email seront désactivées.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_SECURE === 'true', // true pour port 465, false pour les autres
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        // Timeouts pour éviter les blocages sur serveurs cloud
        connectionTimeout: 10000, // 10 secondes pour établir la connexion
        greetingTimeout: 10000,   // 10 secondes pour le greeting SMTP
        socketTimeout: 15000,     // 15 secondes pour les opérations socket
      });

      this.isConfigured = true;
      console.log('✅ Service email configuré avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la configuration du service email:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Vérifie si le service email est configuré
   */
  isReady() {
    return this.isConfigured && this.transporter !== null;
  }

  /**
   * Template HTML de base pour les emails - Design moderne et professionnel
   */
  getBaseTemplate({ title, content, actionUrl, actionText }) {
    const logoSrc = this.logoBase64 || 'https://via.placeholder.com/150x80/1e3a8a/ffffff?text=PAL';
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f1f5f9;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-wrapper {
            width: 100%;
            background: #f1f5f9;
            padding: 40px 20px;
        }
        
        try {
          // Si une clé Resend est présente, on l'active (préférée en production)
          if (process.env.RESEND_API_KEY) {
            this.resendApiKey = process.env.RESEND_API_KEY;
            this.resendEnabled = true;
            console.log('✅ Resend API configurée (envoi via API HTTP)');
          }
          // Si SendGrid est configuré, on l'active
          if (process.env.SENDGRID_API_KEY) {
            this.sendgridApiKey = process.env.SENDGRID_API_KEY;
            this.sendgridEnabled = true;
            console.log('✅ SendGrid API configurée (envoi via API HTTP)');
          }

          this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            secure: process.env.EMAIL_SECURE === 'true', // true pour port 465, false pour les autres
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
            // Timeouts pour éviter les blocages sur serveurs cloud
            connectionTimeout: 10000, // 10 secondes pour établir la connexion
            greetingTimeout: 10000,   // 10 secondes pour le greeting SMTP
            socketTimeout: 15000,     // 15 secondes pour les opérations socket
          });

          this.isConfigured = true;
          console.log('✅ Service email (nodemailer) configuré avec succès');
        } catch (error) {
          console.error('❌ Erreur lors de la configuration du service email:', error.message);
          this.isConfigured = false;
        }
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 25px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .logo {
            max-width: 200px;
            height: auto;
            display: block;
        }
        
        .header-title {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 15px 0 8px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.95);
            font-size: 15px;
            font-weight: 500;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        
        .content h2 {
            color: #1e293b;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 10px 0;
            line-height: 1.3;
        }
        
        .content p {
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
            margin: 15px 0;
        }
        
        .content strong {
            color: #1e293b;
            font-weight: 600;
        }
        
        .info-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .info-box h3 {
            color: #1e40af;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        
        .info-box p {
            margin: 8px 0;
            font-size: 14px;
        }
        
        .success-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 4px solid #22c55e;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .success-box h3 {
            color: #16a34a;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        
        .success-box p {
            margin: 8px 0;
            font-size: 14px;
        }
        
        .warning-box {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .warning-box h3 {
            color: #d97706;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        
        .warning-box p {
            margin: 8px 0;
            font-size: 14px;
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
        }
        
        .button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        .footer {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-logo {
            max-width: 120px;
            height: auto;
            margin: 0 auto 15px;
            opacity: 0.6;
        }
        
        .footer-title {
            color: #1e293b;
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 8px 0;
        }
        
        .footer p {
            color: #64748b;
            font-size: 13px;
            line-height: 1.6;
            margin: 8px 0;
        }
        
        .footer a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin: 20px 0 10px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #64748b;
            text-decoration: none;
            font-size: 12px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #3b82f6;
            color: white;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .container {
                border-radius: 12px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .content h2 {
                font-size: 20px;
            }
            
            .info-box, .success-box, .warning-box {
                padding: 15px;
            }
            
            .button {
                display: block;
                padding: 12px 24px;
            }
            
            .footer {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <img src="${logoSrc}" alt="Port Autonome de Lomé" class="logo">
                </div>
                <h1 class="header-title">Port Autonome de Lomé</h1>
                <p class="header-subtitle">Système de Réservation de Salles</p>
            </div>
            
            <div class="content">
                ${content}
                ${actionUrl && actionText ? `
                <div class="button-container">
                    <a href="${actionUrl}" class="button">${actionText}</a>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <img src="${logoSrc}" alt="Port Autonome de Lomé" class="footer-logo">
                <p class="footer-title">Port Autonome de Lomé</p>
                <p>Boulevard de la Marina - BP 1225<br>Lomé, Togo</p>
                <div class="divider" style="margin: 20px auto; max-width: 200px;"></div>
                <p style="font-size: 12px; color: #94a3b8;">
                    Ceci est un email automatique, merci de ne pas y répondre directement.<br>
                    Pour toute question, contactez le service de réservation.
                </p>
                <p style="margin-top: 15px;">
                    <a href="${process.env.APP_URL || 'http://localhost:5173'}">Accéder à l'application</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Template FYI pour responsables - Validation de réservation
   */
  getReservationValidatedFYITemplate(data) {
    const { userName, roomName, date, startTime, endTime, motif } = data;
    
    const content = `
      <h2>ℹ️ Réservation validée</h2>
      <p>Bonjour,</p>
      <p>Une réservation vient d'être <strong style="color: #22c55e;">validée</strong> dans le système.</p>
      
      <div class="success-box">
        <h3>📋 Détails de la réservation</h3>
        <p><strong>👤 Utilisateur :</strong> ${userName}</p>
        <p><strong>🏢 Salle :</strong> ${roomName}</p>
        <p><strong>📅 Date :</strong> ${date}</p>
        <p><strong>🕐 Horaire :</strong> ${startTime} - ${endTime}</p>
        <p><strong>📝 Motif :</strong> ${motif}</p>
      </div>
      
      <div class="info-box">
        <h3>✅ Statut</h3>
        <p>• La réservation est maintenant <strong>active</strong> dans le système</p>
        <p>• L'utilisateur a été notifié par email</p>
        <p>• La salle apparaît comme réservée dans le calendrier</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #64748b; font-size: 13px;">
        <em>Ceci est une notification d'information - aucune action requise.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'FYI: Réservation Validée - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/admin/reservations`,
      actionText: '📊 Voir toutes les réservations'
    });
  }

  /**
   * Template pour notification de validation de réservation (utilisateur)
   */
  getReservationValidatedTemplate(data) {
    const { userName, roomName, date, startTime, endTime, motif } = data;
    
    const content = `
      <h2>✅ Réservation validée avec succès</h2>
      <p>Bonjour <strong>${userName}</strong>,</p>
      <p>Excellente nouvelle ! Votre demande de réservation a été <strong style="color: #22c55e;">approuvée</strong> par notre équipe administrative.</p>
      
      <div class="success-box">
        <h3>📋 Détails de votre réservation</h3>
        <p><strong>Salle :</strong> ${roomName}</p>
        <p><strong>📅 Date :</strong> ${date}</p>
        <p><strong>🕐 Horaire :</strong> ${startTime} - ${endTime}</p>
        <p><strong>📝 Motif :</strong> ${motif}</p>
      </div>
      
      <div class="info-box">
        <h3>ℹ️ Informations importantes</h3>
        <p>• Présentez-vous 10 minutes avant le début de votre réservation</p>
        <p>• En cas d'empêchement, annulez votre réservation via l'application</p>
        <p>• Pour toute modification, contactez le service de réservation</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #64748b; font-size: 14px;">
        <em>Nous vous souhaitons une excellente utilisation de nos installations.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'Réservation Validée - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/mes-reservations`,
      actionText: '📱 Voir mes réservations'
    });
  }

  /**
   * Template FYI pour responsables - Rejet de réservation
   */
  getReservationRejectedFYITemplate(data) {
    const { userName, roomName, date, startTime, endTime, motif, reason } = data;
    
    const content = `
      <h2>ℹ️ Réservation refusée</h2>
      <p>Bonjour,</p>
      <p>Une demande de réservation vient d'être <strong style="color: #f59e0b;">refusée</strong> dans le système.</p>
      
      <div class="warning-box">
        <h3>📋 Détails de la demande refusée</h3>
        <p><strong>👤 Utilisateur :</strong> ${userName}</p>
        <p><strong>🏢 Salle demandée :</strong> ${roomName}</p>
        <p><strong>📅 Date :</strong> ${date}</p>
        <p><strong>🕐 Horaire :</strong> ${startTime} - ${endTime}</p>
        <p><strong>📝 Motif initial :</strong> ${motif}</p>
      </div>
      
      <div class="info-box">
        <h3>💬 Raison du refus</h3>
        <p style="font-size: 15px; line-height: 1.6;">${reason}</p>
      </div>
      
      <div class="info-box">
        <h3>✅ Actions effectuées</h3>
        <p>• La demande a été marquée comme refusée</p>
        <p>• L'utilisateur a été notifié par email avec le motif</p>
        <p>• L'historique a été enregistré dans le système</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #64748b; font-size: 13px;">
        <em>Ceci est une notification d'information - aucune action requise.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'FYI: Réservation Refusée - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/admin/reservations`,
      actionText: '📊 Voir l\'historique'
    });
  }

  /**
   * Template pour notification de rejet de réservation (utilisateur)
   */
  getReservationRejectedTemplate(data) {
    const { userName, roomName, date, startTime, endTime, motif, reason } = data;
    
    const content = `
      <h2>❌ Décision concernant votre réservation</h2>
      <p>Bonjour <strong>${userName}</strong>,</p>
      <p>Nous regrettons de vous informer que votre demande de réservation n'a pas pu être approuvée.</p>
      
      <div class="warning-box">
        <h3>📋 Détails de la demande</h3>
        <p><strong>Salle demandée :</strong> ${roomName}</p>
        <p><strong>📅 Date :</strong> ${date}</p>
        <p><strong>🕐 Horaire :</strong> ${startTime} - ${endTime}</p>
        <p><strong>📝 Motif :</strong> ${motif}</p>
      </div>
      
      <div class="info-box">
        <h3>💬 Motif du refus</h3>
        <p style="font-size: 15px; line-height: 1.6;">${reason}</p>
      </div>
      
      <div class="divider"></div>
      
      <p><strong>Que faire maintenant ?</strong></p>
      <p style="color: #475569;">
        • Consultez la disponibilité des salles pour d'autres créneaux<br>
        • Vérifiez si une autre salle correspond à vos besoins<br>
        • Contactez le service de réservation pour plus d'informations
      </p>
      
      <p style="text-align: center; margin-top: 25px;">
        <em style="color: #64748b;">Nous restons à votre disposition pour vous accompagner.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'Réservation Refusée - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/reservations`,
      actionText: '🔄 Faire une nouvelle demande'
    });
  }

  /**
   * Template FYI pour responsables - Proposition d'alternative
   */
  getAlternativeProposedFYITemplate(data) {
    const { userName, originalRoom, originalDate, originalTime, proposedRoom, proposedDate, proposedTime, proposerName, reason } = data;
    
    const content = `
      <h2>ℹ️ Alternative proposée</h2>
      <p>Bonjour,</p>
      <p><strong>${proposerName}</strong> vient de proposer une alternative à <strong>${userName}</strong>.</p>
      
      <div class="warning-box">
        <h3>📋 Demande initiale</h3>
        <p><strong>👤 Utilisateur :</strong> ${userName}</p>
        <p><strong>🏢 Salle :</strong> ${originalRoom}</p>
        <p><strong>📅 Date :</strong> ${originalDate}</p>
        <p><strong>🕐 Horaire :</strong> ${originalTime}</p>
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 8px 16px; background: #f1f5f9; border-radius: 20px; color: #64748b; font-weight: 600;">
          ↓ Proposition alternative ↓
        </div>
      </div>
      
      <div class="success-box">
        <h3>✨ Alternative proposée</h3>
        <p><strong>🏢 Salle :</strong> <span style="color: #16a34a; font-weight: 600;">${proposedRoom}</span></p>
        <p><strong>📅 Date :</strong> ${proposedDate}</p>
        <p><strong>🕐 Horaire :</strong> ${proposedTime}</p>
      </div>
      
      <div class="info-box">
        <h3>💬 Raison</h3>
        <p>${reason}</p>
      </div>
      
      <div class="info-box">
        <h3>⏳ En attente</h3>
        <p>• L'utilisateur a été notifié par email</p>
        <p>• En attente de sa décision (accepter/refuser)</p>
        <p>• Une notification sera envoyée lors de sa réponse</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #64748b; font-size: 13px;">
        <em>Ceci est une notification d'information - aucune action requise.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'FYI: Alternative Proposée - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/admin/alternatives`,
      actionText: '📊 Voir les alternatives'
    });
  }

  /**
   * Template pour proposition d'alternative (utilisateur)
   */
  getAlternativeProposedTemplate(data) {
    const { userName, originalRoom, originalDate, originalTime, proposedRoom, proposedDate, proposedTime, proposerName, reason } = data;
    
    const content = `
      <h2>🔄 Nouvelle proposition pour votre réservation</h2>
      <p>Bonjour <strong>${userName}</strong>,</p>
      <p><strong>${proposerName}</strong> a examiné votre demande et vous propose une <strong style="color: #3b82f6;">solution alternative</strong> pour répondre à vos besoins.</p>
      
      <div class="warning-box">
        <h3>📍 Votre demande initiale</h3>
        <p><strong>Salle :</strong> ${originalRoom}</p>
        <p><strong>📅 Date :</strong> ${originalDate}</p>
        <p><strong>🕐 Horaire :</strong> ${originalTime}</p>
        ${reason ? `<p><strong>💬 Raison :</strong> ${reason}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <div style="display: inline-block; padding: 8px 16px; background: #f1f5f9; border-radius: 20px; font-size: 14px; color: #64748b;">
          ⬇️ Proposition alternative ⬇️
        </div>
      </div>
      
      <div class="success-box">
        <h3>✨ Solution proposée</h3>
        <p><strong>Nouvelle salle :</strong> <span style="color: #22c55e; font-weight: 600;">${proposedRoom}</span></p>
        <p><strong>📅 Date :</strong> ${proposedDate}</p>
        <p><strong>🕐 Horaire :</strong> ${proposedTime}</p>
      </div>
      
      <div class="info-box">
        <h3>🎯 Action requise</h3>
        <p>Consultez cette proposition dans votre espace notifications et choisissez :</p>
        <p style="margin-top: 10px;">
          <strong style="color: #22c55e;">✓ Accepter</strong> cette alternative<br>
          <strong style="color: #ef4444;">✗ Refuser</strong> et faire une nouvelle demande
        </p>
      </div>
      
      <p style="text-align: center; margin-top: 25px;">
        <em style="color: #64748b;">Nous espérons que cette solution conviendra à vos besoins.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'Proposition Alternative - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/notifications`,
      actionText: '👀 Consulter la proposition'
    });
  }

  /**
   * Template pour nouvelle réservation (notification aux admins)
   */
  getNewReservationTemplate(data) {
    const { userName, userEmail, roomName, date, startTime, endTime, motif, department } = data;
    
    const content = `
      <h2>📝 Nouvelle demande en attente de validation</h2>
      <p>Une demande de réservation vient d'être soumise et nécessite votre <strong style="color: #3b82f6;">approbation</strong>.</p>
      
      <div class="info-box">
        <h3>👤 Demandeur</h3>
        <p><strong>Nom complet :</strong> ${userName}</p>
        <p><strong>📧 Email :</strong> <a href="mailto:${userEmail}" style="color: #3b82f6;">${userEmail}</a></p>
        ${department ? `<p><strong>🏢 Département :</strong> <span style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${department}</span></p>` : ''}
      </div>
      
      <div class="success-box">
        <h3>📋 Détails de la demande</h3>
        <p><strong>Salle demandée :</strong> <span style="color: #16a34a; font-weight: 600;">${roomName}</span></p>
        <p><strong>📅 Date :</strong> ${date}</p>
        <p><strong>🕐 Horaire :</strong> ${startTime} - ${endTime}</p>
        <p><strong>📝 Motif :</strong></p>
        <p style="background: white; padding: 10px; border-radius: 6px; margin-top: 8px; font-style: italic;">${motif}</p>
      </div>
      
      <div class="warning-box">
        <h3>⏱️ Action requise</h3>
        <p>Cette demande est en attente de traitement. Veuillez :</p>
        <p style="margin-top: 10px;">
          ✅ <strong>Valider</strong> si la demande est conforme<br>
          ❌ <strong>Refuser</strong> avec un motif si nécessaire<br>
          🔄 <strong>Proposer une alternative</strong> si disponible
        </p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #64748b; font-size: 14px;">
        <em>Merci de traiter cette demande dans les meilleurs délais.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'Nouvelle Réservation - Action Requise',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/admin/reservations`,
      actionText: '⚡ Traiter la demande'
    });
  }

  /**
   * Template pour acceptation d'une alternative
   */
  getAlternativeAcceptedTemplate(data) {
    const { proposerName, userName, roomName, date, time } = data;
    
    const content = `
      <h2>✅ Bonne nouvelle : Proposition acceptée !</h2>
      <p>Bonjour <strong>${proposerName}</strong>,</p>
      <p><strong style="color: #3b82f6;">${userName}</strong> vient d'accepter la proposition alternative que vous avez soumise.</p>
      
      <div class="success-box">
        <h3>🎉 Réservation confirmée</h3>
        <p><strong>Salle :</strong> <span style="color: #16a34a; font-weight: 600;">${roomName}</span></p>
        <p><strong>📅 Date :</strong> ${date}</p>
        <p><strong>🕐 Horaire :</strong> ${time}</p>
      </div>
      
      <div class="info-box">
        <h3>ℹ️ Informations</h3>
        <p>✓ La réservation a été <strong>automatiquement créée</strong> avec le statut "Validée"</p>
        <p>✓ Une notification a été envoyée à l'utilisateur</p>
        <p>✓ La salle apparaît maintenant comme réservée dans le calendrier</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center;">
        <em style="color: #64748b;">Merci pour votre réactivité et votre service de qualité.</em>
      </p>
    `;

    return this.getBaseTemplate({
      title: 'Proposition Acceptée - Port Autonome de Lomé',
      content,
      actionUrl: `${process.env.APP_URL || 'http://localhost:5173'}/admin/reservations`,
      actionText: '📊 Voir toutes les réservations'
    });
  }

  /**
   * Envoi un email
   * @param {Object} options - Options d'envoi
   * @param {string} options.to - Adresse email du destinataire
   * @param {string} options.subject - Sujet de l'email
   * @param {string} options.html - Contenu HTML de l'email
   */
  async sendEmail({ to, subject, html }) {
    if (!this.isReady()) {
      console.warn('⚠️  Service email non configuré. Email non envoyé à:', to);
      return null;
    }
    // Si Resend est activé, on envoie via l'API HTTP (préféré en production)
    if (this.resendEnabled && this.resendApiKey) {
      try {
        const result = await this.sendViaResend({ to, subject, html });
        if (result && result.status === 'ok') {
          console.log(`✅ Email envoyé via Resend à ${to}: ${result.data?.id || 'ok'}`);
          return result;
        }

        console.error('❌ Erreur Resend:', result);
        return null;
      } catch (err) {
        console.error('❌ Exception envoi via Resend:', err.message || err);
        return null;
      }
    }

    // Si SendGrid est activé, on envoie via l'API SendGrid
    if (this.sendgridEnabled && this.sendgridApiKey) {
      try {
        const sgResult = await this.sendViaSendGrid({ to, subject, html });
        if (sgResult && sgResult.status === 'ok') {
          console.log(`✅ Email envoyé via SendGrid à ${to}`);
          return sgResult;
        }
        console.error('❌ Erreur SendGrid:', sgResult);
        return null;
      } catch (err) {
        console.error('❌ Exception envoi via SendGrid:', err.message || err);
        return null;
      }
    }

    // Sinon, on tente l'envoi SMTP via nodemailer
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Réservation PAL'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Email envoyé à ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      // Log l'erreur mais ne pas la propager - fail silently
      // Ceci permet à l'application de continuer même si l'email échoue
      console.error(`❌ Erreur lors de l'envoi d'email à ${to}:`, error.message);
      console.warn('📧 L\'email n\'a pas été envoyé mais la notification en base reste active');
      return null; // Retourne null au lieu de throw pour continuer l'exécution
    }
  }

  /**
   * Envoi via l'API Resend (https://api.resend.com/emails)
   * Utilise le champ RESEND_API_KEY pour l'autorisation
   */
  async sendViaResend({ to, subject, html }) {
    if (!this.resendApiKey) return { status: 'error', error: 'no_api_key' };

    const payload = JSON.stringify({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.resendApiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 10000,
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : null;
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ status: 'ok', data: parsed });
            } else {
              resolve({ status: 'error', statusCode: res.statusCode, body: parsed || body });
            }
          } catch (e) {
            resolve({ status: 'error', error: e.message, raw: body });
          }
        });
      });

      req.on('error', (err) => resolve({ status: 'error', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 'error', error: 'timeout' }); });
      req.write(payload);
      req.end();
    });
  }

  /**
   * Envoi via l'API SendGrid (https://api.sendgrid.com/v3/mail/send)
   * Utilise le champ SENDGRID_API_KEY pour l'autorisation
   */
  async sendViaSendGrid({ to, subject, html }) {
    if (!this.sendgridApiKey) return { status: 'error', error: 'no_api_key' };

    const payload = JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.EMAIL_FROM || process.env.EMAIL_USER },
      subject: subject,
      content: [{ type: 'text/html', value: html }]
    });

    const options = {
      hostname: 'api.sendgrid.com',
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.sendgridApiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 10000,
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: 'ok', statusCode: res.statusCode });
          } else {
            let parsed = null;
            try { parsed = body ? JSON.parse(body) : null; } catch (e) { parsed = body; }
            resolve({ status: 'error', statusCode: res.statusCode, body: parsed });
          }
        });
      });

      req.on('error', (err) => resolve({ status: 'error', error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 'error', error: 'timeout' }); });
      req.write(payload);
      req.end();
    });
  }

  /**
   * Envoi une notification de validation de réservation
   */
  async sendReservationValidated(user, reservation) {
    const dataTemplate = {
      userName: `${user.prenom} ${user.nom}`,
      roomName: reservation.salle?.nom || reservation.Room?.nom || 'Salle inconnue',
      date: new Date(reservation.date_debut).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      startTime: new Date(reservation.date_debut).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      endTime: new Date(reservation.date_fin).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      motif: reservation.motif || 'Non spécifié',
    };

    // Email pour l'utilisateur (personnel)
    const htmlUser = this.getReservationValidatedTemplate(dataTemplate);

    // Envoi à l'utilisateur
    const userEmailResult = await this.sendEmail({
      to: user.email,
      subject: '✅ Réservation validée - Port Autonome de Lomé',
      html: htmlUser,
    });

    // Email FYI pour les responsables (informatif)
    const htmlFYI = this.getReservationValidatedFYITemplate(dataTemplate);

    // Envoi aux admins et responsables (préférer responsables si setting activé)
    const roomId = reservation.room_id || (reservation.salle && reservation.salle.id) || null;
    const adminsEmails = await this.getAdminsAndResponsablesEmails(roomId);
    if (adminsEmails.length > 0) {
      await this.sendEmail({
        to: adminsEmails.join(','),
        subject: 'ℹ️ FYI: Réservation validée - Port Autonome de Lomé',
        html: htmlFYI,
      }).catch(err => console.error('❌ Erreur envoi aux responsables:', err.message));
    }

    return userEmailResult;
  }

  /**
   * Envoi une notification de rejet de réservation
   */
  async sendReservationRejected(user, reservation, reason) {
    const dataTemplate = {
      userName: `${user.prenom} ${user.nom}`,
      roomName: reservation.salle?.nom || reservation.Room?.nom || 'Salle inconnue',
      date: new Date(reservation.date_debut).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      startTime: new Date(reservation.date_debut).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      endTime: new Date(reservation.date_fin).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      motif: reservation.motif || 'Non spécifié',
      reason: reason || 'Aucun motif spécifié',
    };

    // Email pour l'utilisateur (personnel)
    const htmlUser = this.getReservationRejectedTemplate(dataTemplate);

    // Envoi à l'utilisateur
    const userEmailResult = await this.sendEmail({
      to: user.email,
      subject: '❌ Réservation refusée - Port Autonome de Lomé',
      html: htmlUser,
    });

    // Email FYI pour les responsables (informatif)
    const htmlFYI = this.getReservationRejectedFYITemplate(dataTemplate);

    // Envoi aux admins et responsables (préférer responsables si setting activé)
    const roomId = reservation.room_id || (reservation.salle && reservation.salle.id) || null;
    const adminsEmails = await this.getAdminsAndResponsablesEmails(roomId);
    if (adminsEmails.length > 0) {
      await this.sendEmail({
        to: adminsEmails.join(','),
        subject: 'ℹ️ FYI: Réservation refusée - Port Autonome de Lomé',
        html: htmlFYI,
      }).catch(err => console.error('❌ Erreur envoi aux responsables:', err.message));
    }

    return userEmailResult;
  }

  /**
   * Envoi une notification de proposition alternative
   */
  async sendAlternativeProposed(user, alternativeData) {
    // Email pour l'utilisateur (personnel)
    const htmlUser = this.getAlternativeProposedTemplate(alternativeData);

    // Envoi à l'utilisateur
    const userEmailResult = await this.sendEmail({
      to: user.email,
      subject: '🔄 Proposition de salle alternative - Port Autonome de Lomé',
      html: htmlUser,
    });

    // Email FYI pour les responsables (informatif)
    const htmlFYI = this.getAlternativeProposedFYITemplate(alternativeData);

    // Envoi aux admins et responsables (préférer responsables si setting activé)
    const roomId = reservation.room_id || (reservation.salle && reservation.salle.id) || null;
    const adminsEmails = await this.getAdminsAndResponsablesEmails(roomId);
    if (adminsEmails.length > 0) {
      await this.sendEmail({
        to: adminsEmails.join(','),
        subject: 'ℹ️ FYI: Alternative proposée - Port Autonome de Lomé',
        html: htmlFYI,
      }).catch(err => console.error('❌ Erreur envoi aux responsables:', err.message));
    }

    return userEmailResult;
  }

  /**
   * Envoi une notification de nouvelle réservation aux admins
   */
  async sendNewReservationToAdmins(adminEmail, reservationData) {
    const html = this.getNewReservationTemplate(reservationData);

    return this.sendEmail({
      to: adminEmail,
      subject: '📝 Nouvelle demande de réservation - Port Autonome de Lomé',
      html,
    });
  }

  /**
   * Envoi une notification d'acceptation d'alternative
   */
  async sendAlternativeAccepted(proposerEmail, acceptanceData) {
    const html = this.getAlternativeAcceptedTemplate(acceptanceData);

    // Envoi au proposeur
    const proposerEmailResult = await this.sendEmail({
      to: proposerEmail,
      subject: '✅ Proposition alternative acceptée - Port Autonome de Lomé',
      html,
    });

    // Envoi aux autres admins et responsables (préférer responsables si setting activé)
    const roomId = alternativeData.room_id || (alternativeData.salle && alternativeData.salle.id) || null;
    const adminsEmails = await this.getAdminsAndResponsablesEmails(roomId);
    const otherAdmins = adminsEmails.filter(email => email !== proposerEmail);
    if (otherAdmins.length > 0) {
      await this.sendEmail({
        to: otherAdmins.join(','),
        subject: '✅ Proposition alternative acceptée - Port Autonome de Lomé',
        html,
      }).catch(err => console.error('❌ Erreur envoi aux responsables:', err.message));
    }

    return proposerEmailResult;
  }
}

// Export une instance unique (singleton)
module.exports = new EmailService();
