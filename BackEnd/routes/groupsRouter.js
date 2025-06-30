import express from 'express';

import {
    insertGrupo,
    getAllGrupos,
    getAllGruposIncludingDeleted,
    getGrupoById,
    updateGrupo,
    deleteGrupo,
    restoreGrupo,
    hardDeleteGrupo,
    getGruposByTipo,
    getGruposConHorarios,
    getGruposDeleted,
    verificarConflictosHorarios,
    getEstadisticasGrupos
} from '../controllers/groupController.js';

const router = express.Router();

// Crear nuevo grupo
router.post('/add-grupo', insertGrupo);

// Obtener todos los grupos (solo no eliminados)
router.get('/all-grupos', getAllGrupos);

// Obtener todos los grupos incluyendo eliminados
router.get('/all-grupos-including-deleted', getAllGruposIncludingDeleted);

// Obtener grupos eliminados (papelera)
router.get('/grupos-eliminados', getGruposDeleted);

// Obtener grupo por ID
router.get('/:id', getGrupoById);

// Obtener grupos por tipo
router.get('/grupos-por-tipo/:tipo', getGruposByTipo);

// Obtener grupos con sus horarios
router.get('/grupos-con-horarios/', getGruposConHorarios);

// Verificar conflictos de horarios
router.get('/verificar-conflictos/horarios', verificarConflictosHorarios);

// Obtener estadísticas de grupos
router.get('/estadisticas/resumen', getEstadisticasGrupos);

// Actualizar grupo
router.patch('/update-grupo/:id', updateGrupo);

// Eliminar grupo (soft delete)
router.delete('/delete-grupo/:id', deleteGrupo);

// Restaurar grupo eliminado
router.patch('/restore-grupo/:id', restoreGrupo);

// Eliminar grupo permanentemente (hard delete)
router.delete('/hard-delete-grupo/:id', hardDeleteGrupo);

export default router;