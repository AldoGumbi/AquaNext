import gruposModel from '../models/groups.js';
import horariosModel from '../models/schedule.js';

export const insertGrupo = async (req, res) => {
    try {
        const { codigo, nombre, tipo, nivel, descripcion, horarios } = req.body;

        // Validaciones básicas
        if (!codigo || !nombre || !tipo) {
            return res.status(400).json({
                data: false,
                message: 'Código, nombre y tipo son requeridos',
                error: true
            });
        }

        if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
            return res.status(400).json({
                data: false,
                message: 'Debe proporcionar al menos un horario',
                error: true
            });
        }

        // Validar que todos los horarios tengan los campos requeridos
        for (let i = 0; i < horarios.length; i++) {
            const horario = horarios[i];
            if (!horario.dia || !horario.hora_inicio || !horario.hora_fin) {
                return res.status(400).json({
                    data: false,
                    message: `Horario ${i + 1}: día, hora de inicio y hora de fin son requeridos`,
                    error: true
                });
            }

            if (horario.hora_inicio >= horario.hora_fin) {
                return res.status(400).json({
                    data: false,
                    message: `Horario ${i + 1}: la hora de inicio debe ser menor que la hora de fin`,
                    error: true
                });
            }

            // Solo validar conflictos si hay un profesor asignado Y no es null
            if (horario.profesor_id && horario.profesor_id !== null && horario.profesor_id !== "null") {
                const conflictos = await horariosModel.verificarConflictoProfesor(
                    horario.profesor_id,
                    horario.dia,
                    horario.hora_inicio,
                    horario.hora_fin
                );
                
                if (conflictos.length > 0) {
                    return res.status(400).json({
                        data: false,
                        message: `Conflicto en horario ${i + 1}: El profesor ya tiene asignada una clase el ${horario.dia} de ${horario.hora_inicio} a ${horario.hora_fin}`,
                        error: true
                    });
                }
            }
        }

        // Verificar que el código no esté duplicado
        const grupoExistente = await gruposModel.getByCodigo(codigo);
        if (grupoExistente) {
            return res.status(400).json({
                data: false,
                message: 'Ya existe un grupo con este código',
                error: true
            });
        }

        // Crear el grupo con sus horarios usando transacción
        const nuevoGrupo = {
            codigo: codigo.trim(),
            nombre: nombre.trim(),
            tipo,
            nivel: nivel?.trim() || null,
            descripcion: descripcion?.trim() || null,
            activo: true
        };

        // Esta función maneja tanto la creación del grupo como sus horarios en una transacción
        const grupoId = await gruposModel.crearConHorarios(nuevoGrupo, horarios);

        res.status(201).json({
            data: true,
            message: 'Grupo creado correctamente con sus horarios',
            grupo_id: grupoId,
            error: false
        });

    } catch (error) {
        console.error('Error al crear grupo:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                data: false,
                message: 'Ya existe un grupo con este código',
                error: true
            });
        }

        res.status(500).json({
            data: false,
            message: 'Error interno al crear el grupo',
            error: error.message
        });
    }
};

export const getAllGrupos = async (req, res) => {
    try {
        const grupos = await gruposModel.getAll();
        
        res.status(200).json({
            data: grupos,
            message: grupos.length > 0 ? 'Grupos obtenidos correctamente' : 'No se encontraron grupos',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener grupos:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los grupos',
            error: error.message
        });
    }
};

export const getAllGruposIncludingDeleted = async (req, res) => {
    try {
        const grupos = await gruposModel.getAllIncludingDeleted();
        
        res.status(200).json({
            data: grupos,
            message: 'Todos los grupos obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener todos los grupos:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener todos los grupos',
            error: error.message
        });
    }
};

