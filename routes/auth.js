const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { authenticateToken } = require("../middlewares/auth");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

// 🔑 Route de connexion (votre version améliorée)
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    
    // Validation des données requises
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'motDePasse', 'nom', 'prenom', 'role', 'isActive']
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification du compte actif
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Erreur login :", error);
    return res.status(500).json({ 
      success: false,
      error: "⛔ Erreur serveur lors de la connexion" 
    });
  }
});

// 📝 Route d'inscription (nouvelle)
router.post('/register', async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom, role = 'user' } = req.body;

    // Validation des champs requis
    if (!email || !motDePasse || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Validation de la longueur du mot de passe
    if (motDePasse.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Hashage du mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

    // Création de l'utilisateur
    const newUser = await User.create({
      email,
      motDePasse: hashedPassword,
      nom,
      prenom,
      role: ['admin', 'manager', 'user'].includes(role) ? role : 'user',
      isActive: true
    });

    // Génération du token JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        nom: newUser.nom,
        prenom: newUser.prenom,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});

// 👤 Route pour obtenir le profil utilisateur (nouvelle - c'est celle qui manquait !)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'email', 'nom', 'prenom', 'role', 'isActive', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        isActive: user.isActive,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil'
    });
  }
});

// ✏️ Route pour mettre à jour le profil (nouvelle)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nom, prenom, currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Si on veut changer le mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel requis pour le changement'
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.motDePasse);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ motDePasse: hashedNewPassword });
    }

    // Mise à jour des autres champs
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;

    if (Object.keys(updateData).length > 0) {
      await user.update(updateData);
    }

    // Récupération des données mises à jour
    await user.reload();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
});

// 🔍 Route pour vérifier la validité du token (nouvelle)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token valide',
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// 🚪 Route de déconnexion (nouvelle)
router.post('/logout', authenticateToken, (req, res) => {
  // Avec JWT, la déconnexion se fait côté client en supprimant le token
  // On peut log l'action pour audit
  console.log(`Utilisateur ${req.user.email} déconnecté`);
  
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

module.exports = router;