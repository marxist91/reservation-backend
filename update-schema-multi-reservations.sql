
-- Création de la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  lu BOOLEAN DEFAULT FALSE,
  reservation_id INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
);

-- Création de la table historique
CREATE TABLE IF NOT EXISTS historique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  details JSON,
  reservation_id INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
);

-- Ajout de la colonne group_id pour les réservations multiples
-- On vérifie d'abord si la colonne existe pour éviter les erreurs (MariaDB/MySQL syntaxe un peu complexe pour IF NOT EXISTS column, donc on utilise une procédure stockée simple ou on suppose qu'elle n'existe pas si c'est une mise à jour)
-- Pour simplifier ici, on tente l'ajout. Si elle existe, ça échouera mais le reste passera si on exécute bloc par bloc ou si on ignore l'erreur.
-- Mais pour être propre :

SET @dbname = DATABASE();
SET @tablename = "reservations";
SET @columnname = "group_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE reservations ADD COLUMN group_id VARCHAR(36) NULL AFTER id;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Ajout de l'index sur group_id
SET @preparedStatementIndex = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'idx_group_id')
  ) > 0,
  "SELECT 1",
  "CREATE INDEX idx_group_id ON reservations(group_id);"
));
PREPARE createIndexIfNotExists FROM @preparedStatementIndex;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
