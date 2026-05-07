-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_rental_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,7,'LOGIN','User logged in','auth',NULL,'::1','2026-04-27 13:52:20'),(2,8,'LOGIN','User logged in','auth',NULL,'::1','2026-04-27 13:53:17'),(3,14,'LOGIN','User logged in','auth',NULL,'::1','2026-04-27 13:53:35'),(4,8,'LOGIN','User logged in','auth',NULL,'::1','2026-04-27 13:54:46'),(5,1,'LOGIN','User logged in','auth',NULL,'::1','2026-04-27 13:55:05'),(6,7,'LOGIN','User logged in','auth',NULL,'::1','2026-04-28 07:06:51'),(7,7,'LOGIN','User logged in','auth',NULL,'::1','2026-04-29 13:49:31'),(8,2,'LOGIN','User logged in','auth',NULL,'::1','2026-04-29 13:50:28'),(9,2,'LOGIN','User logged in','auth',NULL,'::1','2026-04-30 10:57:28'),(10,2,'LOGIN','User logged in','auth',NULL,'::1','2026-04-30 21:10:23'),(11,2,'LOGIN','User logged in','auth',NULL,'::1','2026-04-30 21:23:45'),(12,14,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 11:37:49'),(13,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 11:38:13'),(14,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 11:39:09'),(15,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 11:39:21'),(16,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 16:39:28'),(17,14,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 16:39:48'),(18,7,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 17:53:20'),(19,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 17:53:41'),(20,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:48:18'),(21,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:48:47'),(22,14,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:49:07'),(23,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:49:59'),(24,7,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:51:20'),(25,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:51:44'),(26,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:52:17'),(27,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 20:59:18'),(28,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 21:00:16'),(29,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 21:02:19'),(30,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 21:08:11'),(31,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 21:27:11'),(32,1,'LOGIN','User logged in successfully','auth',NULL,'127.0.0.1','2026-05-01 22:40:56'),(33,1,'PROPERTY_ADDED','Added new property \"Cozy Apartment\"','property',NULL,'127.0.0.1','2026-05-01 22:40:56'),(34,1,'PAYMENT_RECORDED','Recorded payment of RWF 50,000','payment',NULL,'127.0.0.1','2026-05-01 22:40:56'),(35,1,'RENTAL_CREATED','Created new rental agreement','rental',NULL,'127.0.0.1','2026-05-01 22:40:56'),(36,1,'INVOICE_CREATED','Created invoice for May 2026 - RWF 40,000','invoice',NULL,'127.0.0.1','2026-05-01 22:40:56'),(37,2,'LOGIN','Uwimana Alice logged in successfully','auth',NULL,'127.0.0.1','2026-05-01 22:45:32'),(38,2,'PROPERTY_ADDED','Added new property \"Cozy Room in Nyamirambo\"','property',NULL,'127.0.0.1','2026-05-01 22:45:32'),(39,2,'RENTAL_CREATED','Created rental agreement with Mugisha Prince','rental',NULL,'127.0.0.1','2026-05-01 22:45:32'),(40,2,'PAYMENT_RECORDED','Recorded payment of RWF 23,000 from Mugisha Prince','payment',NULL,'127.0.0.1','2026-05-01 22:45:32'),(41,2,'INVOICE_CREATED','Created invoice for May 2026 - RWF 40,000','invoice',NULL,'127.0.0.1','2026-05-01 22:45:32'),(42,8,'LOGIN','Mugisha Prince logged in successfully','auth',NULL,'127.0.0.1','2026-05-01 22:45:34'),(43,8,'INVOICE_CREATED','Created invoice for May 2026 - RWF 40,000','invoice',NULL,'127.0.0.1','2026-05-01 22:45:34'),(44,8,'PAYMENT_INITIATED','Initiated payment of RWF 20,000','payment',NULL,'127.0.0.1','2026-05-01 22:45:34'),(45,8,'PAYMENT_COMPLETED','Completed payment of RWF 20,000','payment',NULL,'127.0.0.1','2026-05-01 22:45:34'),(46,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 22:50:39'),(47,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 22:50:49'),(48,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 22:51:01'),(49,7,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 22:56:56'),(50,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-01 23:06:08'),(51,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 10:51:08'),(52,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 11:21:35'),(53,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 11:23:36'),(54,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 22:36:18'),(55,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 22:58:47'),(56,1,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 22:59:16'),(57,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:00:22'),(58,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:03:43'),(59,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:09:55'),(60,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:10:23'),(61,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:11:51'),(62,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:13:51'),(63,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:15:24'),(64,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:21:21'),(65,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:28:45'),(66,14,'PAYMENT_INITIATED','Initiated payment of RWF 2000.00 for invoice #1','payment',22,'::ffff:192.168.1.102','2026-05-02 23:33:48'),(67,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:35:26'),(68,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:39:27'),(69,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:42:09'),(70,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:44:11'),(71,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 23:48:02'),(72,14,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 23:50:12'),(73,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 23:50:27'),(74,1,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:51:06'),(75,1,'LOGIN','User logged in','auth',NULL,'::1','2026-05-02 23:51:14'),(76,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:51:32'),(77,14,'PASSWORD_CHANGED','Password was changed','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:57:41'),(78,14,'PASSWORD_CHANGED','Password was changed','auth',NULL,'::ffff:192.168.1.102','2026-05-02 23:58:00'),(79,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 00:10:49'),(80,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 00:11:05'),(81,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 00:11:49'),(82,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:11:56'),(83,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:13:49'),(84,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:14:07'),(85,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 00:21:30'),(86,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:39:58'),(87,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:44:20'),(88,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:51:51'),(89,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 00:56:05'),(90,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 01:02:36'),(91,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 01:10:43'),(92,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 01:26:25'),(93,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 01:27:01'),(94,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 01:41:51'),(95,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 08:20:57'),(96,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 08:30:51'),(97,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 08:31:42'),(98,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 08:48:23'),(99,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 08:51:29'),(100,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-03 09:06:41'),(101,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 09:31:04'),(102,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.104','2026-05-03 09:38:07'),(103,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 09:50:28'),(104,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 09:54:36'),(105,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 09:55:17'),(106,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 09:57:50'),(107,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 09:59:07'),(108,8,'INVOICE_CREATED','Created invoice for 2026-05 - RWF 17000','invoice',7,'::ffff:192.168.1.102','2026-05-03 10:00:48'),(109,8,'PAYMENT_INITIATED','Initiated payment of RWF 17000 for invoice #7','payment',23,'::ffff:192.168.1.102','2026-05-03 10:00:49'),(110,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 10:38:46'),(111,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 10:48:17'),(112,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-03 10:51:33'),(113,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-04 08:09:00'),(114,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 08:13:06'),(115,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 08:13:34'),(116,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 08:14:21'),(117,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-04 08:20:30'),(118,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 08:32:37'),(119,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 09:24:43'),(120,8,'PAYMENT_INITIATED','Initiated payment of RWF 17000.00 for invoice #7','payment',24,'::ffff:192.168.1.102','2026-05-04 09:31:50'),(121,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 09:47:40'),(122,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 09:56:48'),(123,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 10:18:06'),(124,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-04 10:18:26'),(125,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-05 22:17:00'),(126,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-05 22:44:00'),(127,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-05 22:50:59'),(128,8,'INVOICE_CREATED','Created invoice for May 2026 - RWF 2000','invoice',8,'::ffff:192.168.1.102','2026-05-05 22:52:00'),(129,8,'PAYMENT_INITIATED','Initiated payment of RWF 2000.00 for invoice #8','payment',25,'::ffff:192.168.1.102','2026-05-05 22:52:09'),(130,8,'LOGIN','User logged in','auth',NULL,'::1','2026-05-05 23:06:25'),(131,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-05 23:07:34'),(132,8,'INVOICE_CANCELLED','Cancelled invoice for 2026-05','invoice',7,'::1','2026-05-05 23:28:06'),(133,8,'INVOICE_CANCELLED','Cancelled invoice for May 2026','invoice',8,'::ffff:192.168.1.102','2026-05-05 23:28:23'),(134,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-05 23:29:34'),(135,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-05 23:37:44'),(136,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-05 23:44:26'),(137,2,'LOGIN','User logged in','auth',NULL,'::1','2026-05-05 23:59:33'),(138,2,'PROPERTY_UPDATED','Updated property: \"2-Bedroom in Gisozi\"','property',5,'::ffff:192.168.1.102','2026-05-06 00:01:07'),(139,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:01:51'),(140,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:02:20'),(141,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:12:29'),(142,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:13:48'),(143,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:15:06'),(144,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:22:00'),(145,14,'INVOICE_CANCELLED','Cancelled invoice for may','invoice',1,'::ffff:192.168.1.102','2026-05-06 00:22:32'),(146,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:24:14'),(147,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:25:53'),(148,7,'LOGIN','User logged in','auth',NULL,'::1','2026-05-06 00:26:14'),(149,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:26:38'),(150,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:29:54'),(151,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:31:47'),(152,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:38:52'),(153,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 00:45:05'),(154,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 01:03:27'),(155,14,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 01:48:45'),(156,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 01:49:47'),(157,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 01:51:05'),(158,14,'LOGIN','User logged in','auth',NULL,'::1','2026-05-06 01:52:04'),(159,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:05:20'),(160,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:12:25'),(161,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:13:03'),(162,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:25:17'),(163,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:42:19'),(164,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:43:44'),(165,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:45:22'),(166,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 02:59:27'),(167,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 03:00:20'),(168,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 03:14:56'),(169,8,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 03:15:42'),(170,2,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 03:17:31'),(171,14,'LOGIN','User logged in','auth',NULL,'::1','2026-05-06 12:16:22'),(172,7,'LOGIN','User logged in','auth',NULL,'::ffff:192.168.1.102','2026-05-06 12:22:44'),(173,7,'LOGIN','User logged in','auth',NULL,'::1','2026-05-06 16:12:22');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_payments`
--

DROP TABLE IF EXISTS `invoice_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `transaction_ref` varchar(100) DEFAULT NULL,
  `paypack_ref` varchar(100) DEFAULT NULL,
  `method` enum('mtn_momo','airtel_money') NOT NULL,
  `status` enum('pending','successful','failed') DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `invoice_payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_payments`
--

LOCK TABLES `invoice_payments` WRITE;
/*!40000 ALTER TABLE `invoice_payments` DISABLE KEYS */;
INSERT INTO `invoice_payments` VALUES (1,1,2000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 16:41:12'),(2,1,2000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 16:41:21'),(3,1,2000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 16:42:18'),(4,2,2000.00,'250780776354',NULL,'2d6be721-3c86-43e0-a0cb-2fcee425833d','mtn_momo','successful',NULL,'2026-05-01 16:53:00'),(5,3,100.00,'250780776354',NULL,'8cd789ee-94c5-47f7-b6b5-3c1f9fd0f336','mtn_momo','successful',NULL,'2026-05-01 16:54:39'),(6,3,100.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 17:03:07'),(7,3,100.00,'250780776354',NULL,'78419e79-47d1-4bee-97aa-e641d1a204dd','mtn_momo','successful',NULL,'2026-05-01 17:07:26'),(8,3,100.00,'250780776354',NULL,'87d07c9b-871b-462c-8b8d-7ca511f73778','mtn_momo','successful',NULL,'2026-05-01 17:14:52'),(9,4,1000.00,'250780776354',NULL,'aa6b444d-ccd5-4b24-b657-3065ee7f34ed','mtn_momo','successful',NULL,'2026-05-01 17:19:57'),(10,3,100.00,'250780776354',NULL,'ffca845c-3029-4771-8f18-a79a99cf0589','mtn_momo','successful',NULL,'2026-05-01 17:26:46'),(11,5,20000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:53:48'),(12,5,20000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:53:50'),(13,5,20000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:54:36'),(14,5,20000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:55:15'),(15,5,20000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:55:34'),(16,6,3000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:56:41'),(17,6,3000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:56:47'),(18,6,3000.00,'250780776354',NULL,NULL,'mtn_momo','failed',NULL,'2026-05-01 20:56:53'),(19,5,20000.00,'250780776354',NULL,'b5b3a044-7ef9-4bfb-8ec8-80738fa3e525','mtn_momo','successful','2026-05-01 22:59:07','2026-05-01 20:57:56'),(20,6,3000.00,'250726186811',NULL,'7f9b3793-bcc1-4224-b6ff-1dd4afa401f2','airtel_money','pending',NULL,'2026-05-01 21:00:45'),(21,6,3000.00,'250726186911',NULL,'cd2e1eb7-6adc-4e47-b8cf-dfdca77cb8d1','airtel_money','successful','2026-05-01 23:02:04','2026-05-01 21:01:26'),(22,1,2000.00,'250780776354',NULL,'bcbfb78f-0cd6-429b-864a-91e3bc1108a4','mtn_momo','pending',NULL,'2026-05-02 23:33:47'),(23,7,17000.00,'250780776354',NULL,'07212558-0a15-496d-adb6-9e830ec72beb','mtn_momo','pending',NULL,'2026-05-03 10:00:48'),(24,7,17000.00,'250780776354',NULL,'189b03c4-ed01-4248-ac34-1ddb71fd96f4','mtn_momo','pending',NULL,'2026-05-04 09:31:49'),(25,8,2000.00,'250780776354',NULL,'318d6a6b-e04a-4ce6-9a91-aa9471a92e95','mtn_momo','pending',NULL,'2026-05-05 22:52:08');
/*!40000 ALTER TABLE `invoice_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `landlord_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `remaining` decimal(10,2) NOT NULL,
  `month_year` varchar(20) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('unpaid','partial','paid','overdue','cancelled') DEFAULT 'unpaid',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expiry_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rental_id` (`rental_id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `landlord_id` (`landlord_id`),
  KEY `idx_expiry_date` (`expiry_date`),
  KEY `idx_status_expiry` (`status`,`expiry_date`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,5,14,1,2000.00,0.00,2000.00,'may','2026-05-01','cancelled','May Rent','2026-05-01 16:40:32','2026-05-06 00:22:32','2026-05-02 00:00:00'),(2,5,14,1,2000.00,2000.00,0.00,'may 2026','2026-05-02','paid','may rent','2026-05-01 16:52:41','2026-05-05 22:55:38','2026-05-03 00:00:00'),(3,5,14,1,100.00,100.00,0.00,'may','2026-05-01','paid','may','2026-05-01 16:54:27','2026-05-05 22:55:38','2026-05-02 00:00:00'),(4,5,14,1,1000.00,1000.00,0.00,'may 2026','2026-05-02','paid','may rent','2026-05-01 17:19:42','2026-05-05 22:55:38','2026-05-03 00:00:00'),(5,6,8,2,20000.00,20000.00,0.00,'May 2026','2026-05-01','paid','May rent','2026-05-01 20:53:30','2026-05-05 22:55:38','2026-05-02 00:00:00'),(6,6,8,2,3000.00,3000.00,0.00,'may 2026','2026-05-01','paid',NULL,'2026-05-01 20:56:23','2026-05-05 22:55:38','2026-05-02 00:00:00'),(7,6,8,2,17000.00,0.00,17000.00,'2026-05','2026-05-10','cancelled','Rent payment for May 2026','2026-05-03 10:00:48','2026-05-05 23:28:06','2026-05-11 00:00:00'),(8,6,8,2,2000.00,0.00,2000.00,'May 2026','2026-05-05','cancelled',NULL,'2026-05-05 22:52:00','2026-05-05 23:28:23','2026-05-06 00:00:00');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `property_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (3,14,2,4,'is it available now',1,'2026-04-24 23:28:37'),(4,2,14,NULL,'yes',1,'2026-04-24 23:32:47'),(5,14,2,NULL,'okay',1,'2026-04-25 07:09:46'),(6,1,15,NULL,'hey',0,'2026-05-01 23:16:20'),(7,14,2,NULL,'Hey',1,'2026-05-02 23:38:43'),(8,14,2,NULL,'Hey',1,'2026-05-02 23:39:38'),(9,14,2,NULL,'G',1,'2026-05-02 23:42:29'),(10,14,2,NULL,'Hey',1,'2026-05-02 23:44:47'),(11,14,2,NULL,'Hey',1,'2026-05-02 23:45:04'),(12,14,2,NULL,'Hey',1,'2026-05-02 23:47:42'),(13,2,14,NULL,'how are you',1,'2026-05-02 23:48:20'),(14,8,2,NULL,'Hey',1,'2026-05-03 11:05:36'),(15,8,2,NULL,'Hey',1,'2026-05-03 11:09:08'),(16,2,8,NULL,'Hey',1,'2026-05-05 23:35:53'),(17,14,2,NULL,'Done',0,'2026-05-06 00:22:51'),(18,8,2,NULL,'Hey',1,'2026-05-06 03:16:33'),(19,2,8,NULL,'How are you',0,'2026-05-06 03:17:45');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('request','agreement','payment','message','alert','general') DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT '0',
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'🏠 New Rental Request','Parfait Guta sent a rental request for \"Single Room in Gikondo\"','request',0,'/landlord/requests','2026-04-24 23:24:29'),(2,14,'✅ Request Accepted','Your rental request for \"Single Room in Gikondo\" was accepted!','request',0,'/my-requests','2026-04-24 23:25:08'),(3,14,'📋 Rental Agreement Created','A rental agreement has been created for \"Single Room in Gikondo\". Welcome!','agreement',1,'/my-rentals','2026-04-24 23:25:37'),(4,2,'💬 New Message','Parfait Guta sent you a message','message',1,'/messages','2026-04-24 23:28:37'),(5,14,'💬 New Message','Uwimana Alice sent you a message','message',1,'/messages','2026-04-24 23:32:47'),(6,2,'🏠 New Rental Request','Parfait Guta sent a rental request for \"Cozy Room in Nyamirambo\"','request',1,'/landlord/requests','2026-04-24 23:34:44'),(7,2,'💬 New Message','Parfait Guta sent you a message','message',1,'/messages','2026-04-25 07:09:46'),(8,14,'💰 Payment Request','May 2026 rent of RWF 35000 requested for \"Single Room in Gikondo\"','payment',1,'/my-rentals','2026-04-26 08:50:16'),(9,14,'✅ Payment Recorded','Payment of RWF 35000.00 recorded for \"Single Room in Gikondo\"','payment',1,'/my-rentals','2026-04-26 08:52:20'),(10,2,'🏠 New Rental Request','Mugisha Prince sent a rental request for \"Cozy Room in Nyamirambo\"','request',1,'/landlord/requests','2026-04-27 12:58:15'),(11,8,'✅ Request Accepted','Your rental request for \"Cozy Room in Nyamirambo\" was accepted!','request',0,'/my-requests','2026-04-27 12:58:40'),(12,1,'💰 Payment Request','may rent of RWF 2000 requested for \"Single Room in Gikondo\"','payment',0,'/my-rentals','2026-05-01 16:40:32'),(13,1,'💰 Payment Request','may 2026 rent of RWF 2000 requested for \"Single Room in Gikondo\"','payment',0,'/my-rentals','2026-05-01 16:52:41'),(14,1,'💰 Payment Request','may rent of RWF 100 requested for \"Single Room in Gikondo\"','payment',0,'/my-rentals','2026-05-01 16:54:27'),(15,1,'💰 Payment Request','may 2026 rent of RWF 1000 requested for \"Single Room in Gikondo\"','payment',0,'/my-rentals','2026-05-01 17:19:42'),(16,8,'📋 Rental Agreement Created','A rental agreement has been created for \"Cozy Room in Nyamirambo\". Welcome!','agreement',0,'/my-rentals','2026-05-01 20:51:59'),(17,2,'💰 Payment Request','May 2026 rent of RWF 20000 requested for \"Cozy Room in Nyamirambo\"','payment',0,'/my-rentals','2026-05-01 20:53:31'),(18,2,'💰 Payment Request','may 2026 rent of RWF 3000 requested for \"Cozy Room in Nyamirambo\"','payment',0,'/my-rentals','2026-05-01 20:56:23'),(19,15,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-01 23:16:20'),(20,2,'🏠 New Rental Request','Parfait Guta sent a rental request for \"3-Bedroom in Huye\"','request',0,'/landlord/requests','2026-05-02 23:24:13'),(21,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-02 23:38:43'),(22,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-02 23:39:38'),(23,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-02 23:42:29'),(24,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-02 23:44:47'),(25,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-02 23:45:04'),(26,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-02 23:47:42'),(27,14,'💬 New Message','Uwimana Alice sent you a message','message',0,'/messages','2026-05-02 23:48:20'),(28,2,'💰 Payment Request','2026-05 rent of RWF 17000 requested for \"Cozy Room in Nyamirambo\"','payment',0,'/my-rentals','2026-05-03 10:00:48'),(29,2,'🏠 New Rental Request','Mugisha Prince sent a rental request for \"2-Bedroom in Gisozi\"','request',0,'/landlord/requests','2026-05-03 10:22:11'),(30,2,'💬 New Message','Mugisha Prince sent you a message','message',0,'/messages','2026-05-03 11:05:36'),(31,2,'💬 New Message','Mugisha Prince sent you a message','message',0,'/messages','2026-05-03 11:09:08'),(32,2,'💰 Payment Request','May 2026 rent of RWF 2000 requested for \"Cozy Room in Nyamirambo\"','payment',0,'/my-rentals','2026-05-05 22:52:00'),(33,8,'💬 New Message','Uwimana Alice sent you a message','message',0,'/messages','2026-05-05 23:35:53'),(34,14,'❌ Request Rejected','Your rental request for \"3-Bedroom in Huye\" was not accepted.','request',0,'/my-requests','2026-05-05 23:45:59'),(35,8,'✅ Request Accepted','Your rental request for \"2-Bedroom in Gisozi\" was accepted!','request',0,'/my-requests','2026-05-05 23:59:38'),(36,2,'🏠 New Rental Request','Parfait Guta sent a rental request for \"2-Bedroom in Gisozi\"','request',0,'/landlord/requests','2026-05-06 00:02:00'),(37,14,'✅ Request Accepted','Your rental request for \"2-Bedroom in Gisozi\" was accepted!','request',0,'/my-requests','2026-05-06 00:02:26'),(38,14,'✅ Request Accepted','Your rental request for \"Cozy Room in Nyamirambo\" was accepted!','request',0,'/my-requests','2026-05-06 00:12:36'),(39,14,'📋 Rental Agreement Created','A rental agreement has been created for \"2-Bedroom in Gisozi\". Welcome!','agreement',0,'/my-rentals','2026-05-06 00:21:31'),(40,2,'💬 New Message','Parfait Guta sent you a message','message',0,'/messages','2026-05-06 00:22:51'),(41,2,'💬 New Message','Mugisha Prince sent you a message','message',0,'/messages','2026-05-06 03:16:33'),(42,8,'💬 New Message','Uwimana Alice sent you a message','message',0,'/messages','2026-05-06 03:17:45');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_requests`
--

DROP TABLE IF EXISTS `payment_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `landlord_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `month_year` varchar(20) NOT NULL,
  `status` enum('pending','paid','overdue') DEFAULT 'pending',
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rental_id` (`rental_id`),
  KEY `landlord_id` (`landlord_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `payment_requests_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_requests_ibfk_2` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_requests_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_requests`
--

LOCK TABLES `payment_requests` WRITE;
/*!40000 ALTER TABLE `payment_requests` DISABLE KEYS */;
INSERT INTO `payment_requests` VALUES (3,5,1,14,35000.00,'2026-01-05','May 2026','paid','pay before 5th','2026-04-26 08:50:16','2026-04-26 08:52:20');
/*!40000 ALTER TABLE `payment_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `method` enum('cash','mtn_momo','airtel_money') DEFAULT 'cash',
  `status` enum('paid','pending','overdue') DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rental_id` (`rental_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (9,5,35000.00,'2026-01-05','mtn_momo','paid','may 2026','2026-04-25 18:26:48'),(10,5,35000.00,'2026-04-26','cash','paid','May 2026 — Auto from payment request','2026-04-26 08:52:20'),(11,6,20000.00,'2026-05-01','mtn_momo','paid','Payment for May 2026 - Invoice #5 (auto-approved)','2026-05-01 20:59:07'),(12,6,3000.00,'2026-05-01','airtel_money','paid','Payment for may 2026 - Invoice #6 (auto-approved)','2026-05-01 21:02:04');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `landlord_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `province` varchar(50) DEFAULT NULL,
  `district` varchar(50) DEFAULT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `cell` varchar(50) DEFAULT NULL,
  `village` varchar(50) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `status` enum('available','rented','inactive') DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `landlord_id` (`landlord_id`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (2,1,'Studio Apartment in Remera','Self-contained studio near UTC Remera, fully furnished',80000.00,'Kigali','Gasabo','Remera','Nyabisindu','Urugwiro',-1.953600,30.112700,'rented','2026-04-21 13:24:44'),(3,1,'Family House in Kacyiru','3 bedrooms, large compound, borehole water',250000.00,'Kigali','Gasabo','Kacyiru','Kamatamu','Inkingi',-1.939400,30.089400,'rented','2026-04-21 13:24:44'),(4,2,'Cozy Room in Nyamirambo','Single room with shared kitchen, near market',40000.00,'Kigali','Nyarugenge','Nyamirambo','Cyivugiza','Iterambere',-1.983100,30.044100,'rented','2026-04-21 13:24:44'),(5,2,'2-Bedroom in Gisozi','Quiet neighborhood, good roads, near schools',120000.00,'Kigali','Gasabo','Gisozi',NULL,NULL,NULL,NULL,'rented','2026-04-21 13:24:44'),(6,2,'Shop + House in Musanze','Ground floor shop, upper floor 2 bedrooms',180000.00,'Northern','Musanze','Muhoza','Cyabararika','Ubwiyunge',-1.499000,29.634000,'available','2026-04-21 13:24:44'),(7,1,'Single Room in Gikondo','Clean room, shared bathroom, near Gikondo market',35000.00,'Kigali','Kicukiro','Gikondo','Rwampara','Inzira',-1.981400,30.079400,'available','2026-04-21 13:24:44'),(8,2,'3-Bedroom in Huye','Spacious home near NUR university campus',160000.00,'Southern','Huye','Ngoma','Cyarwa','Isangano',-2.596700,29.736900,'available','2026-04-21 13:24:44');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_images`
--

LOCK TABLES `property_images` WRITE;
/*!40000 ALTER TABLE `property_images` DISABLE KEYS */;
INSERT INTO `property_images` VALUES (3,2,'/uploads/property-8476bd67-28ae-46f7-86e4-bb38a9589319.jpg',1,'2026-04-22 17:14:41'),(4,3,'/uploads/property-7d264d0d-d305-4b60-890e-3d6694bf41de.jpg',1,'2026-04-23 19:22:25');
/*!40000 ALTER TABLE `property_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rental_requests`
--

DROP TABLE IF EXISTS `rental_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rental_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `renter_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  KEY `renter_id` (`renter_id`),
  CONSTRAINT `rental_requests_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rental_requests_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental_requests`
--

LOCK TABLES `rental_requests` WRITE;
/*!40000 ALTER TABLE `rental_requests` DISABLE KEYS */;
INSERT INTO `rental_requests` VALUES (5,2,8,'rejected','','2026-04-22 17:17:08'),(9,7,14,'accepted','','2026-04-24 23:24:29'),(10,4,14,'accepted','','2026-04-24 23:34:44'),(11,4,8,'accepted','','2026-04-27 12:58:15'),(12,8,14,'rejected','I am interested in renting 3-Bedroom in Huye','2026-05-02 23:24:13'),(13,5,8,'accepted','I am interested in renting 2-Bedroom in Gisozi','2026-05-03 10:22:11'),(14,5,14,'accepted','I am interested in renting 2-Bedroom in Gisozi','2026-05-06 00:02:00');
/*!40000 ALTER TABLE `rental_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rentals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `status` enum('active','expired','terminated') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `termination_reason` text,
  `terminated_at` datetime DEFAULT NULL,
  `tenant_status` enum('good','warning','problematic') DEFAULT 'good',
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `rentals_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rentals_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` VALUES (5,7,15,'2026-04-24',NULL,35000.00,'terminated','2026-04-24 23:25:37',NULL,NULL,'good'),(6,4,8,'2026-05-01',NULL,40000.00,'active','2026-05-01 20:51:59',NULL,NULL,'good'),(7,5,14,'2026-05-06',NULL,120000.00,'active','2026-05-06 00:21:31',NULL,NULL,'good');
/*!40000 ALTER TABLE `rentals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `renter_id` int NOT NULL,
  `rental_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`rental_id`,`renter_id`),
  KEY `property_id` (`property_id`),
  KEY `renter_id` (`renter_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (2,7,14,5,4,NULL,'2026-04-27 08:09:22');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_notes`
--

DROP TABLE IF EXISTS `tenant_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `landlord_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `note` text NOT NULL,
  `type` enum('general','warning','compliment','issue') DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rental_id` (`rental_id`),
  KEY `landlord_id` (`landlord_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `tenant_notes_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_notes_ibfk_2` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_notes_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notes`
--

LOCK TABLES `tenant_notes` WRITE;
/*!40000 ALTER TABLE `tenant_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('renter','landlord','admin') NOT NULL DEFAULT 'renter',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `otp_code` varchar(6) DEFAULT NULL,
  `otp_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Parfait Guta','parfait@gmail.com','0780776354','$2a$12$sx6VMidnVcPcJNzj4AcyQ.ZF3Ca/n3MEEipOJl5SeoccHMhRgHg/6','landlord','2026-04-21 13:24:44','8beeab29bc25775ad313423d5104f20882eafae75a39baa751fdf200a7716b0c','2026-04-23 01:52:23',1,NULL,NULL),(2,'Uwimana Alice','alice@gmail.com','0788111222','$2a$12$sx6VMidnVcPcJNzj4AcyQ.ZF3Ca/n3MEEipOJl5SeoccHMhRgHg/6','landlord','2026-04-21 13:24:44',NULL,NULL,1,NULL,NULL),(7,'Tuyisabe Parfait','tuyisabeparfait888@gmail.com','0780776354','$2a$12$PqylwzBrjBlUvhW76QJSW.H9WiESJsGD/rv/AYFuJuq4.EZRJVEM2','admin','2026-04-21 13:24:44',NULL,NULL,1,NULL,NULL),(8,'Mugisha Prince','mugisha@gmail.com','0781326724','$2a$12$kOSc5FaQgscs5hSm799P9emDrw.NG3Ph4qmdDPSROduCwX.fvxjNG','renter','2026-04-21 23:10:42',NULL,NULL,1,NULL,NULL),(14,'Parfait Guta','parfaitguta@gmail.com','0726186811','$2a$12$poqbHf2kozmBrtMpDFLuvePAjzuEw1wZPPbC9PPSpZKo.m8WsVZWC','renter','2026-04-24 23:21:43',NULL,NULL,1,NULL,NULL),(15,'Test Tenant','tenant@test.com','0780000000','$2a$12$sx6VMidnVcPcJNzj4AcyQ.ZF3Ca/n3MEEipOJl5SeoccHMhRgHg/6','renter','2026-05-01 20:26:03',NULL,NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06 19:45:48
