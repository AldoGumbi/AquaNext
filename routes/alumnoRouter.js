// alumnoRouter.js - Router actualizado
import express from 'express';

import {
	insertAlumno,
	getAllAlumnos,
	getActiveAlumnos,
	updateAlumno,
	deleteAlumno,
	// Nuevos métodos para resumen del alumno
	getAlumnoById,
	getInscripcionesMensualidadesAlumno,
	getAsistenciasAlumno,
	getResumenCompleto,
	getAlumnosConMensualidades,
	getFreeTrialStudents, ConvertFreeTrialToRegular
} from '../controllers/alumnoController.js';

const router = express.Router();

// insert new student
router.post('/register', insertAlumno);

// get all students
router.get('/all-students', getAllAlumnos);

// get all active students
router.get('/active-students', getActiveAlumnos);

// get students with mensualidades
router.get('/students-with-mensualidades', getAlumnosConMensualidades);

// edit alumno
router.patch('/update-student/:id', updateAlumno);

// delete alumno
router.delete('/delete-student/:id', deleteAlumno);

// Obtener información completa de un alumno
router.get('/student/:id', getAlumnoById);

// Obtener inscripciones y mensualidades del alumno
router.get('/student/:id/inscripciones-mensualidades', getInscripcionesMensualidadesAlumno);

// Obtener asistencias del alumno
router.get('/student/:id/asistencias', getAsistenciasAlumno);

// Obtener resumen completo (estadísticas generales)
router.get('/student/:id/resumen', getResumenCompleto);

// obtener todos los alumnos que son de prueba
router.get('/free-trial-students', getFreeTrialStudents);

// cambiar a alumno regular
router.patch('/make-regular/:id', ConvertFreeTrialToRegular);

export default router;
