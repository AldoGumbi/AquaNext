-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sharkids
-- ------------------------------------------------------
-- Server version	8.0.42

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-26 13:05:13
