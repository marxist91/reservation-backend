const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middlewares
const { validators } = require('../middleware/validation');
const { catchAsync, AppError, ConflictError } = require('../middleware/errorHandler');

// Models
const { User } = require('../models');

// Helpers
const logger = require('../helpers/logger');

// Utils
const JWT_ISSUER = 'reservation-backend';
const JWT_AUDIENCE = 'reservation-app';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un utilisateur
 * @access Public
 */
router.post('/register',
  validators.validateRegister,
  catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName, lastName, email, password: hashedPassword,
      role, department, phone
    });

    logger.info('Nouvel utilisateur enregistré', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user.id,
          firstName, lastName, email, role, department, phone,
          createdAt: user.createdAt
        },
        token
      }
    });
  })
);

/**
 * @route POST /api/auth/login
 * @desc Connexion utilisateur
 * @access Public
 */
router.post('/login',
  validators.validateLogin,
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'department', 'phone', 'isActive', 'lastLoginAt']
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Compte désactivé. Contactez un administrateur.', 403, 'ACCOUNT_DISABLED');
    }

    logger.info('Connexion utilisateur réussie', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    await user.update({ lastLoginAt: new Date() });

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          lastLoginAt: user.lastLoginAt
        },
        token
      }
    });
  })
);

module.exports = router;