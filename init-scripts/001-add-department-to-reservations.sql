-- 001-add-department-to-reservations.sql
-- Migration : ajouter la colonne `department_id` à la table `reservations`
-- Exécutez ce fichier dans votre base `reservation_salles` (phpMyAdmin ou CLI MySQL).
-- ATTENTION : si la table `departments` n'existe pas, créez-la d'abord.

-- Ajouter la colonne
ALTER TABLE reservations
  ADD COLUMN department_id INT NULL;

-- Ajouter un index pour accélérer les recherches par département
ALTER TABLE reservations
  ADD INDEX idx_department (department_id);

-- Ajouter la contrainte de clé étrangère (si la table departments existe)
ALTER TABLE reservations
  ADD CONSTRAINT fk_reservations_department
  FOREIGN KEY (department_id) REFERENCES departments(id)
  ON DELETE SET NULL;

-- Rollback (si nécessaire) :
-- ALTER TABLE reservations DROP FOREIGN KEY fk_reservations_department;
-- ALTER TABLE reservations DROP INDEX idx_department;
-- ALTER TABLE reservations DROP COLUMN department_id;
