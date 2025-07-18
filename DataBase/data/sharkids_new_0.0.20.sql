-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: 5.78.131.3    Database: sharkids
-- ------------------------------------------------------
-- Server version	9.3.0

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
INSERT INTO `alumnos` VALUES (1,'regular','Iker Yared','Covarrubias','Famoso','2004-01-02','Sayula,49300,Centro,Direccion de iker','ejemplo@gmail.com','4811223355','4811223355',NULL,'activo',1,'2025-06-20 02:01:05','2025-06-26 02:42:24',0,NULL),(2,'regular','test','test','test','2004-07-04','direccion test','test@gmail.com','1234567890','1234567890',NULL,'activo',1,'2025-06-23 20:47:20','2025-06-26 02:39:27',0,NULL);
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
  `user_id` int NOT NULL,
  `shift` enum('matutino','vespertino') DEFAULT 'matutino',
  `amount_opening` decimal(12,2) DEFAULT '1000.00',
  `amount_closing` decimal(12,2) DEFAULT '0.00',
  `revenue` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `status` enum('open','close','reopened') DEFAULT 'open',
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id_creted_caja_idx` (`user_id`),
  CONSTRAINT `user_id_creted_caja` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja_registradora`
--

LOCK TABLES `caja_registradora` WRITE;
/*!40000 ALTER TABLE `caja_registradora` DISABLE KEYS */;
INSERT INTO `caja_registradora` VALUES (3,1,'matutino',1000.00,1000.00,0.00,0.00,'close','fdsgfgd','2025-07-03 23:35:04','2025-07-17 22:29:03'),(4,1,'vespertino',2300.00,1000.00,0.00,0.00,'close','como estas ','2025-07-17 22:35:31','2025-07-17 22:38:34'),(5,1,'vespertino',900.00,6000.00,0.00,0.00,'close','cierre bien','2025-07-17 22:49:37','2025-07-18 01:10:12'),(6,1,'vespertino',30000.00,300.00,0.00,0.00,'close','','2025-07-18 01:14:47','2025-07-18 01:16:13'),(7,1,'matutino',7.00,123.00,0.00,0.00,'close','','2025-07-18 01:16:32','2025-07-18 01:29:18'),(8,1,'vespertino',800.00,800.00,0.00,0.00,'close','','2025-07-18 01:29:26','2025-07-18 01:30:29'),(9,1,'matutino',900.00,90.00,0.00,0.00,'close','','2025-07-18 01:30:37','2025-07-18 01:36:31'),(10,1,'vespertino',500.00,90.00,0.00,0.00,'close','','2025-07-18 01:36:38','2025-07-18 01:37:46'),(11,1,'matutino',700.00,900.00,0.00,0.00,'close','','2025-07-18 02:03:48','2025-07-18 02:04:00'),(12,1,'vespertino',800.00,23.00,0.00,0.00,'close','','2025-07-18 02:15:23','2025-07-18 02:18:32');
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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito_items`
--

LOCK TABLES `carrito_items` WRITE;
/*!40000 ALTER TABLE `carrito_items` DISABLE KEYS */;
INSERT INTO `carrito_items` VALUES (42,1,'',9,46),(43,1,'',9,48),(44,1,'',10,48),(45,1,'',10,48),(46,1,'',10,48);
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
  `id_cupones` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carritos_usuarios_id_fk` (`usuario_id`),
  KEY `carritos_cupones_id_fk` (`id_cupones`),
  CONSTRAINT `carritos_cupones_id_fk` FOREIGN KEY (`id_cupones`) REFERENCES `cupones` (`id`),
  CONSTRAINT `carritos_usuarios_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (46,1,'2025-07-08 23:15:01','2025-07-08 23:15:08',1),(48,1,'2025-07-08 23:15:22','2025-07-09 19:42:54',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupones`
--

