// routes/inscripcionesRouter.js
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
    deleteTarifaMensualidad
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

export default router;