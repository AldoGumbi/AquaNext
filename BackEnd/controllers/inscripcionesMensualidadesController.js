// controllers/inscripcionesController.js
import inscripcionesModel from '../models/inscripciones.js';
import mensualidadesModel from '../models/mensualidades.js';
import tarifasModel from '../models/tarifas.js';
// import transaccionesModel from '../models/transacciones.js';
import gruposModel from '../models/groups.js';
import clasesService from '../services/clasesService.js';
import asistenciasService from '../services/asistenciasService.js';

// === CONTROLADORES DE INSCRIPCIONES ===

export const createInscripcionSola = async (req, res) => {
    try {
        const {
            alumno_id,
            anos_inscripcion = 1,
            monto,
            metodo_pago,
            usuario_id
        } = req.body;

        // Validaciones básicas
        if (!alumno_id || !monto || !metodo_pago || !usuario_id) {
            return res.status(400).json({
                data: false,
                message: 'Faltan datos requeridos: alumno_id, monto, metodo_pago, usuario_id',
                error: true
            });
        }

        // Verificar si ya tiene una inscripción vigente para este año
        const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumno_id);
        if (inscripcionVigente) {
            return res.status(400).json({
                data: false,
                message: 'El alumno ya tiene una inscripción vigente',
                error: true
            });
        }

        // Crear la inscripción con transacción
        const resultado = await inscripcionesModel.createInscripcionSola({
            alumno_id,
            anos_inscripcion,
            monto,
            metodo_pago,
            usuario_id
        });

        res.status(201).json({
            data: resultado,
            message: 'Inscripción creada exitosamente',
            error: false
        });

    } catch (error) {
        console.error('Error al crear inscripción:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al crear la inscripción',
            error: error.message
        });
    }
};

export const createInscripcionConMensualidades = async (req, res) => {
    try {
        const {
            alumno_id,
            inscripcion,
            mensualidades,
            metodo_pago,
            usuario_id
        } = req.body;

        // Validaciones básicas
        if (!alumno_id || !inscripcion || !mensualidades || !Array.isArray(mensualidades) || mensualidades.length === 0) {
            return res.status(400).json({
                data: false,
                message: 'Datos incompletos o formato inválido',
                error: true
            });
        }

        // Verificar inscripción vigente
        const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumno_id);
        if (inscripcionVigente) {
            return res.status(400).json({
                data: false,
                message: 'El alumno ya tiene una inscripción vigente',
                error: true
            });
        }

        // Validar mensualidades
        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            if (!mensualidad.grupos || !Array.isArray(mensualidad.grupos) || mensualidad.grupos.length === 0) {
                return res.status(400).json({
                    data: false,
                    message: `Mensualidad ${i + 1}: Debe especificar al menos un grupo`,
                    error: true
                });
            }

            if (!mensualidad.fecha_inicio || !mensualidad.fecha_fin) {
                return res.status(400).json({
                    data: false,
                    message: `Mensualidad ${i + 1}: Debe especificar fecha_inicio y fecha_fin`,
                    error: true
                });
            }
        }

        // Crear inscripción con mensualidades
        const resultado = await inscripcionesModel.createInscripcionConMensualidades({
            alumno_id,
            inscripcion,
            mensualidades,
            metodo_pago,
            usuario_id
        });

        res.status(201).json({
            data: resultado,
            message: 'Inscripción y mensualidades creadas exitosamente',
            error: false
        });

    } catch (error) {
        console.error('Error al crear inscripción con mensualidades:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al crear inscripción con mensualidades',
            error: error.message
        });
    }
};

