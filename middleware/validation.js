// middleware/validation.js
const Joi = require('joi');

/**
 * Middleware de validation générique utilisant Joi
 * @param {Object} schema - Schéma Joi pour la validation
 * @param {string} property - Propriété à valider ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retourne toutes les erreurs
      stripUnknown: true, // Supprime les champs non définis
      convert: true // Convertit automatiquement les types
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: errors
      });
    }

    // Remplace les données par les valeurs validées et nettoyées
    req[property] = value;
    next();
  };
};

// Schémas de validation pour l'authentification
const authSchemas = {
  register: Joi.object({
    nom: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)
      .required()
      .messages({
        'string.pattern.base': 'Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes'
      }),
    
    prenom: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÀ-ÿ\s-']+$/)
      .required()
      .messages({
        'string.pattern.base': 'Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial'
      }),
    
    role: Joi.string()
      .valid('user', 'admin', 'responsable')
      .default('user'),
    
    poste: Joi.string()
      .max(100)
      .optional(),
    
    telephone: Joi.string()
      .pattern(/^(\+33|0)[1-9](\d{8})$/)
      .optional()
      .messages({
        'string.pattern.base': 'Numéro de téléphone français invalide'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    
    password: Joi.string()
      .required()
  })
};

// Schémas de validation pour les salles
const roomSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required(),
    
    description: Joi.string()
      .max(500)
      .optional(),
    
    capacity: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .required(),
    
    location: Joi.string()
      .max(200)
      .required(),
    
    equipment: Joi.array()
      .items(Joi.string().max(50))
      .default([]),
    
    isActive: Joi.boolean()
      .default(true),
    
    hourlyRate: Joi.number()
      .precision(2)
      .min(0)
      .optional(),
    
    image: Joi.string()
      .uri()
      .optional()
  }),

  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    
    description: Joi.string()
      .max(500)
      .optional(),
    
    capacity: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional(),
    
    location: Joi.string()
      .max(200)
      .optional(),
    
    equipment: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    
    isActive: Joi.boolean()
      .optional(),
    
    hourlyRate: Joi.number()
      .precision(2)
      .min(0)
      .optional(),
    
    image: Joi.string()
      .uri()
      .optional()
  })
};

// Schémas de validation pour les réservations
const reservationSchemas = {
  create: Joi.object({
    roomId: Joi.number()
      .integer()
      .positive()
      .required(),
    
    startTime: Joi.date()
      .iso()
      .min('now')
      .required(),
    
    endTime: Joi.date()
      .iso()
      .greater(Joi.ref('startTime'))
      .required(),
    
    purpose: Joi.string()
      .min(5)
      .max(200)
      .required(),
    
    participants: Joi.number()
      .integer()
      .min(1)
      .required(),
    
    notes: Joi.string()
      .max(500)
      .optional()
  }),

  update: Joi.object({
    startTime: Joi.date()
      .iso()
      .optional(),
    
    endTime: Joi.date()
      .iso()
      .when('startTime', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startTime')),
        otherwise: Joi.date()
      })
      .optional(),
    
    purpose: Joi.string()
      .min(5)
      .max(200)
      .optional(),
    
    participants: Joi.number()
      .integer()
      .min(1)
      .optional(),
    
    notes: Joi.string()
      .max(500)
      .optional(),
    
    status: Joi.string()
      .valid('pending', 'confirmed', 'cancelled', 'completed')
      .optional()
  }),

  query: Joi.object({
    roomId: Joi.number()
      .integer()
      .positive()
      .optional(),
    
    startDate: Joi.date()
      .iso()
      .optional(),
    
    endDate: Joi.date()
      .iso()
      .when('startDate', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startDate')),
        otherwise: Joi.date()
      })
      .optional(),
    
    status: Joi.string()
      .valid('pending', 'confirmed', 'cancelled', 'completed')
      .optional(),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
  })
};

// Schémas de validation pour les paramètres d'URL
const paramSchemas = {
  id: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
  }),
  
  userId: Joi.object({
    userId: Joi.number()
      .integer()
      .positive()
      .required()
  }),
  
  roomId: Joi.object({
    roomId: Joi.number()
      .integer()
      .positive()
      .required()
  })
};

// Middleware spécialisés pour chaque route
const validators = {
  // Authentification
  validateRegister: validate(authSchemas.register),
  validateLogin: validate(authSchemas.login),
  
  // Salles
  validateCreateRoom: validate(roomSchemas.create),
  validateUpdateRoom: validate(roomSchemas.update),
  
  // Réservations
  validateCreateReservation: validate(reservationSchemas.create),
  validateUpdateReservation: validate(reservationSchemas.update),
  validateReservationQuery: validate(reservationSchemas.query, 'query'),
  
  // Paramètres
  validateId: validate(paramSchemas.id, 'params'),
  validateUserId: validate(paramSchemas.userId, 'params'),
  validateRoomId: validate(paramSchemas.roomId, 'params')
};

module.exports = {
  validate,
  validators,
  schemas: {
    auth: authSchemas,
    room: roomSchemas,
    reservation: reservationSchemas,
    params: paramSchemas
  }
};