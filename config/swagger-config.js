const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration de base Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Réservation',
      version: '1.0.0',
      description: 'API REST pour la gestion des réservations de salles',
      contact: {
        name: 'Équipe Développement',
        email: 'dev@reservation.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.reservation.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification'
        }
      },
      schemas: {
        // Schéma User
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur'
            },
            nom: {
              type: 'string',
              description: 'Nom de l\'utilisateur'
            },
            prenom: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user'],
              description: 'Rôle de l\'utilisateur'
            },
            telephone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        
        // Schéma Room
        Room: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de la salle'
            },
            nom: {
              type: 'string',
              description: 'Nom de la salle'
            },
            description: {
              type: 'string',
              description: 'Description de la salle'
            },
            capacite: {
              type: 'integer',
              description: 'Capacité maximale de la salle'
            },
            equipements: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Liste des équipements disponibles'
            },
            prix_heure: {
              type: 'number',
              format: 'decimal',
              description: 'Prix par heure de location'
            },
            statut: {
              type: 'string',
              enum: ['disponible', 'maintenance', 'hors_service'],
              description: 'Statut de la salle'
            }
          }
        },
        
        // Schéma Reservation
        Reservation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de la réservation'
            },
            utilisateur_id: {
              type: 'integer',
              description: 'ID de l\'utilisateur qui réserve'
            },
            salle_id: {
              type: 'integer',
              description: 'ID de la salle réservée'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date de la réservation (YYYY-MM-DD)'
            },
            heure_debut: {
              type: 'string',
              format: 'time',
              description: 'Heure de début (HH:MM:SS)'
            },
            heure_fin: {
              type: 'string',
              format: 'time',
              description: 'Heure de fin (HH:MM:SS)'
            },
            statut: {
              type: 'string',
              enum: ['en_attente', 'confirme', 'annule', 'termine'],
              description: 'Statut de la réservation'
            },
            prix_total: {
              type: 'number',
              format: 'decimal',
              description: 'Prix total de la réservation'
            },
            notes: {
              type: 'string',
              description: 'Notes additionnelles'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        
        // Schémas de réponses standardisées
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Opération réussie'
            },
            data: {
              type: 'object',
              description: 'Données de la réponse'
            }
          }
        },
        
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Message d\'erreur'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Détails additionnels sur l\'erreur'
            }
          }
        },
        
        // Schémas pour les requêtes
        ReservationCreateRequest: {
          type: 'object',
          required: ['salle_id', 'date', 'heure_debut', 'heure_fin'],
          properties: {
            salle_id: {
              type: 'integer',
              description: 'ID de la salle à réserver'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date de la réservation'
            },
            heure_debut: {
              type: 'string',
              format: 'time',
              description: 'Heure de début'
            },
            heure_fin: {
              type: 'string',
              format: 'time',
              description: 'Heure de fin'
            },
            notes: {
              type: 'string',
              description: 'Notes additionnelles'
            }
          }
        },
        
        ReservationUpdateRequest: {
          type: 'object',
          properties: {
            statut: {
              type: 'string',
              enum: ['en_attente', 'confirme', 'annule', 'termine'],
              description: 'Nouveau statut de la réservation'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Nouvelle date de la réservation'
            },
            heure_debut: {
              type: 'string',
              format: 'time',
              description: 'Nouvelle heure de début'
            },
            heure_fin: {
              type: 'string',
              format: 'time',
              description: 'Nouvelle heure de fin'
            },
            notes: {
              type: 'string',
              description: 'Nouvelles notes'
            }
          }
        },
        
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Mot de passe'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './app.js'
  ]
};

// Génération des spécifications Swagger
const specs = swaggerJsdoc(options);

// Configuration de l'interface Swagger UI
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .scheme-container { padding: 30px 0; }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info .title { color: #3b4151; }
  `,
  customSiteTitle: 'API Réservation - Documentation',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};