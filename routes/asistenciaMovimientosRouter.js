import express from 'express';
import {
  getHorariosCompatiblesParaMover,
  getFechasDisponiblesEnHorario,
  moverAsistenciaANuevaClase,
  getHistorialMovimientosAsistencia
} from '../controllers/asistenciaMovimientosController.js';

const router = express.Router();

/**
 * Obtener horarios compatibles para mover una asistencia
 * GET /api/asistencia-movimientos/:asistencia_id/horarios-compatibles
 */
router.get('/:asistencia_id/horarios-compatibles', getHorariosCompatiblesParaMover);

/**
 * Obtener fechas disponibles en un horario específico (calendario)
 * GET /api/asistencia-movimientos/horario/:horario_id/fechas-disponibles
 * Query params: mensualidad_id, alumno_id, asistencia_id
 */
router.get('/horario/:horario_id/fechas-disponibles', getFechasDisponiblesEnHorario);

/**
 * Mover asistencia a nueva fecha
 * POST /api/asistencia-movimientos/:asistencia_id/mover
 * Body: { fecha_destino, horario_destino_id, motivo }
 */
router.post('/:asistencia_id/mover', moverAsistenciaANuevaClase);

/**
 * Obtener historial de movimientos de una asistencia
 * GET /api/asistencia-movimientos/:asistencia_id/historial
 */
router.get('/:asistencia_id/historial', getHistorialMovimientosAsistencia);

export default router;