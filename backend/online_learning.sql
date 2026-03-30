-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 30, 2026 at 02:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `online_learning`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('normal','important','urgent') DEFAULT 'normal',
  `created_by` int(11) DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `course_id`, `title`, `content`, `priority`, `created_by`, `scheduled_at`, `created_at`) VALUES
(1, NULL, 'Aannouncement', 'asdasdasdasdasdasd', 'important', 1, NULL, '2026-03-21 01:47:55'),
(2, NULL, 'asdasd', 'asdasdasd', 'important', 1, NULL, '2026-03-21 01:51:35'),
(3, NULL, 'jhgjgjhhhjhj', 'jjkjhjkhjkhkjh', 'normal', 1, NULL, '2026-03-21 05:29:28'),
(8, NULL, 'asdasd', 'asdasd', 'important', 1, NULL, '2026-03-21 06:30:13'),
(9, NULL, '54yyrtyrt1', 'werwerwerw', 'normal', 1, NULL, '2026-03-24 00:53:20'),
(10, 45, 'gfhghfghkl;', 'keljlkejrlkejtklej', 'important', 1, NULL, '2026-03-24 00:58:13'),
(13, 45, 'sadasd', 'sadasdasd', 'normal', 1, NULL, '2026-03-24 01:10:06'),
(33, 45, 'asdasd', 'asdasdasd', 'normal', 1, NULL, '2026-03-24 01:25:51'),
(37, 45, 'asdasd', 'asdasdasd', 'urgent', 1, NULL, '2026-03-24 01:27:27'),
(44, 45, 'sad', 'asdasd', 'normal', 1, NULL, '2026-03-24 01:34:18'),
(45, NULL, 'asdasd', 'asdasdsad', 'normal', 1, NULL, '2026-03-24 01:34:40'),
(65, 45, 'asdasd', 'asdasdasdasd', 'normal', 1, NULL, '2026-03-24 01:45:11'),
(67, NULL, 'asdasd', 'sadasdasd', 'urgent', 1, NULL, '2026-03-24 01:48:46'),
(68, 45, 'yfyftf', 'hjghjghjgjh', 'important', 1, NULL, '2026-03-24 08:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_groups`
--

CREATE TABLE `announcement_groups` (
  `id` int(11) NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement_groups`
--

INSERT INTO `announcement_groups` (`id`, `announcement_id`, `group_id`) VALUES
(1, 8, 1),
(2, 10, 2),
(3, 33, 2),
(4, 37, 2),
(5, 44, 2),
(6, 65, 2),
(7, 67, 2),
(8, 68, 2);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `image` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `status`, `image`, `created_by`, `created_at`, `amount`) VALUES
(17, 'asdasd', 'asdasdasdasd', 'draft', NULL, 1, '2026-03-21 06:36:24', 1000.00),
(18, 'sadasd', 'asdasd', 'draft', NULL, 1, '2026-03-21 06:36:50', 3000.00),
(20, 'dsfsdfsdf', 'asdasdasd', 'draft', '/uploads/1774082566099-324968199.jpg', 1, '2026-03-21 08:26:39', 100.00),
(21, 'asdasd', 'asdasdasdasdasd', 'draft', NULL, 1, '2026-03-21 08:52:21', 1000.00),
(22, 'asdasdasdsa', 'asdasdasd', 'draft', '/uploads/1774083654987-836495781.jpg', 1, '2026-03-21 09:00:54', 1000.00),
(23, 'sadasd', 'asdasdasd', 'draft', NULL, 1, '2026-03-21 09:01:33', 1000.00),
(24, 'Untitled Course', NULL, 'draft', NULL, 1, '2026-03-21 09:02:08', 0.00),
(25, 'asdasdasddasd', 'asdasd', 'draft', '/uploads/1774085379027-578020015.jpg', 1, '2026-03-21 09:29:39', 1000.00),
(26, 'asdasdasd', 'asdasdasdas', 'draft', '/uploads/1774085689524-748940942.png', 1, '2026-03-21 09:34:49', 1000.00),
(27, 'asdasdasd', 'asdasdasd', 'draft', '/uploads/1774085995315-882316775.jpg', 1, '2026-03-21 09:39:55', 1000.00),
(28, 'asdasdasd', 'asdasdasdasd', 'draft', '/uploads/1774086272858-585212115.png', 1, '2026-03-21 09:44:32', 1000.00),
(29, 'asdasdasd', 'asdasdasd', 'draft', '/uploads/1774086706353-939592967.jpeg', 1, '2026-03-21 09:51:46', 10000.00),
(30, 'asdasdasd', 'asdasdasd', 'draft', '/uploads/1774086927758-377490088.jpg', 1, '2026-03-21 09:55:27', 1000.00),
(31, 'sadasdasdas', 'asdasdasd', 'draft', '/uploads/1774087044277-661754865.jpg', 1, '2026-03-21 09:57:24', 1000.00),
(32, 'asdasdasdasda', 'adasdasd', 'draft', '/uploads/1774087601397-555547285.png', 1, '2026-03-21 10:06:41', 1000.00),
(33, 'asdasdasd', 'asdasdasdasd', 'draft', '/uploads/1774087850347-219437969.jpg', 1, '2026-03-21 10:10:50', 1000.99),
(34, 'asdasdasd', 'asdasdasdasd', 'draft', '/uploads/1774088052048-642502634.png', 1, '2026-03-21 10:14:12', 1000.00),
(35, 'asdasdasd', 'asdasdasd', 'draft', '/uploads/1774088309135-302279578.png', 1, '2026-03-21 10:18:29', 1000.00),
(36, 'asdasd', 'asdasdasd ', 'draft', '/uploads/1774089170505-32786564.jpg', 1, '2026-03-21 10:32:50', 1000.00),
(37, 'asdasdasd', 'asdasdasd', 'draft', NULL, 1, '2026-03-21 10:41:16', 0.00),
(38, 'asdasdasd', 'asdasd', 'draft', NULL, 1, '2026-03-23 00:44:51', 100.00),
(39, 'ASDASDASD', 'ASDASDASD', 'draft', NULL, 1, '2026-03-23 02:16:19', 100.00),
(40, 'asdasd', 'sadasdasd', 'draft', '/uploads/1774247246117-67788182.jpg', 1, '2026-03-23 06:27:26', 1000.00),
(41, 'qweqweqwe', 'asdasdasdasd', 'published', '/uploads/1774249936184-91942629.jpg', 1, '2026-03-23 06:58:33', 1000.00),
(42, 'Hands', 'asdasd', 'published', '/uploads/1774250461932-724471032.jpg', 1, '2026-03-23 07:21:01', 10000000.00),
(45, 'BSIT', 'kgflkglkdfjglkdgld', 'published', '/uploads/1774313224081-955836217.jpg', 1, '2026-03-24 00:47:04', 1000.00),
(46, 'English', 'wdjakhdjakshdkjashd', 'published', '/uploads/1774336849881-964338672.png', 1, '2026-03-24 07:20:49', 1000.00),
(47, 'sdfsdfsdf', 'sfsdfsdfsdf', 'draft', '/uploads/1774337180666-595519321.jpg', 1, '2026-03-24 07:26:20', 1000.00),
(48, 'sadasd', 'asdasdasda', 'draft', '/uploads/1774337537736-280886073.jpg', 1, '2026-03-24 07:32:17', 10000.00),
(49, 'dasdasdsadasd', 'sadasdasd', 'draft', '/uploads/1774337991651-37709798.jpg', 1, '2026-03-24 07:39:51', 1000.00),
(50, 'sdfsdfsdf', 'sdfsdfsdf', 'draft', '/uploads/1774338961155-65246990.png', 1, '2026-03-24 07:56:01', 10000.00),
(51, 'wdfsfsdf`', 'sdfsdfsdf', 'draft', '/uploads/1774339486051-931280346.jpg', 1, '2026-03-24 08:04:46', 1000.00),
(52, 'sadasd', 'sadasd', 'draft', '/uploads/1774414376166-362678150.png', 1, '2026-03-25 04:52:56', 1000.00),
(53, 'asdasdasd', 'ddsadasdasd', 'draft', '/uploads/1774495047447-556636183.jpg', 1, '2026-03-26 03:17:27', 1000.00),
(54, 'sadasd', 'asdasd', 'draft', NULL, 1, '2026-03-28 11:49:41', 10000.00);

-- --------------------------------------------------------

--
-- Table structure for table `course_class_links`
--

CREATE TABLE `course_class_links` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `class_link` varchar(500) NOT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT 0,
  `status` enum('pending','active','completed') DEFAULT 'pending',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES
(17, 2, 18, 0, 'active', '2026-03-21 06:38:23'),
(18, 2, 22, 0, '', '2026-03-21 09:03:13'),
(19, 2, 25, 0, '', '2026-03-21 09:30:04'),
(20, 2, 26, 0, 'active', '2026-03-21 09:35:11'),
(21, 2, 27, 0, 'active', '2026-03-21 09:40:59'),
(22, 2, 28, 0, 'active', '2026-03-21 09:44:46'),
(23, 2, 29, 0, 'active', '2026-03-21 09:52:15'),
(24, 2, 30, 0, 'active', '2026-03-21 09:55:43'),
(25, 2, 31, 0, 'active', '2026-03-21 09:57:48'),
(26, 2, 32, 0, 'active', '2026-03-21 10:06:57'),
(27, 2, 33, 0, 'active', '2026-03-21 10:11:04'),
(28, 2, 34, 0, 'active', '2026-03-21 10:14:32'),
(29, 2, 35, 0, 'active', '2026-03-21 10:18:46'),
(30, 2, 36, 0, 'active', '2026-03-21 10:33:39'),
(31, 2, 37, 0, 'active', '2026-03-21 10:41:38'),
(32, 2, 38, 0, 'active', '2026-03-23 00:48:27'),
(33, 2, 39, 0, 'active', '2026-03-23 02:16:41'),
(34, 2, 40, 0, 'active', '2026-03-23 06:27:46'),
(35, 2, 41, 0, 'active', '2026-03-23 06:58:56'),
(36, 2, 42, 0, 'active', '2026-03-23 07:21:55'),
(39, 2, 45, 100, 'completed', '2026-03-24 00:47:55'),
(40, 6, 45, 0, 'active', '2026-03-24 00:59:22'),
(41, 5, 45, 0, 'active', '2026-03-24 01:01:20'),
(42, 5, 46, 100, 'completed', '2026-03-24 07:21:18'),
(43, 5, 47, 0, 'active', '2026-03-24 07:26:46'),
(44, 5, 48, 0, '', '2026-03-24 07:32:25'),
(45, 5, 49, 0, '', '2026-03-24 07:40:15'),
(46, 5, 50, 0, '', '2026-03-24 07:56:17'),
(47, 5, 51, 0, '', '2026-03-24 08:05:27'),
(48, 2, 52, 0, 'active', '2026-03-25 04:53:26'),
(49, 7, 53, 100, 'completed', '2026-03-26 03:18:08'),
(50, 2, 53, 100, 'completed', '2026-03-28 07:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `handouts`
--

CREATE TABLE `handouts` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `handouts`
--

INSERT INTO `handouts` (`id`, `course_id`, `title`, `file_path`, `file_type`, `file_size`, `description`, `created_at`) VALUES
(1, 40, 'asdasdas', '/uploads/handouts/1774248825420-651507915.pdf', 'application/pdf', 373254, '', '2026-03-23 06:53:45'),
(2, 41, 'wddasd', '/uploads/handouts/1774249233086-673672869.pdf', 'application/pdf', 373254, '', '2026-03-23 07:00:33'),
(3, 36, 'asdasdasd', '/uploads/handouts/1774249877138-701161117.pdf', 'application/pdf', 373254, '', '2026-03-23 07:11:17'),
(4, 42, 'asdas', '/uploads/handouts/1774250486162-458280448.pdf', 'application/pdf', 373254, '', '2026-03-23 07:21:26'),
(8, 45, 'yyrtyrt', '/uploads/handouts/1774313434411-813142708.pdf', 'application/pdf', 373254, '', '2026-03-24 00:50:34'),
(9, 46, 'fsdfsdfsdf', '/uploads/handouts/1774336969296-725143826.pdf', 'application/pdf', 373254, '', '2026-03-24 07:22:49'),
(10, 52, 'asdasd', '/uploads/handouts/1774414485463-434656821.pdf', 'application/pdf', 373254, '', '2026-03-25 04:54:45'),
(11, 53, 'English', '/uploads/handouts/1774495137493-263739341.pdf', 'application/pdf', 373254, '', '2026-03-26 03:18:57');

-- --------------------------------------------------------

--
-- Table structure for table `learning_paths`
--

CREATE TABLE `learning_paths` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'published',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_path_courses`
--

CREATE TABLE `learning_path_courses` (
  `id` int(11) NOT NULL,
  `learning_path_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `order_num` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_path_enrollments`
--

CREATE TABLE `learning_path_enrollments` (
  `id` int(11) NOT NULL,
  `learning_path_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT 0,
  `status` enum('active','completed') DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_resources`
--

CREATE TABLE `learning_resources` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `resource_type` enum('pdf','video','link','document','template') DEFAULT 'pdf',
  `file_path` varchar(500) DEFAULT NULL,
  `external_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_global` tinyint(1) DEFAULT 0,
  `course_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `order_num` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `video_file` varchar(255) DEFAULT NULL,
  `document_file` varchar(255) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `course_id`, `title`, `content`, `video_url`, `order_num`, `created_at`, `video_file`, `document_file`, `document_type`) VALUES
(2, 18, 'asdasdasd', 'asdasdasd', 'asdasdasd', 0, '2026-03-21 06:37:47', NULL, NULL, NULL),
(4, 20, 'sdfsdfsdf', 'sdasdasdas', 'asdasdasd', 1, '2026-03-21 08:26:39', NULL, NULL, NULL),
(5, 21, 'asdasd', 'adasdasdasd', 'asdasdasdasd', 1, '2026-03-21 08:52:21', NULL, NULL, NULL),
(6, 23, 'asdasdasd', 'asdasdasd', 'sadasdasdasd', 1, '2026-03-21 09:01:33', NULL, NULL, NULL),
(8, 24, 'asdasd', 'asdasdasd', 'asdasdasdasd', 2, '2026-03-21 09:04:32', NULL, NULL, NULL),
(9, 40, 'sdfsdfsdfsdf', 'asdasdasd', 'https://elms.sti.edu/files/8981488/01_Handout_1(34).pdf?lmsauth=3cec2101afa2483eab9dd4678c7831cde868a426', 1, '2026-03-23 06:31:11', NULL, NULL, NULL),
(11, 45, '5tertertert1ewetwetwetwe', 'rtertertretert', '', 1, '2026-03-24 00:50:09', NULL, NULL, NULL),
(12, 46, 'sadasd', 'asdasdasdasd', '', 1, '2026-03-24 07:22:24', NULL, NULL, NULL),
(13, 52, 'sadasdasd', 'dsadasdasd', '', 1, '2026-03-25 04:54:32', NULL, NULL, NULL),
(14, 53, 'asdasd', 'sadasdasdasd', '', 1, '2026-03-26 03:18:48', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lesson_progress`
--

INSERT INTO `lesson_progress` (`id`, `user_id`, `lesson_id`, `completed`, `completed_at`) VALUES
(2, 2, 11, 1, '2026-03-24 00:51:20'),
(3, 5, 12, 1, '2026-03-24 07:23:10'),
(4, 7, 14, 1, '2026-03-26 03:19:44'),
(5, 2, 14, 1, '2026-03-28 07:14:06');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('payment_confirmed','class_link','enrollment_pending','general','announcement') DEFAULT 'general',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `enrollment_id` int(11) DEFAULT NULL,
  `class_link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `course_id`, `enrollment_id`, `class_link`, `is_read`, `created_at`) VALUES
(1, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 02:28:52'),
(2, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 02:33:25'),
(3, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 02:37:30'),
(4, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 1, '2026-03-21 02:44:27'),
(5, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 03:04:40'),
(6, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 03:53:22'),
(7, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 03:59:52'),
(8, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 04:08:10'),
(9, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 04:14:35'),
(10, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 04:22:56'),
(11, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 05:18:35'),
(12, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', NULL, NULL, NULL, 0, '2026-03-21 05:18:51'),
(13, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 05:26:01'),
(14, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', NULL, NULL, NULL, 0, '2026-03-21 05:27:18'),
(15, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-21 06:06:58'),
(16, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', NULL, NULL, NULL, 0, '2026-03-21 06:07:15'),
(17, 2, 'announcement', 'asdasd', 'asdasd', NULL, NULL, NULL, 0, '2026-03-21 06:30:13'),
(18, 3, 'announcement', 'asdasd', 'asdasd', NULL, NULL, NULL, 0, '2026-03-21 06:30:13'),
(19, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 18, 17, NULL, 0, '2026-03-21 06:38:23'),
(20, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 18, 17, NULL, 0, '2026-03-21 06:38:33'),
(21, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 22, 18, NULL, 0, '2026-03-21 09:03:13'),
(22, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 25, 19, NULL, 0, '2026-03-21 09:30:04'),
(23, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 26, 20, NULL, 0, '2026-03-21 09:35:11'),
(24, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 26, 20, NULL, 0, '2026-03-21 09:37:04'),
(25, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 27, 21, NULL, 0, '2026-03-21 09:40:59'),
(26, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 27, 21, NULL, 0, '2026-03-21 09:41:04'),
(27, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 28, 22, NULL, 0, '2026-03-21 09:44:46'),
(28, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 28, 22, NULL, 0, '2026-03-21 09:44:53'),
(29, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 29, 23, NULL, 0, '2026-03-21 09:52:15'),
(30, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 29, 23, NULL, 0, '2026-03-21 09:52:23'),
(31, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 30, 24, NULL, 0, '2026-03-21 09:55:43'),
(32, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 30, 24, NULL, 0, '2026-03-21 09:55:50'),
(33, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 31, 25, NULL, 0, '2026-03-21 09:57:48'),
(34, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 31, 25, NULL, 0, '2026-03-21 09:57:55'),
(35, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 32, 26, NULL, 0, '2026-03-21 10:06:57'),
(36, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 32, 26, NULL, 0, '2026-03-21 10:07:06'),
(37, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 33, 27, NULL, 0, '2026-03-21 10:11:04'),
(38, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 33, 27, NULL, 0, '2026-03-21 10:11:10'),
(39, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 34, 28, NULL, 0, '2026-03-21 10:14:32'),
(40, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 34, 28, NULL, 0, '2026-03-21 10:14:38'),
(41, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 35, 29, NULL, 0, '2026-03-21 10:18:46'),
(42, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 35, 29, NULL, 0, '2026-03-21 10:18:53'),
(43, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 36, 30, NULL, 0, '2026-03-21 10:33:39'),
(44, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 36, 30, NULL, 0, '2026-03-21 10:33:49'),
(45, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 37, 31, NULL, 0, '2026-03-21 10:41:38'),
(46, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 37, 31, NULL, 0, '2026-03-21 10:41:46'),
(47, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 38, 32, NULL, 0, '2026-03-23 00:48:27'),
(48, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 38, 32, NULL, 0, '2026-03-23 00:48:35'),
(49, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 39, 33, NULL, 0, '2026-03-23 02:16:41'),
(50, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 39, 33, NULL, 0, '2026-03-23 02:16:50'),
(51, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 40, 34, NULL, 0, '2026-03-23 06:27:46'),
(52, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 40, 34, NULL, 0, '2026-03-23 06:27:54'),
(53, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 41, 35, NULL, 0, '2026-03-23 06:58:56'),
(54, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 41, 35, NULL, 0, '2026-03-23 06:59:11'),
(55, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 42, 36, NULL, 0, '2026-03-23 07:21:55'),
(56, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 42, 36, NULL, 0, '2026-03-23 07:22:01'),
(57, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-23 07:30:25'),
(58, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', NULL, NULL, NULL, 0, '2026-03-23 07:30:42'),
(59, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', NULL, NULL, NULL, 0, '2026-03-23 07:42:13'),
(60, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', NULL, NULL, NULL, 0, '2026-03-23 07:42:44'),
(61, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 45, 39, NULL, 0, '2026-03-24 00:47:55'),
(62, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 45, 39, NULL, 0, '2026-03-24 00:49:05'),
(63, 2, 'announcement', '54yyrtyrt1', 'werwerwerw', NULL, NULL, NULL, 0, '2026-03-24 00:53:20'),
(64, 3, 'announcement', '54yyrtyrt1', 'werwerwerw', NULL, NULL, NULL, 0, '2026-03-24 00:53:20'),
(65, 6, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 45, 40, NULL, 0, '2026-03-24 00:59:22'),
(66, 6, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 45, 40, NULL, 0, '2026-03-24 00:59:34'),
(67, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 45, 41, NULL, 0, '2026-03-24 01:01:20'),
(68, 5, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 45, 41, NULL, 0, '2026-03-24 01:01:26'),
(69, 2, 'announcement', 'asdasd', 'asdasdsad', NULL, NULL, NULL, 0, '2026-03-24 01:34:40'),
(70, 3, 'announcement', 'asdasd', 'asdasdsad', NULL, NULL, NULL, 0, '2026-03-24 01:34:40'),
(71, 5, 'announcement', 'asdasd', 'asdasdsad', NULL, NULL, NULL, 0, '2026-03-24 01:34:40'),
(72, 6, 'announcement', 'asdasd', 'asdasdsad', NULL, NULL, NULL, 0, '2026-03-24 01:34:40'),
(73, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 46, 42, NULL, 0, '2026-03-24 07:21:18'),
(74, 5, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 46, 42, NULL, 0, '2026-03-24 07:21:54'),
(75, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 47, 43, NULL, 0, '2026-03-24 07:26:46'),
(76, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 48, 44, NULL, 0, '2026-03-24 07:32:25'),
(77, 5, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 47, 43, NULL, 0, '2026-03-24 07:34:51'),
(78, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 49, 45, NULL, 0, '2026-03-24 07:40:15'),
(79, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 50, 46, NULL, 0, '2026-03-24 07:56:17'),
(80, 5, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 51, 47, NULL, 0, '2026-03-24 08:05:27'),
(81, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 52, 48, NULL, 0, '2026-03-25 04:53:26'),
(82, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 52, 48, NULL, 0, '2026-03-25 04:53:59'),
(83, 7, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 53, 49, NULL, 0, '2026-03-26 03:18:08'),
(84, 7, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 53, 49, NULL, 0, '2026-03-26 03:18:29'),
(85, 2, 'enrollment_pending', 'Enrollment Pending', 'Your enrollment is pending payment confirmation. Please upload your payment proof.', 53, 50, NULL, 0, '2026-03-28 07:13:31'),
(86, 2, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', 53, 50, NULL, 0, '2026-03-28 07:13:41');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('bank_transfer','e_wallet','gcash','paymaya','other') DEFAULT 'bank_transfer',
  `proof_path` varchar(255) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `enrollment_id`, `user_id`, `course_id`, `amount`, `payment_method`, `proof_path`, `reference_number`, `notes`, `status`, `verified_by`, `verified_at`, `created_at`) VALUES
(4, 17, 2, 18, 3000.00, 'bank_transfer', 'C:\\xampp\\htdocs\\Online learnings\\backend\\uploads\\payments\\payment-1774075103296-895736489.jpg', '0886319910', '', 'verified', 1, '2026-03-21 06:38:33', '2026-03-21 06:38:23'),
(5, 20, 2, 26, 1000.00, 'bank_transfer', 'C:\\xampp\\htdocs\\Online learnings\\backend\\uploads\\payments\\payment-1774085711260-377753294.jpg', '0886319910', '', 'verified', 1, '2026-03-21 09:37:04', '2026-03-21 09:35:11'),
(6, 21, 2, 27, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774086059067-515182264.jpg', '0886319910', '', 'verified', 1, '2026-03-21 09:41:04', '2026-03-21 09:40:59'),
(7, 22, 2, 28, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774086287010-443235531.jpg', '0886319910', '', 'verified', 1, '2026-03-21 09:44:53', '2026-03-21 09:44:47'),
(8, 23, 2, 29, 10000.00, 'bank_transfer', '/uploads/payments/payment-1774086735196-811068095.jpg', '0886319910', '', 'verified', 1, '2026-03-21 09:52:23', '2026-03-21 09:52:15'),
(9, 24, 2, 30, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774086943756-933239610.jpg', '0886319910', '', 'verified', 1, '2026-03-21 09:55:50', '2026-03-21 09:55:43'),
(10, 25, 2, 31, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774087068984-256492618.jpg', '0886319910', '', 'verified', 1, '2026-03-21 09:57:55', '2026-03-21 09:57:48'),
(11, 26, 2, 32, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774087617831-384647093.jpg', '0886319910', '', 'verified', 1, '2026-03-21 10:07:06', '2026-03-21 10:06:57'),
(12, 27, 2, 33, 1000.99, 'bank_transfer', '/uploads/payments/payment-1774087864514-126185208.png', '0886319910', '', 'verified', 1, '2026-03-21 10:11:10', '2026-03-21 10:11:04'),
(13, 28, 2, 34, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774088072052-46643920.png', '0886319910', '', 'verified', 1, '2026-03-21 10:14:38', '2026-03-21 10:14:32'),
(14, 29, 2, 35, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774088326982-687544341.png', '0886319910', '', 'verified', 1, '2026-03-21 10:18:53', '2026-03-21 10:18:47'),
(15, 30, 2, 36, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774089219935-942662861.png', '0886319910', '', 'verified', 1, '2026-03-21 10:33:49', '2026-03-21 10:33:39'),
(16, 31, 2, 37, 0.00, 'bank_transfer', '/uploads/payments/payment-1774089698045-926566167.jpg', '0886319910', '', 'verified', 1, '2026-03-21 10:41:46', '2026-03-21 10:41:38'),
(17, 32, 2, 38, 100.00, 'bank_transfer', '/uploads/payments/payment-1774226907709-569292163.png', '0886319910', '', 'verified', 1, '2026-03-23 00:48:35', '2026-03-23 00:48:27'),
(18, 33, 2, 39, 100.00, 'bank_transfer', '/uploads/payments/payment-1774232201866-639109613.jpg', '0886319910', '', 'verified', 1, '2026-03-23 02:16:50', '2026-03-23 02:16:41'),
(19, 34, 2, 40, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774247266201-259871090.jpg', '0886319910', '', 'verified', 1, '2026-03-23 06:27:54', '2026-03-23 06:27:46'),
(20, 35, 2, 41, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774249136129-883426022.jpg', '0886319910', '', 'verified', 1, '2026-03-23 06:59:11', '2026-03-23 06:58:56'),
(21, 36, 2, 42, 10000000.00, 'bank_transfer', '/uploads/payments/payment-1774250515253-501002347.png', '0886319910', '', 'verified', 1, '2026-03-23 07:22:01', '2026-03-23 07:21:55'),
(24, 39, 2, 45, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774313275319-310254529.jpg', '0886319910', '', 'verified', 1, '2026-03-24 00:49:05', '2026-03-24 00:47:55'),
(25, 40, 6, 45, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774313962429-849372062.png', '0886319910', '', 'verified', 1, '2026-03-24 00:59:34', '2026-03-24 00:59:22'),
(26, 41, 5, 45, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774314080401-474786334.jpg', '0886319910', '', 'verified', 1, '2026-03-24 01:01:26', '2026-03-24 01:01:20'),
(27, 42, 5, 46, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774336878262-11580081.jpg', '0886319910', '', 'verified', 1, '2026-03-24 07:21:54', '2026-03-24 07:21:18'),
(28, 43, 5, 47, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774337206045-970698220.jpg', '0886319910', '', 'verified', 1, '2026-03-24 07:34:51', '2026-03-24 07:26:46'),
(29, 45, 5, 49, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774338015922-446261434.jpg', '0886319910', '', 'pending', NULL, NULL, '2026-03-24 07:40:15'),
(30, 46, 5, 50, 10000.00, 'bank_transfer', '/uploads/payments/payment-1774338977439-237511083.png', '0886319910', '', 'pending', NULL, NULL, '2026-03-24 07:56:17'),
(31, 47, 5, 51, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774339527143-730699588.jpg', '0886319910', '', 'pending', NULL, NULL, '2026-03-24 08:05:27'),
(32, 48, 2, 52, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774414406598-513859455.jpg', '0886319910', '', 'verified', 1, '2026-03-25 04:53:59', '2026-03-25 04:53:26'),
(33, 49, 7, 53, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774495088910-245823364.jpg', '0886319910', '', 'verified', 1, '2026-03-26 03:18:29', '2026-03-26 03:18:08'),
(34, 50, 2, 53, 1000.00, 'bank_transfer', '/uploads/payments/payment-1774682011648-605846399.png', '0886319910', '', 'verified', 1, '2026-03-28 07:13:41', '2026-03-28 07:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `payment_settings`
--

CREATE TABLE `payment_settings` (
  `id` int(11) NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `qr_code_path` varchar(255) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_network` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_settings`
--

INSERT INTO `payment_settings` (`id`, `bank_name`, `account_name`, `account_number`, `amount`, `qr_code_path`, `instructions`, `updated_by`, `updated_at`, `payment_network`) VALUES
(1, 'Sacombank', 'ROLDAN HERRERA SARREAL', '0886319910', 1000.00, '/uploads/payment_settings/qr-1774072914062-961206118.jpg', 'Please transfer the exact amount and upload your payment proof.', 1, '2026-03-21 06:01:54', 'Napas247 Fast Fund / VietQR');

-- --------------------------------------------------------

--
-- Table structure for table `student_events`
--

CREATE TABLE `student_events` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `event_type` enum('quiz','assignment','class','meeting','deadline','other') DEFAULT 'other',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_goals`
--

CREATE TABLE `student_goals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_type` enum('course_completion','lesson_completion','hours_learned','certificates','custom') DEFAULT 'custom',
  `target_value` int(11) DEFAULT 100,
  `current_value` int(11) DEFAULT 0,
  `deadline` date DEFAULT NULL,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `linked_course_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_groups`
--

CREATE TABLE `student_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_groups`
--

INSERT INTO `student_groups` (`id`, `name`, `description`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'wewewew', 'adawdawd', 1, '2026-03-21 06:22:59', '2026-03-21 06:22:59'),
(2, 'GROUP 1 MAHOGANY', 'sfsdfsdfsdfsdsddfgdf', 1, '2026-03-24 00:57:24', '2026-03-24 00:57:24');

-- --------------------------------------------------------

--
-- Table structure for table `student_group_members`
--

CREATE TABLE `student_group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_group_members`
--

INSERT INTO `student_group_members` (`id`, `group_id`, `user_id`, `added_at`) VALUES
(1, 1, 2, '2026-03-21 06:23:17'),
(2, 1, 3, '2026-03-21 06:23:17'),
(3, 2, 3, '2026-03-24 01:07:39'),
(4, 2, 5, '2026-03-24 01:07:39');

-- --------------------------------------------------------

--
-- Table structure for table `student_todos`
--

CREATE TABLE `student_todos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `text` varchar(500) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','student') DEFAULT 'student',
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `notification_email` tinyint(1) DEFAULT 1,
  `notification_progress` tinyint(1) DEFAULT 1,
  `notification_courses` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `phone`, `bio`, `notification_email`, `notification_progress`, `notification_courses`, `created_at`) VALUES
(1, 'Admin', 'admin@example.com', '$2a$10$dGtNmtUP4PI9Nm4zpKaFWeKzOSj5QHQY/Oqp92.ho5xW2VXHU/8Ve', 'admin', NULL, NULL, NULL, 1, 1, 1, '2026-03-20 04:55:39'),
(2, 'lloradojustin', 'lloradojustin334@gmail.com', '$2a$10$pbXwc9PZz9G58VjaNJ5X7eKWyocvfU1h8Ns/mbKOB9Ns8LQlUbAJm', 'student', NULL, NULL, NULL, 1, 1, 1, '2026-03-20 04:58:53'),
(3, 'Lisa Misa', 'lisa@gmail.com', '$2a$10$/JiLPtfsVpnNW.aVBIpG9.vMbAZ1qZ9ClVxZLdjVmjyT6KTMiVwmW', 'student', NULL, NULL, NULL, 1, 1, 1, '2026-03-20 05:46:54'),
(5, 'cruz mill', 'cruz@gmail.com', '$2a$10$eIl/U2l6mUrQ0Whsp290NOQowQ3YsIfQa2Ikev02h0GVCmczHKoju', 'student', NULL, NULL, NULL, 1, 1, 1, '2026-03-24 00:56:04'),
(6, 'miss atene', 'miss@gmail.com', '$2a$10$0nFhwuzXKcnm2n1j6yU51.TaZomr2e3mdIY2WvBLzTIIysUhihKYm', 'student', NULL, NULL, NULL, 1, 1, 1, '2026-03-24 00:56:32'),
(7, 'john Lloyd', 'john@gmail.com', '$2a$10$v1LjVgN8.ejMIi0A3m5F.OUZXcawa1qleg8.S1Uc8OOV/ImLhCGBW', 'student', NULL, NULL, NULL, 1, 1, 1, '2026-03-25 04:57:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `announcement_groups`
--
ALTER TABLE `announcement_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_announcement_group` (`announcement_id`,`group_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `course_class_links`
--
ALTER TABLE `course_class_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `handouts`
--
ALTER TABLE `handouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `learning_path_courses`
--
ALTER TABLE `learning_path_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_path_course` (`learning_path_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `learning_path_enrollments`
--
ALTER TABLE `learning_path_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_path_enrollment` (`learning_path_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `learning_resources`
--
ALTER TABLE `learning_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_progress` (`user_id`,`lesson_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `enrollment_id` (`enrollment_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollment_id` (`enrollment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indexes for table `payment_settings`
--
ALTER TABLE `payment_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `student_events`
--
ALTER TABLE `student_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `student_goals`
--
ALTER TABLE `student_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `linked_course_id` (`linked_course_id`);

--
-- Indexes for table `student_groups`
--
ALTER TABLE `student_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `student_group_members`
--
ALTER TABLE `student_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_member` (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `student_todos`
--
ALTER TABLE `student_todos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `announcement_groups`
--
ALTER TABLE `announcement_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `course_class_links`
--
ALTER TABLE `course_class_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `handouts`
--
ALTER TABLE `handouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `learning_paths`
--
ALTER TABLE `learning_paths`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_path_courses`
--
ALTER TABLE `learning_path_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_path_enrollments`
--
ALTER TABLE `learning_path_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_resources`
--
ALTER TABLE `learning_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `payment_settings`
--
ALTER TABLE `payment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_events`
--
ALTER TABLE `student_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_goals`
--
ALTER TABLE `student_goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_groups`
--
ALTER TABLE `student_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_group_members`
--
ALTER TABLE `student_group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_todos`
--
ALTER TABLE `student_todos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `announcement_groups`
--
ALTER TABLE `announcement_groups`
  ADD CONSTRAINT `announcement_groups_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `student_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `course_class_links`
--
ALTER TABLE `course_class_links`
  ADD CONSTRAINT `course_class_links_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_class_links_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `handouts`
--
ALTER TABLE `handouts`
  ADD CONSTRAINT `handouts_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD CONSTRAINT `learning_paths_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `learning_path_courses`
--
ALTER TABLE `learning_path_courses`
  ADD CONSTRAINT `learning_path_courses_ibfk_1` FOREIGN KEY (`learning_path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_path_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_path_enrollments`
--
ALTER TABLE `learning_path_enrollments`
  ADD CONSTRAINT `learning_path_enrollments_ibfk_1` FOREIGN KEY (`learning_path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_path_enrollments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_resources`
--
ALTER TABLE `learning_resources`
  ADD CONSTRAINT `learning_resources_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `learning_resources_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_settings`
--
ALTER TABLE `payment_settings`
  ADD CONSTRAINT `payment_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_events`
--
ALTER TABLE `student_events`
  ADD CONSTRAINT `student_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_events_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_goals`
--
ALTER TABLE `student_goals`
  ADD CONSTRAINT `student_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_goals_ibfk_2` FOREIGN KEY (`linked_course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_groups`
--
ALTER TABLE `student_groups`
  ADD CONSTRAINT `student_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_group_members`
--
ALTER TABLE `student_group_members`
  ADD CONSTRAINT `student_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `student_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_todos`
--
ALTER TABLE `student_todos`
  ADD CONSTRAINT `student_todos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
