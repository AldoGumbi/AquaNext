// controllers/inscripcionesController.js - Optimizado con validación de cupos
import inscripcionesModel from '../models/inscripciones.js';
import mensualidadesModel from '../models/mensualidades.js';
import tarifasModel from '../models/tarifas.js';
import transaccionesModel from '../models/transactions.js';
import couponsModel from '../models/discountCoupons.js';
import gruposModel from '../models/groups.js';
import clasesService from '../services/clasesService.js';
import asistenciasService from '../services/asistenciasService.js';
import CuposValidationService from '../services/cuposValidationService.js';
import { executeWithRetry } from '../config/db.js';

// === CONTROLADORES DE INSCRIPCIONES ===

export const createInscripcionSola = async (req, res) => {
    try {
        const {
            alumno_id,
            anos_inscripcion = 1,
            monto,
            metodo_pago,
            usuario_id,
            observaciones = null,
            cupon_id = null,
            descuento_aplicado = 0,
            cash_register_id,
            // NUEVO PARÁMETRO PARA INDICAR SI ES RENOVACIÓN
            es_renovacion = false
        } = req.body;


        if (!alumno_id || !monto || !metodo_pago || !usuario_id) {
            return res.status(400).json({
                data: false,
                message: 'Faltan datos requeridos: alumno_id, monto, metodo_pago, usuario_id',
                error: true
            });
        }

        // Validar cupón si se proporciona
        if (cupon_id) {
            const validacionCupon = await couponsModel.validateCoupon(cupon_id);
            if (!validacionCupon.valido) {
                return res.status(400).json({
                    data: false,
                    message: `Cupón no válido: ${validacionCupon.mensaje}`,
                    error: true,
                    tipo_error: 'CUPON_NO_VALIDO'
                });
            }
        }

        let resultado;

        if (es_renovacion) {
            // FLUJO DE RENOVACIÓN
            const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumno_id);
            
            if (!inscripcionVigente) {
                return res.status(400).json({
                    data: false,
                    message: 'No se puede renovar: el alumno no tiene una inscripción vigente',
                    error: true,
                    tipo_error: 'SIN_INSCRIPCION_VIGENTE'
                });
            }

            // Verificar que la inscripción no haya expirado aún
            const hoy = new Date();
            const fechaFin = new Date(inscripcionVigente.fecha_fin);
            
            if (fechaFin < hoy) {
                return res.status(400).json({
                    data: false,
                    message: 'La inscripción ya expiró. Debe crear una nueva inscripción.',
                    error: true,
                    tipo_error: 'INSCRIPCION_EXPIRADA'
                });
            }

            // Usar el método renovar mejorado
            resultado = await inscripcionesModel.renovarConTransaccionCompleta({
                inscripcion_id: inscripcionVigente.id,
                anos_renovacion: anos_inscripcion,
                monto,
                metodo_pago,
                usuario_id,
                cash_register_id,
                observaciones,
                cupon_id,
                descuento_aplicado
            });

        } else {
            // FLUJO NORMAL DE INSCRIPCIÓN
            resultado = await inscripcionesModel.createInscripcionSola({
                alumno_id,
                anos_inscripcion,
                monto,
                metodo_pago,
                usuario_id,
                observaciones,
                cupon_id,
                descuento_aplicado,
                cash_register_id
            });
        }

        res.status(es_renovacion ? 200 : 201).json({
            data: resultado,
            message: es_renovacion ? 'Inscripción renovada exitosamente' : 'Inscripción creada exitosamente',
            error: false
        });

    } catch (error) {
        console.error('Error al procesar inscripción:', error);

        if (error.message.includes('cupón')) {
            return res.status(400).json({
                data: false,
                message: error.message,
                error: true,
                tipo_error: 'CUPON_ERROR'
            });
        }

        res.status(500).json({
            data: false,
            message: 'Error interno al procesar la inscripción',
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
            usuario_id,
            cash_register_id
        } = req.body;

        // Validaciones básicas
        if (!alumno_id || !inscripcion || !mensualidades || !Array.isArray(mensualidades) || mensualidades.length === 0) {
            return res.status(400).json({
                data: false,
                message: 'Datos incompletos o formato inválido',
                error: true
            });
        }

        // Verificar inscripción duplicada antes de la transacción
        const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumno_id);
        if (inscripcionVigente) {
            return res.status(400).json({
                data: false,
                message: 'El alumno ya tiene una inscripción vigente',
                error: true
            });
        }

        // Validar cupón de inscripción si existe
        if (inscripcion.cupon_id) {
            const validacionCupon = await couponsModel.validateCoupon(inscripcion.cupon_id);
            if (!validacionCupon.valido) {
                return res.status(400).json({
                    data: false,
                    message: `Cupón de inscripción no válido: ${validacionCupon.mensaje}`,
                    error: true,
                    tipo_error: 'CUPON_INSCRIPCION_NO_VALIDO'
                });
            }

            // Validar descuento de inscripción si se aplica
            if (inscripcion.descuento_aplicado > 0) {
                const cupon = await couponsModel.GetCouponById(inscripcion.cupon_id);
                if (cupon && cupon.length > 0) {
                    const cuponData = cupon[0];
                    let descuentoEsperado = 0;

                    if (cuponData.tipo === 'porcentaje') {
                        descuentoEsperado = (parseFloat(inscripcion.monto) * parseFloat(cuponData.valor)) / 100;
                    } else if (cuponData.tipo === 'cantidad') {
                        descuentoEsperado = parseFloat(cuponData.valor);
                    }

                    const tolerancia = 0.01;
                    if (Math.abs(parseFloat(inscripcion.descuento_aplicado) - descuentoEsperado) > tolerancia) {
                        return res.status(400).json({
                            data: false,
                            message: `El descuento de inscripción aplicado no coincide con el valor del cupón`,
                            error: true,
                            tipo_error: 'DESCUENTO_INSCRIPCION_INCORRECTO'
                        });
                    }
                }
            }
        }

        // Verificar disponibilidad de cupos para todas las mensualidades
        const erroresCupos = [];
        const resumenCupos = [];

        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            console.log(`🔍 Validando cupos para mensualidad ${i + 1}:`, {
                fecha_inicio: mensualidad.fecha_inicio,
                fecha_fin: mensualidad.fecha_fin,
                grupos_count: mensualidad.grupos?.length || 0
            });

            const validacionCupos = await CuposValidationService.validarCuposMensualidad(mensualidad, alumno_id);
            
            resumenCupos.push({
                mensualidad_index: i + 1,
                validacion: validacionCupos
            });

            if (!validacionCupos.todos_disponibles) {
                erroresCupos.push(`Mensualidad ${i + 1}: ${validacionCupos.mensaje}`);
            }
        }

        // Si hay errores de cupos, devolver error detallado
        if (erroresCupos.length > 0) {
            return res.status(400).json({
                data: false,
                // message: 'No hay cupos disponibles para algunas mensualidades',
                message: erroresCupos.join(' || '),
                error: true,
                errores_cupos: erroresCupos,
                resumen_cupos: resumenCupos,
                tipo_error: 'CUPOS_NO_DISPONIBLES'
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

        // Verificar cupones de mensualidades
        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            if (mensualidad.cupon_id) {
                const validacionCupon = await couponsModel.validateCoupon(mensualidad.cupon_id);
                
                if (!validacionCupon.valido) {
                    return res.status(400).json({
                        data: false,
                        message: `Mensualidad ${i + 1}: ${validacionCupon.mensaje}`,
                        error: true,
                        tipo_error: 'CUPON_MENSUALIDAD_NO_VALIDO'
                    });
                }
            }
        }

        // Calcular montos correctamente
        let montoSubtotalInscripcion = parseFloat(inscripcion.monto || 0);
        let montoTotalInscripcion = montoSubtotalInscripcion - parseFloat(inscripcion.descuento_aplicado || 0);
        
        let montoSubtotalMensualidades = 0;
        let montoTotalMensualidades = 0;
        
        for (const mensualidad of mensualidades) {
            const total = parseFloat(mensualidad.monto_total) - parseFloat(mensualidad.descuento_aplicado || 0);
            const subtotal = parseFloat(mensualidad.monto_total);
            
            montoSubtotalMensualidades += subtotal;
            montoTotalMensualidades += total;
        }

        const montoSubtotalTotal = montoSubtotalInscripcion + montoSubtotalMensualidades;
        const montoTotalFinal = montoTotalInscripcion + montoTotalMensualidades;

        // Usar executeWithRetry para transacciones pesadas
        const resultado = await executeWithRetry(async (connection) => {
            return await inscripcionesModel.createInscripcionConMensualidades({
                alumno_id,
                inscripcion,
                mensualidades,
                metodo_pago,
                usuario_id,
                cash_register_id,
                monto_subtotal: montoSubtotalTotal,
                monto_total: montoTotalFinal
            });
        });

        res.status(201).json({
            data: resultado,
            message: 'Inscripción y mensualidades creadas exitosamente',
            error: false,
            resumen_cupos: resumenCupos
        });

    } catch (error) {
        console.error('Error al crear inscripción con mensualidades:', error);

        if (error.message.includes('cupón')) {
            return res.status(400).json({
                data: false,
                message: error.message,
                error: true,
                tipo_error: 'CUPON_ERROR'
            });
        }
        
        if (error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.code === 'ER_LOCK_DEADLOCK') {
            return res.status(503).json({
                data: false,
                message: 'El servidor está ocupado. Intente nuevamente en unos momentos.',
                error: true
            });
        }
        
        res.status(500).json({
            data: false,
            message: 'Error interno al crear inscripción con mensualidades',
            error: error.message
        });
    }
};

