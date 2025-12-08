
-- Correction des colonnes de timestamp pour historique uniquement
-- On renomme createdAt -> created_at et updatedAt -> updated_at

ALTER TABLE historique CHANGE createdAt created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE historique CHANGE updatedAt updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
