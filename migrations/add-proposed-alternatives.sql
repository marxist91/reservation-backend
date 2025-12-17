-- Migration pour ajouter la table proposed_alternatives
-- Permet aux admins de proposer des salles alternatives lors du refus d'une réservation

CREATE TABLE IF NOT EXISTS proposed_alternatives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_reservation_id INT NOT NULL,
  proposed_room_id INT NOT NULL,
  proposed_date_debut DATETIME NOT NULL,
  proposed_date_fin DATETIME NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  motif TEXT COMMENT 'Raison de la proposition alternative',
  proposed_by INT COMMENT 'ID de l''admin qui a proposé l''alternative',
  proposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (original_reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (proposed_room_id) REFERENCES rooms(id),
  FOREIGN KEY (proposed_by) REFERENCES users(id),
  INDEX idx_original_reservation (original_reservation_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
