'use strict';

const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const packageJson = require('../package.json');

/**
 * @swagger
 * /api/meta:
 *   get:
 *     summary: Informations système et état de l'API
 *     description: Retourne les métadonnées du système, état de la base de données, et informations d'environnement
 *     tags: [Métadonnées]
 *     responses:
 *       200:
 *         description: Informations système récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 système:
 *                   type: object
 *                 base_données:
 *                   type: object
 *                 environnement:
 *                   type: object
 *                 performance:
 *                   type: object
 */
router.get('/meta', async (req, res) => {
  try {
    // Test de connexion DB
    let dbStatus = 'DÉCONNECTÉ';
    let dbInfo = {};
    
    try {
      await sequelize.authenticate();
      dbStatus = 'CONNECTÉ';
      
      // Informations sur la base de données
      const dbConfig = sequelize.config;
      dbInfo = {
        dialecte: sequelize.getDialect(),
        base: dbConfig.database,
        hôte: dbConfig.host,
        port: dbConfig.port,
        version: await sequelize.databaseVersion()
      };
    } catch (error) {
      dbInfo.erreur = error.message;
    }

    // Informations système
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const meta = {
      système: {
        nom: packageJson.name || 'Système de Réservation de Salles',
        description: packageJson.description || 'API Backend de gestion des réservations',
        version: packageJson.version || '1.0.0',
        node_version: process.version,
        plateforme: process.platform,
        architecture: process.arch,
        uptime_secondes: Math.floor(uptime),
        uptime_humain: formatUptime(uptime)
      },
      base_données: {
        statut: dbStatus,
        ...dbInfo
      },
      environnement: {
        mode: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      performance: {
        mémoire: {
          rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
          heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          externe_mb: Math.round(memoryUsage.external / 1024 / 1024)
        },
        load_average: process.platform !== 'win32' ? require('os').loadavg() : 'N/A (Windows)'
      },
      horodatage: new Date().toISOString(),
      request_id: `meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    res.json(meta);
  } catch (error) {
    console.error('❌ Erreur GET /api/meta:', error);
    res.status(500).json({
      succès: false,
      message: 'Erreur lors de la récupération des métadonnées système',
      erreur: error.message,
      horodatage: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Version de l'API et informations de build
 *     description: Retourne la version actuelle de l'API, les dépendances principales et les informations de déploiement
 *     tags: [Métadonnées]
 *     responses:
 *       200:
 *         description: Informations de version récupérées avec succès
 */
router.get('/version', (req, res) => {
  try {
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    const versionInfo = {
      api: {
        nom: packageJson.name || 'reservation-backend',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'API de réservation de salles',
        auteur: packageJson.author || 'Équipe Développement'
      },
      runtime: {
        node: process.version,
        npm: process.env.npm_version || 'N/A'
      },
      dépendances_principales: {
        express: dependencies.express || 'N/A',
        sequelize: dependencies.sequelize || 'N/A',
        mysql2: dependencies.mysql2 || 'N/A',
        jsonwebtoken: dependencies.jsonwebtoken || 'N/A',
        bcryptjs: dependencies.bcryptjs || 'N/A'
      },
      build: {
        timestamp: process.env.BUILD_TIMESTAMP || new Date().toISOString(),
        commit: process.env.GIT_COMMIT || 'N/A',
        branche: process.env.GIT_BRANCH || 'N/A',
        environnement: process.env.NODE_ENV || 'development'
      },
      compatibilité: {
        node_min: packageJson.engines?.node || '>=14.0.0',
        npm_min: packageJson.engines?.npm || '>=6.0.0'
      },
      horodatage: new Date().toISOString()
    };

    res.json(versionInfo);
  } catch (error) {
    console.error('❌ Erreur GET /api/version:', error);
    res.status(500).json({
      succès: false,
      message: 'Erreur lors de la récupération des informations de version',
      erreur: error.message
    });
  }
});

/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: Inventaire des routes et permissions disponibles
 *     description: Retourne la liste complète des endpoints disponibles avec leurs méthodes, permissions requises et statut d'audit
 *     tags: [Métadonnées]
 *     responses:
 *       200:
 *         description: Inventaire des routes récupéré avec succès
 */
router.get('/info', (req, res) => {
  try {
    // Inventaire des routes principales (à adapter selon votre structure réelle)
    const routesInventory = {
      authentification: {
        'POST /api/auth/login': {
          description: 'Connexion utilisateur',
          permission: 'public',
          audit: true,
          corps_requis: ['email', 'password']
        },
        'POST /api/auth/logout': {
          description: 'Déconnexion utilisateur',
          permission: 'authentifié',
          audit: true
        },
        'GET /api/auth/profile': {
          description: 'Profil utilisateur actuel',
          permission: 'authentifié',
          audit: false
        }
      },
      utilisateurs: {
        'GET /api/users': {
          description: 'Liste des utilisateurs',
          permission: 'admin',
          audit: false,
          pagination: true
        },
        'POST /api/users': {
          description: 'Créer un utilisateur',
          permission: 'admin',
          audit: true,
          corps_requis: ['nom', 'email', 'role']
        },
        'PUT /api/users/:id': {
          description: 'Modifier un utilisateur',
          permission: 'admin|propriétaire',
          audit: true
        },
        'DELETE /api/users/:id': {
          description: 'Supprimer un utilisateur',
          permission: 'admin',
          audit: true
        }
      },
      salles: {
        'GET /api/rooms': {
          description: 'Liste des salles',
          permission: 'authentifié',
          audit: false,
          filtres: ['capacite', 'equipements', 'responsable_id']
        },
        'POST /api/rooms': {
          description: 'Créer une salle',
          permission: 'admin|responsable_salle',
          audit: true,
          corps_requis: ['nom', 'capacite', 'responsable_id']
        },
        'PUT /api/rooms/:id': {
          description: 'Modifier une salle',
          permission: 'admin|responsable_salle',
          audit: true
        },
        'DELETE /api/rooms/:id': {
          description: 'Supprimer une salle',
          permission: 'admin',
          audit: true
        }
      },
      réservations: {
        'GET /api/reservations': {
          description: 'Liste des réservations',
          permission: 'authentifié',
          audit: false,
          filtres: ['date', 'salle_id', 'statut', 'utilisateur_id']
        },
        'GET /api/reservations/list': {
          description: 'Liste détaillée avec associations',
          permission: 'authentifié',
          audit: false
        },
        'POST /api/reservations': {
          description: 'Créer une réservation',
          permission: 'authentifié',
          audit: true,
          corps_requis: ['room_id', 'date', 'heure_debut', 'heure_fin']
        },
        'PUT /api/reservations/:id': {
          description: 'Modifier une réservation',
          permission: 'admin|propriétaire',
          audit: true
        },
        'DELETE /api/reservations/:id': {
          description: 'Supprimer une réservation',
          permission: 'admin|propriétaire',
          audit: true
        },
        'GET /api/reservations/occupation/roles': {
          description: 'Statistiques d\'occupation par rôle',
          permission: 'admin|responsable_salle',
          audit: false
        }
      },
      métadonnées: {
        'GET /api/meta': {
          description: 'Informations système',
          permission: 'public',
          audit: false
        },
        'GET /api/version': {
          description: 'Version de l\'API',
          permission: 'public',
          audit: false
        },
        'GET /api/info': {
          description: 'Inventaire des routes',
          permission: 'public',
          audit: false
        }
      },
      système: {
        'GET /health': {
          description: 'Vérification de santé',
          permission: 'public',
          audit: false
        },
        'GET /api-docs': {
          description: 'Documentation Swagger',
          permission: 'public',
          audit: false
        }
      }
    };

    // Résumé statistiques
    let totalRoutes = 0;
    let routesAuditées = 0;
    let routesPubliques = 0;

    Object.values(routesInventory).forEach(category => {
      Object.values(category).forEach(route => {
        totalRoutes++;
        if (route.audit) routesAuditées++;
        if (route.permission === 'public') routesPubliques++;
      });
    });

    const infoResponse = {
      résumé: {
        total_routes: totalRoutes,
        routes_auditées: routesAuditées,
        routes_publiques: routesPubliques,
        routes_protégées: totalRoutes - routesPubliques,
        taux_audit: `${Math.round((routesAuditées / totalRoutes) * 100)}%`
      },
      routes: routesInventory,
      permissions_disponibles: [
        'public',
        'authentifié',
        'admin',
        'responsable_salle',
        'utilisateur',
        'propriétaire'
      ],
      types_audit: [
        'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
        'CREATE_ROOM', 'UPDATE_ROOM', 'DELETE_ROOM',
        'CREATE_RESERVATION', 'UPDATE_RESERVATION', 'DELETE_RESERVATION'
      ],
      horodatage: new Date().toISOString(),
      version_api: packageJson.version || '1.0.0'
    };

    res.json(infoResponse);
  } catch (error) {
    console.error('❌ Erreur GET /api/info:', error);
    res.status(500).json({
      succès: false,
      message: 'Erreur lors de la récupération de l\'inventaire des routes',
      erreur: error.message
    });
  }
});

// Fonction utilitaire pour formater l'uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}j ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

module.exports = router;