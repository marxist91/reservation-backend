-- Script pour ajouter les réunions récurrentes
-- À exécuter dans phpMyAdmin pour la base reservation_salles

-- Créer la table recurring_meetings
CREATE TABLE IF NOT EXISTS recurring_meetings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Nom de la réunion récurrente',
  day_of_week INT NOT NULL COMMENT 'Jour: 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam',
  start_time TIME NOT NULL COMMENT 'Heure de début',
  end_time TIME NOT NULL COMMENT 'Heure de fin',
  room_id INT NOT NULL COMMENT 'ID de la salle',
  description TEXT COMMENT 'Description ou motif',
  organizer_id INT COMMENT 'ID de l\'organisateur',
  start_date DATE NOT NULL COMMENT 'Date de début de la récurrence',
  end_date DATE COMMENT 'Date de fin (null = indéfini)',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Si actif',
  auto_validate TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Auto-valider les réservations',
  color VARCHAR(20) DEFAULT '#1976d2' COMMENT 'Couleur calendrier',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_day_of_week (day_of_week),
  INDEX idx_room_id (room_id),
  INDEX idx_is_active (is_active),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajouter la colonne recurring_meeting_id à la table reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS recurring_meeting_id INT NULL 
COMMENT 'Lien vers la réunion récurrente qui a généré cette réservation'
AFTER group_id;

-- Ajouter l'index pour la colonne
ALTER TABLE reservations 
ADD INDEX IF NOT EXISTS idx_recurring_meeting_id (recurring_meeting_id);

-- Ajouter la clé étrangère (optionnel, peut échouer si la contrainte existe déjà)
-- ALTER TABLE reservations 
-- ADD CONSTRAINT fk_recurring_meeting 
-- FOREIGN KEY (recurring_meeting_id) REFERENCES recurring_meetings(id) ON DELETE SET NULL;

SELECT 'Mise à jour terminée!' AS Status;
