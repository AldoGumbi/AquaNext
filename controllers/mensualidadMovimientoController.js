// controllers/mensualidadMovimientoController.js
import MensualidadMovimientoService from '../services/mensualidadMovimientoService.js';
import MensualidadMovimientosModel from '../models/mensualidadMovimientos.js';

/**
 * Analiza una mensualidad para determinar opciones de movimiento
 */
export const analizarMensualidadParaMovimiento = async (req, res) => {
    try {
        const { mensualidad_id } = req.params;

        console.log("mensualidad_id: ", mensualidad_id);

        if (!mensualidad_id || isNaN(Number(mensualidad_id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de mensualidad inválido',
                error: true
            });
        }

        const analisis = await MensualidadMovimientoService.analizarMensualidadParaMovimiento(mensualidad_id);

        if (!analisis.puede_mover) {
            return res.status(400).json({
                success: false,
                message: analisis.motivo,
                error: true
            });
        }

        res.status(200).json({
            success: true,
            data: {
                puede_mover: analisis.puede_mover,
                mensualidad: analisis.mensualidad,
                meses_info: analisis.meses_info,
                opciones_movimiento: analisis.opciones_movimiento,
                total_meses_movibles: analisis.total_meses_movibles
            },
            message: analisis.mensaje,
            error: false
        });

    } catch (error) {
        console.error('Error al analizar mensualidad para movimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al analizar la mensualidad',
            error: error.message
        });
    }
};

/**
 * Obtiene horarios disponibles para el movimiento
 */
export const getHorariosDisponiblesParaMovimiento = async (req, res) => {
    try {
        const { tipo_clase, fecha_desde, fecha_hasta, nivel_clase, alumno_id } = req.body;
        // console.log("tipo_clase, fecha_desde, fecha_hasta, nivel_clase: ", tipo_clase, fecha_desde, fecha_hasta, nivel_clase);
        const { horarios_actuales } = req.body || {};

        if (!tipo_clase || !fecha_desde || !fecha_hasta || !nivel_clase || !alumno_id) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren tipo_clase, fecha_desde, fecha_hasta, nivel_clase y alumno_id',
                error: true
            });
        }

        // Validar formato de fechas
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_desde) || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_hasta)) {
            return res.status(400).json({
                success: false,
                message: 'Las fechas deben tener formato YYYY-MM-DD',
                error: true
            });
        }

        const horariosDisponibles = await MensualidadMovimientoService.getHorariosDisponiblesParaMovimiento(
            tipo_clase,
            nivel_clase,
            fecha_desde,
            fecha_hasta,
            horarios_actuales || [],
            alumno_id
        );

        // Agrupar horarios por día para mejor presentación en frontend
        const horariosPorDia = {};
        horariosDisponibles.forEach(horario => {
            if (!horariosPorDia[horario.dia]) {
                horariosPorDia[horario.dia] = [];
            }
            horariosPorDia[horario.dia].push(horario);
        });

        res.status(200).json({
            success: true,
            data: {
                horarios_disponibles: horariosDisponibles,
                horarios_por_dia: horariosPorDia,
                total_horarios: horariosDisponibles.length,
                horarios_completamente_disponibles: horariosDisponibles.filter(h => h.disponible_completo).length
            },
            message: 'Horarios disponibles obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener horarios disponibles',
            error: error.message
        });
    }
};

/**
 * Valida los nuevos horarios antes del movimiento
 */
