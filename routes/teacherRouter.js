import express from 'express';

import {
    getAllProfesores,
    insertProfesor,
    updateProfesor,
    deleteProfesor,
    checkTelefonoAvailability,
    getProfesorById,
    buscarProfesores,
    getEstadisticasProfesores,
    getClasesPorFecha,
    getClases,
    updateClaseProfesor,
    getGruposYHorariosByProfesor
} from '../controllers/teacherController.js';

const router = express.Router();

// Crear un nuevo profesor
router.post('/add-profesor', insertProfesor);

// Obtener todos los profesores
router.get("/all-profesores", getAllProfesores);

// Obtener un profesor por ID
router.get("/get-by-id/:id", getProfesorById);

// Actualizar un profesor
router.patch("/update-profesor/:id", updateProfesor);

// Desactivar un profesor (soft delete)
router.delete("/delete-profesor/:id", deleteProfesor);

// Verificar disponibilidad de teléfono
router.get('/check-telefono-available/:telefono', checkTelefonoAvailability);

// Buscar profesores por nombre o especialidad
router.get('/buscar', buscarProfesores);

// Obtener estadísticas de profesores
router.get('/estadisticas', getEstadisticasProfesores);

router.get('/clases', getClasesPorFecha);

router.get("/:id/detalles-clases", getClases);

router.patch("/update-clase-profesor", updateClaseProfesor);

router.get("/:id/grupos-horarios", getGruposYHorariosByProfesor);


export default router;