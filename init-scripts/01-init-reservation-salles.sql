-- Initialisation de la base reservation_salles
-- Ce script sera exécuté automatiquement au premier démarrage de MySQL

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS reservation_salles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utilisation de la base
USE reservation_salles;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des salles
CREATE TABLE IF NOT EXISTS salles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    capacite INT NOT NULL,
    equipements JSON,
    prix_heure DECIMAL(10,2) DEFAULT 0,
    statut ENUM('disponible', 'maintenance', 'indisponible') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    salle_id INT NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    statut ENUM('en_attente', 'confirmee', 'annulee', 'terminee') DEFAULT 'en_attente',
    motif TEXT,
    nombre_participants INT DEFAULT 1,
    prix_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_reservations_date ON reservations(date_debut, date_fin);
CREATE INDEX idx_reservations_salle ON reservations(salle_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);

-- Données de test (optionnel)
INSERT IGNORE INTO salles (nom, description, capacite, prix_heure) VALUES 
('Salle de Conférence A', 'Grande salle avec vidéoprojecteur', 50, 25.00),
('Salle de Réunion B', 'Salle équipée pour 10 personnes', 10, 15.00),
('Salle de Formation C', 'Salle avec matériel informatique', 20, 20.00);

-- Utilisateur admin par défaut (mot de passe: admin123)
-- Note: Le hash doit être généré par votre application
INSERT IGNORE INTO users (nom, prenom, email, password, role) VALUES 
('Admin', 'Système', 'admin@reservation.com', '$2b$10$hash_du_mot_de_passe', 'admin');