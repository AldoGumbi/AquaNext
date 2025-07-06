import express from 'express';
import {
  getDashboardStats,
  getIngresos,
  getInscripcionesStatus,
  getMensualidadesStatus,
  getAlumnosEnAlberca,
  getVentasTienda
} from '../controllers/dashboardController.js';

const router = express.Router();

// Estadísticas generales (alumnos activos/inactivos, etc.)
router.get('/stats', getDashboardStats);

// Ingresos por inscripciones, mensualidades, tienda
router.get('/ingresos', getIngresos);

// Estado de inscripciones
router.get('/inscripciones-status', getInscripcionesStatus);

// Estado de mensualidades
router.get('/mensualidades-status', getMensualidadesStatus);

// Alumnos en alberca
router.get('/alumnos-en-alberca', getAlumnosEnAlberca);

// Ventas tienda
router.get('/ventas-tienda', getVentasTienda);

export default router;