export const getGrupoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de grupo inválido',
                error: true
            });
        }

        const grupo = await gruposModel.getById(id);
        
        if (!grupo) {
            return res.status(404).json({
                data: false,
                message: 'Grupo no encontrado',
                error: true
            });
        }

        // Obtener los horarios del grupo
        const horarios = await horariosModel.getByGrupoId(id);
        grupo.horarios = horarios;

        res.status(200).json({
            data: grupo,
            message: 'Grupo encontrado',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener grupo:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener el grupo',
            error: error.message
        });
    }
};

export const getGruposByTipo = async (req, res) => {
    try {
        const { tipo } = req.params;
        
        const tiposValidos = ['matronatacion', 'nado_libre', 'aqua_fitness', 'natacion_infantil', 'natacion_adultos'];
        
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                data: false,
                message: 'Tipo de grupo inválido',
                error: true
            });
        }

        const grupos = await gruposModel.getByTipo(tipo);
        
        res.status(200).json({
            data: grupos,
            message: `Grupos de tipo ${tipo} obtenidos correctamente`,
            error: false
        });

    } catch (error) {
        console.error('Error al obtener grupos por tipo:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los grupos',
            error: error.message
        });
    }
};

export const getGruposConHorarios = async (req, res) => {
    try {
        const grupos = await gruposModel.getAllConHorarios();
        
        res.status(200).json({
            data: grupos,
            message: 'Grupos con horarios obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener grupos con horarios:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los grupos con horarios',
            error: error.message
        });
    }
};

export const getGruposDeleted = async (req, res) => {
    try {
        const grupos = await gruposModel.getDeleted();
        
        res.status(200).json({
            data: grupos,
            message: 'Grupos eliminados obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener grupos eliminados:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los grupos eliminados',
            error: error.message
        });
    }
};

export const updateGrupo = async (req, res) => {

    try {
        const { id } = req.params;
        const { codigo, nombre, tipo, nivel, descripcion, activo, horarios } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de grupo inválido',
                error: true
            });
        }

        // Verificar que el grupo existe
        const grupoExistente = await gruposModel.getById(id);
        if (!grupoExistente) {
            return res.status(404).json({
                data: false,
                message: 'Grupo no encontrado',
                error: true
            });
        }

        // Validaciones básicas
        if (!codigo || !nombre || !tipo) {
            return res.status(400).json({
                data: false,
                message: 'Código, nombre y tipo son requeridos',
                error: true
            });
        }

        // Verificar código duplicado (excepto el mismo grupo)
        const grupoCodigo = await gruposModel.getByCodigo(codigo);
        if (grupoCodigo && parseInt(grupoCodigo.id) !== parseInt(id)) {
            return res.status(400).json({
                data: false,
                message: 'Ya existe otro grupo con este código',
                error: true
            });
        }

        // Si se proporcionan horarios, validarlos
        if (horarios && Array.isArray(horarios) && horarios.length > 0) {
            for (let i = 0; i < horarios.length; i++) {
                const horario = horarios[i];
                if (!horario.dia || !horario.hora_inicio || !horario.hora_fin) {
                    return res.status(400).json({
                        data: false,
                        message: `Horario ${i + 1}: día, hora de inicio y hora de fin son requeridos`,
                        error: true
                    });
                }

                if (horario.hora_inicio >= horario.hora_fin) {
                    return res.status(400).json({
                        data: false,
                        message: `Horario ${i + 1}: la hora de inicio debe ser menor que la hora de fin`,
                        error: true
                    });
                }

                // Solo validar conflictos si hay un profesor asignado Y no es null
                if (horario.profesor_id && horario.profesor_id !== null && horario.profesor_id !== "null") {
                    const conflictos = await horariosModel.verificarConflictoProfesor(
                        horario.profesor_id,
                        horario.dia,
                        horario.hora_inicio,
                        horario.hora_fin,
                        horario.id // Excluir el horario actual si está siendo editado
                    );
                    
                    if (conflictos.length > 0) {
                        return res.status(400).json({
                            data: false,
                            message: `Conflicto en horario ${i + 1}: El profesor ya tiene asignada una clase el ${horario.dia} de ${horario.hora_inicio} a ${horario.hora_fin}`,
                            error: true
                        });
                    }
                }
            }
        }

        const grupoActualizado = {
            codigo: codigo.trim(),
            nombre: nombre.trim(),
            tipo,
            nivel: nivel?.trim() || null,
            descripcion: descripcion?.trim() || null,
            activo: activo !== undefined ? activo : true
        };

        // Actualizar el grupo y sus horarios usando transacción
        const resultado = await gruposModel.updateConHorarios(id, grupoActualizado, horarios);
        
        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Grupo actualizado correctamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'No se pudo actualizar el grupo',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al actualizar grupo:', error);
        
        // Mejorar el manejo de errores para que sea más específico
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                data: false,
                message: 'Ya existe un grupo con este código',
                error: true
            });
        }

        res.status(500).json({
            data: false,
            message: 'Error interno al actualizar el grupo',
            error: error.message
        });
    }
};