export const createMensualidadSola = async (req, res) => {
    try {
        const {
            alumno_id,
            mensualidades,
            metodo_pago,
            usuario_id
        } = req.body;

        // Validaciones básicas
        if (!alumno_id || !mensualidades || !Array.isArray(mensualidades) || mensualidades.length === 0) {
            return res.status(400).json({
                data: false,
                message: 'Datos incompletos o formato inválido',
                error: true
            });
        }

        // Verificar inscripción vigente
        const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumno_id);
        if (!inscripcionVigente) {
            return res.status(400).json({
                data: false,
                message: 'El alumno no tiene una inscripción vigente. Debe comprar una inscripción primero.',
                error: true
            });
        }

        // Validar mensualidades
        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            if (!mensualidad.grupos || !Array.isArray(mensualidad.grupos) || mensualidad.grupos.length === 0) {
                return res.status(400).json({
                    data: false,
                    message: `Mensualidad ${i + 1}: Debe especificar al menos un grupo`,
                    error: true
                });
            }
        }

        // Crear mensualidades
        const resultado = await mensualidadesModel.createMensualidadesSolas({
            alumno_id,
            inscripcion_id: inscripcionVigente.id,
            mensualidades,
            metodo_pago,
            usuario_id
        });

        res.status(201).json({
            data: resultado,
            message: 'Mensualidades creadas exitosamente',
            error: false
        });

    } catch (error) {
        console.error('Error al crear mensualidades:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al crear las mensualidades',
            error: error.message
        });
    }
};

// === CONTROLADORES DE CONSULTA ===

export const getAllInscripciones = async (req, res) => {
    try {
        const { page = 1, limit = 50, alumno_nombre, year } = req.query;
        
        const inscripciones = await inscripcionesModel.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            alumno_nombre,
            year: year ? parseInt(year) : null
        });

        res.status(200).json({
            data: inscripciones,
            message: 'Inscripciones obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener inscripciones:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener inscripciones',
            error: error.message
        });
    }
};

export const getInscripcionesByAlumno = async (req, res) => {
    try {
        const { alumnoId } = req.params;
        
        if (!alumnoId || isNaN(Number(alumnoId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de alumno inválido',
                error: true
            });
        }

        const inscripciones = await inscripcionesModel.getByAlumno(alumnoId);

        res.status(200).json({
            data: inscripciones,
            message: 'Inscripciones del alumno obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener inscripciones del alumno:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener inscripciones del alumno',
            error: error.message
        });
    }
};

export const validateInscripcionVigente = async (req, res) => {
    try {
        const { alumnoId } = req.params;
        
        if (!alumnoId || isNaN(Number(alumnoId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de alumno inválido',
                error: true
            });
        }

        const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumnoId);

        res.status(200).json({
            data: {
                tiene_inscripcion_vigente: !!inscripcionVigente,
                inscripcion: inscripcionVigente
            },
            message: inscripcionVigente ? 'Alumno tiene inscripción vigente' : 'Alumno no tiene inscripción vigente',
            error: false
        });

    } catch (error) {
        console.error('Error al validar inscripción vigente:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al validar inscripción',
            error: error.message
        });
    }
};

export const getMensualidadesByAlumno = async (req, res) => {
    try {
        const { alumnoId } = req.params;
        const { year, mes, incluir_canceladas = false } = req.query;
        
        if (!alumnoId || isNaN(Number(alumnoId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de alumno inválido',
                error: true
            });
        }

        const mensualidades = await mensualidadesModel.getByAlumno(alumnoId, {
            year: year ? parseInt(year) : null,
            mes: mes ? parseInt(mes) : null,
            incluir_canceladas: incluir_canceladas === 'true'
        });

        res.status(200).json({
            data: mensualidades,
            message: 'Mensualidades del alumno obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener mensualidades del alumno:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener mensualidades del alumno',
            error: error.message
        });
    }
};

export const getMensualidadesByInscripcion = async (req, res) => {
    try {
        const { inscripcionId } = req.params;
        
        if (!inscripcionId || isNaN(Number(inscripcionId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de inscripción inválido',
                error: true
            });
        }

        const mensualidades = await mensualidadesModel.getByInscripcion(inscripcionId);

        res.status(200).json({
            data: mensualidades,
            message: 'Mensualidades de la inscripción obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener mensualidades de la inscripción:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener mensualidades',
            error: error.message
        });
    }
};