// createMensualidadSola con validación de cupos
export const createMensualidadSola = async (req, res) => {
    try {
        const {
            alumno_id,
            mensualidades,
            metodo_pago,
            usuario_id,
            cash_register_id
        } = req.body;

        // console.log("req.body AAAAAAAAAAAAAAAAAAA: ", req.body);

        // Validaciones básicas
        if (!alumno_id || !mensualidades || !Array.isArray(mensualidades) || mensualidades.length === 0) {
            return res.status(400).json({
                data: false,
                message: 'Datos incompletos o formato inválido',
                error: true
            });
        }

        // Verificar inscripción vigente antes de la transacción
        const inscripcionVigente = await inscripcionesModel.getInscripcionVigente(alumno_id);
        if (!inscripcionVigente) {
            return res.status(400).json({
                data: false,
                message: 'El alumno no tiene una inscripción vigente. Debe comprar una inscripción primero.',
                error: true
            });
        }

        // Verificar disponibilidad de cupos para todas las mensualidades
        const erroresCupos = [];
        const resumenCupos = [];

        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            console.log(`🔍 Validando cupos para mensualidad ${i + 1}:`, {
                fecha_inicio: mensualidad.fecha_inicio,
                fecha_fin: mensualidad.fecha_fin,
                grupos_count: mensualidad.grupos?.length || 0
            });

            const validacionCupos = await CuposValidationService.validarCuposMensualidad(mensualidad, alumno_id);
            
            resumenCupos.push({
                mensualidad_index: i + 1,
                validacion: validacionCupos
            });

            if (!validacionCupos.todos_disponibles) {
                erroresCupos.push(`Mensualidad ${i + 1}: ${validacionCupos.mensaje}`);
            }
        }

        // Si hay errores de cupos, devolver error detallado
        if (erroresCupos.length > 0) {
            return res.status(400).json({
                data: false,
                // message: 'No hay cupos disponibles para algunas mensualidades',
                message: erroresCupos.join(" || "),
                error: true,
                errores_cupos: erroresCupos,
                resumen_cupos: resumenCupos,
                tipo_error: 'CUPOS_NO_DISPONIBLES'
            });
        }

        // Validar grupos y horarios
        for (const mensualidad of mensualidades) {
            if (!mensualidad.grupos || !Array.isArray(mensualidad.grupos) || mensualidad.grupos.length === 0) {
                return res.status(400).json({
                    data: false,
                    message: 'Debe especificar al menos un grupo para cada mensualidad',
                    error: true
                });
            }
        }


        // Verificar cupones antes de procesar
        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            if (mensualidad.cupon_id) {
                const validacionCupon = await couponsModel.validateCoupon(mensualidad.cupon_id);
                
                if (!validacionCupon.valido) {
                    return res.status(400).json({
                        data: false,
                        message: `Mensualidad ${i + 1}: ${validacionCupon.mensaje}`,
                        error: true,
                        tipo_error: 'CUPON_NO_VALIDO'
                    });
                }
            }
        }

        // Calcular monto total correctamente (con descuentos)
        let montoSubtotal = 0;
        let montoTotal = 0;
        
        for (const mensualidad of mensualidades) {
            const total = parseFloat(mensualidad.monto_total) - parseFloat(mensualidad.descuento_aplicado || 0);
            const subtotal = parseFloat(mensualidad.monto_total);
            
            montoSubtotal += subtotal;
            montoTotal += total;
        }

        // Usar executeWithRetry para transacciones pesadas
        const resultado = await executeWithRetry(async (connection) => {
            return await mensualidadesModel.createMensualidadesSolas({
                alumno_id,
                inscripcion_id: inscripcionVigente.id,
                mensualidades,
                metodo_pago,
                usuario_id,
                cash_register_id,
                monto_total: montoTotal,
                monto_subtotal: montoSubtotal
            });
        });

        res.status(201).json({
            data: resultado,
            message: 'Mensualidades creadas exitosamente',
            error: false,
            resumen_cupos: resumenCupos
        });

    } catch (error) {
        console.error('Error al crear mensualidades:', error);

        if (error.message.includes('cupón')) {
            return res.status(400).json({
                data: false,
                message: error.message,
                error: true,
                tipo_error: 'CUPON_ERROR'
            });
        }
        
        // Manejo específico de errores de timeout o deadlock
        if (error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.code === 'ER_LOCK_DEADLOCK') {
            return res.status(503).json({
                data: false,
                message: 'El servidor está ocupado procesando otras transacciones. Intente nuevamente en unos momentos.',
                error: true
            });
        }
        
        res.status(500).json({
            data: false,
            message: 'Error interno al crear las mensualidades',
            error: error.message
        });
    }
};

