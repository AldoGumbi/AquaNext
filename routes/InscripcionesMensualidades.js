// routes/inscripcionesRouter.js - Actualizado con validación de cupos
import express from 'express';
import {
    createInscripcionSola,
    createMensualidadSola,
    createInscripcionConMensualidades,
    getAllInscripciones,
    getInscripcionesByAlumno,
    validateInscripcionVigente,
    getMensualidadesByAlumno,
    getMensualidadesByInscripcion,
    cancelarInscripcion,
    cancelarMensualidad,
    getEstadisticasInscripciones,
    getTarifasMensualidad,
    createTarifaMensualidad,
    updateTarifaMensualidad,
    deleteTarifaMensualidad,
    validarDisponibilidadCupos,
    getDisponibilidadCuposUI,
    getAllTransacciones,
    getDetallesTransaccion,
    getTransaccionesByAlumno,
    getEstadisticasVentas,
    getTransaccionesByDateRange,
    getTransaccionesByTipo,
    cancelarTransaccion,
    getVentasDelDia,
} from '../controllers/inscripcionesMensualidadesController.js';

const router = express.Router();

// === RUTAS DE INSCRIPCIONES ===
// Crear solo inscripción
router.post('/inscripcion-solo', createInscripcionSola);

// Crear inscripción con mensualidades
router.post('/inscripcion-con-mensualidades', createInscripcionConMensualidades);

// Obtener todas las inscripciones
router.get('/inscripciones', getAllInscripciones);

// Obtener inscripciones por alumno
router.get('/inscripciones/alumno/:alumnoId', getInscripcionesByAlumno);

// Validar si un alumno tiene inscripción vigente
router.get('/inscripciones/validar/:alumnoId', validateInscripcionVigente);

// Cancelar inscripción
router.patch('/inscripciones/cancelar/:inscripcionId', cancelarInscripcion);

// === RUTAS DE MENSUALIDADES ===
// Crear solo mensualidad (requiere inscripción vigente)
router.post('/mensualidad-solo', createMensualidadSola);

// Obtener mensualidades por alumno
router.get('/mensualidades/alumno/:alumnoId', getMensualidadesByAlumno);

// Obtener mensualidades por inscripción
router.get('/mensualidades/inscripcion/:inscripcionId', getMensualidadesByInscripcion);

// Cancelar mensualidad
router.patch('/mensualidades/cancelar/:mensualidadId', cancelarMensualidad);

// === RUTAS DE VALIDACIÓN DE CUPOS ===

// Validar disponibilidad de cupos antes de crear mensualidades
router.post('/cupos/validar', validarDisponibilidadCupos);

// Obtener disponibilidad de cupos para interfaz de usuario
router.get('/cupos/disponibilidad', getDisponibilidadCuposUI);

// === RUTAS DE TARIFAS ===
// Obtener todas las tarifas
router.get('/tarifas', getTarifasMensualidad);

// Crear tarifa
router.post('/tarifas', createTarifaMensualidad);

// Actualizar tarifa
router.put('/tarifas/:tarifaId', updateTarifaMensualidad);

// Eliminar tarifa
router.delete('/tarifas/:tarifaId', deleteTarifaMensualidad);

// === RUTAS DE ESTADÍSTICAS ===
router.get('/estadisticas', getEstadisticasInscripciones);

// === RUTAS DE TRANSACCIONES ===
// Obtener todas las transacciones de inscripciones y mensualidades
router.get('/all-sales', getAllTransacciones);

// Obtener estadísticas de ventas
router.get('/stats', getEstadisticasVentas);

// Obtener ventas del día actual
router.get('/today', getVentasDelDia);

// Obtener transacciones por rango de fechas
router.get('/by-date-range', getTransaccionesByDateRange);

// Obtener transacciones por tipo (inscripcion, mensualidad, inscripcion_mensualidades)
router.get('/by-type/:tipo', getTransaccionesByTipo);

// Obtener detalles de una transacción específica
router.get('/details/:id', getDetallesTransaccion);

// Obtener transacciones por alumno
router.get('/by-student/:alumnoId', getTransaccionesByAlumno);

// Cancelar transacción (soft delete)
router.patch('/cancel/:id', cancelarTransaccion);

export default router;