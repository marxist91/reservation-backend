-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 05, 2025 at 07:57 PM
-- Server version: 12.1.2-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reservation_salles`
--

-- --------------------------------------------------------

--
-- Table structure for table `actionlog`
--

CREATE TABLE `actionlog` (
  `id` int(11) NOT NULL,
  `acteur_id` int(11) NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `cible_type` varchar(255) DEFAULT NULL,
  `cible_id` int(11) DEFAULT NULL,
  `avant` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`avant`)),
  `apres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`apres`)),
  `timestamp` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `actionlogs`
--

CREATE TABLE `actionlogs` (
  `id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL COMMENT 'Type d''action effectuée (CREATE, UPDATE, DELETE, LOGIN, etc.)',
  `user_id` int(11) DEFAULT NULL,
  `cible_type` varchar(50) DEFAULT NULL COMMENT 'Type d''entité ciblée (User, Reservation, Room, etc.)',
  `cible_id` int(11) DEFAULT NULL COMMENT 'ID de l''entité ciblée',
  `details` text DEFAULT NULL COMMENT 'Détails supplémentaires sur l''action (JSON)',
  `ancien_etat` text DEFAULT NULL COMMENT 'État de l''entité avant modification (JSON)',
  `nouvel_etat` text DEFAULT NULL COMMENT 'État de l''entité après modification (JSON)',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Adresse IP de l''utilisateur',
  `user_agent` text DEFAULT NULL COMMENT 'User-Agent du navigateur',
  `metadata` text DEFAULT NULL COMMENT 'Métadonnées additionnelles (JSON)',
  `statut` enum('succes','echec','partiel') NOT NULL DEFAULT 'succes' COMMENT 'Statut de l''exécution de l''action',
  `message_erreur` text DEFAULT NULL COMMENT 'Message d''erreur si l''action a échoué',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `action`, `user_id`, `cible_type`, `cible_id`, `details`, `ancien_etat`, `nouvel_etat`, `ip_address`, `user_agent`, `metadata`, `statut`, `message_erreur`, `created_at`) VALUES
(1, 'CREATE_RESERVATION', 1, 'Reservation', 9, '{\"salle_id\":1,\"horaire\":\"undefined-undefined\",\"statut\":\"en_attente\"}', NULL, '{\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"statut\":\"en_attente\",\"updatedAt\":\"2025-12-02T11:40:19.007Z\",\"createdAt\":\"2025-12-02T11:40:19.007Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-02 11:40:19'),
(2, 'CREATE_USER', NULL, 'User', 9, '{\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"test@example.com\",\"role\":\"user\"}', NULL, '{\"actif\":true,\"id\":9,\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"test@example.com\",\"password\":\"$2a$12$qWVO/.22XGsW05ZTXdPFtuWLep8ixeNBgsU5EwArxSvktF8cncM66\",\"role\":\"user\",\"telephone\":\"0612345678\",\"updatedAt\":\"2025-12-02T13:54:42.203Z\",\"createdAt\":\"2025-12-02T13:54:42.203Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-02 13:54:42'),
(3, 'CREATE_USER', NULL, 'User', 10, '{\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"testuser@test.com\",\"role\":\"user\"}', NULL, '{\"actif\":true,\"id\":10,\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"testuser@test.com\",\"password\":\"$2a$12$jdy70FaAr7Y1frrESKKgkOf.ZLL8R.HMWP1T.Y5wMz/PuJSq3mW3y\",\"role\":\"user\",\"poste\":\"Testeur\",\"updatedAt\":\"2025-12-02T20:28:35.935Z\",\"createdAt\":\"2025-12-02T20:28:35.935Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-02 20:28:36'),
(4, 'CREATE_RESERVATION', 6, 'Reservation', 10, '{\"salle_id\":1,\"horaire\":\"undefined-undefined\",\"statut\":\"en_attente\"}', NULL, '{\"id\":10,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-03T11:00:00.000Z\",\"date_fin\":\"2025-12-03T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T10:38:53.012Z\",\"createdAt\":\"2025-12-03T10:38:53.012Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 10:38:53'),
(5, 'CREATE_RESERVATION', 6, 'Reservation', 11, '{\"salle_id\":3,\"horaire\":\"undefined-undefined\",\"statut\":\"en_attente\"}', NULL, '{\"id\":11,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-03T11:00:00.000Z\",\"date_fin\":\"2025-12-03T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T10:39:48.928Z\",\"createdAt\":\"2025-12-03T10:39:48.928Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 10:39:49'),
(6, 'CREATE_RESERVATION', 1, 'Reservation', 12, '{\"salle_id\":1,\"date\":\"2025-12-03\",\"horaire\":\"15:00-17:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-03\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":12,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-03T15:00:00.000Z\",\"date_fin\":\"2025-12-03T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reuinion\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T11:54:46.261Z\",\"createdAt\":\"2025-12-03T11:54:46.261Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 11:54:46'),
(7, 'CREATE_RESERVATION', 6, 'Reservation', 13, '{\"salle_id\":4,\"date\":\"2025-12-03\",\"horaire\":\"15:00-17:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-03\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":13,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-03T15:00:00.000Z\",\"date_fin\":\"2025-12-03T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T11:57:45.113Z\",\"createdAt\":\"2025-12-03T11:57:45.113Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 11:57:45'),
(8, 'CREATE_RESERVATION', 6, 'Reservation', 14, '{\"salle_id\":3,\"date\":\"2025-12-03\",\"horaire\":\"13:00-16:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-03\",\"heure_debut\":\"13:00\",\"heure_fin\":\"16:00\",\"id\":14,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-03T13:00:00.000Z\",\"date_fin\":\"2025-12-03T16:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T12:08:48.101Z\",\"createdAt\":\"2025-12-03T12:08:48.101Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 12:08:48'),
(9, 'CREATE_RESERVATION', 6, 'Reservation', 15, '{\"salle_id\":1,\"date\":\"2025-12-03\",\"horaire\":\"13:00-15:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-03\",\"heure_debut\":\"13:00\",\"heure_fin\":\"15:00\",\"id\":15,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-03T13:00:00.000Z\",\"date_fin\":\"2025-12-03T15:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T12:21:09.789Z\",\"createdAt\":\"2025-12-03T12:21:09.789Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 12:21:10'),
(10, 'CREATE_RESERVATION', 6, 'Reservation', 16, '{\"salle_id\":4,\"date\":\"2025-12-04\",\"horaire\":\"15:00-17:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-04\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":16,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-04T15:00:00.000Z\",\"date_fin\":\"2025-12-04T17:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"fete\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T12:38:00.666Z\",\"createdAt\":\"2025-12-03T12:38:00.666Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 12:38:00'),
(11, 'UPDATE_RESERVATION', 6, 'Reservation', 16, '{\"champs_modifies\":[\"0\"]}', '{\"id\":16,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-04T15:00:00.000Z\",\"date_fin\":\"2025-12-04T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"fete\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T12:38:00.000Z\",\"updatedAt\":\"2025-12-03T12:38:00.000Z\"}', '{\"date\":\"2025-12-04\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":16,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-04T15:00:00.000Z\",\"date_fin\":\"2025-12-04T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"fete\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T12:38:00.000Z\",\"updatedAt\":\"2025-12-03T13:39:50.194Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 13:39:50'),
(12, 'CREATE_RESERVATION', 6, 'Reservation', 17, '{\"salle_id\":2,\"date\":\"2025-12-05\",\"horaire\":\"09:00-10:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-05\",\"heure_debut\":\"09:00\",\"heure_fin\":\"10:00\",\"id\":17,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-05T09:00:00.000Z\",\"date_fin\":\"2025-12-05T10:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"assise\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T15:44:32.724Z\",\"createdAt\":\"2025-12-03T15:44:32.724Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 15:44:33'),
(13, 'CREATE_RESERVATION', 6, 'Reservation', 18, '{\"salle_id\":4,\"date\":\"2025-12-04\",\"horaire\":\"11:00-14:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-04\",\"heure_debut\":\"11:00\",\"heure_fin\":\"14:00\",\"id\":18,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-04T11:00:00.000Z\",\"date_fin\":\"2025-12-04T14:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"dak\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T15:51:38.673Z\",\"createdAt\":\"2025-12-03T15:51:38.673Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 15:51:38'),
(14, 'CREATE_RESERVATION', 6, 'Reservation', 19, '{\"salle_id\":4,\"date\":\"2025-12-08\",\"horaire\":\"09:00-12:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-08\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"formation\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T16:17:23.980Z\",\"createdAt\":\"2025-12-03T16:17:23.980Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 16:17:24'),
(15, 'UPDATE_ROOM', NULL, 'Room', 1, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":1,\"nom\":\"Salle Administration Générale\",\"description\":\"Salle de réunion principale de l\'administration générale du port. Équipée pour les réunions de direction et sessions de travail.\",\"capacite\":30,\"equipements\":\"[\\\"Vidéoprojecteur\\\",\\\"Écran\\\",\\\"Tableau blanc\\\",\\\"WiFi\\\",\\\"Climatisation\\\",\\\"Système audio\\\"]\",\"batiment\":\"Bâtiment Administratif\",\"etage\":\"Rez-de-cha\",\"superficie\":\"80.00\",\"responsable_id\":2,\"statut\":\"disponible\",\"image_url\":\"/images/rooms/admin-generale.jpg\",\"createdAt\":\"2025-12-02T11:22:11.000Z\",\"updatedAt\":\"2025-12-02T11:22:11.000Z\"}', '{\"id\":1,\"nom\":\"Salle Administration Générale\",\"description\":\"Salle de réunion principale de l\'administration générale du port. Équipée pour les réunions de direction et sessions de travail.\",\"capacite\":30,\"equipements\":\"[\\\"Vidéoprojecteur\\\",\\\"Écran\\\",\\\"Tableau blanc\\\",\\\"WiFi\\\",\\\"Climatisation\\\",\\\"Système audio\\\"]\",\"batiment\":\"Bâtiment Administratif\",\"etage\":\"3iem\",\"superficie\":80,\"responsable_id\":2,\"statut\":\"disponible\",\"image_url\":\"/images/rooms/admin-generale.jpg\",\"createdAt\":\"2025-12-02T11:22:11.000Z\",\"updatedAt\":\"2025-12-03T18:57:20.268Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 18:57:21'),
(16, 'UPDATE_RESERVATION', 5, 'Reservation', 2, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":2,\"user_id\":5,\"room_id\":4,\"date_debut\":\"2025-12-03T12:00:00.000Z\",\"date_fin\":\"2025-12-03T15:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"Formation sécurité portuaire\",\"nombre_participants\":12,\"equipements_supplementaires\":\"[\\\"Vidéoprojecteur\\\",\\\"Supports papier\\\"]\",\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:22:17.000Z\",\"updatedAt\":\"2025-12-02T11:22:17.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"12:00\",\"heure_fin\":\"15:00\",\"id\":2,\"user_id\":5,\"room_id\":4,\"date_debut\":\"2025-12-03T12:00:00.000Z\",\"date_fin\":\"2025-12-03T15:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"Formation sécurité portuaire (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":12,\"equipements_supplementaires\":\"[\\\"Vidéoprojecteur\\\",\\\"Supports papier\\\"]\",\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:22:17.000Z\",\"updatedAt\":\"2025-12-03T19:13:46.755Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:46'),
(17, 'UPDATE_RESERVATION', 6, 'Reservation', 10, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":10,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-03T11:00:00.000Z\",\"date_fin\":\"2025-12-03T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T10:38:53.000Z\",\"updatedAt\":\"2025-12-03T10:38:53.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"11:00\",\"heure_fin\":\"12:00\",\"id\":10,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-03T11:00:00.000Z\",\"date_fin\":\"2025-12-03T12:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"reunion (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T10:38:53.000Z\",\"updatedAt\":\"2025-12-03T19:13:46.952Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:46'),
(18, 'UPDATE_RESERVATION', 6, 'Reservation', 11, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":11,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-03T11:00:00.000Z\",\"date_fin\":\"2025-12-03T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T10:39:48.000Z\",\"updatedAt\":\"2025-12-03T10:39:48.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"11:00\",\"heure_fin\":\"12:00\",\"id\":11,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-03T11:00:00.000Z\",\"date_fin\":\"2025-12-03T12:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"reunion (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T10:39:48.000Z\",\"updatedAt\":\"2025-12-03T19:13:46.994Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:47'),
(19, 'UPDATE_RESERVATION', 1, 'Reservation', 12, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":12,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-03T15:00:00.000Z\",\"date_fin\":\"2025-12-03T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reuinion\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T11:54:46.000Z\",\"updatedAt\":\"2025-12-03T11:54:46.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":12,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-03T15:00:00.000Z\",\"date_fin\":\"2025-12-03T17:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"reuinion (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T11:54:46.000Z\",\"updatedAt\":\"2025-12-03T19:13:47.078Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:47'),
(20, 'UPDATE_RESERVATION', 6, 'Reservation', 13, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":13,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-03T15:00:00.000Z\",\"date_fin\":\"2025-12-03T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T11:57:45.000Z\",\"updatedAt\":\"2025-12-03T11:57:45.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":13,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-03T15:00:00.000Z\",\"date_fin\":\"2025-12-03T17:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"reunion (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T11:57:45.000Z\",\"updatedAt\":\"2025-12-03T19:13:47.682Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:47'),
(21, 'UPDATE_RESERVATION', 6, 'Reservation', 14, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":14,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-03T13:00:00.000Z\",\"date_fin\":\"2025-12-03T16:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T12:08:48.000Z\",\"updatedAt\":\"2025-12-03T12:08:48.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"13:00\",\"heure_fin\":\"16:00\",\"id\":14,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-03T13:00:00.000Z\",\"date_fin\":\"2025-12-03T16:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"reunion (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T12:08:48.000Z\",\"updatedAt\":\"2025-12-03T19:13:47.722Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:47'),
(22, 'UPDATE_RESERVATION', 6, 'Reservation', 15, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":15,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-03T13:00:00.000Z\",\"date_fin\":\"2025-12-03T15:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"reunion\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T12:21:09.000Z\",\"updatedAt\":\"2025-12-03T12:21:09.000Z\"}', '{\"date\":\"2025-12-03\",\"heure_debut\":\"13:00\",\"heure_fin\":\"15:00\",\"id\":15,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-03T13:00:00.000Z\",\"date_fin\":\"2025-12-03T15:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"reunion (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T12:21:09.000Z\",\"updatedAt\":\"2025-12-03T19:13:47.728Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:13:47'),
(23, 'UPDATE_RESERVATION', 6, 'Reservation', 18, '{\"champs_modifies\":[\"0\"]}', '{\"id\":18,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-04T11:00:00.000Z\",\"date_fin\":\"2025-12-04T14:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"dak\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T15:51:38.000Z\",\"updatedAt\":\"2025-12-03T15:51:38.000Z\"}', '{\"date\":\"2025-12-04\",\"heure_debut\":\"11:00\",\"heure_fin\":\"14:00\",\"id\":18,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-04T11:00:00.000Z\",\"date_fin\":\"2025-12-04T14:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"dak\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T15:51:38.000Z\",\"updatedAt\":\"2025-12-03T19:25:42.679Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:25:42'),
(24, 'UPDATE_RESERVATION', 6, 'Reservation', 17, '{\"champs_modifies\":[\"0\"]}', '{\"id\":17,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-05T09:00:00.000Z\",\"date_fin\":\"2025-12-05T10:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"assise\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T15:44:32.000Z\",\"updatedAt\":\"2025-12-03T15:44:32.000Z\"}', '{\"date\":\"2025-12-05\",\"heure_debut\":\"09:00\",\"heure_fin\":\"10:00\",\"id\":17,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-05T09:00:00.000Z\",\"date_fin\":\"2025-12-05T10:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"assise\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T15:44:32.000Z\",\"updatedAt\":\"2025-12-03T19:32:59.353Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:32:59'),
(25, 'UPDATE_RESERVATION', 6, 'Reservation', 19, '{\"champs_modifies\":[\"0\"]}', '{\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T16:17:23.000Z\"}', '{\"date\":\"2025-12-08\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:42:03.406Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:42:03'),
(26, 'UPDATE_RESERVATION', 6, 'Reservation', 19, '{\"champs_modifies\":[\"0\"]}', '{\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:42:03.000Z\"}', '{\"date\":\"2025-12-08\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:42:09.118Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:42:09'),
(27, 'UPDATE_RESERVATION', 6, 'Reservation', 19, '{\"champs_modifies\":[\"0\"]}', '{\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:42:09.000Z\"}', '{\"date\":\"2025-12-08\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:42:32.665Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:42:32'),
(28, 'UPDATE_RESERVATION', 6, 'Reservation', 19, '{\"champs_modifies\":[\"0\"]}', '{\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:42:32.000Z\"}', '{\"date\":\"2025-12-08\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":19,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-08T09:00:00.000Z\",\"date_fin\":\"2025-12-08T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T16:17:23.000Z\",\"updatedAt\":\"2025-12-03T19:43:55.272Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 19:43:55'),
(29, 'CREATE_RESERVATION', 6, 'Reservation', 20, '{\"salle_id\":2,\"date\":\"2025-12-04\",\"horaire\":\"12:00-14:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-04\",\"heure_debut\":\"12:00\",\"heure_fin\":\"14:00\",\"id\":20,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T12:00:00.000Z\",\"date_fin\":\"2025-12-04T14:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"form\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T20:01:19.781Z\",\"createdAt\":\"2025-12-03T20:01:19.781Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:01:19'),
(30, 'UPDATE_RESERVATION', 6, 'Reservation', 20, '{\"champs_modifies\":[\"0\"]}', '{\"id\":20,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T12:00:00.000Z\",\"date_fin\":\"2025-12-04T14:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"form\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:01:19.000Z\",\"updatedAt\":\"2025-12-03T20:01:19.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', '{\"date\":\"2025-12-04\",\"heure_debut\":\"12:00\",\"heure_fin\":\"14:00\",\"id\":20,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T12:00:00.000Z\",\"date_fin\":\"2025-12-04T14:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"form\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:01:19.000Z\",\"updatedAt\":\"2025-12-03T20:02:02.169Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:02:02'),
(31, 'UPDATE_RESERVATION', 1, 'Reservation', 9, '{\"champs_modifies\":[\"0\"]}', '{\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:40:19.000Z\",\"updatedAt\":\"2025-12-02T11:40:19.000Z\",\"utilisateur\":{\"id\":1,\"nom\":\"Admin\",\"prenom\":\"Système\",\"email\":\"admin@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-15\",\"heure_debut\":\"09:00\",\"heure_fin\":\"11:00\",\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:40:19.000Z\",\"updatedAt\":\"2025-12-03T20:10:39.891Z\",\"utilisateur\":{\"id\":1,\"nom\":\"Admin\",\"prenom\":\"Système\",\"email\":\"admin@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:10:39'),
(32, 'UPDATE_RESERVATION', 1, 'Reservation', 9, '{\"champs_modifies\":[\"0\"]}', '{\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:40:19.000Z\",\"updatedAt\":\"2025-12-03T20:10:39.000Z\",\"utilisateur\":{\"id\":1,\"nom\":\"Admin\",\"prenom\":\"Système\",\"email\":\"admin@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-15\",\"heure_debut\":\"09:00\",\"heure_fin\":\"11:00\",\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:40:19.000Z\",\"updatedAt\":\"2025-12-03T20:11:31.157Z\",\"utilisateur\":{\"id\":1,\"nom\":\"Admin\",\"prenom\":\"Système\",\"email\":\"admin@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:11:31'),
(33, 'UPDATE_RESERVATION', 1, 'Reservation', 9, '{\"champs_modifies\":[\"0\"]}', '{\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:40:19.000Z\",\"updatedAt\":\"2025-12-03T20:11:31.000Z\",\"utilisateur\":{\"id\":1,\"nom\":\"Admin\",\"prenom\":\"Système\",\"email\":\"admin@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-15\",\"heure_debut\":\"09:00\",\"heure_fin\":\"11:00\",\"id\":9,\"user_id\":1,\"room_id\":1,\"date_debut\":\"2025-12-15T09:00:00.000Z\",\"date_fin\":\"2025-12-15T11:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"Test r�servation gratuite\",\"nombre_participants\":15,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-02T11:40:19.000Z\",\"updatedAt\":\"2025-12-03T20:11:43.969Z\",\"utilisateur\":{\"id\":1,\"nom\":\"Admin\",\"prenom\":\"Système\",\"email\":\"admin@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:11:44'),
(34, 'CREATE_RESERVATION', 6, 'Reservation', 21, '{\"salle_id\":2,\"date\":\"2025-12-04\",\"horaire\":\"07:00-08:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-04\",\"heure_debut\":\"07:00\",\"heure_fin\":\"08:00\",\"id\":21,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T07:00:00.000Z\",\"date_fin\":\"2025-12-04T08:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"recre\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T20:16:59.372Z\",\"createdAt\":\"2025-12-03T20:16:59.372Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:16:59'),
(35, 'UPDATE_RESERVATION', 6, 'Reservation', 21, '{\"champs_modifies\":[\"0\"]}', '{\"id\":21,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T07:00:00.000Z\",\"date_fin\":\"2025-12-04T08:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"recre\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:16:59.000Z\",\"updatedAt\":\"2025-12-03T20:16:59.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', '{\"date\":\"2025-12-04\",\"heure_debut\":\"07:00\",\"heure_fin\":\"08:00\",\"id\":21,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T07:00:00.000Z\",\"date_fin\":\"2025-12-04T08:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"recre\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:16:59.000Z\",\"updatedAt\":\"2025-12-03T20:17:52.734Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:17:52'),
(36, 'UPDATE_RESERVATION', 6, 'Reservation', 21, '{\"champs_modifies\":[\"0\"]}', '{\"id\":21,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T07:00:00.000Z\",\"date_fin\":\"2025-12-04T08:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"recre\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:16:59.000Z\",\"updatedAt\":\"2025-12-03T20:17:52.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', '{\"date\":\"2025-12-04\",\"heure_debut\":\"07:00\",\"heure_fin\":\"08:00\",\"id\":21,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-04T07:00:00.000Z\",\"date_fin\":\"2025-12-04T08:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"recre\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:16:59.000Z\",\"updatedAt\":\"2025-12-03T20:18:14.956Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:18:14'),
(37, 'CREATE_RESERVATION', 6, 'Reservation', 22, '{\"salle_id\":1,\"date\":\"2025-12-16\",\"horaire\":\"09:00-12:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-16\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":22,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-16T09:00:00.000Z\",\"date_fin\":\"2025-12-16T12:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"kok\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T20:23:56.739Z\",\"createdAt\":\"2025-12-03T20:23:56.739Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:23:56'),
(38, 'UPDATE_RESERVATION', 6, 'Reservation', 22, '{\"champs_modifies\":[\"0\"]}', '{\"id\":22,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-16T09:00:00.000Z\",\"date_fin\":\"2025-12-16T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"kok\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:23:56.000Z\",\"updatedAt\":\"2025-12-03T20:23:56.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-16\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":22,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-16T09:00:00.000Z\",\"date_fin\":\"2025-12-16T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"kok\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:23:56.000Z\",\"updatedAt\":\"2025-12-03T20:24:16.571Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:24:16'),
(39, 'UPDATE_RESERVATION', 6, 'Reservation', 22, '{\"champs_modifies\":[\"0\"]}', '{\"id\":22,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-16T09:00:00.000Z\",\"date_fin\":\"2025-12-16T12:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"kok\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:23:56.000Z\",\"updatedAt\":\"2025-12-03T20:24:16.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-16\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":22,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-16T09:00:00.000Z\",\"date_fin\":\"2025-12-16T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"kok\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:23:56.000Z\",\"updatedAt\":\"2025-12-03T20:25:23.761Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:25:23'),
(40, 'CREATE_RESERVATION', 6, 'Reservation', 23, '{\"salle_id\":3,\"date\":\"2025-12-11\",\"horaire\":\"08:00-10:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-11\",\"heure_debut\":\"08:00\",\"heure_fin\":\"10:00\",\"id\":23,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-11T08:00:00.000Z\",\"date_fin\":\"2025-12-11T10:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"fol\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T20:32:34.066Z\",\"createdAt\":\"2025-12-03T20:32:34.066Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:32:34'),
(41, 'UPDATE_RESERVATION', 6, 'Reservation', 23, '{\"champs_modifies\":[\"0\"]}', '{\"id\":23,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-11T08:00:00.000Z\",\"date_fin\":\"2025-12-11T10:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"fol\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:32:34.000Z\",\"updatedAt\":\"2025-12-03T20:32:34.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', '{\"date\":\"2025-12-11\",\"heure_debut\":\"08:00\",\"heure_fin\":\"10:00\",\"id\":23,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-11T08:00:00.000Z\",\"date_fin\":\"2025-12-11T10:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"fol\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:32:34.000Z\",\"updatedAt\":\"2025-12-03T20:33:09.769Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:33:10'),
(42, 'UPDATE_RESERVATION', 6, 'Reservation', 23, '{\"champs_modifies\":[\"0\"]}', '{\"id\":23,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-11T08:00:00.000Z\",\"date_fin\":\"2025-12-11T10:00:00.000Z\",\"statut\":\"validee\",\"motif\":\"fol\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:32:34.000Z\",\"updatedAt\":\"2025-12-03T20:33:09.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', '{\"date\":\"2025-12-11\",\"heure_debut\":\"08:00\",\"heure_fin\":\"10:00\",\"id\":23,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-11T08:00:00.000Z\",\"date_fin\":\"2025-12-11T10:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"fol\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:32:34.000Z\",\"updatedAt\":\"2025-12-03T20:33:47.381Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:33:47'),
(43, 'CREATE_RESERVATION', 6, 'Reservation', 24, '{\"salle_id\":2,\"date\":\"2025-12-09\",\"horaire\":\"09:00-12:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-09\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":24,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-09T09:00:00.000Z\",\"date_fin\":\"2025-12-09T12:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"FORI\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T20:36:36.332Z\",\"createdAt\":\"2025-12-03T20:36:36.332Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:36:36'),
(44, 'UPDATE_RESERVATION', 6, 'Reservation', 24, '{\"champs_modifies\":[\"0\"]}', '{\"id\":24,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-09T09:00:00.000Z\",\"date_fin\":\"2025-12-09T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"FORI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:36:36.000Z\",\"updatedAt\":\"2025-12-03T20:36:36.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', '{\"date\":\"2025-12-09\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":24,\"user_id\":6,\"room_id\":2,\"date_debut\":\"2025-12-09T09:00:00.000Z\",\"date_fin\":\"2025-12-09T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"FORI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T20:36:36.000Z\",\"updatedAt\":\"2025-12-03T20:36:59.193Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":2,\"nom\":\"Salle Port de Pêche\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 20:36:59'),
(45, 'CREATE_RESERVATION', 6, 'Reservation', 25, '{\"salle_id\":3,\"date\":\"2025-12-15\",\"horaire\":\"08:00-23:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-15\",\"heure_debut\":\"08:00\",\"heure_fin\":\"23:00\",\"id\":25,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-15T08:00:00.000Z\",\"date_fin\":\"2025-12-15T23:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"gof\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-03T21:15:57.464Z\",\"createdAt\":\"2025-12-03T21:15:57.464Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 21:15:57'),
(46, 'UPDATE_RESERVATION', 6, 'Reservation', 25, '{\"champs_modifies\":[\"0\"]}', '{\"id\":25,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-15T08:00:00.000Z\",\"date_fin\":\"2025-12-15T23:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"gof\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T21:15:57.000Z\",\"updatedAt\":\"2025-12-03T21:15:57.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', '{\"date\":\"2025-12-15\",\"heure_debut\":\"08:00\",\"heure_fin\":\"23:00\",\"id\":25,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-15T08:00:00.000Z\",\"date_fin\":\"2025-12-15T23:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"gof\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"createdAt\":\"2025-12-03T21:15:57.000Z\",\"updatedAt\":\"2025-12-03T21:17:38.835Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-03 21:17:38'),
(47, 'UPDATE_RESERVATION', 6, 'Reservation', 28, '{\"champs_modifies\":[\"0\"]}', '{\"id\":28,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-10T09:00:00.000Z\",\"date_fin\":\"2025-12-10T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"06d0769e-1f24-48fc-be32-e4eafc00e9ce\",\"createdAt\":\"2025-12-04T10:12:21.000Z\",\"updatedAt\":\"2025-12-04T10:12:21.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', '{\"date\":\"2025-12-10\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":28,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-10T09:00:00.000Z\",\"date_fin\":\"2025-12-10T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"06d0769e-1f24-48fc-be32-e4eafc00e9ce\",\"createdAt\":\"2025-12-04T10:12:21.000Z\",\"updatedAt\":\"2025-12-04T10:15:41.939Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 10:15:42'),
(48, 'UPDATE_RESERVATION', 6, 'Reservation', 29, '{\"champs_modifies\":[\"0\"]}', '{\"id\":29,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-10T15:00:00.000Z\",\"date_fin\":\"2025-12-10T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"06d0769e-1f24-48fc-be32-e4eafc00e9ce\",\"createdAt\":\"2025-12-04T10:12:21.000Z\",\"updatedAt\":\"2025-12-04T10:12:21.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', '{\"date\":\"2025-12-10\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":29,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-10T15:00:00.000Z\",\"date_fin\":\"2025-12-10T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"06d0769e-1f24-48fc-be32-e4eafc00e9ce\",\"createdAt\":\"2025-12-04T10:12:21.000Z\",\"updatedAt\":\"2025-12-04T10:15:47.975Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 10:15:47'),
(49, 'UPDATE_RESERVATION', 6, 'Reservation', 30, '{\"champs_modifies\":[\"0\"]}', '{\"id\":30,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-11T09:00:00.000Z\",\"date_fin\":\"2025-12-11T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"f37e6aed-bb99-4221-8c7b-c63b3e7ee346\",\"createdAt\":\"2025-12-04T10:34:55.000Z\",\"updatedAt\":\"2025-12-04T10:34:55.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', '{\"date\":\"2025-12-11\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":30,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-11T09:00:00.000Z\",\"date_fin\":\"2025-12-11T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"f37e6aed-bb99-4221-8c7b-c63b3e7ee346\",\"createdAt\":\"2025-12-04T10:34:55.000Z\",\"updatedAt\":\"2025-12-04T10:48:43.833Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 10:48:43'),
(50, 'UPDATE_RESERVATION', 6, 'Reservation', 31, '{\"champs_modifies\":[\"0\"]}', '{\"id\":31,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-11T15:00:00.000Z\",\"date_fin\":\"2025-12-11T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"f37e6aed-bb99-4221-8c7b-c63b3e7ee346\",\"createdAt\":\"2025-12-04T10:34:55.000Z\",\"updatedAt\":\"2025-12-04T10:34:55.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', '{\"date\":\"2025-12-11\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":31,\"user_id\":6,\"room_id\":4,\"date_debut\":\"2025-12-11T15:00:00.000Z\",\"date_fin\":\"2025-12-11T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation de gest-courier\\n\\nDSI\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"f37e6aed-bb99-4221-8c7b-c63b3e7ee346\",\"createdAt\":\"2025-12-04T10:34:55.000Z\",\"updatedAt\":\"2025-12-04T10:48:50.872Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":4,\"nom\":\"Salle TD\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 10:48:50');
INSERT INTO `audit_logs` (`id`, `action`, `user_id`, `cible_type`, `cible_id`, `details`, `ancien_etat`, `nouvel_etat`, `ip_address`, `user_agent`, `metadata`, `statut`, `message_erreur`, `created_at`) VALUES
(51, 'UPDATE_RESERVATION', 6, 'Reservation', 32, '{\"champs_modifies\":[\"0\"]}', '{\"id\":32,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-09T09:00:00.000Z\",\"date_fin\":\"2025-12-09T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation PU\\n\\nrssi\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"8b56f491-20d4-4c5a-8853-d0f630392b61\",\"createdAt\":\"2025-12-04T10:51:45.000Z\",\"updatedAt\":\"2025-12-04T10:51:45.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', '{\"date\":\"2025-12-09\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":32,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-09T09:00:00.000Z\",\"date_fin\":\"2025-12-09T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation PU\\n\\nrssi\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"8b56f491-20d4-4c5a-8853-d0f630392b61\",\"createdAt\":\"2025-12-04T10:51:45.000Z\",\"updatedAt\":\"2025-12-04T11:16:46.280Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 11:16:46'),
(52, 'UPDATE_RESERVATION', 6, 'Reservation', 33, '{\"champs_modifies\":[\"0\"]}', '{\"id\":33,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-09T15:00:00.000Z\",\"date_fin\":\"2025-12-09T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation PU\\n\\nrssi\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"8b56f491-20d4-4c5a-8853-d0f630392b61\",\"createdAt\":\"2025-12-04T10:51:45.000Z\",\"updatedAt\":\"2025-12-04T10:51:45.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', '{\"date\":\"2025-12-09\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":33,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-09T15:00:00.000Z\",\"date_fin\":\"2025-12-09T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"formation PU\\n\\nrssi\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"8b56f491-20d4-4c5a-8853-d0f630392b61\",\"createdAt\":\"2025-12-04T10:51:45.000Z\",\"updatedAt\":\"2025-12-04T11:16:49.467Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 11:16:49'),
(53, 'CREATE_RESERVATION', 6, 'Reservation', 34, '{\"salle_id\":3,\"date\":\"2025-12-05\",\"horaire\":\"15:00-17:00\",\"statut\":\"en_attente\"}', NULL, '{\"date\":\"2025-12-05\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":34,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-05T15:00:00.000Z\",\"date_fin\":\"2025-12-05T17:00:00.000Z\",\"statut\":\"en_attente\",\"equipements_supplementaires\":null,\"motif\":\"formation PU\",\"nombre_participants\":1,\"updatedAt\":\"2025-12-04T11:27:59.862Z\",\"createdAt\":\"2025-12-04T11:27:59.862Z\"}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 11:27:59'),
(54, 'UPDATE_RESERVATION', 6, 'Reservation', 35, '{\"champs_modifies\":[\"0\"]}', '{\"id\":35,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-22T09:00:00.000Z\",\"date_fin\":\"2025-12-22T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-22\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":35,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-22T09:00:00.000Z\",\"date_fin\":\"2025-12-22T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T12:07:58.069Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 12:07:58'),
(55, 'UPDATE_RESERVATION', 6, 'Reservation', 36, '{\"champs_modifies\":[\"0\"]}', '{\"id\":36,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-22T15:00:00.000Z\",\"date_fin\":\"2025-12-22T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-22\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":36,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-22T15:00:00.000Z\",\"date_fin\":\"2025-12-22T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T12:08:05.410Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 12:08:05'),
(56, 'UPDATE_RESERVATION', 6, 'Reservation', 37, '{\"champs_modifies\":[\"0\"]}', '{\"id\":37,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-23T09:00:00.000Z\",\"date_fin\":\"2025-12-23T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-23\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":37,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-23T09:00:00.000Z\",\"date_fin\":\"2025-12-23T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T12:19:41.363Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 12:19:41'),
(57, 'UPDATE_RESERVATION', 6, 'Reservation', 38, '{\"champs_modifies\":[\"0\"]}', '{\"id\":38,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-23T15:00:00.000Z\",\"date_fin\":\"2025-12-23T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-23\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":38,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-23T15:00:00.000Z\",\"date_fin\":\"2025-12-23T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T12:32:46.229Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 12:32:46'),
(58, 'UPDATE_RESERVATION', 6, 'Reservation', 39, '{\"champs_modifies\":[\"0\"]}', '{\"id\":39,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-24T09:00:00.000Z\",\"date_fin\":\"2025-12-24T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-24\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":39,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-24T09:00:00.000Z\",\"date_fin\":\"2025-12-24T12:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T15:44:21.557Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 15:44:22'),
(59, 'UPDATE_RESERVATION', 6, 'Reservation', 40, '{\"champs_modifies\":[\"0\"]}', '{\"id\":40,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-24T15:00:00.000Z\",\"date_fin\":\"2025-12-24T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-24\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":40,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-24T15:00:00.000Z\",\"date_fin\":\"2025-12-24T17:00:00.000Z\",\"statut\":\"validée\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T15:49:34.306Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 15:49:34'),
(60, 'UPDATE_RESERVATION', 6, 'Reservation', 41, '{\"champs_modifies\":[\"0\"]}', '{\"id\":41,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-25T09:00:00.000Z\",\"date_fin\":\"2025-12-25T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-25\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":41,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-25T09:00:00.000Z\",\"date_fin\":\"2025-12-25T12:00:00.000Z\",\"statut\":\"refusee\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T16:00:48.695Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 16:00:48'),
(61, 'UPDATE_RESERVATION', 6, 'Reservation', 42, '{\"champs_modifies\":[\"0\"]}', '{\"id\":42,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-25T15:00:00.000Z\",\"date_fin\":\"2025-12-25T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-25\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":42,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-25T15:00:00.000Z\",\"date_fin\":\"2025-12-25T17:00:00.000Z\",\"statut\":\"refusee\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T16:02:27.454Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 16:02:27'),
(62, 'UPDATE_RESERVATION', 6, 'Reservation', 43, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":43,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-26T09:00:00.000Z\",\"date_fin\":\"2025-12-26T12:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"rejection_reason\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-26\",\"heure_debut\":\"09:00\",\"heure_fin\":\"12:00\",\"id\":43,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-26T09:00:00.000Z\",\"date_fin\":\"2025-12-26T12:00:00.000Z\",\"statut\":\"refusee\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"rejection_reason\":\"la sasalle est occuper par le directeur a cette date et heur\",\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T16:14:43.964Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 16:14:44'),
(63, 'UPDATE_RESERVATION', 6, 'Reservation', 44, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":44,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-26T15:00:00.000Z\",\"date_fin\":\"2025-12-26T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"rejection_reason\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T11:50:48.000Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', '{\"date\":\"2025-12-26\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":44,\"user_id\":6,\"room_id\":1,\"date_debut\":\"2025-12-26T15:00:00.000Z\",\"date_fin\":\"2025-12-26T17:00:00.000Z\",\"statut\":\"rejetee\",\"motif\":\"sensibilisation\\n\\nDAG\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"rejection_reason\":\"la salle est occupé \",\"validee_par\":null,\"validee_le\":null,\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"createdAt\":\"2025-12-04T11:50:48.000Z\",\"updatedAt\":\"2025-12-04T16:57:56.154Z\",\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"},\"salle\":{\"id\":1,\"nom\":\"Salle Administration Générale\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-04 16:57:56'),
(64, 'UPDATE_RESERVATION', 6, 'Reservation', 34, '{\"champs_modifies\":[\"0\",\"1\"]}', '{\"id\":34,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-05T15:00:00.000Z\",\"date_fin\":\"2025-12-05T17:00:00.000Z\",\"statut\":\"en_attente\",\"motif\":\"formation PU\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"rejection_reason\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":null,\"createdAt\":\"2025-12-04T11:27:59.000Z\",\"updatedAt\":\"2025-12-04T11:27:59.000Z\",\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"},\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"}}', '{\"date\":\"2025-12-05\",\"heure_debut\":\"15:00\",\"heure_fin\":\"17:00\",\"id\":34,\"user_id\":6,\"room_id\":3,\"date_debut\":\"2025-12-05T15:00:00.000Z\",\"date_fin\":\"2025-12-05T17:00:00.000Z\",\"statut\":\"annulee\",\"motif\":\"formation PU (Annulée automatiquement - délai de validation dépassé)\",\"nombre_participants\":1,\"equipements_supplementaires\":null,\"commentaire_admin\":null,\"rejection_reason\":null,\"validee_par\":null,\"validee_le\":null,\"group_id\":null,\"createdAt\":\"2025-12-04T11:27:59.000Z\",\"updatedAt\":\"2025-12-05T15:04:10.739Z\",\"salle\":{\"id\":3,\"nom\":\"Salle de Réunion 2ème Étage\"},\"utilisateur\":{\"id\":6,\"nom\":\"Laurent\",\"prenom\":\"Thomas\",\"email\":\"thomas.laurent@port-autonome.com\"}}', NULL, NULL, NULL, 'succes', NULL, '2025-12-05 15:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `historique`
--

CREATE TABLE `historique` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `reservation_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `historique`
--

INSERT INTO `historique` (`id`, `user_id`, `type`, `action`, `description`, `details`, `reservation_id`, `created_at`, `updated_at`) VALUES
(1, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 10:12', '{\"group_id\":\"06d0769e-1f24-48fc-be32-e4eafc00e9ce\",\"motif\":\"formation de gest-courier\"}', 28, '2025-12-04 10:12:21', '2025-12-04 12:38:11'),
(2, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 10:12', '{\"group_id\":\"06d0769e-1f24-48fc-be32-e4eafc00e9ce\",\"motif\":\"formation de gest-courier\"}', 29, '2025-12-04 10:12:21', '2025-12-04 12:38:11'),
(3, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 10:34', '{\"group_id\":\"f37e6aed-bb99-4221-8c7b-c63b3e7ee346\",\"motif\":\"formation de gest-courier\"}', 30, '2025-12-04 10:34:55', '2025-12-04 12:38:11'),
(4, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 10:34', '{\"group_id\":\"f37e6aed-bb99-4221-8c7b-c63b3e7ee346\",\"motif\":\"formation de gest-courier\"}', 31, '2025-12-04 10:34:55', '2025-12-04 12:38:11'),
(5, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 10:51', '{\"group_id\":\"8b56f491-20d4-4c5a-8853-d0f630392b61\",\"motif\":\"formation PU\"}', 32, '2025-12-04 10:51:45', '2025-12-04 12:38:11'),
(6, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 10:51', '{\"group_id\":\"8b56f491-20d4-4c5a-8853-d0f630392b61\",\"motif\":\"formation PU\"}', 33, '2025-12-04 10:51:45', '2025-12-04 12:38:11'),
(7, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 32, '2025-12-04 11:16:46', '2025-12-04 11:16:46'),
(8, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 33, '2025-12-04 11:16:49', '2025-12-04 11:16:49'),
(9, 6, 'CREATION', 'Demande de réservation', 'Nouvelle demande de réservation créée pour le 2025-12-05.', '{\"room_id\":3,\"date\":\"2025-12-05\",\"heure_debut\":\"15:00:00\",\"heure_fin\":\"17:00:00\"}', 34, '2025-12-04 11:28:00', '2025-12-04 11:28:00'),
(10, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 35, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(11, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 36, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(12, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 37, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(13, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 38, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(14, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 39, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(15, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 40, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(16, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 41, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(17, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 42, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(18, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 43, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(19, 6, 'CREATION', 'Demande de réservation (Groupe)', 'Réservation multiple - Créneau créé le 04/12/2025 à 11:50', '{\"group_id\":\"75a4da36-acbf-4a6f-bffe-5951d7bf7e9c\",\"motif\":\"sensibilisation\"}', 44, '2025-12-04 11:50:48', '2025-12-04 12:38:11'),
(20, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 35, '2025-12-04 12:07:58', '2025-12-04 12:07:58'),
(21, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 36, '2025-12-04 12:08:05', '2025-12-04 12:08:05'),
(22, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 37, '2025-12-04 12:19:41', '2025-12-04 12:19:41'),
(23, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 38, '2025-12-04 12:32:46', '2025-12-04 12:32:46'),
(24, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 39, '2025-12-04 15:44:23', '2025-12-04 15:44:23'),
(25, 1, 'VALIDATION', 'Validation de réservation', 'La réservation a été validée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"validée\"}', 40, '2025-12-04 15:49:34', '2025-12-04 15:49:34'),
(26, 1, 'REFUS', 'Refus de réservation', 'La réservation a été refusée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"refusee\"}', 41, '2025-12-04 16:00:48', '2025-12-04 16:31:45'),
(27, 1, 'REFUS', 'Refus de réservation', 'La réservation a été refusée par Admin.', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"refusee\"}', 42, '2025-12-04 16:02:27', '2025-12-04 16:31:45'),
(28, 1, 'REFUS', 'Refus de réservation', 'La réservation a été refusée par Admin. Motif: la sasalle est occuper par le directeur a cette date et heur', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"refusee\",\"motif_refus\":\"la sasalle est occuper par le directeur a cette date et heur\"}', 43, '2025-12-04 16:14:44', '2025-12-04 16:31:45'),
(29, 1, 'REFUS', 'Refus de réservation', 'La réservation a été refusée par Admin. Motif: la salle est occupé ', '{\"ancien_statut\":\"en_attente\",\"nouveau_statut\":\"rejetee\",\"motif_refus\":\"la salle est occupé \"}', 44, '2025-12-04 16:57:56', '2025-12-04 16:57:56');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Utilisateur destinataire de la notification',
  `type` varchar(50) NOT NULL COMMENT 'Type: reservation_validated, reservation_rejected, etc.',
  `titre` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `reservation_id` int(11) DEFAULT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `titre`, `message`, `lu`, `reservation_id`, `action_url`, `created_at`, `updated_at`) VALUES
(1, 1, 'info', 'Test Notification', 'Ceci est une notification de test générée par le script.', 1, NULL, NULL, '2025-12-03 21:36:44', '2025-12-04 12:32:40'),
(3, 6, 'reservation_created_group', 'Réservation multiple créée', 'Votre demande de réservation multiple (2 créneaux) pour la salle 4 a été enregistrée et est en attente de validation.', 1, 28, NULL, '2025-12-04 10:12:21', '2025-12-04 12:32:16'),
(4, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle TD\" a été validée.', 1, 28, NULL, '2025-12-04 10:15:42', '2025-12-04 12:32:16'),
(5, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle TD\" a été validée.', 1, 29, NULL, '2025-12-04 10:15:48', '2025-12-04 12:32:16'),
(6, 6, 'reservation_created_group', 'Réservation multiple créée', 'Votre demande de réservation multiple (2 créneaux) pour la salle 4 a été enregistrée et est en attente de validation.', 1, 30, NULL, '2025-12-04 10:34:55', '2025-12-04 12:32:16'),
(7, 1, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (2 créneaux) a été créée par l\'utilisateur 6.', 1, 30, NULL, '2025-12-04 10:34:55', '2025-12-04 12:32:40'),
(8, 2, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (2 créneaux) a été créée par l\'utilisateur 6.', 0, 30, NULL, '2025-12-04 10:34:55', '2025-12-04 10:34:55'),
(9, 3, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (2 créneaux) a été créée par l\'utilisateur 6.', 0, 30, NULL, '2025-12-04 10:34:55', '2025-12-04 10:34:55'),
(10, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle TD\" a été validée.', 1, 30, NULL, '2025-12-04 10:48:43', '2025-12-04 12:32:16'),
(11, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle TD\" a été validée.', 1, 31, NULL, '2025-12-04 10:48:50', '2025-12-04 12:32:16'),
(12, 6, 'reservation_created_group', 'Réservation multiple créée', 'Votre demande de réservation multiple (2 créneaux) pour la salle 3 a été enregistrée et est en attente de validation.', 1, 32, NULL, '2025-12-04 10:51:45', '2025-12-04 12:32:16'),
(13, 1, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (2 créneaux) a été créée par l\'utilisateur 6.', 1, 32, NULL, '2025-12-04 10:51:45', '2025-12-04 12:32:40'),
(14, 2, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (2 créneaux) a été créée par l\'utilisateur 6.', 0, 32, NULL, '2025-12-04 10:51:45', '2025-12-04 10:51:45'),
(15, 3, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (2 créneaux) a été créée par l\'utilisateur 6.', 0, 32, NULL, '2025-12-04 10:51:45', '2025-12-04 10:51:45'),
(16, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle de Réunion 2ème Étage\" a été validée.', 1, 32, NULL, '2025-12-04 11:16:46', '2025-12-04 12:32:16'),
(17, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle de Réunion 2ème Étage\" a été validée.', 1, 33, NULL, '2025-12-04 11:16:49', '2025-12-04 12:32:16'),
(18, 1, 'new_reservation', 'Nouvelle demande de réservation', 'Nouvelle demande de réservation pour la salle (ID: 3) le 2025-12-05.', 1, 34, NULL, '2025-12-04 11:27:59', '2025-12-04 12:32:40'),
(19, 6, 'reservation_created_group', 'Réservation multiple créée', 'Votre demande de réservation multiple (10 créneaux) pour la salle 1 a été enregistrée et est en attente de validation.', 1, 35, NULL, '2025-12-04 11:50:48', '2025-12-04 12:32:16'),
(20, 1, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (10 créneaux) a été créée par l\'utilisateur 6.', 1, 35, NULL, '2025-12-04 11:50:48', '2025-12-04 12:32:40'),
(21, 2, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (10 créneaux) a été créée par l\'utilisateur 6.', 0, 35, NULL, '2025-12-04 11:50:48', '2025-12-04 11:50:48'),
(22, 3, 'admin_new_reservation_group', 'Nouvelle demande de réservation multiple', 'Une nouvelle demande de réservation multiple (10 créneaux) a été créée par l\'utilisateur 6.', 0, 35, NULL, '2025-12-04 11:50:48', '2025-12-04 11:50:48'),
(23, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle Administration Générale\" a été validée.', 1, 35, NULL, '2025-12-04 12:07:58', '2025-12-04 12:32:16'),
(24, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle Administration Générale\" a été validée.', 1, 36, NULL, '2025-12-04 12:08:05', '2025-12-04 12:32:16'),
(25, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-23 a été validée.', 1, 37, NULL, '2025-12-04 12:19:41', '2025-12-04 12:32:16'),
(26, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-23 a été validée.', 1, 38, NULL, '2025-12-04 12:32:46', '2025-12-04 15:44:08'),
(27, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-24 a été validée.', 1, 39, NULL, '2025-12-04 15:44:23', '2025-12-04 15:44:44'),
(28, 6, 'reservation_validated', 'Réservation validée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-24 a été validée.', 1, 40, NULL, '2025-12-04 15:49:34', '2025-12-04 15:49:47'),
(29, 6, 'reservation_rejected', 'Réservation refusée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-25 a été refusée.', 1, 41, NULL, '2025-12-04 16:00:48', '2025-12-04 16:13:15'),
(30, 6, 'reservation_rejected', 'Réservation refusée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-25 a été refusée.', 1, 42, NULL, '2025-12-04 16:02:27', '2025-12-04 16:13:15'),
(31, 6, 'reservation_rejected', 'Réservation refusée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-26 a été refusée. Motif: la sasalle est occuper par le directeur a cette date et heur', 1, 43, NULL, '2025-12-04 16:14:44', '2025-12-04 16:26:37'),
(32, 6, 'reservation_rejected', 'Réservation refusée', 'Votre réservation pour la salle \"Salle Administration Générale\" le 2025-12-26 a été refusée. Motif: la salle est occupé ', 1, 44, NULL, '2025-12-04 16:57:56', '2025-12-04 18:50:56');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `group_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `statut` enum('en_attente','validee','rejetee','confirmee','annulee','terminee') NOT NULL DEFAULT 'en_attente',
  `equipements_attribues` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `motif` text DEFAULT NULL,
  `nombre_participants` int(11) DEFAULT NULL,
  `equipements_supplementaires` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`equipements_supplementaires`)),
  `commentaire_admin` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `validee_par` int(11) DEFAULT NULL,
  `validee_le` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `group_id`, `user_id`, `room_id`, `statut`, `equipements_attribues`, `createdAt`, `updatedAt`, `date_debut`, `date_fin`, `motif`, `nombre_participants`, `equipements_supplementaires`, `commentaire_admin`, `rejection_reason`, `validee_par`, `validee_le`) VALUES
(1, NULL, 4, 1, 'validee', NULL, '2025-12-02 11:22:17', '2025-12-02 11:22:17', '2025-12-03 09:00:00', '2025-12-03 11:00:00', 'Réunion de direction mensuelle', 20, '[\"Café\",\"Viennoiseries\"]', 'Réservation approuvée', NULL, 1, '2025-12-02 11:22:17'),
(2, NULL, 5, 4, 'annulee', NULL, '2025-12-02 11:22:17', '2025-12-03 19:13:46', '2025-12-03 12:00:00', '2025-12-03 15:00:00', 'Formation sécurité portuaire (Annulée automatiquement - délai de validation dépassé)', 12, '[\"Vidéoprojecteur\",\"Supports papier\"]', NULL, NULL, NULL, NULL),
(3, NULL, 6, 2, 'confirmee', NULL, '2025-12-02 11:22:17', '2025-12-02 11:22:17', '2025-12-04 14:00:00', '2025-12-04 15:30:00', 'Point hebdomadaire exploitation port de pêche', 8, NULL, NULL, NULL, 2, '2025-12-02 11:22:17'),
(4, NULL, 7, 3, 'annulee', NULL, '2025-11-29 11:22:17', '2025-12-02 11:22:17', '2025-11-30 11:22:17', '2025-11-30 12:22:17', 'Comité météo et sécurité navigation', 10, NULL, 'Annulée à la demande de l\'organisateur - report prévu', NULL, NULL, NULL),
(5, NULL, 4, 4, 'terminee', NULL, '2025-11-25 11:22:17', '2025-11-27 11:22:17', '2025-11-27 11:22:17', '2025-11-27 15:22:17', 'Formation ISPS - Sûreté portuaire', 15, '[\"Supports de cours\",\"Attestations\"]', NULL, NULL, 1, '2025-11-26 11:22:17'),
(6, NULL, 6, 1, 'validee', NULL, '2025-12-02 11:22:17', '2025-12-02 11:22:17', '2025-12-09 10:00:00', '2025-12-09 13:00:00', 'Réunion de coordination des services', 25, '[\"Déjeuner léger\"]', NULL, NULL, 1, '2025-12-02 11:22:17'),
(7, NULL, 8, 2, 'rejetee', NULL, '2025-12-01 11:22:17', '2025-12-02 11:22:17', '2025-12-03 14:00:00', '2025-12-03 17:00:00', 'Audit criées et ventes', 5, NULL, 'Salle indisponible - maintenance prévue', NULL, 2, '2025-12-02 11:22:17'),
(8, NULL, 5, 3, 'validee', NULL, '2025-12-02 11:22:17', '2025-12-02 11:22:17', '2025-12-11 10:00:00', '2025-12-11 12:00:00', 'Comité de pilotage projet modernisation', 18, '[\"Vidéoprojection\",\"Visioconférence\"]', NULL, NULL, 1, '2025-12-02 11:22:17'),
(9, NULL, 1, 1, 'validee', NULL, '2025-12-02 11:40:19', '2025-12-03 20:11:43', '2025-12-15 09:00:00', '2025-12-15 11:00:00', 'Test r�servation gratuite', 15, NULL, NULL, NULL, NULL, NULL),
(10, NULL, 6, 1, 'annulee', NULL, '2025-12-03 10:38:53', '2025-12-03 19:13:46', '2025-12-03 11:00:00', '2025-12-03 12:00:00', 'reunion (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(11, NULL, 6, 3, 'annulee', NULL, '2025-12-03 10:39:48', '2025-12-03 19:13:46', '2025-12-03 11:00:00', '2025-12-03 12:00:00', 'reunion (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(12, NULL, 1, 1, 'annulee', NULL, '2025-12-03 11:54:46', '2025-12-03 19:13:47', '2025-12-03 15:00:00', '2025-12-03 17:00:00', 'reuinion (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(13, NULL, 6, 4, 'annulee', NULL, '2025-12-03 11:57:45', '2025-12-03 19:13:47', '2025-12-03 15:00:00', '2025-12-03 17:00:00', 'reunion (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(14, NULL, 6, 3, 'annulee', NULL, '2025-12-03 12:08:48', '2025-12-03 19:13:47', '2025-12-03 13:00:00', '2025-12-03 16:00:00', 'reunion (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(15, NULL, 6, 1, 'annulee', NULL, '2025-12-03 12:21:09', '2025-12-03 19:13:47', '2025-12-03 13:00:00', '2025-12-03 15:00:00', 'reunion (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(16, NULL, 6, 4, 'validee', NULL, '2025-12-03 12:38:00', '2025-12-03 13:39:50', '2025-12-04 15:00:00', '2025-12-04 17:00:00', 'fete', 1, NULL, NULL, NULL, NULL, NULL),
(17, NULL, 6, 2, 'validee', NULL, '2025-12-03 15:44:32', '2025-12-03 19:32:59', '2025-12-05 09:00:00', '2025-12-05 10:00:00', 'assise', 1, NULL, NULL, NULL, NULL, NULL),
(18, NULL, 6, 4, 'validee', NULL, '2025-12-03 15:51:38', '2025-12-03 19:25:42', '2025-12-04 11:00:00', '2025-12-04 14:00:00', 'dak', 1, NULL, NULL, NULL, NULL, NULL),
(19, NULL, 6, 4, 'validee', NULL, '2025-12-03 16:17:23', '2025-12-03 19:43:55', '2025-12-08 09:00:00', '2025-12-08 12:00:00', 'formation', 1, NULL, NULL, NULL, NULL, NULL),
(20, NULL, 6, 2, 'validee', NULL, '2025-12-03 20:01:19', '2025-12-03 20:02:02', '2025-12-04 12:00:00', '2025-12-04 14:00:00', 'form', 1, NULL, NULL, NULL, NULL, NULL),
(21, NULL, 6, 2, 'validee', NULL, '2025-12-03 20:16:59', '2025-12-03 20:18:14', '2025-12-04 07:00:00', '2025-12-04 08:00:00', 'recre', 1, NULL, NULL, NULL, NULL, NULL),
(22, NULL, 6, 1, 'validee', NULL, '2025-12-03 20:23:56', '2025-12-03 20:25:23', '2025-12-16 09:00:00', '2025-12-16 12:00:00', 'kok', 1, NULL, NULL, NULL, NULL, NULL),
(23, NULL, 6, 3, 'validee', NULL, '2025-12-03 20:32:34', '2025-12-03 20:33:47', '2025-12-11 08:00:00', '2025-12-11 10:00:00', 'fol', 1, NULL, NULL, NULL, NULL, NULL),
(24, NULL, 6, 2, 'validee', NULL, '2025-12-03 20:36:36', '2025-12-03 20:36:59', '2025-12-09 09:00:00', '2025-12-09 12:00:00', 'FORI', 1, NULL, NULL, NULL, NULL, NULL),
(25, NULL, 6, 3, 'validee', NULL, '2025-12-03 21:15:57', '2025-12-03 21:17:38', '2025-12-15 08:00:00', '2025-12-15 23:00:00', 'gof', 1, NULL, NULL, NULL, NULL, NULL),
(28, '06d0769e-1f24-48fc-be32-e4eafc00e9ce', 6, 4, 'validee', NULL, '2025-12-04 10:12:21', '2025-12-04 10:15:41', '2025-12-10 09:00:00', '2025-12-10 12:00:00', 'formation de gest-courier\n\nDSI', 1, NULL, NULL, NULL, NULL, NULL),
(29, '06d0769e-1f24-48fc-be32-e4eafc00e9ce', 6, 4, 'validee', NULL, '2025-12-04 10:12:21', '2025-12-04 10:15:47', '2025-12-10 15:00:00', '2025-12-10 17:00:00', 'formation de gest-courier\n\nDSI', 1, NULL, NULL, NULL, NULL, NULL),
(30, 'f37e6aed-bb99-4221-8c7b-c63b3e7ee346', 6, 4, 'validee', NULL, '2025-12-04 10:34:55', '2025-12-04 10:48:43', '2025-12-11 09:00:00', '2025-12-11 12:00:00', 'formation de gest-courier\n\nDSI', 1, NULL, NULL, NULL, NULL, NULL),
(31, 'f37e6aed-bb99-4221-8c7b-c63b3e7ee346', 6, 4, 'validee', NULL, '2025-12-04 10:34:55', '2025-12-04 10:48:50', '2025-12-11 15:00:00', '2025-12-11 17:00:00', 'formation de gest-courier\n\nDSI', 1, NULL, NULL, NULL, NULL, NULL),
(32, '8b56f491-20d4-4c5a-8853-d0f630392b61', 6, 3, 'validee', NULL, '2025-12-04 10:51:45', '2025-12-04 11:16:46', '2025-12-09 09:00:00', '2025-12-09 12:00:00', 'formation PU\n\nrssi', 1, NULL, NULL, NULL, NULL, NULL),
(33, '8b56f491-20d4-4c5a-8853-d0f630392b61', 6, 3, 'validee', NULL, '2025-12-04 10:51:45', '2025-12-04 11:16:49', '2025-12-09 15:00:00', '2025-12-09 17:00:00', 'formation PU\n\nrssi', 1, NULL, NULL, NULL, NULL, NULL),
(34, NULL, 6, 3, 'annulee', NULL, '2025-12-04 11:27:59', '2025-12-05 15:04:10', '2025-12-05 15:00:00', '2025-12-05 17:00:00', 'formation PU (Annulée automatiquement - délai de validation dépassé)', 1, NULL, NULL, NULL, NULL, NULL),
(35, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'validee', NULL, '2025-12-04 11:50:48', '2025-12-04 12:07:58', '2025-12-22 09:00:00', '2025-12-22 12:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, NULL, NULL, NULL),
(36, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'validee', NULL, '2025-12-04 11:50:48', '2025-12-04 12:08:05', '2025-12-22 15:00:00', '2025-12-22 17:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, NULL, NULL, NULL),
(37, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'validee', NULL, '2025-12-04 11:50:48', '2025-12-04 12:19:41', '2025-12-23 09:00:00', '2025-12-23 12:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, NULL, NULL, NULL),
(38, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'validee', NULL, '2025-12-04 11:50:48', '2025-12-04 12:32:46', '2025-12-23 15:00:00', '2025-12-23 17:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, NULL, NULL, NULL),
(39, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'validee', NULL, '2025-12-04 11:50:48', '2025-12-04 15:44:21', '2025-12-24 09:00:00', '2025-12-24 12:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, NULL, NULL, NULL),
(40, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'validee', NULL, '2025-12-04 11:50:48', '2025-12-04 15:49:34', '2025-12-24 15:00:00', '2025-12-24 17:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, NULL, NULL, NULL),
(41, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'rejetee', NULL, '2025-12-04 11:50:48', '2025-12-04 16:00:48', '2025-12-25 09:00:00', '2025-12-25 12:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, 'Réservation refusée (motif non renseigné - ancien rejet)', NULL, NULL),
(42, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'rejetee', NULL, '2025-12-04 11:50:48', '2025-12-04 16:02:27', '2025-12-25 15:00:00', '2025-12-25 17:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, 'Réservation refusée (motif non renseigné - ancien rejet)', NULL, NULL),
(43, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'rejetee', NULL, '2025-12-04 11:50:48', '2025-12-04 16:14:43', '2025-12-26 09:00:00', '2025-12-26 12:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, 'la sasalle est occuper par le directeur a cette date et heur', NULL, NULL),
(44, '75a4da36-acbf-4a6f-bffe-5951d7bf7e9c', 6, 1, 'rejetee', NULL, '2025-12-04 11:50:48', '2025-12-04 16:57:56', '2025-12-26 15:00:00', '2025-12-26 17:00:00', 'sensibilisation\n\nDAG', 1, NULL, NULL, 'la salle est occupé ', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `capacite` int(11) DEFAULT NULL,
  `equipements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`equipements`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `responsable_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `batiment` varchar(50) DEFAULT NULL,
  `etage` varchar(10) DEFAULT NULL,
  `superficie` decimal(8,2) DEFAULT NULL,
  `statut` enum('disponible','maintenance','indisponible') NOT NULL DEFAULT 'disponible',
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `nom`, `capacite`, `equipements`, `createdAt`, `updatedAt`, `responsable_id`, `description`, `batiment`, `etage`, `superficie`, `statut`, `image_url`) VALUES
(1, 'Salle Administration Générale', 30, '[\"Vidéoprojecteur\",\"Écran\",\"Tableau blanc\",\"WiFi\",\"Climatisation\",\"Système audio\"]', '2025-12-02 11:22:11', '2025-12-03 18:57:20', 2, 'Salle de réunion principale de l\'administration générale du port. Équipée pour les réunions de direction et sessions de travail.', 'Bâtiment Administratif', '3iem', 80.00, 'disponible', '/images/rooms/admin-generale.jpg'),
(2, 'Salle Port de Pêche', 20, '[\"Écran TV\",\"Tableau blanc\",\"WiFi\",\"Téléphone de conférence\"]', '2025-12-02 11:22:11', '2025-12-02 11:22:11', 3, 'Salle dédiée aux réunions concernant les activités du port de pêche. Proche des quais de débarquement.', 'Zone Port de Pêche', '1er étage', 50.00, 'disponible', '/images/rooms/port-peche.jpg'),
(3, 'Salle de Réunion 2ème Étage', 25, '[\"Vidéoprojecteur\",\"Écran motorisé\",\"Tableau blanc\",\"WiFi\",\"Climatisation\",\"Machine à café\"]', '2025-12-02 11:22:11', '2025-12-02 11:22:11', 2, 'Salle polyvalente située au 2ème étage, idéale pour réunions de travail et sessions de formation.', 'Bâtiment Principal', '2ème étage', 65.00, 'disponible', '/images/rooms/reunion-2eme.jpg'),
(4, 'Salle TD', 15, '[\"Écran TV\",\"Tableau blanc\",\"WiFi\",\"Tables modulables\",\"Prises électriques multiples\"]', '2025-12-02 11:22:11', '2025-12-02 11:22:11', 3, 'Salle de travaux dirigés et formations. Configuration modulable pour ateliers pratiques et sessions de formation.', 'Bâtiment Formation', '1er étage', 40.00, 'disponible', '/images/rooms/salle-td.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20250717162244-create-user.js'),
('20250717162312-create-room.js'),
('20250717162326-create-reservation.js'),
('202507192233-update-reservation-statut-enum.js'),
('20250720002440-add-responsable-id-to-rooms.js'),
('20250720013511-add-equipements-to-rooms.js'),
('202507251614-create-audit-logs.js'),
('20250729224514-create-action-logs.js'),
('202507301446-create-action-logs.js'),
('20251202101504-update-users-table-structure.js'),
('20251202102056-add-missing-columns-to-rooms.js'),
('20251202102300-restructure-reservations-dates.js'),
('20251202105708-remove-pricing-columns.js');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','responsable','user') NOT NULL DEFAULT 'user',
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `poste` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `password`, `role`, `actif`, `createdAt`, `updatedAt`, `poste`, `telephone`) VALUES
(1, 'Admin', 'Système', 'admin@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'admin', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Administrateur Système', '0123456789'),
(2, 'Dupont', 'Jean', 'jean.dupont@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'responsable', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Responsable des Salles', '0123456790'),
(3, 'Martin', 'Sophie', 'sophie.martin@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'responsable', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Responsable Logistique', '0123456791'),
(4, 'Bernard', 'Pierre', 'pierre.bernard@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'user', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Chargé de Communication', '0123456792'),
(5, 'Dubois', 'Marie', 'marie.dubois@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'user', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Assistante RH', '0123456793'),
(6, 'Laurent', 'Thomas', 'thomas.laurent@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'user', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Technicien IT', '0123456794'),
(7, 'Simon', 'Julie', 'julie.simon@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'user', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Comptable', '0123456795'),
(8, 'Michel', 'David', 'david.michel@port-autonome.com', '$2a$12$JnXN.yZsuaZBu8Bn4o6tkeFFuFAUSzrqiUCDi7FJ1f7dI0cLJrT0u', 'user', 1, '2025-12-02 11:22:03', '2025-12-02 11:22:03', 'Chef de Projet', '0123456796'),
(9, 'Test', 'User', 'test@example.com', '$2a$12$qWVO/.22XGsW05ZTXdPFtuWLep8ixeNBgsU5EwArxSvktF8cncM66', 'user', 1, '2025-12-02 13:54:42', '2025-12-02 13:54:42', NULL, '0612345678'),
(10, 'Test', 'User', 'testuser@test.com', '$2a$12$jdy70FaAr7Y1frrESKKgkOf.ZLL8R.HMWP1T.Y5wMz/PuJSq3mW3y', 'user', 1, '2025-12-02 20:28:35', '2025-12-02 20:28:35', 'Testeur', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actionlog`
--
ALTER TABLE `actionlog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `actionlogs`
--
ALTER TABLE `actionlogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_action` (`action`),
  ADD KEY `idx_audit_logs_user_id` (`user_id`),
  ADD KEY `idx_audit_logs_cible_type` (`cible_type`),
  ADD KEY `idx_audit_logs_created_at` (`created_at`),
  ADD KEY `idx_audit_logs_user_date` (`user_id`,`created_at`),
  ADD KEY `idx_audit_logs_action_date` (`action`,`created_at`),
  ADD KEY `idx_audit_logs_cible` (`cible_type`,`cible_id`);

--
-- Indexes for table `historique`
--
ALTER TABLE `historique`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `reservations_validee_par_foreign_idx` (`validee_par`),
  ADD KEY `idx_group_id` (`group_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rooms_responsable_id_foreign_idx` (`responsable_id`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actionlog`
--
ALTER TABLE `actionlog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `actionlogs`
--
ALTER TABLE `actionlogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `historique`
--
ALTER TABLE `historique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actionlogs`
--
ALTER TABLE `actionlogs`
  ADD CONSTRAINT `1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `historique`
--
ALTER TABLE `historique`
  ADD CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `2` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `2` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservations_validee_par_foreign_idx` FOREIGN KEY (`validee_par`) REFERENCES `users` (`id`);

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_responsable_id_foreign_idx` FOREIGN KEY (`responsable_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