// Validar disponibilidad de cupos antes de crear mensualidades
export const validarDisponibilidadCupos = async (req, res) => {
    try {
        const { mensualidades, alumno_id } = req.body;

        if (!mensualidades || !Array.isArray(mensualidades) || mensualidades.length === 0) {
            return res.status(400).json({
                data: false,
                message: 'Se requiere un array de mensualidades',
                error: true
            });
        }

        const resumenValidacion = [];
        let todosDisponibles = true;

        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            const validacion = await CuposValidationService.validarCuposMensualidad(mensualidad, alumno_id);
            
            resumenValidacion.push({
                mensualidad_index: i + 1,
                periodo: `${mensualidad.fecha_inicio} - ${mensualidad.fecha_fin}`,
                validacion: validacion
            });

            if (!validacion.todos_disponibles) {
                todosDisponibles = false;
            }
        }

        res.status(200).json({
            data: {
                todos_disponibles: todosDisponibles,
                validaciones: resumenValidacion,
                puede_proceder: todosDisponibles
            },
            message: todosDisponibles 
                ? 'Todos los cupos están disponibles'
                : 'Algunos cupos no están disponibles',
            error: false
        });

    } catch (error) {
        console.error('Error al validar disponibilidad de cupos:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al validar disponibilidad',
            error: error.message
        });
    }
};