// === CONTROLADORES DE CANCELACIÓN ===

export const cancelarInscripcion = async (req, res) => {
    try {
        const { inscripcionId } = req.params;
        const { motivo } = req.body;
        
        if (!inscripcionId || isNaN(Number(inscripcionId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de inscripción inválido',
                error: true
            });
        }

        const resultado = await inscripcionesModel.cancelar(inscripcionId, motivo);
        
        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Inscripción cancelada exitosamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Inscripción no encontrada',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al cancelar inscripción:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al cancelar inscripción',
            error: error.message
        });
    }
};

export const cancelarMensualidad = async (req, res) => {
    try {
        const { mensualidadId } = req.params;
        const { motivo } = req.body;
        
        if (!mensualidadId || isNaN(Number(mensualidadId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de mensualidad inválido',
                error: true
            });
        }

        const resultado = await mensualidadesModel.cancelar(mensualidadId, motivo);
        
        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Mensualidad cancelada exitosamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Mensualidad no encontrada',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al cancelar mensualidad:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al cancelar mensualidad',
            error: error.message
        });
    }
};

// === CONTROLADORES DE TARIFAS ===

export const getTarifasMensualidad = async (req, res) => {
    try {
        const tarifas = await tarifasModel.getAll();

        res.status(200).json({
            data: tarifas,
            message: 'Tarifas obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener tarifas:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener tarifas',
            error: error.message
        });
    }
};

export const createTarifaMensualidad = async (req, res) => {
    try {
        const { tipo_clase, clases_por_semana, monto_mensual } = req.body;

        if (!tipo_clase || !clases_por_semana || !monto_mensual) {
            return res.status(400).json({
                data: false,
                message: 'Faltan datos requeridos: tipo_clase, clases_por_semana, monto_mensual',
                error: true
            });
        }

        const tarifaId = await tarifasModel.create({
            tipo_clase,
            clases_por_semana,
            monto_mensual
        });

        res.status(201).json({
            data: { id: tarifaId },
            message: 'Tarifa creada exitosamente',
            error: false
        });

    } catch (error) {
        console.error('Error al crear tarifa:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                data: false,
                message: 'Ya existe una tarifa para este tipo de clase con esta cantidad de clases por semana',
                error: true
            });
        }

        res.status(500).json({
            data: false,
            message: 'Error interno al crear tarifa',
            error: error.message
        });
    }
};

export const updateTarifaMensualidad = async (req, res) => {
    try {
        const { tarifaId } = req.params;
        const { tipo_clase, clases_por_semana, monto_mensual, activa } = req.body;

        if (!tarifaId || isNaN(Number(tarifaId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de tarifa inválido',
                error: true
            });
        }

        const resultado = await tarifasModel.update(tarifaId, {
            tipo_clase,
            clases_por_semana,
            monto_mensual,
            activa
        });

        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Tarifa actualizada exitosamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Tarifa no encontrada',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al actualizar tarifa:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al actualizar tarifa',
            error: error.message
        });
    }
};

export const deleteTarifaMensualidad = async (req, res) => {
    try {
        const { tarifaId } = req.params;

        if (!tarifaId || isNaN(Number(tarifaId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de tarifa inválido',
                error: true
            });
        }

        const resultado = await tarifasModel.delete(tarifaId);

        if (resultado) {
            res.status(200).json({
                data: true,
                message: 'Tarifa eliminada exitosamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Tarifa no encontrada',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al eliminar tarifa:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al eliminar tarifa',
            error: error.message
        });
    }
};

// === CONTROLADORES DE ESTADÍSTICAS ===

export const getEstadisticasInscripciones = async (req, res) => {
    try {
        const { year } = req.query;
        
        const estadisticas = await inscripcionesModel.getEstadisticas(year ? parseInt(year) : null);

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