CREATE DATABASE  IF NOT EXISTS `sharkids_old` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sharkids_old`;
-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (arm64)
--
-- Host: 5.78.131.3    Database: sharkids_old
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CuponesPromociones`
--

DROP TABLE IF EXISTS `CuponesPromociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CuponesPromociones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombreCupon` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `valorPorcentaje` decimal(5,2) DEFAULT NULL,
  `numeroUsos` int DEFAULT NULL,
  `fechaInicio` date DEFAULT NULL,
  `fechaVencimiento` date DEFAULT NULL,
  `valorCantidad` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombreCupon` (`nombreCupon`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `VentaActiva`
--

DROP TABLE IF EXISTS `VentaActiva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VentaActiva` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidad` int DEFAULT NULL,
  `codigo` int DEFAULT NULL,
  `producto` char(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PrecioVenta` decimal(9,2) DEFAULT NULL,
  `costo` decimal(9,2) DEFAULT NULL,
  `categoria` char(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `folio` int DEFAULT NULL,
  `terminada` enum('NO','SI') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `metodo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario` char(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=333 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish_ci NOT NULL,
  `Apellido` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `FechaNacimiento` date DEFAULT NULL,
  `Direccion` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `Telefono` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `TelefonoEmergencia` varchar(13) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `firma` char(2) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `estatus` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `picture` longtext COLLATE utf8mb4_general_ci,
  `fecha_captura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2512 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `alumnos_activos`
--

DROP TABLE IF EXISTS `alumnos_activos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos_activos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_alumno` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_clase` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hora_entrada` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `id_mensualidad` int DEFAULT NULL,
  `id_alumno_prueba` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id_mensualidad` (`id_mensualidad`),
  UNIQUE KEY `unique_id_alumno_prueba` (`id_alumno_prueba`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `alumnos_prueba`
--

DROP TABLE IF EXISTS `alumnos_prueba`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos_prueba` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_alumno_prueba` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `curp` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_nacimiento` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dia_clase` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_clase` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo_clase` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_clase` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `asistencia` tinyint(1) DEFAULT '0',
  `verificado` tinyint(1) DEFAULT '0',
  `habilitado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `curp_UNIQUE` (`curp`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clase_alumnos`
--

DROP TABLE IF EXISTS `clase_alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clase_alumnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_clase` int NOT NULL,
  `id_alumno` int DEFAULT NULL,
  `id_alumno_prueba` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_mensualidad` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_clase` (`id_clase`),
  KEY `id_alumno` (`id_alumno`),
  KEY `fk_mensualidad` (`id_mensualidad`),
  CONSTRAINT `clase_alumnos_ibfk_1` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id`),
  CONSTRAINT `clase_alumnos_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`ID`),
  CONSTRAINT `fk_mensualidad` FOREIGN KEY (`id_mensualidad`) REFERENCES `mensualidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10460 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clase_alumnos_inactivos`
--

DROP TABLE IF EXISTS `clase_alumnos_inactivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clase_alumnos_inactivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_clase` int NOT NULL,
  `id_alumno` int DEFAULT NULL,
  `id_alumno_prueba` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_mensualidad` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_clase` (`id_clase`),
  KEY `id_alumno` (`id_alumno`),
  KEY `fk_mensualidad` (`id_mensualidad`),
  CONSTRAINT `clase_alumnos_inactivos_ibfk_1` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id`),
  CONSTRAINT `clase_alumnos_inactivos_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`ID`),
  CONSTRAINT `fk_mensualidad_inactivos` FOREIGN KEY (`id_mensualidad`) REFERENCES `mensualidades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clases`
--

DROP TABLE IF EXISTS `clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_clase` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `id_profesor` int DEFAULT NULL,
  `horario` time NOT NULL,
  `dia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_profesor` (`id_profesor`),
  CONSTRAINT `clases_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6942 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `codigos`
--

DROP TABLE IF EXISTS `codigos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos` (
  `grupo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nivel` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `horario` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dia` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `grupo_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `profesor_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `profesor` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cupo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cupofaltante` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '0',
  `cupo_prueba` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `codigos123`
--

DROP TABLE IF EXISTS `codigos123`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos123` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grupo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nivel` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `horario` time NOT NULL,
  `dia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `grupo_id` text COLLATE utf8mb4_general_ci,
  `tipo` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `codigos_backup_230324`