// Obtener disponibilidad de cupos para interfaz
export const getDisponibilidadCuposUI = async (req, res) => {
    try {
        const { horarios_ids, year, mes, alumnoId } = req.query;

        console.log("AlumnoId: ", alumnoId);

        if (!horarios_ids || !year || !mes) {
            return res.status(400).json({
                data: false,
                message: 'Se requieren horarios_ids, year y mes',
                error: true
            });
        }

        const horariosArray = Array.isArray(horarios_ids) 
            ? horarios_ids.map(id => parseInt(id))
            : horarios_ids.split(',').map(id => parseInt(id));

        const disponibilidad = await CuposValidationService.getDisponibilidadParaUI(
            horariosArray, 
            parseInt(year), 
            parseInt(mes),
            alumnoId ? parseInt(alumnoId) : null
        );

        res.status(200).json({
            data: disponibilidad,
            message: 'Disponibilidad de cupos obtenida correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad para UI:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad',
            error: error.message
        });
    }
};

// === RESTO DE CONTROLADORES (sin cambios) ===

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

// === CONTROLADORES DE TRANSACCIONES ===

// Obtener todas las transacciones de inscripciones y mensualidades
export const getAllTransacciones = async (req, res) => {
    try {

        const { tipo_usuario } = req.query;
        const { userId: user_id } = req.user || {};
        // console.log("user_id en getAllTransacciones: ", user_id);
        // console.log("Tipo usuario en getAllTransacciones: ", tipo_usuario);
        const transacciones = await transaccionesModel.getVentasInscripcionesYMensualidades({ tipo_usuario: tipo_usuario || null, user_id: user_id || null });

        if (transacciones.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No se encontraron transacciones',
                error: false
            });
        }

        // Formatear datos para el frontend
        const transaccionesFormatted = transacciones.map(transaccion => ({
            ...transaccion,
            cancelada: Boolean(transaccion.cancelada),
            fecha_transaccion: transaccion.fecha_transaccion ? 
                transaccion.fecha_transaccion.toISOString() : null,
            fecha_modificacion: transaccion.fecha_modificacion ? 
                transaccion.fecha_modificacion.toISOString() : null
        }));

        res.status(200).json({
            data: transaccionesFormatted,
            message: 'Transacciones obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener las transacciones',
            error: error.message
        });
    }
};