export const validarHorariosParaMovimiento = async (req, res) => {
    try {
        const {
            mensualidad_id,
            horarios_anteriores,
            horarios_nuevos,
            cantidad_horarios_requeridos,
            fecha_desde,
            fecha_hasta,
            alumno_id
        } = req.body;

        if (!mensualidad_id || !horarios_anteriores || !horarios_nuevos || !fecha_desde || !fecha_hasta || !alumno_id || !cantidad_horarios_requeridos) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para la validación',
                error: true
            });
        }

        const validacion = await MensualidadMovimientoService.validarNuevosHorarios(
            mensualidad_id,
            horarios_anteriores,
            horarios_nuevos,
            cantidad_horarios_requeridos,
            fecha_desde,
            fecha_hasta,
            alumno_id
        );

        res.status(200).json({
            success: true,
            data: {
                valido: validacion.valido,
                mensaje: validacion.mensaje,
                errores_cupos: validacion.errores_cupos || [],
                solapamientos: validacion.solapamientos || []
            },
            message: validacion.valido ? 'Validación exitosa' : 'Se encontraron problemas en la validación',
            error: !validacion.valido
        });

    } catch (error) {
        console.error('Error al validar horarios para movimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al validar horarios',
            error: error.message
        });
    }
};

/**
 * Procesa el movimiento completo de una mensualidad
 */
export const procesarMovimientoMensualidad = async (req, res) => {
    try {
        const {
            mensualidad_id,
            alumno_id,
            usuario_id,
            opcion_seleccionada,
            horarios_nuevos,
            motivo,
            cantidad_horarios_requeridos
        } = req.body;

        if (!mensualidad_id || !alumno_id || !usuario_id || !opcion_seleccionada || !horarios_nuevos || !cantidad_horarios_requeridos) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para el movimiento',
                error: true
            });
        }

        // Validar estructura de opcion_seleccionada
        if (!opcion_seleccionada.tipo || !opcion_seleccionada.fecha_desde || !opcion_seleccionada.fecha_hasta) {
            return res.status(400).json({
                success: false,
                message: 'La opción seleccionada debe incluir tipo, fecha_desde y fecha_hasta',
                error: true
            });
        }

        // Validar que horarios_nuevos sea un array con elementos válidos
        if (!Array.isArray(horarios_nuevos) || horarios_nuevos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se debe proporcionar al menos un horario nuevo',
                error: true
            });
        }

        // Validar estructura de horarios_nuevos
        for (const horario of horarios_nuevos) {
            if (!horario.horario_id || !horario.grupo_id || !horario.dia || !horario.hora_inicio || !horario.hora_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Cada horario nuevo debe incluir horario_id, grupo_id, dia, hora_inicio y hora_fin',
                    error: true
                });
            }
        }

        const resultado = await MensualidadMovimientoService.procesarMovimientoMensualidad({
            mensualidad_id,
            alumno_id,
            usuario_id,
            opcion_seleccionada,
            cantidad_horarios_requeridos,
            horarios_nuevos,
            motivo: motivo || 'Movimiento solicitado por el usuario'
        });

        if (!resultado.success) {
            return res.status(400).json({
                success: false,
                message: resultado.mensaje,
                error: true,
                errores_validacion: resultado.errores_validacion || []
            });
        }

        res.status(200).json({
            success: true,
            data: {
                movimiento_id: resultado.movimiento_id,
                detalles: resultado.detalles
            },
            message: resultado.mensaje,
            error: false
        });

    } catch (error) {
        console.error('Error al procesar movimiento de mensualidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al procesar el movimiento',
            error: error.message
        });
    }
};

/**
 * Obtiene el historial de movimientos de una mensualidad
 */
export const getHistorialMovimientos = async (req, res) => {
    try {
        const { mensualidad_id } = req.params;

        if (!mensualidad_id || isNaN(Number(mensualidad_id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de mensualidad inválido',
                error: true
            });
        }

        const historial = await MensualidadMovimientosModel.getHistorialMovimientos(mensualidad_id);

        // Procesar datos para el frontend
        const historialProcesado = historial.map(movimiento => ({
            ...movimiento,
            horarios_anteriores: JSON.parse(movimiento.horarios_anteriores),
            horarios_nuevos: JSON.parse(movimiento.horarios_nuevos),
            detalles_adicionales: movimiento.detalles_adicionales ? 
                JSON.parse(movimiento.detalles_adicionales) : null
        }));

        res.status(200).json({
            success: true,
            data: historialProcesado,
            message: 'Historial de movimientos obtenido correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener historial de movimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener el historial',
            error: error.message
        });
    }
};