--

DROP TABLE IF EXISTS `codigos_backup_230324`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos_backup_230324` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grupo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nivel` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `horario` time NOT NULL,
  `dia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `grupo_id` text COLLATE utf8mb4_general_ci,
  `tipo` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `codigos_personalizados`
--

DROP TABLE IF EXISTS `codigos_personalizados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos_personalizados` (
  `grupo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nivel` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `horario` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dia` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `grupo_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `profesor_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `profesor` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cupo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cupofaltante` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cupo_prueba` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `folios`
--

DROP TABLE IF EXISTS `folios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folios` (
  `id` int(13) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `folio` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historialventas`
--

DROP TABLE IF EXISTS `historialventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historialventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inscripcion_id` int DEFAULT NULL,
  `cantidad_total` decimal(10,2) NOT NULL,
  `cantidad_mensualidad` decimal(10,2) NOT NULL,
  `cantidad_inscripcion` decimal(10,2) NOT NULL,
  `cantidad_descuento` decimal(10,2) NOT NULL,
  `grupo` text COLLATE utf8mb4_general_ci NOT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nombreAlumno` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `totalDescuento` bigint DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `inscripcion_id` (`inscripcion_id`) USING BTREE,
  CONSTRAINT `historialventas_ibfk_1` FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripciones` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=714 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `duracion` int NOT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `historial_ventas_id` int DEFAULT NULL,
  `fecha_captura` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `alumno_id` (`alumno_id`),
  KEY `fk_historial_ventas` (`historial_ventas_id`),
  CONSTRAINT `fk_historial_ventas` FOREIGN KEY (`historial_ventas_id`) REFERENCES `historialventas` (`id`),
  CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`ID`),
  CONSTRAINT `inscripciones_chk_1` CHECK ((`duracion` between 1 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=966 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` int DEFAULT NULL,
  `producto` char(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `existencia` int DEFAULT NULL,
  `PrecioVenta` double(11,2) DEFAULT NULL,
  `costo` double(11,2) DEFAULT NULL,
  `fecha_captura` datetime DEFAULT CURRENT_TIMESTAMP,
  `categoria` enum('cafeteria','ArticuloDeportivo') COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logs_acceso`
--

DROP TABLE IF EXISTS `logs_acceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_acceso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int NOT NULL,
  `id_mensualidad` int NOT NULL,
  `fecha_clase` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_alumno_mensualidad_alumno` (`id_alumno`),
  KEY `fk_alumno_mensualidad_mensualidad` (`id_mensualidad`),
  CONSTRAINT `fk_alumno_mensualidad_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_alumno_mensualidad_mensualidad` FOREIGN KEY (`id_mensualidad`) REFERENCES `mensualidades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensualidades`
--

DROP TABLE IF EXISTS `mensualidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensualidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inscripcion_id` int NOT NULL,
  `historial_ventas_id` int DEFAULT NULL,
  `mes_inicio` date NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `mes_fin` date NOT NULL,
  `grupo_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dias_semana` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero_clases` int DEFAULT '0',
  `tipo_clases` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_captura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `clases_totales` int DEFAULT NULL,
  `asistencias` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `inscripcion_id` (`inscripcion_id`),
  KEY `fk_historial_ventas_new` (`historial_ventas_id`),
  CONSTRAINT `fk_historial_ventas_new` FOREIGN KEY (`historial_ventas_id`) REFERENCES `historialventas` (`id`),
  CONSTRAINT `mensualidades_ibfk_1` FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1597 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profesores`
--

DROP TABLE IF EXISTS `profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `apellido` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `especialidad` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_contratacion` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `logoBase64` text,
  `fecha_inscripcion` date DEFAULT NULL,
  `duracion` text,
  `metodo_pago` text,
  `total_inscripcion` decimal(9,2) DEFAULT NULL,
  `total_mensualidades` decimal(9,2) DEFAULT NULL,
  `total_pagar` text,
  `detalles` text,
  `usuario` text,
  `fecha_impresion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_captura` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb3_unicode_ci DEFAULT 'other',
  `phone_number` varchar(15) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `address_line1` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','pending') COLLATE utf8mb3_unicode_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rol` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-04 21:13:43