// Obtener detalles de una transacción específica
export const getDetallesTransaccion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de transacción inválido',
                error: true
            });
        }

        const detalles = await transaccionesModel.getDetallesTransaccion(id);

        if (detalles.length === 0) {
            return res.status(404).json({
                data: false,
                message: 'Transacción no encontrada',
                error: true
            });
        }

        res.status(200).json({
            data: detalles,
            message: 'Detalles obtenidos correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los detalles',
            error: error.message
        });
    }
};

// Obtener transacciones por alumno
export const getTransaccionesByAlumno = async (req, res) => {
    try {
        const { alumnoId } = req.params;

        if (!alumnoId || isNaN(Number(alumnoId))) {
            return res.status(400).json({
                data: false,
                message: 'ID de alumno inválido',
                error: true
            });
        }

        const transacciones = await transaccionesModel.getTransaccionesByAlumno(alumnoId);

        res.status(200).json({
            data: transacciones,
            message: 'Transacciones del alumno obtenidas correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener las transacciones del alumno',
            error: error.message
        });
    }
};

// Obtener estadísticas de ventas
export const getEstadisticasVentas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        // Validación de fechas si se proporcionan
        if (fechaInicio && !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
            return res.status(400).json({
                data: false,
                message: 'Fecha de inicio debe tener formato YYYY-MM-DD',
                error: true
            });
        }

        if (fechaFin && !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
            return res.status(400).json({
                data: false,
                message: 'Fecha de fin debe tener formato YYYY-MM-DD',
                error: true
            });
        }

        const estadisticas = await transaccionesModel.getEstadisticasVentas(fechaInicio, fechaFin);

        res.status(200).json({
            data: estadisticas,
            message: 'Estadísticas obtenidas correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener las estadísticas',
            error: error.message
        });
    }
};

