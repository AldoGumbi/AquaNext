import express from "express";
import {
  getDashboardStats,
  getInscripcionesTablas,
  getMensualidadesTablas,

  // nuevos imports del controller de ingresos
  getTotalIngresos,
  getTotalIngresosByFecha,
  getIngresosGlobales,
  getIngresosInscripciones,
  getIngresosMensualidades,
  getIngresosClasesPrueba,
  getIngresosTienda
} from "../controllers/dashboardController.js";

const router = express.Router();

// 📊 Estadísticas generales (alumnos activos/inactivos, etc.)
router.get("/stats", getDashboardStats);

// 🏊 Alumnos en alberca

// 📋 Inscripciones (vigentes/vencidas)
router.get("/inscripciones-tablas", getInscripcionesTablas);

// 📋 Mensualidades (vigentes/vencidas)
router.get("/mensualidades-tablas", getMensualidadesTablas);

// 💰 Ingresos
router.get("/ingresos-total", getTotalIngresos);
router.get("/ingresos-total-fecha", getTotalIngresosByFecha);
router.get("/ingresos-globales", getIngresosGlobales);
router.get("/ingresos-inscripciones", getIngresosInscripciones);
router.get("/ingresos-mensualidades", getIngresosMensualidades);
router.get("/ingresos-clases-prueba", getIngresosClasesPrueba);
router.get("/ingresos-tienda", getIngresosTienda);

export default router;