/**
 * Obtiene estadísticas de movimientos
 */
export const getEstadisticasMovimientos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        // Validar formato de fechas si se proporcionan
        if (fecha_inicio && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio)) {
            return res.status(400).json({
                success: false,
                message: 'fecha_inicio debe tener formato YYYY-MM-DD',
                error: true
            });
        }

        if (fecha_fin && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin)) {
            return res.status(400).json({
                success: false,
                message: 'fecha_fin debe tener formato YYYY-MM-DD',
                error: true
            });
        }

        const estadisticas = await MensualidadMovimientosModel.getEstadisticasMovimientos(fecha_inicio, fecha_fin);

        res.status(200).json({
            success: true,
            data: estadisticas,
            message: 'Estadísticas obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de movimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener estadísticas',
            error: error.message
        });
    }
};

/**
 * Verifica si una mensualidad se puede mover (endpoint de validación rápida)
 */
export const verificarSePuedeMovern = async (req, res) => {
    try {
        const { mensualidad_id } = req.params;
        const { fecha_desde } = req.query;

        if (!mensualidad_id || isNaN(Number(mensualidad_id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de mensualidad inválido',
                error: true
            });
        }

        if (fecha_desde && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_desde)) {
            return res.status(400).json({
                success: false,
                message: 'fecha_desde debe tener formato YYYY-MM-DD',
                error: true
            });
        }

        const verificacion = await MensualidadMovimientosModel.verificarSePuedeMovern(mensualidad_id, fecha_desde);

        res.status(200).json({
            success: true,
            data: {
                puede_mover: verificacion.puede_mover,
                motivo: verificacion.motivo,
                mensualidad: verificacion.mensualidad,
                fecha_minima_movimiento: verificacion.fecha_minima_movimiento
            },
            message: verificacion.puede_mover ? 'La mensualidad se puede mover' : verificacion.motivo,
            error: !verificacion.puede_mover
        });

    } catch (error) {
        console.error('Error al verificar si se puede mover:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al verificar la mensualidad',
            error: error.message
        });
    }
};

/**
 * Obtiene información detallada de un movimiento específico
 */
export const getDetallesMovimiento = async (req, res) => {
    try {
        const { movimiento_id } = req.params;

        if (!movimiento_id || isNaN(Number(movimiento_id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de movimiento inválido',
                error: true
            });
        }

        const [movimiento] = await db.query(`
            SELECT 
                mm.*,
                u.nombre as usuario_nombre,
                u.email as usuario_email,
                m.fecha_inicio as mensualidad_fecha_inicio,
                m.fecha_fin as mensualidad_fecha_fin,
                a.nombre as alumno_nombre,
                a.apellido_paterno as alumno_apellido_paterno,
                a.apellido_materno as alumno_apellido_materno
            FROM mensualidad_movimientos mm
            LEFT JOIN users u ON mm.usuario_id = u.id
            LEFT JOIN mensualidades m ON mm.mensualidad_id = m.id
            LEFT JOIN inscripciones i ON m.inscripcion_id = i.id
            LEFT JOIN alumnos a ON i.alumno_id = a.id
            WHERE mm.id = ?
        `, [movimiento_id]);

        if (movimiento.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movimiento no encontrado',
                error: true
            });
        }

        const mov = movimiento[0];
        
        // Procesar datos JSON
        const movimientoDetallado = {
            ...mov,
            horarios_anteriores: JSON.parse(mov.horarios_anteriores),
            horarios_nuevos: JSON.parse(mov.horarios_nuevos),
            detalles_adicionales: mov.detalles_adicionales ? 
                JSON.parse(mov.detalles_adicionales) : null
        };

        res.status(200).json({
            success: true,
            data: movimientoDetallado,
            message: 'Detalles del movimiento obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener detalles del movimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener detalles del movimiento',
            error: error.message
        });
    }
};