// Obtener transacciones por rango de fechas
export const getTransaccionesByDateRange = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                data: false,
                message: 'Se requieren fechaInicio y fechaFin',
                error: true
            });
        }

        // Validación de formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
            return res.status(400).json({
                data: false,
                message: 'Las fechas deben tener formato YYYY-MM-DD',
                error: true
            });
        }

        const transacciones = await transaccionesModel.getTransaccionesByDateRange(fechaInicio, fechaFin);

        // Formatear fechas para el frontend
        const transaccionesFormatted = transacciones.map(transaccion => ({
            ...transaccion,
            cancelada: Boolean(transaccion.cancelada),
            fecha_transaccion: transaccion.fecha_transaccion ? 
                transaccion.fecha_transaccion.toISOString() : null
        }));

        res.status(200).json({
            data: transaccionesFormatted,
            message: 'Transacciones obtenidas correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener las transacciones',
            error: error.message
        });
    }
};

// Obtener transacciones por tipo (inscripcion, mensualidad, etc.)
export const getTransaccionesByTipo = async (req, res) => {
    try {
        const { tipo } = req.params;

        if (!tipo) {
            return res.status(400).json({
                data: false,
                message: 'Tipo de transacción requerido',
                error: true
            });
        }

        // Validar tipos permitidos
        const tiposPermitidos = ['inscripcion', 'mensualidad', 'inscripcion_mensualidades'];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                data: false,
                message: `Tipo de transacción inválido. Tipos permitidos: ${tiposPermitidos.join(', ')}`,
                error: true
            });
        }

        const transacciones = await transaccionesModel.getTransaccionesByTipo(tipo);

        // Formatear fechas para el frontend
        const transaccionesFormatted = transacciones.map(transaccion => ({
            ...transaccion,
            cancelada: Boolean(transaccion.cancelada),
            fecha_transaccion: transaccion.fecha_transaccion ? 
                transaccion.fecha_transaccion.toISOString() : null
        }));

        res.status(200).json({
            data: transaccionesFormatted,
            message: `Transacciones de ${tipo} obtenidas correctamente`,
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener las transacciones por tipo',
            error: error.message
        });
    }
};


// Cancelar transacción
export const cancelarTransaccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.body; 

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'ID de transacción inválido',
                error: true
            });
        }

        if (!usuario_id) {
            return res.status(400).json({
                data: false,
                message: 'Usuario requerido para cancelar transacción',
                error: true
            });
        }

        const resultado = await transaccionesModel.cancelarTransaccion(id, usuario_id);

        if (resultado.success) {
            res.status(200).json({
                data: resultado.data,
                message: resultado.message,
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: resultado.message,
                error: true
            });
        }

    } catch (error) {
        console.error('Error al cancelar transacción:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al cancelar la transacción',
            error: error.message
        });
    }
};

// Obtener ventas del día actual
export const getVentasDelDia = async (req, res) => {
    try {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const transacciones = await transaccionesModel.getTransaccionesByDateRange(fechaHoy, fechaHoy);

        // Calcular totales del día
        const totales = {
            total_ventas: transacciones.length,
            monto_total: transacciones.reduce((sum, t) => sum + parseFloat(t.monto_total || 0), 0),
            inscripciones: transacciones.filter(t => t.tipo_transaccion === 'inscripcion').length,
            mensualidades: transacciones.filter(t => t.tipo_transaccion === 'mensualidad').length,
            mixtas: transacciones.filter(t => t.tipo_transaccion === 'inscripcion_mensualidades').length
        };

        res.status(200).json({
            data: {
                transacciones,
                totales,
                fecha: fechaHoy
            },
            message: 'Ventas del día obtenidas correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener las ventas del día',
            error: error.message
        });
    }
};
