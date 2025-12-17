-- ========================================
-- Script d'initialisation XAMPP
-- Réservation de Salles - Port Autonome
-- ========================================

-- Création de l'utilisateur admin
-- (removed) CREATE USER IF NOT EXISTS 'marcel_admin'@'localhost' IDENTIFIED BY 'Reservation2025!';

-- Sélectionner la base
USE reservation_salles;

-- ========================================
-- TABLES
-- ========================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'responsable', 'user') DEFAULT 'user',
    poste VARCHAR(100),
    telephone VARCHAR(20),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des salles
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    capacite INT NOT NULL,
    equipements JSON,
    batiment VARCHAR(50),
    etage VARCHAR(10),
    superficie DECIMAL(8,2),
    -- prix_heure DECIMAL(10,2) DEFAULT 0,
    responsable_id INT,
    statut ENUM('disponible', 'maintenance', 'indisponible') DEFAULT 'disponible',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_statut (statut),
    INDEX idx_capacite (capacite),
    INDEX idx_responsable (responsable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    statut ENUM('en_attente', 'validee', 'confirmee', 'annulee', 'terminee', 'rejetee') DEFAULT 'en_attente',
    motif TEXT,
    nombre_participants INT DEFAULT 1,
    equipements_supplementaires JSON,
    -- prix_total DECIMAL(10,2) DEFAULT 0,
    commentaire_admin TEXT,
    validee_par INT,
    validee_le TIMESTAMP NULL,
    department_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (validee_par) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_room (room_id),
    INDEX idx_department (department_id),
    INDEX idx_statut (statut),
    INDEX idx_dates (date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des actions (logs simplifiés)
CREATE TABLE IF NOT EXISTS action_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DONNÉES DE TEST
-- ========================================

-- Utilisateur admin par défaut (mot de passe: Admin123!)
-- Hash bcrypt de "Admin123!"
INSERT INTO users (nom, prenom, email, password, role, actif) 
VALUES (
    'Admin', 
    'Système', 
    'admin@port-autonome.com', 
    '$2a$10$9kKqC0EHEhvxKpFKDqLz4eMOE.vJxBqJqKhP.MdtC.wZqGJxE8yKC',
    'admin',
    TRUE
) ON DUPLICATE KEY UPDATE email = email;

-- Utilisateur test (mot de passe: User123!)
INSERT INTO users (nom, prenom, email, password, role, actif) 
VALUES (
    'Dupont', 
    'Jean', 
    'jean.dupont@port-autonome.com', 
    '$2a$10$vI7ZQqC0dKOkPP.xJ6E9WOzLKJLmWQqXhqYGKXQHQK8kBQKXQKXQK',
    'user',
    TRUE
) ON DUPLICATE KEY UPDATE email = email;

-- Salles exemples
INSERT INTO rooms (nom, description, capacite, batiment, etage, statut, equipements) 
VALUES 
    ('Salle de Réunion A', 'Grande salle pour réunions importantes', 20, 'Bâtiment Principal', '1er', 'disponible', 
     JSON_ARRAY('Projecteur', 'Écran', 'Tableau blanc', 'Visioconférence')),
    ('Salle de Réunion B', 'Salle moyenne pour équipes', 10, 'Bâtiment Principal', '2ème', 'disponible', 
     JSON_ARRAY('Écran TV', 'Tableau blanc')),
    ('Salle de Formation', 'Salle équipée pour formations', 30, 'Bâtiment Annexe', 'RDC', 'disponible', 
     JSON_ARRAY('Projecteur', 'Écran', 'Tables modulables', 'Wifi')),
    ('Bureau Partagé 1', 'Espace de travail collaboratif', 6, 'Bâtiment Principal', '3ème', 'disponible', 
     JSON_ARRAY('Wifi', 'Prises électriques'))
ON DUPLICATE KEY UPDATE nom = nom;

-- ========================================
-- VUES UTILES
-- ========================================

-- Vue des réservations avec détails
CREATE OR REPLACE VIEW v_reservations_details AS
SELECT 
    r.id,
    r.date_debut,
    r.date_fin,
    r.statut,
    r.motif,
    r.nombre_participants,
    u.nom AS user_nom,
    u.prenom AS user_prenom,
    u.email AS user_email,
    rm.nom AS salle_nom,
    rm.capacite AS salle_capacite,
    rm.batiment,
    v.nom AS validateur_nom,
    r.validee_le,
    r.created_at
FROM reservations r
JOIN users u ON r.user_id = u.id
JOIN rooms rm ON r.room_id = rm.id
LEFT JOIN users v ON r.validee_par = v.id;

-- Vue des salles disponibles
CREATE OR REPLACE VIEW v_salles_disponibles AS
SELECT 
    id,
    nom,
    description,
    capacite,
    equipements,
    batiment,
    etage
FROM rooms
WHERE statut = 'disponible';

-- ========================================
-- PROCÉDURES STOCKÉES
-- ========================================

DELIMITER //

-- Procédure pour vérifier disponibilité d'une salle
CREATE PROCEDURE IF NOT EXISTS sp_check_room_availability(
    IN p_room_id INT,
    IN p_date_debut DATETIME,
    IN p_date_fin DATETIME,
    OUT p_available BOOLEAN
)
BEGIN
    DECLARE conflits INT;
    
    SELECT COUNT(*) INTO conflits
    FROM reservations
    WHERE room_id = p_room_id
      AND statut IN ('en_attente', 'validee', 'confirmee')
      AND (
          (date_debut <= p_date_debut AND date_fin > p_date_debut)
          OR (date_debut < p_date_fin AND date_fin >= p_date_fin)
          OR (date_debut >= p_date_debut AND date_fin <= p_date_fin)
      );
    
    SET p_available = (conflits = 0);
END //

DELIMITER ;

-- ========================================
-- PERMISSIONS FINALES
-- ========================================

-- (removed) GRANT ALL PRIVILEGES ON reservation_salles.* TO 'marcel_admin'@'localhost';
-- FLUSH PRIVILEGES;

-- Afficher le résumé
SELECT 
    'Base de données initialisée avec succès' AS message,
    (SELECT COUNT(*) FROM users) AS nb_users,
    (SELECT COUNT(*) FROM rooms) AS nb_rooms,
    (SELECT COUNT(*) FROM reservations) AS nb_reservations;
