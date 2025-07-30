// middleware/errorHandler.js
const logger = require('../helpers/logger');

// Classes d'erreurs personnalisées
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

// Gestionnaire d'erreurs Sequelize
const handleSequelizeError = (err) => {
  let error;

  switch (err.name) {
    case 'SequelizeValidationError':
      const errors = err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
      error = new ValidationError('Validation failed', errors);
      break;

    case 'SequelizeUniqueConstraintError':
      const field = err.errors[0].path;
      error = new ConflictError(`${field} already exists`);
      break;

    case 'SequelizeForeignKeyConstraintError':
      error = new AppError('Referenced resource does not exist', 400, 'FOREIGN_KEY_ERROR');
      break;

    case 'SequelizeConnectionError':
      error = new AppError('Database connection error', 503, 'DATABASE_ERROR');
      break;

    case 'SequelizeTimeoutError':
      error = new AppError('Database query timeout', 504, 'DATABASE_TIMEOUT');
      break;

    default:
      error = new AppError('Database error occurred', 500, 'DATABASE_ERROR');
  }

  return error;
};

// Gestionnaire d'erreurs JWT
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token expired');
  }
  return new UnauthorizedError('Token error');
};

// Formatage des erreurs pour différents environnements
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      status: err.status,
      code: err.code,
      message: err.message,
      stack: err.stack,
      errors: err.errors || []
    }
  });
};

const sendErrorProd = (err, res) => {
  // Erreurs opérationnelles : envoyer le message au client
  if (err.isOperational) {
    const response = {
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    };

    // Ajouter les détails de validation si disponibles
    if (err.errors && err.errors.length > 0) {
      response.error.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
  } else {
    // Erreurs de programmation : ne pas exposer les détails
    logger.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong!'
      }
    });
  }
};

// Middleware principal de gestion d'erreurs
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log de l'erreur
  logger.error(`Error ${err.statusCode}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    stack: err.stack
  });

  let error = { ...err };
  error.message = err.message;

  // Gestion des erreurs spécifiques
  if (err.name?.startsWith('Sequelize')) {
    error = handleSequelizeError(err);
  }
  
  if (err.name?.includes('JsonWebToken') || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Code 11000 = Duplicate key error (MongoDB style, adapt for MySQL if needed)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ConflictError(`${field} already exists`);
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Middleware pour capturer les erreurs asynchrones
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware pour les routes non trouvées
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Gestionnaire pour les promesses rejetées non capturées
process.on('unhandledRejection', (err, promise) => {
  logger.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  
  process.exit(1);
});

// Gestionnaire pour les exceptions non capturées
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  
  process.exit(1);
});

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  globalErrorHandler,
  catchAsync,
  notFound
};

// helpers/logger.js - Système de logging
const winston = require('winston');
const path = require('path');

// Configuration des formats de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'reservation-backend' },
  transports: [
    // Logs d'erreurs dans un fichier séparé
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // Tous les logs dans combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// En développement, aussi logger dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;