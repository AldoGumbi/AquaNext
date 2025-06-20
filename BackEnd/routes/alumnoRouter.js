import express from 'express';

import {
	insertAlumno,
	getAllAlumnos,
	updateAlumno,
	deleteAlumno
} from '../controllers/alumnoController.js';

const router = express.Router();

// insert new student
router.post('/register', insertAlumno);

// get all students
router.get('/all-students', getAllAlumnos);

// edit alumno
router.patch('/update-student/:id', updateAlumno);

// delete alumno
router.delete('/delete-student/:id', deleteAlumno);


export default router;