LOCK TABLES `cupones` WRITE;
/*!40000 ALTER TABLE `cupones` DISABLE KEYS */;
INSERT INTO `cupones` VALUES (1,'VERANO2025','DESCUENTO DE VERANO','porcentaje',20.00,50,49,'2025-07-02','2025-07-14',1,'2025-07-03 23:54:50'),(2,'NAVIDAD2025','CUPON DE NAVIDAD','cantidad',100.00,100,0,'2025-07-04','2025-07-21',1,'2025-07-04 17:21:50');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (6,'NL','NADO LIBRE','nado_libre','Intermedio','nado libre sin profe',1,'2025-06-28 19:03:00',0,NULL),(7,'GA','GRUPAL ADULTOS','grupo_adultos','Avanzado','Grupo de nado adultos avanzado',1,'2025-06-28 19:04:13',0,NULL),(10,'AFAM','Activación Física Adulto Mayor - AFAM','activacion_fisica_adulto_mayor','Mixto','Clase de Actividad Física para Adultos Mayores',1,'2025-06-30 02:37:31',0,NULL),(11,'AQ-PRINCIPIANTE','Aquafitness - AQ-PRINCIPIANTE','aquafitness','Principiante','Clases de Aquafitness de nivel principiante',1,'2025-07-04 00:33:57',0,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios`
--

LOCK TABLES `horarios` WRITE;
/*!40000 ALTER TABLE `horarios` DISABLE KEYS */;
INSERT INTO `horarios` VALUES (1,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-06-28 19:05:37',1,'2025-07-03 01:03:42',8),(2,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-06-28 19:17:52',1,'2025-07-03 01:03:42',8),(3,7,6,'martes','09:00:00','11:00:00',1,'2025-06-28 19:18:33',1,'2025-07-02 21:05:23',8),(10,10,6,'lunes','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(11,10,6,'martes','11:00:00','12:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(12,10,6,'miercoles','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(13,10,6,'jueves','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(14,10,6,'viernes','09:00:00','10:00:00',1,'2025-06-30 02:37:31',1,'2025-07-02 21:06:03',8),(31,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-01 02:16:40',1,'2025-07-03 01:03:42',8),(32,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-01 02:16:40',1,'2025-07-03 01:03:42',8),(33,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-01 02:16:47',1,'2025-07-03 01:03:42',8),(34,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-01 02:16:47',1,'2025-07-03 01:03:42',8),(35,7,6,'martes','09:00:00','11:00:00',1,'2025-07-02 21:05:23',1,'2025-07-03 06:47:52',16),(36,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(37,10,6,'martes','11:00:00','12:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(38,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(39,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(40,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-02 21:06:03',1,'2025-07-02 21:06:27',15),(41,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(42,10,6,'martes','11:00:00','12:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(43,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(44,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(45,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-02 21:06:27',1,'2025-07-03 00:49:32',15),(46,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-02 21:07:58',1,'2025-07-03 01:03:42',8),(47,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-02 21:07:58',1,'2025-07-03 01:03:42',8),(48,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(49,10,6,'martes','11:00:00','12:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(50,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(51,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-03 00:49:32',1,'2025-07-03 00:50:02',15),(52,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-03 06:48:53',15),(53,10,6,'martes','11:00:00','12:00:00',1,'2025-07-03 00:50:02',1,'2025-07-03 06:48:53',15),(54,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-03 06:48:53',15),(55,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-03 06:48:53',15),(56,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-03 00:50:02',1,'2025-07-03 06:48:53',15),(57,6,NULL,'lunes','09:00:00','10:00:00',1,'2025-07-03 01:03:42',0,NULL,8),(58,6,NULL,'miercoles','09:00:00','10:00:00',1,'2025-07-03 01:03:42',0,NULL,8),(59,7,6,'martes','09:00:00','11:00:00',1,'2025-07-03 06:47:52',0,NULL,16),(60,10,6,'lunes','09:00:00','10:00:00',1,'2025-07-03 06:48:53',1,'2025-07-04 00:31:14',15),(61,10,6,'martes','11:00:00','12:00:00',1,'2025-07-03 06:48:53',1,'2025-07-04 00:31:14',15),(62,10,6,'miercoles','09:00:00','10:00:00',1,'2025-07-03 06:48:53',1,'2025-07-04 00:31:14',15),(63,10,6,'jueves','09:00:00','10:00:00',1,'2025-07-03 06:48:53',1,'2025-07-04 00:31:14',15),(64,10,6,'viernes','09:00:00','10:00:00',1,'2025-07-03 06:48:53',1,'2025-07-04 00:31:14',15),(65,10,5,'lunes','09:00:00','10:00:00',1,'2025-07-04 00:31:14',0,NULL,15),(66,10,5,'martes','11:00:00','12:00:00',1,'2025-07-04 00:31:14',0,NULL,15),(67,10,5,'miercoles','09:00:00','10:00:00',1,'2025-07-04 00:31:14',0,NULL,15),(68,10,5,'jueves','09:00:00','10:00:00',1,'2025-07-04 00:31:14',0,NULL,15),(69,10,5,'viernes','09:00:00','10:00:00',1,'2025-07-04 00:31:14',0,NULL,15),(70,11,5,'martes','15:00:00','17:00:00',1,'2025-07-04 00:33:57',0,NULL,8),(71,11,5,'jueves','15:00:00','17:00:00',1,'2025-07-04 00:33:57',0,NULL,8);
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
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_inscripcion_year` (`alumno_id`,`year_inscripcion`),
  KEY `idx_alumno_year` (`alumno_id`,`year_inscripcion`),
  CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones`
--

LOCK TABLES `inscripciones` WRITE;
/*!40000 ALTER TABLE `inscripciones` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (6,9,100,1,0,'2025-07-03 23:47:26'),(7,10,100,0,0,'2025-07-08 22:48:56');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (9,'blue-short3245','SHORT','Short deportivo color azul','articulo_deportivo',200.00,100.00,1,'2025-07-03 23:47:26','2025-07-03 23:47:26','data:image/webp;base64,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',0),(10,'GAFAS-3434534','GAFAS DE NATACION','GAFAS VERDES DE NATACION','articulo_deportivo',10.00,1.00,1,'2025-07-08 22:48:56','2025-07-08 22:48:56','data:image/webp;base64,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',0);
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
INSERT INTO `profesores` VALUES (5,'Maicol','Felps','2000-11-07','Direccion de Maicol','4455667766','Nada como yo corro','2025-06-24',1,'2025-06-24 21:44:04','2025-07-04 00:30:38',0,NULL),(6,'Iker Yared','Covarrubias Famoso','2004-01-02','Av. Manuel Avila Camacho 116 poniente, Centro, Sayula, Jalisco, 49300','4811223355','Crol super duper avanzado','2025-06-20',1,'2025-06-25 01:01:53','2025-06-25 19:35:44',0,NULL);
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
INSERT INTO `refresh_tokens` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1Mjc5MjMwNywiZXhwIjoxNzUzMzk3MTA3fQ.4YxKuzL5RJ6ztGMw7vH5ZN2NWABi1steb2F60kBu-m8','2025-07-03 13:45:37','2025-07-17 22:45:07'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc1MjgwNTQxOSwiZXhwIjoxNzUzNDEwMjE5fQ.xDoYn_ebK0jlufVe87Z6rvExy7YkVeoldBTkBTYb8i8','2025-06-28 20:41:11','2025-07-18 02:23:39');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifas_mensualidad`
--

LOCK TABLES `tarifas_mensualidad` WRITE;
/*!40000 ALTER TABLE `tarifas_mensualidad` DISABLE KEYS */;
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
  CONSTRAINT `transaccion_detalles_ibfk_1` FOREIGN KEY (`transaccion_id`) REFERENCES `transacciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaccion_detalles`
--

LOCK TABLES `transaccion_detalles` WRITE;
/*!40000 ALTER TABLE `transaccion_detalles` DISABLE KEYS */;
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
  `tipo_transaccion` enum('inscripcion','mensualidad','producto','descuento') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `transacciones_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones`
--

LOCK TABLES `transacciones` WRITE;
/*!40000 ALTER TABLE `transacciones` DISABLE KEYS */;
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
-- Dumping routines for database 'sharkids'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-17 19:36:05
