import express from 'express';
import {
    getDisponibilidadIA,
    getDisponibilidadIAPorRango,
    getListaGruposYHorarios
} from '../controllers/disponibilidadCuposIAController.js';

const router = express.Router();

// Obtener disponibilidad inteligente por mes específico (IA)
router.post('/ia/:year/:mes', getDisponibilidadIA);

// Obtener disponibilidad inteligente por rango de meses (IA)
router.post('/ia/rango', getDisponibilidadIAPorRango);

//Nuevo endpoint para IA o diagnóstico
router.get("/cupos/lista", getListaGruposYHorarios);

export default router;
