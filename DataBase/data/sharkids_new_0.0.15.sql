-- MySQL dump 10.13  Distrib 8.4.4, for macos15.2 (arm64)
--
-- Host: localhost    Database: shark_1
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
INSERT INTO `alumnos` VALUES (1,'regular','Iker Yared','Covarrubias','Famoso','2004-01-02','Sayula,49300,Centro,Direccion de iker','ejemplo@gmail.com','4811223355','4811223355',NULL,'activo',1,'2025-06-20 02:01:05','2025-06-23 20:50:50',0,NULL),(2,'regular','test','test','test','2025-06-03','test, test, test, test, test','test@gmail.com','1234567890','1234567890',NULL,'inactivo',0,'2025-06-23 20:47:20','2025-06-23 20:47:20',0,NULL);
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_update_alumnos` BEFORE UPDATE ON `alumnos` FOR EACH ROW BEGIN
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
INSERT INTO `carrito_items` VALUES (7,1,'',4,5);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (5,1,'2025-06-12 03:14:03','2025-06-12 03:14:03'),(6,1,'2025-06-12 03:14:04','2025-06-12 03:14:04'),(7,1,'2025-06-12 03:14:04','2025-06-12 03:14:04'),(8,1,'2025-06-12 03:14:04','2025-06-12 03:14:04');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases`
--

LOCK TABLES `clases` WRITE;
/*!40000 ALTER TABLE `clases` DISABLE KEYS */;
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
INSERT INTO `fotos_alumnos` VALUES (19,2,'data:image/jpeg;base64,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','2025-06-23 14:47:20','2025-06-23 14:47:20');
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
  `tipo` enum('matronatacion','nado_libre','aqua_fitness','natacion_infantil','natacion_adultos') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,'MAT-01','Matronatación Básico','matronatacion','Principiante',NULL,1,'2025-06-09 03:11:02'),(2,'NL-01','Nado Libre Intermedio','nado_libre','Intermedio',NULL,1,'2025-06-09 03:11:02'),(3,'NI-01','Natación Infantil 6-8 años','natacion_infantil','Principiante',NULL,1,'2025-06-09 03:11:02'),(4,'NA-01','Natación Adultos Principiantes','natacion_adultos','Principiante',NULL,1,'2025-06-09 03:11:02'),(5,'AF-01','Aqua Fitness Matutino','aqua_fitness','Todos los niveles',NULL,1,'2025-06-09 03:11:02');
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_horario` (`grupo_id`,`dia`,`hora_inicio`),
  KEY `idx_grupo_dia` (`grupo_id`,`dia`),
  KEY `idx_profesor` (`profesor_id`),
  CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios`
--

LOCK TABLES `horarios` WRITE;
/*!40000 ALTER TABLE `horarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `horarios` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,1,150,20,300,'2025-06-19 00:50:36'),(2,3,100,15,200,'2025-06-19 00:50:36'),(3,4,80,10,150,'2025-06-19 00:50:36'),(4,7,60,10,100,'2025-06-19 00:50:36'),(5,8,120,15,250,'2025-06-19 00:50:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'234dsfds','Pañal para natación','Pañal de aquatico','accesorios',23.89,10.23,1,'2025-06-11 22:33:00','2025-06-11 23:29:13',NULL,1),(3,'SKUDEPRUEBA','Pañal para natación','Pañal de aquatico','accesorios',23.89,10.23,1,'2025-06-11 22:33:33','2025-06-12 01:38:46','base64/img...',1),(4,'23fds','Pañal para natación','Pañal de aquatico','accesorios',23.89,10.23,1,'2025-06-12 01:41:00','2025-06-19 01:09:54',NULL,0),(7,'CAFE-002','PAÑAL','Pañal - Cafetería','accesorios',8.00,3.00,1,'2025-06-19 00:24:11','2025-06-19 00:59:43',NULL,0),(8,'CAFE-001','SHAMPOO','Shampoo - Cafetería','accesorios',4.00,1.87,1,'2025-06-19 00:24:11','2025-06-19 00:24:11',NULL,0);
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
  PRIMARY KEY (`id`),
  KEY `idx_nombre_completo` (`nombre`,`apellido`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesores`
--

LOCK TABLES `profesores` WRITE;
/*!40000 ALTER TABLE `profesores` DISABLE KEYS */;
INSERT INTO `profesores` VALUES (5,'test','test','2000-06-13','tes test test, test, test, test, 12431','4455667766','test','2025-06-24',1,'2025-06-24 21:44:04','2025-06-24 21:44:04');
/*!40000 ALTER TABLE `profesores` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `refresh_tokens` VALUES (3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc1MDYyNzExMSwiZXhwIjoxNzUxMjMxOTExfQ.fHESg8Hzg05fZuyQgJFtKVEP-Gm9x7vJjzBp17WlRKM','2025-06-14 23:02:36','2025-06-22 21:18:31');
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
  `tipo_clase` enum('matronatacion','nado_libre','aqua_fitness','natacion_infantil','natacion_adultos') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `tarifas_mensualidad` VALUES (1,'matronatacion',1,800.00,1,'2025-06-09 03:10:55'),(2,'matronatacion',2,1400.00,1,'2025-06-09 03:10:55'),(3,'nado_libre',2,1000.00,1,'2025-06-09 03:10:55'),(4,'nado_libre',3,1400.00,1,'2025-06-09 03:10:55'),(5,'natacion_infantil',2,900.00,1,'2025-06-09 03:10:55'),(6,'natacion_adultos',2,1100.00,1,'2025-06-09 03:10:55'),(7,'aqua_fitness',2,1200.00,1,'2025-06-09 03:10:55');
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
-- Dumping routines for database 'shark_1'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-24 16:08:29
