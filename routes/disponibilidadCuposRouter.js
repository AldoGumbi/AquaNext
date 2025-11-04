import express from 'express';
import {
    getDisponibilidadPorMes,
    getDisponibilidadPorRango
} from '../controllers/disponibilidadCuposController.js';

const router = express.Router();

// Obtener disponibilidad por mes específico
router.get('/cupos/:year/:mes', getDisponibilidadPorMes);

// Obtener disponibilidad por rango de meses
router.get('/cupos/rango', getDisponibilidadPorRango);

export default router;