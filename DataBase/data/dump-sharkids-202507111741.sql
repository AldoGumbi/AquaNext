-- MySQL dump 10.13  Distrib 8.4.4, for macos15.2 (arm64)
--
-- Host: localhost    Database: sharkids
-- ------------------------------------------------------
-- Server version	8.4.4

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
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_alumno` enum('regular','prueba') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'regular',
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `domicilio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono_emergencia` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estatus` enum('activo','inactivo','pendiente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `firma` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_nombre_completo` (`nombre`,`apellido_paterno`,`apellido_materno`),
  KEY `idx_tipo_estado` (`tipo_alumno`,`estatus`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (1,'regular','Iker Yared','Covarrubias','Famoso','2004-01-02','Sayula,49300,Centro,Direccion de iker','ejemplo@gmail.com','4811223355','4811223355',NULL,'activo',1,'2025-06-20 02:01:05','2025-06-26 02:42:24',0,NULL),(2,'regular','test','test','test','2004-07-04','direccion test','test@gmail.com','1234567890','1234567890',NULL,'activo',1,'2025-06-23 20:47:20','2025-07-06 19:07:07',0,NULL);
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumnos_prueba_detalle`
--

DROP TABLE IF EXISTS `alumnos_prueba_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos_prueba_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `fecha_prueba` date NOT NULL,
  `asistio` tinyint(1) DEFAULT '0',
  `convertido_regular` tinyint(1) DEFAULT '0',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alumno_id` (`alumno_id`),
  KEY `idx_fecha_prueba` (`fecha_prueba`),
  CONSTRAINT `alumnos_prueba_detalle_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos_prueba_detalle`
--

LOCK TABLES `alumnos_prueba_detalle` WRITE;
/*!40000 ALTER TABLE `alumnos_prueba_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `alumnos_prueba_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `clase_id` int NOT NULL,
  `mensualidad_id` int DEFAULT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time DEFAULT NULL,
  `es_prueba` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asistencia` (`alumno_id`,`clase_id`),
  KEY `mensualidad_id` (`mensualidad_id`),
  KEY `idx_alumno_fecha` (`alumno_id`,`created_at`),
  KEY `idx_clase` (`clase_id`),
  KEY `idx_asistencias_fecha` (`created_at`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`clase_id`) REFERENCES `clases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_3` FOREIGN KEY (`mensualidad_id`) REFERENCES `mensualidades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caja_registradora`
--

DROP TABLE IF EXISTS `caja_registradora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja_registradora` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shift` enum('matutino','vespertino') DEFAULT 'matutino',
  `amount_opening` decimal(12,2) DEFAULT '1000.00',
  `amount_closing` decimal(12,2) DEFAULT '0.00',
  `revenue` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('open','close','reopened') DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `user_id_creted_caja_idx` (`user_id`),
  CONSTRAINT `user_id_creted_caja` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja_registradora`
--

LOCK TABLES `caja_registradora` WRITE;
/*!40000 ALTER TABLE `caja_registradora` DISABLE KEYS */;
INSERT INTO `caja_registradora` VALUES (3,'matutino',1000.00,0.00,0.00,0.00,3,'2025-07-06 19:11:53','open'),(4,'matutino',1000.00,0.00,0.00,0.00,3,'2025-07-06 19:38:02','open');
/*!40000 ALTER TABLE `caja_registradora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrito_items`
--

DROP TABLE IF EXISTS `carrito_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidad` int DEFAULT NULL,
  `comentario` text,
  `producto_id` int NOT NULL,
  `carrito_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `carrito_items_carritos_id_fk` (`carrito_id`),
  KEY `carrito_items_productos_id_fk` (`producto_id`),
  CONSTRAINT `carrito_items_carritos_id_fk` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`),
  CONSTRAINT `carrito_items_productos_id_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito_items`
--

LOCK TABLES `carrito_items` WRITE;
/*!40000 ALTER TABLE `carrito_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `carrito_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `carritos_usuarios_id_fk` (`usuario_id`),
  CONSTRAINT `carritos_usuarios_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (10,1,'2025-06-28 03:22:54','2025-06-28 03:22:54');
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases`
--

DROP TABLE IF EXISTS `clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `horario_id` int NOT NULL,
  `fecha` date NOT NULL,
  `profesor_suplente_id` int DEFAULT NULL,
  `cancelada` tinyint(1) DEFAULT '0',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_clase` (`horario_id`,`fecha`),
  KEY `profesor_suplente_id` (`profesor_suplente_id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_horario_fecha` (`horario_id`,`fecha`),
  CONSTRAINT `clases_ibfk_1` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clases_ibfk_2` FOREIGN KEY (`profesor_suplente_id`) REFERENCES `profesores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases`
--

LOCK TABLES `clases` WRITE;
/*!40000 ALTER TABLE `clases` DISABLE KEYS */;
INSERT INTO `clases` VALUES (1,3,'2025-07-01',NULL,0,'primera clase del profe iker','2025-06-28 19:20:51');
/*!40000 ALTER TABLE `clases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupones`
--

DROP TABLE IF EXISTS `cupones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('porcentaje','cantidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `usos_maximos` int DEFAULT NULL,
  `usos_actuales` int DEFAULT '0',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupones`
--

LOCK TABLES `cupones` WRITE;
/*!40000 ALTER TABLE `cupones` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupones_uso`
--

DROP TABLE IF EXISTS `cupones_uso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupones_uso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cupon_id` int NOT NULL,
  `transaccion_id` int NOT NULL,
  `monto_descuento` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_uso` (`cupon_id`,`transaccion_id`),
  KEY `transaccion_id` (`transaccion_id`),
  CONSTRAINT `cupones_uso_ibfk_1` FOREIGN KEY (`cupon_id`) REFERENCES `cupones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cupones_uso_ibfk_2` FOREIGN KEY (`transaccion_id`) REFERENCES `transacciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupones_uso`
--

LOCK TABLES `cupones_uso` WRITE;
/*!40000 ALTER TABLE `cupones_uso` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupones_uso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fotos_alumnos`
--

DROP TABLE IF EXISTS `fotos_alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotos_alumnos` (
  `id_foto` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int DEFAULT NULL,
  `base_64` longtext,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_foto`),
  KEY `fk_fotos_alumnos_alumno` (`id_alumno`),
  CONSTRAINT `fk_fotos_alumnos_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_alumnos`
--

LOCK TABLES `fotos_alumnos` WRITE;
/*!40000 ALTER TABLE `fotos_alumnos` DISABLE KEYS */;
/*!40000 ALTER TABLE `fotos_alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('grupo_adultos','grupo_preescolar','grupo_escolar','aquafitness','nado_libre','activacion_fisica_adulto_mayor','matronatacion') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Soft delete flag: 0=no eliminado, 1=eliminado',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora de eliminación',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (6,'NL','NADO LIBRE','nado_libre','Intermedio','nado libre sin profe',1,'2025-06-28 19:03:00',0,NULL),(7,'GA','GRUPAL ADULTOS','grupo_adultos','Avanzado','Grupo de nado adultos avanzado',1,'2025-06-28 19:04:13',0,NULL),(10,'AFAM','Activación Física Adulto Mayor - AFAM','activacion_fisica_adulto_mayor','Mixto','Clase de Actividad Física para Adultos Mayores',1,'2025-06-30 02:37:31',0,NULL),(11,'AQF-PRINCIPIANTE','Aquafitness - AQF-PRINCIPIANTE','aquafitness','Principiante','Clase de AquaFitness de nivel principiante',1,'2025-07-03 01:33:44',0,NULL),(12,'GP-MIXTO','Grupo Preescolar - GP-MIXTO','grupo_preescolar','Mixto','Grupo preescolar de nivel mixto',1,'2025-07-07 23:10:31',0,NULL);
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_update_grupos` BEFORE UPDATE ON `grupos` FOR EACH ROW BEGIN
  IF NEW.deleted = 1 AND OLD.deleted = 0 THEN
    SET NEW.deleted_at = NOW();
  ELSEIF NEW.deleted = 0 AND OLD.deleted = 1 THEN
    SET NEW.deleted_at = NULL;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `horarios`
--

DROP TABLE IF EXISTS `horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grupo_id` int NOT NULL,
  `profesor_id` int DEFAULT NULL,
  `dia` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Soft delete flag: 0=no eliminado, 1=eliminado',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora de eliminación',
  `cupo_maximo` int DEFAULT '8' COMMENT 'Número máximo de alumnos para este horario específico',
  PRIMARY KEY (`id`),
  KEY `idx_grupo_dia` (`grupo_id`,`dia`),
  KEY `idx_profesor` (`profesor_id`),
  CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios`
--

LOCK TABLES `horarios` WRITE;
/*!40000 ALTER TABLE `horarios` DISABLE KEYS */;
INSERT INTO `horarios` VALUES (1,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-06-28 19:05:37',1,'2025-07-03 01:03:42',8),(2,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-06-28 19:17:52',1,'2025-07-03 01:03:42',8),(3,7,6,'martes','09:00:00','11:00:00',1,'2025-06-28 19:18:33',1,'2025-07-02 21:05:23',8),(10,10,6,'lunes','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(11,10,6,'martes','11:00:00','12:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(12,10,6,'miercoles','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(13,10,6,'jueves','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(14,10,6,'viernes','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(31,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-01 02:16:40',1,'2025-07-03 01:03:42',8),(32,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-01 02:16:40',1,'2025-07-03 01:03:42',8),(33,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-01 02:16:47',1,'2025-07-03 01:03:42',8),(34,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-01 02:16:47',1,'2025-07-03 01:03:42',8),(35,7,6,'martes','09:00:00','11:00:00',1,'2025-07-02 21:05:23',0,NULL,16),(36,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(37,10,6,'martes','11:00:00','12:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(38,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(39,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(40,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(41,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(42,10,6,'martes','11:00:00','12:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(43,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(44,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(45,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(46,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-02 21:07:58',1,'2025-07-03 01:03:42',8),(47,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-02 21:07:58',1,'2025-07-03 01:03:42',8),(48,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(49,10,6,'martes','11:00:00','12:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(50,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(51,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(52,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-06 19:28:54',15),(53,10,6,'martes','11:00:00','12:00:00',1,'2025-07-03 00:50:02',1,'2025-07-06 19:28:54',15),(54,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-06 19:28:54',15),(55,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-06 19:28:54',15),(56,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-06 19:28:54',15),(57,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-03 01:03:42',0,NULL,8),(58,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-03 01:03:42',0,NULL,8),(59,11,6,'lunes','13:00:00','15:00:00',1,'2025-07-03 01:33:44',0,NULL,8),(60,11,6,'martes','13:00:00','15:00:00',1,'2025-07-03 01:33:44',0,NULL,8),(61,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-06 19:28:54',1,'2025-07-06 19:29:06',15),(62,10,6,'martes','11:00:00','12:00:00',1,'2025-07-06 19:28:54',1,'2025-07-06 19:29:06',15),(63,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-06 19:28:54',1,'2025-07-06 19:29:06',15),(64,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-06 19:28:54',1,'2025-07-06 19:29:06',15),(65,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-06 19:28:54',1,'2025-07-06 19:29:06',15),(66,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-06 19:29:06',1,'2025-07-06 19:29:15',10),(67,10,6,'martes','11:00:00','12:00:00',1,'2025-07-06 19:29:06',1,'2025-07-06 19:29:15',10),(68,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-06 19:29:06',1,'2025-07-06 19:29:15',10),(69,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-06 19:29:06',1,'2025-07-06 19:29:15',10),(70,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-06 19:29:06',1,'2025-07-06 19:29:15',10),(71,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-06 19:29:15',1,'2025-07-06 19:29:24',6),(72,10,6,'martes','11:00:00','12:00:00',1,'2025-07-06 19:29:15',1,'2025-07-06 19:29:24',6),(73,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-06 19:29:15',1,'2025-07-06 19:29:24',6),(74,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-06 19:29:15',1,'2025-07-06 19:29:24',6),(75,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-06 19:29:15',1,'2025-07-06 19:29:24',6),(76,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-06 19:29:24',1,'2025-07-06 19:29:48',16),(77,10,6,'martes','11:00:00','12:00:00',1,'2025-07-06 19:29:24',1,'2025-07-06 19:29:48',16),(78,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-06 19:29:24',1,'2025-07-06 19:29:48',16),(79,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-06 19:29:24',1,'2025-07-06 19:29:48',16),(80,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-06 19:29:24',1,'2025-07-06 19:29:48',16),(81,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-06 19:29:48',1,'2025-07-06 19:30:00',15),(82,10,6,'martes','11:00:00','12:00:00',1,'2025-07-06 19:29:48',1,'2025-07-06 19:30:00',15),(83,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-06 19:29:48',1,'2025-07-06 19:30:00',15),(84,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-06 19:29:48',1,'2025-07-06 19:30:00',15),(85,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-06 19:29:48',1,'2025-07-06 19:30:00',15),(86,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-06 19:30:00',0,NULL,10),(87,10,6,'martes','11:00:00','12:00:00',1,'2025-07-06 19:30:00',0,NULL,10),(88,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-06 19:30:00',0,NULL,10),(89,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-06 19:30:00',0,NULL,10),(90,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-06 19:30:00',0,NULL,10),(91,12,6,'lunes','16:00:00','18:00:00',1,'2025-07-07 23:10:31',1,'2025-07-07 23:10:52',8),(92,12,6,'martes','16:00:00','18:00:00',1,'2025-07-07 23:10:31',1,'2025-07-07 23:10:52',8),(93,12,NULL,'miercoles','16:00:00','18:00:00',1,'2025-07-07 23:10:31',1,'2025-07-07 23:10:52',8),(94,12,5,'lunes','16:00:00','18:00:00',1,'2025-07-07 23:10:31',1,'2025-07-07 23:10:52',8),(95,12,6,'lunes','16:00:00','18:00:00',1,'2025-07-07 23:10:52',0,NULL,6),(96,12,5,'lunes','16:00:00','18:00:00',1,'2025-07-07 23:10:52',0,NULL,6),(97,12,6,'martes','16:00:00','18:00:00',1,'2025-07-07 23:10:52',0,NULL,6),(98,12,5,'miercoles','16:00:00','18:00:00',1,'2025-07-07 23:10:52',0,NULL,6);
/*!40000 ALTER TABLE `horarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_update_horarios` BEFORE UPDATE ON `horarios` FOR EACH ROW BEGIN
  IF NEW.deleted = 1 AND OLD.deleted = 0 THEN
    SET NEW.deleted_at = NOW();
  ELSEIF NEW.deleted = 0 AND OLD.deleted = 1 THEN
    SET NEW.deleted_at = NULL;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `fecha_inscripcion` date NOT NULL,
  `year_inscripcion` year NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `anos_vigencia` int DEFAULT '1',
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_inscripcion_year` (`alumno_id`,`year_inscripcion`),
  KEY `idx_alumno_year` (`alumno_id`,`year_inscripcion`),
  KEY `idx_inscripciones_vigencia` (`alumno_id`,`fecha_inscripcion`,`fecha_fin`,`activa`),
  CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones`
--

LOCK TABLES `inscripciones` WRITE;
/*!40000 ALTER TABLE `inscripciones` DISABLE KEYS */;
INSERT INTO `inscripciones` VALUES (4,1,'2025-07-07',2025,'2027-07-07',2,600.00,'tarjeta',NULL,1,'2025-07-07 23:22:20');
/*!40000 ALTER TABLE `inscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `existencia` int NOT NULL DEFAULT '0',
  `stock_minimo` int DEFAULT '0',
  `stock_maximo` int DEFAULT '0',
  `ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `producto_id` (`producto_id`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensualidad_grupos`
--

DROP TABLE IF EXISTS `mensualidad_grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensualidad_grupos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mensualidad_id` int NOT NULL,
  `grupo_id` int NOT NULL,
  `horario_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mensualidad_horario` (`mensualidad_id`,`horario_id`),
  KEY `grupo_id` (`grupo_id`),
  KEY `horario_id` (`horario_id`),
  KEY `idx_mensualidad` (`mensualidad_id`),
  CONSTRAINT `mensualidad_grupos_ibfk_1` FOREIGN KEY (`mensualidad_id`) REFERENCES `mensualidades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensualidad_grupos_ibfk_2` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensualidad_grupos_ibfk_3` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensualidad_grupos`
--

LOCK TABLES `mensualidad_grupos` WRITE;
/*!40000 ALTER TABLE `mensualidad_grupos` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensualidad_grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensualidades`
--

DROP TABLE IF EXISTS `mensualidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensualidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inscripcion_id` int NOT NULL,
  `mes` int NOT NULL,
  `year` year NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_aplicado` decimal(10,2) DEFAULT '0.00',
  `metodo_pago` enum('efectivo','tarjeta','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagada` tinyint(1) DEFAULT '0',
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mensualidad` (`inscripcion_id`,`year`,`mes`),
  KEY `idx_inscripcion_periodo` (`inscripcion_id`,`year`,`mes`),
  KEY `idx_periodo` (`year`,`mes`),
  KEY `idx_mensualidades_periodo` (`year`,`mes`,`pagada`),
  KEY `idx_mensualidades_fechas` (`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `mensualidades_ibfk_1` FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensualidades_chk_1` CHECK ((`mes` between 1 and 12))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensualidades`
--

LOCK TABLES `mensualidades` WRITE;
/*!40000 ALTER TABLE `mensualidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensualidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida','ajuste') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `existencia_anterior` int NOT NULL,
  `existencia_nueva` int NOT NULL,
  `transaccion_id` int DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `usuario_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transaccion_id` (`transaccion_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_producto_fecha` (`producto_id`,`created_at`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`transaccion_id`) REFERENCES `transacciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `movimientos_inventario_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `categoria` enum('cafeteria','articulo_deportivo','accesorios') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `imagen` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `borrado` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_sku` (`sku`),
  KEY `idx_categoria` (`categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profesores`
--

DROP TABLE IF EXISTS `profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_contratacion` date NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_nombre_completo` (`nombre`,`apellido`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesores`
--

LOCK TABLES `profesores` WRITE;
/*!40000 ALTER TABLE `profesores` DISABLE KEYS */;
INSERT INTO `profesores` VALUES (5,'test','test','2000-11-01','tes test test, test, test, test, 12431','4455667766','test','2025-06-24',1,'2025-06-24 21:44:04','2025-06-30 01:56:59',0,NULL),(6,'Iker Yared','Covarrubias Famoso','2004-01-02','Av. Manuel Avila Camacho 116 poniente, Centro, Sayula, Jalisco, 49300','4811223355','Crol super duper avanzado','2025-06-20',1,'2025-06-25 01:01:53','2025-06-25 19:35:44',0,NULL);
/*!40000 ALTER TABLE `profesores` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_update_profesores` BEFORE UPDATE ON `profesores` FOR EACH ROW BEGIN
  IF NEW.deleted = 1 AND OLD.deleted = 0 THEN
    SET NEW.deleted_at = NOW();
  ELSEIF NEW.deleted = 0 AND OLD.deleted = 1 THEN
    SET NEW.deleted_at = NULL;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `usuario_id` int NOT NULL,
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc1MTU5MDYzMSwiZXhwIjoxNzUyMTk1NDMxfQ.db_i0ZIUsIyKCYbXcimW_smH_FJG6SuW-7-3oEKZXDg','2025-07-03 06:26:58','2025-07-04 00:57:11');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifas_mensualidad`
--

DROP TABLE IF EXISTS `tarifas_mensualidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifas_mensualidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_clase` enum('grupo_adultos','grupo_preescolar','grupo_escolar','aquafitness','nado_libre','activacion_fisica_adulto_mayor','matronatacion') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `clases_por_semana` int NOT NULL,
  `monto_mensual` decimal(10,2) NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tarifa` (`tipo_clase`,`clases_por_semana`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifas_mensualidad`
--

LOCK TABLES `tarifas_mensualidad` WRITE;
/*!40000 ALTER TABLE `tarifas_mensualidad` DISABLE KEYS */;
INSERT INTO `tarifas_mensualidad` VALUES (8,'grupo_preescolar',1,450.00,1,'2025-07-07 01:55:56'),(9,'grupo_preescolar',2,750.00,1,'2025-07-07 01:55:56'),(10,'grupo_preescolar',3,980.00,1,'2025-07-07 01:55:56'),(11,'grupo_escolar',1,380.00,1,'2025-07-07 01:55:56'),(12,'grupo_escolar',2,650.00,1,'2025-07-07 01:55:56'),(13,'grupo_escolar',3,850.00,1,'2025-07-07 01:55:56'),(14,'grupo_escolar',4,1050.00,1,'2025-07-07 01:55:56'),(15,'grupo_adultos',1,350.00,1,'2025-07-07 01:55:56'),(16,'grupo_adultos',2,580.00,1,'2025-07-07 01:55:56'),(17,'grupo_adultos',3,780.00,1,'2025-07-07 01:55:56'),(18,'grupo_adultos',4,950.00,1,'2025-07-07 01:55:56'),(19,'grupo_adultos',5,1100.00,1,'2025-07-07 01:55:56'),(20,'matronatacion',1,520.00,1,'2025-07-07 01:55:56'),(21,'matronatacion',2,850.00,1,'2025-07-07 01:55:56'),(22,'matronatacion',3,1150.00,1,'2025-07-07 01:55:56'),(23,'aquafitness',1,320.00,1,'2025-07-07 01:55:56'),(24,'aquafitness',2,550.00,1,'2025-07-07 01:55:56'),(25,'aquafitness',3,720.00,1,'2025-07-07 01:55:56'),(26,'aquafitness',4,880.00,1,'2025-07-07 01:55:56'),(27,'aquafitness',5,1020.00,1,'2025-07-07 01:55:56'),(28,'activacion_fisica_adulto_mayor',1,400.00,1,'2025-07-07 01:55:56'),(29,'activacion_fisica_adulto_mayor',2,680.00,1,'2025-07-07 01:55:56'),(30,'activacion_fisica_adulto_mayor',3,900.00,1,'2025-07-07 01:55:56'),(31,'activacion_fisica_adulto_mayor',4,1080.00,1,'2025-07-07 01:55:56'),(32,'nado_libre',2,220.00,1,'2025-07-07 01:55:56'),(33,'nado_libre',3,300.00,1,'2025-07-07 01:55:56'),(34,'nado_libre',4,360.00,1,'2025-07-07 01:55:56'),(35,'nado_libre',5,420.00,1,'2025-07-07 01:55:56'),(36,'nado_libre',6,480.00,1,'2025-07-07 01:55:56'),(37,'nado_libre',7,520.00,1,'2025-07-07 01:55:56'),(39,'nado_libre',1,110.00,1,'2025-07-07 01:55:56');
/*!40000 ALTER TABLE `tarifas_mensualidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaccion_detalles`
--

DROP TABLE IF EXISTS `transaccion_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaccion_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaccion_id` int NOT NULL,
  `concepto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `referencia_id` int DEFAULT NULL,
  `referencia_tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_transaccion` (`transaccion_id`),
  KEY `idx_transaccion_detalles_tipo` (`referencia_tipo`,`referencia_id`),
  CONSTRAINT `transaccion_detalles_ibfk_1` FOREIGN KEY (`transaccion_id`) REFERENCES `transacciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaccion_detalles`
--

LOCK TABLES `transaccion_detalles` WRITE;
/*!40000 ALTER TABLE `transaccion_detalles` DISABLE KEYS */;
INSERT INTO `transaccion_detalles` VALUES (4,4,'Inscripción 2 años - 2025',1,600.00,600.00,0.00,600.00,4,'inscripcion');
/*!40000 ALTER TABLE `transaccion_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `folio` int NOT NULL,
  `tipo_transaccion` enum('inscripcion','mensualidad','producto','descuento','mixta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'mixta: permite combinar inscripciones y mensualidades, productos no, en una sola venta',
  `monto_subtotal` decimal(10,2) NOT NULL,
  `monto_descuento` decimal(10,2) DEFAULT '0.00',
  `monto_total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int NOT NULL,
  `alumno_id` int DEFAULT NULL,
  `cancelada` tinyint(1) DEFAULT '0',
  `fecha_cancelacion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `usuario_id` (`usuario_id`),
  KEY `alumno_id` (`alumno_id`),
  KEY `idx_folio` (`folio`),
  KEY `idx_fecha` (`created_at`),
  KEY `idx_tipo` (`tipo_transaccion`),
  KEY `idx_transacciones_fecha_tipo` (`created_at`,`tipo_transaccion`),
  KEY `idx_transacciones_tipo_fecha` (`tipo_transaccion`,`created_at`),
  CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `transacciones_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones`
--

LOCK TABLES `transacciones` WRITE;
/*!40000 ALTER TABLE `transacciones` DISABLE KEYS */;
INSERT INTO `transacciones` VALUES (4,20250002,'inscripcion',600.00,0.00,600.00,'tarjeta',1,1,0,NULL,'2025-07-07 23:22:20');
/*!40000 ALTER TABLE `transacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('admin','cajero','profesor','usuario') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@escuelanatacion.com','admin','admin',1,'2025-06-09 03:10:51','2025-06-10 22:33:57'),(2,'cajero1','cajero1@escuelanatacion.com','$2y$10$YourHashedPasswordHere','cajero',1,'2025-06-09 03:10:51','2025-06-09 03:10:51'),(3,'clu','iker.famoso1219@gmail.com','Iker4554','admin',1,'2025-06-13 03:42:46','2025-06-13 03:42:46');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_inscripciones_estado`
--

DROP TABLE IF EXISTS `vista_inscripciones_estado`;
/*!50001 DROP VIEW IF EXISTS `vista_inscripciones_estado`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_inscripciones_estado` AS SELECT 
 1 AS `id`,
 1 AS `alumno_id`,
 1 AS `fecha_inscripcion`,
 1 AS `year_inscripcion`,
 1 AS `fecha_fin`,
 1 AS `anos_vigencia`,
 1 AS `monto`,
 1 AS `metodo_pago`,
 1 AS `observaciones`,
 1 AS `activa`,
 1 AS `created_at`,
 1 AS `nombre`,
 1 AS `apellido_paterno`,
 1 AS `apellido_materno`,
 1 AS `telefono`,
 1 AS `email`,
 1 AS `estado_inscripcion`,
 1 AS `dias_restantes`,
 1 AS `es_vigente`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'sharkids'
--

--
-- Final view structure for view `vista_inscripciones_estado`
--

/*!50001 DROP VIEW IF EXISTS `vista_inscripciones_estado`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_inscripciones_estado` AS select `i`.`id` AS `id`,`i`.`alumno_id` AS `alumno_id`,`i`.`fecha_inscripcion` AS `fecha_inscripcion`,`i`.`year_inscripcion` AS `year_inscripcion`,`i`.`fecha_fin` AS `fecha_fin`,`i`.`anos_vigencia` AS `anos_vigencia`,`i`.`monto` AS `monto`,`i`.`metodo_pago` AS `metodo_pago`,`i`.`observaciones` AS `observaciones`,`i`.`activa` AS `activa`,`i`.`created_at` AS `created_at`,`a`.`nombre` AS `nombre`,`a`.`apellido_paterno` AS `apellido_paterno`,`a`.`apellido_materno` AS `apellido_materno`,`a`.`telefono` AS `telefono`,`a`.`email` AS `email`,(case when (`i`.`activa` = 0) then 'CANCELADA' when (curdate() > `i`.`fecha_fin`) then 'VENCIDA' when (curdate() between `i`.`fecha_inscripcion` and `i`.`fecha_fin`) then 'VIGENTE' when (curdate() < `i`.`fecha_inscripcion`) then 'FUTURA' else 'INACTIVA' end) AS `estado_inscripcion`,(to_days(`i`.`fecha_fin`) - to_days(curdate())) AS `dias_restantes`,(case when ((curdate() between `i`.`fecha_inscripcion` and `i`.`fecha_fin`) and (`i`.`activa` = 1)) then 1 else 0 end) AS `es_vigente` from (`inscripciones` `i` join `alumnos` `a` on((`i`.`alumno_id` = `a`.`id`))) where (`a`.`deleted` = 0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-11 17:41:21
