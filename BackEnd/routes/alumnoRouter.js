import express from 'express';

import {insertAlumno
} from '../controllers/alumnoController.js';

const router = express.Router();

router.post('/register', insertAlumno);
export default router;