export const deleteGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de grupo inválido',
                error: true
            });
        }

        // Verificar si el grupo tiene clases programadas o alumnos inscritos
        const tieneClases = await gruposModel.verificarClasesActivas(id);
        if (tieneClases) {
            return res.status(400).json({
                data: false,
                message: 'No se puede eliminar el grupo porque tiene clases programadas o alumnos inscritos',
                error: true
            });
        }

        // Eliminar el grupo y sus horarios (soft delete)
        const resultado = await gruposModel.deleteConHorarios(id);
        
        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Grupo eliminado correctamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Grupo no encontrado',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al eliminar el grupo',
            error: error.message
        });
    }
};

export const restoreGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de grupo inválido',
                error: true
            });
        }

        const resultado = await gruposModel.restore(id);
        
        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Grupo restaurado correctamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Grupo no encontrado o no estaba eliminado',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al restaurar grupo:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al restaurar el grupo',
            error: error.message
        });
    }
};

export const hardDeleteGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de grupo inválido',
                error: true
            });
        }

        const resultado = await gruposModel.hardDelete(id);
        
        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Grupo eliminado permanentemente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Grupo no encontrado',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al eliminar permanentemente grupo:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al eliminar permanentemente el grupo',
            error: error.message
        });
    }
};

// Función adicional para verificar conflictos de horarios
export const verificarConflictosHorarios = async (req, res) => {
    try {
        const { dia, hora_inicio, hora_fin, profesor_id, grupo_id } = req.query;

        if (!dia || !hora_inicio || !hora_fin) {
            return res.status(400).json({
                data: false,
                message: 'Día, hora de inicio y hora de fin son requeridos',
                error: true
            });
        }

        let conflictos = [];

        // Verificar conflictos de profesor si se proporciona
        if (profesor_id) {
            const conflictosProfesor = await horariosModel.verificarConflictoProfesor(
                profesor_id,
                dia,
                hora_inicio,
                hora_fin
            );
            conflictos = conflictos.concat(conflictosProfesor);
        }

        // Verificar conflictos generales de horarios
        const conflictosGenerales = await gruposModel.verificarConflictoHorarios(
            dia,
            hora_inicio,
            hora_fin,
            grupo_id
        );
        conflictos = conflictos.concat(conflictosGenerales);

        res.status(200).json({
            data: conflictos,
            message: conflictos.length > 0 ? 'Se encontraron conflictos de horarios' : 'No hay conflictos de horarios',
            error: false
        });

    } catch (error) {
        console.error('Error al verificar conflictos:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al verificar conflictos',
            error: error.message
        });
    }
};

// Función para obtener estadísticas de grupos
export const getEstadisticasGrupos = async (req, res) => {
    try {
        const estadisticas = await gruposModel.getEstadisticas();
        
        res.status(200).json({
            data: estadisticas,
            message: 'Estadísticas obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener estadísticas',
            error: error.message
        });
    }
};