// routes/mensualidadMovimientoRouter.js
import express from 'express';
import {
    analizarMensualidadParaMovimiento,
    getHorariosDisponiblesParaMovimiento,
    validarHorariosParaMovimiento,
    procesarMovimientoMensualidad,
    getHistorialMovimientos,
    getEstadisticasMovimientos,
    verificarSePuedeMovern,
    getDetallesMovimiento
} from '../controllers/mensualidadMovimientoController.js';

const router = express.Router();

// === RUTAS DE ANÁLISIS Y VALIDACIÓN ===

// Verificar si una mensualidad se puede mover (validación rápida)
router.get('/verificar/:mensualidad_id', verificarSePuedeMovern);

// Analizar mensualidad para obtener opciones de movimiento
router.get('/analizar/:mensualidad_id', analizarMensualidadParaMovimiento);

// Obtener horarios disponibles para movimiento
router.post('/horarios-disponibles', getHorariosDisponiblesParaMovimiento);

// Validar horarios antes del movimiento
router.post('/validar-horarios', validarHorariosParaMovimiento);

// === RUTAS DE PROCESAMIENTO ===

// Procesar movimiento completo de mensualidad
router.post('/procesar', procesarMovimientoMensualidad);

// === RUTAS DE CONSULTA ===

// Obtener historial de movimientos de una mensualidad
router.get('/historial/:mensualidad_id', getHistorialMovimientos);

// Obtener detalles de un movimiento específico
router.get('/detalles/:movimiento_id', getDetallesMovimiento);

// Obtener estadísticas de movimientos
router.get('/estadisticas', getEstadisticasMovimientos);

export default router;