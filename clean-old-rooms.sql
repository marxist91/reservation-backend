-- Supprimer les anciennes salles (garder seulement les 4 nouvelles)
DELETE FROM reservations WHERE room_id NOT IN (18, 19, 20, 21);
DELETE FROM rooms WHERE id NOT IN (18, 19, 20, 21);

-- Vérifier
SELECT id, nom, capacite, statut FROM rooms ORDER BY id;
SELECT COUNT(*) as total_reservations FROM reservations;
