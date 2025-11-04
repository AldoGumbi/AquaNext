import alumnosModel from '../models/alumnos.js';
import MensualidadMovimientosModel from '../models/mensualidadMovimientos.js';
import clasesService from "../services/clasesService.js";
import db from "../config/db.js";
import asistenciasService from "../services/asistenciasService.js";
import saleModel from "../models/SaleModel.js";

export const insertAlumno = async (req, res) => {
    // IMPORTANTE: Se crea la connection a la base de datos
    const connection = await db.getConnection();
    try {
        // (1) Obtencion de datos del body
        if (!req.body?.general){
            return res.status(400).json({
                message:'No se recibio los paremetros necesarios para crear el alumno.',
                error: true
            })
        }
        // obtener datos del body
        const data = req.body;
        let transaccion = null;

        console.log(data)


        // (1.1) Validar que todos los campos en data.general estén llenos (no nulos, no undefined)
        const todosLlenos = Object.values(data.general).every(val => val !== null && val !== undefined /**&& val !== ''**/);
        if (!todosLlenos) {
            return res.status(400).json({
                message:'La información general del alumno es incompleta.',
                error: true
            })
        }

        // (1.2) Formatear domicilio como cadena separadas de comas
        const domicilioFormat = Object.values(data.domicilio)
        .map(val => val?.trim())          // limpia espacios
        .filter(val => val)               // elimina nulos, undefined, ""
        .join(', ');
        // (1.3) Formatear fecha a formato YYYY-MM-DD
        const fechaFormatted = new Date(data.general.dateOfBirth).toISOString().split('T')[0];
        // (1.4) Foto (opcional)
        const foto = data?.foto || "";


        await connection.beginTransaction();

        // (2) Creacion del alumno en la base de datos
        const alumno = {
            nombre: data.general.firstName,
            apellido_paterno:data.general.lastNamePaternal,
            apellido_materno: data.general.lastNameMaternal,
            email:data.general.email,
            telefono: data.general.phone,
            telefono_emergencia: data.general.emergencyPhone,
            fecha_nacimiento: fechaFormatted,
            domicilio: domicilioFormat,
            tipo: data.general?.studentType, // REGULAR = ALUMNO CON MENSUALIDADES, PRUEBA = ALUMNO EN PRUEBA
            estatus: 'inactivo',
            foto: foto, 
        }

        let horarioId = null;
        let fechaClase = null;

        if(data?.general?.studentType === 'prueba'){
            horarioId = data?.general?.trialClass?.scheduleId;
            fechaClase = data?.general?.trialClass?.trialDate;
            // (3.2) Validar que horarioId y fechaClase existan
            if(!horarioId || !fechaClase){
                await connection.rollback();
                return res.status(400).json({
                    data:false,
                    message: 'Error: Informacion de clase de prueba incompleta',
                    error: true
                });
            }
        }

        const id = await alumnosModel.crearAlumno(connection,alumno);

        // (3) En caso que el alumno sea de prueba tenemos que
        // - llamar al servicio de clase por periodo
        // - crear la asistencia del alumno con la clase por periodo
        // - generar la transaccion de prueba gratis
        if(data?.general?.studentType === 'prueba'){


            // (3.3) Generar las clases para el periodo (si no existen)
            const claseId = await clasesService.generarClasesParaPeriodo(connection,horarioId,fechaClase,fechaClase);

            if(claseId.length === 0){
                await connection.rollback();
                return res.status(400).json({
                    data:false,
                    message: 'No se genero la clase, puede que la fecha no coincida con el horario seleccionado.',
                    error: true
                });
            }


            // (3.4) Crear la asistencia del alumno con la clase generada
            const asitenciaId = await asistenciasService.crearRegistroAsistencia(connection,id,claseId,null,1);

            // (3.5) se crea el detalle de prueba de alumno
            const pruebaAlumno = await alumnosModel.crearDetallesAlumnoPrueba(connection,id,claseId);
            const transacciones = {
                subTotal : data?.general?.transacction?.amount || 0,
                totalAmount : data?.general?.transacction?.amount || 0,
                user_id : data?.general?.transacction?.user_id || null,
                cashRegisterId : data?.general?.transacction?.cashRegisterId || null,
            };
            const transactionDetails = {
                concepto : 'Clase de prueba gratis',
                cantidad : 1,
                precio_unitario : data?.general?.transacction?.amount || 0,
                total : data?.general?.transacction?.amount || 0,
                referencia_id : claseId // clase de prueba
            }

            // (3.6) Crear la transaccion de prueba gratis asociada a la caja registradora abierta
            transaccion = await saleModel.venderClasePrueba(connection,transacciones,transactionDetails, id)


            console.log("clase: ",claseId);
            console.log("asistencia: ",asitenciaId);
            console.log("Prueba alumno: ",pruebaAlumno);
            console.log("Transaccion: ",transaccion);
        }

        await connection.commit();

        res.status(201).json({
            data: {
                transaccion_id : transaccion?.transactionId || null,
                alumno_id: id
            },
            message: 'Alumno creado correctamente',
            id: id
        });

    } catch(error) {
        await connection.rollback();
        console.log(error);
        res.status(500).json({
            data:false,
            message: 'Ocurrio un error al crear al alumno',
            error: error.message
        });
    }finally {
        connection.release();
    }
}

export const getAllAlumnos = async (req, res) => {
    try {
        const alumnos = await alumnosModel.getAll();
        
        if (alumnos.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No se encontraron alumnos',
                error: false
            });
        }

        // Formatear datos para el frontend
        const alumnosFormatted = alumnos.map(alumno => ({
            ...alumno,
            firma: Boolean(alumno.firma), // Convertir a boolean para el frontend
            fecha_nacimiento: alumno.fecha_nacimiento ? 
                alumno.fecha_nacimiento.toISOString().split('T')[0] : null
        }));

        res.status(200).json({
            data: alumnosFormatted,
            message: 'Alumnos obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los alumnos',
            error: error.message
        });
    }
};

export const getActiveAlumnos = async (req, res) => {
    try {
        const alumnos = await alumnosModel.getActiveAlumnos();
        
        if (alumnos.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No se encontraron alumnos',
                error: false
            });
        }

        // Formatear datos para el frontend
        const alumnosFormatted = alumnos.map(alumno => ({
            ...alumno,
            firma: Boolean(alumno.firma), // Convertir a boolean para el frontend
            fecha_nacimiento: alumno.fecha_nacimiento ? 
                alumno.fecha_nacimiento.toISOString().split('T')[0] : null
        }));

        res.status(200).json({
            data: alumnosFormatted,
            message: 'Alumnos obtenidos correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los alumnos',
            error: error.message
        });
    }
};

export const updateAlumno = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación del ID
        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Es necesario el ID del alumno a modificar',
                error: true
            });
        }

        const {
            tipo_alumno,
            nombre,
            apellido_paterno,
            apellido_materno,
            fecha_nacimiento,
            domicilio,
            email,
            telefono,
            telefono_emergencia,
            foto,
            estatus,
            firma
        } = req.body;

        // Validaciones básicas
        if (!nombre || !apellido_paterno) {
            return res.status(400).json({
                data: false,
                message: 'Nombre y apellido paterno son requeridos',
                error: true
            });
        }

        // Formatear fecha si existe
        let fechaFormatted = null;
        if (fecha_nacimiento) {
            fechaFormatted = new Date(fecha_nacimiento).toISOString().split('T')[0];
        }

        const updatedAlumno = {
            tipo_alumno: tipo_alumno || 'regular',
            nombre: nombre.trim(),
            apellido_paterno: apellido_paterno.trim(),
            apellido_materno: apellido_materno?.trim() || null,
            fecha_nacimiento: fechaFormatted,
            domicilio: domicilio?.trim() || null,
            email: email?.trim() || null,
            telefono: telefono?.trim() || null,
            telefono_emergencia: telefono_emergencia?.trim() || null,
            foto: foto || null,
            estatus: estatus || 'activo',
            firma: firma ? 1 : 0
        };

        // Llamar al modelo para actualizar con validaciones
        const resultado = await alumnosModel.update(id, updatedAlumno);
        
        if (resultado.success) {
            // Respuesta exitosa con detalles de cancelación si aplica
            const response = {
                data: true,
                message: 'Alumno actualizado correctamente',
                error: false
            };

            if (resultado.detalles_cancelacion) {
                response.detalles_cancelacion = resultado.detalles_cancelacion;
            }

            res.status(200).json(response);
        } else {
            // Manejar diferentes tipos de errores
            if (resultado.error_code === 'CAMBIO_ACTIVO_NO_PERMITIDO') {
                return res.status(400).json({
                    data: false,
                    message: resultado.message,
                    error: true,
                    error_code: resultado.error_code,
                    tipo_error: 'PETO__CAMBIO_ACTIVO_ALUMNO'
                });
            }

            // Error genérico (alumno no encontrado, etc.)
            res.status(404).json({
                data: false,
                message: resultado.message || 'Alumno no encontrado',
                error: true
            });
        }

    } catch (error) {
        console.error('Error al actualizar alumno:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al actualizar el alumno',
            error: error.message
        });
    }
};

export const deleteAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Es necesario el ID del alumno a eliminar',
                error: true
            });
        }

        const isDeleted = await alumnosModel.delete(id);
        
        if (isDeleted) {
            res.status(200).json({
                data: true,
                message: 'Alumno eliminado correctamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Alumno no encontrado',
                error: true
            });
        }

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al eliminar el alumno',
            error: error.message
        });
    }
};

// Obtener información completa de un alumno por ID
export const getAlumnoById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID del alumno inválido'
            });
        }

        const alumno = await alumnosModel.getById(id);

        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        // Formatear datos para el frontend
        const alumnoFormatted = {
            ...alumno,
            firma: Boolean(alumno.firma),
            fecha_nacimiento: alumno.fecha_nacimiento ? 
                alumno.fecha_nacimiento.toISOString().split('T')[0] : null
        };

        res.status(200).json({
            success: true,
            data: alumnoFormatted
        });

    } catch (error) {
        console.error('Error al obtener alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener inscripciones y mensualidades del alumno
// alumnoController.js
export const getInscripcionesMensualidadesAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            incluir_canceladas = 'false',
            incluir_historial_movimientos = 'true'
        } = req.query;

        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID del alumno inválido'
            });
        }

        const incluirCanceladas = incluir_canceladas === 'true';
        const incluirHistorial = incluir_historial_movimientos === 'true';
        
        const inscripciones = await alumnosModel.getInscripcionesMensualidadesByAlumno(id, incluirCanceladas);

        // Para cada inscripción, obtener sus mensualidades
        const inscripcionesConMensualidades = await Promise.all(
            inscripciones.map(async (inscripcion) => {
                const mensualidades = await alumnosModel.getMensualidadesByInscripcion(inscripcion.id);
                
                // Si se solicita, obtener historial para cada mensualidad
                let mensualidadesConHistorial = mensualidades;
                if (incluirHistorial) {
                    mensualidadesConHistorial = await Promise.all(
                        mensualidades.map(async (mensualidad) => {
                            const historial = await MensualidadMovimientosModel.getHistorialMovimientos(mensualidad.id);
                            return {
                                ...mensualidad,
                                historial_movimientos: historial || []
                            };
                        })
                    );
                }
                
                return {
                    ...inscripcion,
                    mensualidades: mensualidadesConHistorial
                };
            })
        );

        res.status(200).json({
            success: true,
            data: inscripcionesConMensualidades
        });

    } catch (error) {
        console.error('Error al obtener inscripciones y mensualidades:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener asistencias del alumno
export const getAsistenciasAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            year = new Date().getFullYear(), 
            mes = null,
            inscripcion_id = null,
            mensualidad_id = null,
            incluir_historial_movimientos = 'true' 
        } = req.query;

        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID del alumno inválido'
            });
        }

        const filters = {
            year: parseInt(year),
            mes: mes ? parseInt(mes) : null,
            inscripcion_id: inscripcion_id ? parseInt(inscripcion_id) : null,
            mensualidad_id: mensualidad_id ? parseInt(mensualidad_id) : null,
            incluir_historial_movimientos: incluir_historial_movimientos === 'true'
        };

        const asistencias = await alumnosModel.getAsistenciasByAlumno(id, filters);
        const estadisticas = await alumnosModel.getEstadisticasAsistenciasByAlumno(id, filters);

        res.status(200).json({
            success: true,
            data: {
                asistencias,
                estadisticas
            }
        });

    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener resumen completo del alumno
export const getResumenCompleto = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID del alumno inválido'
            });
        }

        // Verificar que el alumno existe
        const alumno = await alumnosModel.getById(id);
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        const resumenGeneral = await alumnosModel.getResumenGeneralByAlumno(id);

        res.status(200).json({
            success: true,
            data: resumenGeneral
        });

    } catch (error) {
        console.error('Error al obtener resumen completo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener alumnos con información de mensualidades para movimiento
 * Optimizado para evitar múltiples llamadas API
 */
export const getAlumnosConMensualidades = async (req, res) => {
    try {
        const { 
            search = null,
            limit = 50,
            incluir_sin_mensualidades = 'true'
        } = req.query;

        // Validar limit
        const limitNumber = parseInt(limit);
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro limit debe ser un número entre 1 y 100',
                error: true
            });
        }

        const filters = {
            search: search?.trim() || null,
            limit: limitNumber,
            incluir_sin_mensualidades: incluir_sin_mensualidades === 'true'
        };

        const alumnos = await alumnosModel.getAlumnosConMensualidades(filters);

        console.log(`Alumnos obtenidos: ${alumnos.length}`);

        // Formatear respuesta para el frontend
        const alumnosFormatted = alumnos.map(alumno => {
            const infoMensualidades = alumno.info_mensualidades || { tiene_mensualidades: false };
            
            return {
                id: alumno.id,
                tipo_alumno: alumno.tipo_alumno,
                nombre: alumno.nombre,
                apellido_paterno: alumno.apellido_paterno,
                apellido_materno: alumno.apellido_materno,
                fecha_nacimiento: alumno.fecha_nacimiento,
                email: alumno.email,
                telefono: alumno.telefono,
                telefono_emergencia: alumno.telefono_emergencia,
                estatus: alumno.estatus,
                fecha_creacion: alumno.fecha_creacion,
                foto: alumno.foto,
                
                // Información procesada de mensualidades
                tiene_mensualidades_activas: infoMensualidades.tiene_mensualidades || false,
                cantidad_mensualidades: infoMensualidades.cantidad || 0,
                proxima_expiracion: infoMensualidades.proxima_expiracion || null,
                dias_hasta_expiracion: infoMensualidades.dias_hasta_expiracion || null,
                expiracion_urgente: infoMensualidades.expiracion_urgente || false,
                mensualidades_activas: infoMensualidades.mensualidades || [],
                
                // Flag para errores de procesamiento
                error_mensualidades: infoMensualidades.error || false
            };
        });

        // Calcular estadísticas de la consulta
        const totalAlumnos = alumnosFormatted.length;
        const alumnosConMensualidades = alumnosFormatted.filter(a => a.tiene_mensualidades_activas).length;
        const alumnosSinMensualidades = totalAlumnos - alumnosConMensualidades;
        const alumnosConExpiracionUrgente = alumnosFormatted.filter(a => a.expiracion_urgente).length;

        res.status(200).json({
            success: true,
            data: alumnosFormatted,
            metadata: {
                total_alumnos: totalAlumnos,
                con_mensualidades: alumnosConMensualidades,
                sin_mensualidades: alumnosSinMensualidades,
                expiracion_urgente: alumnosConExpiracionUrgente,
                limite_aplicado: limitNumber,
                busqueda_aplicada: !!filters.search
            },
            message: `Se obtuvieron ${totalAlumnos} alumnos con información de mensualidades`,
            error: false
        });

    } catch (error) {
        console.error('Error al obtener alumnos con mensualidades para movimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener alumnos con información de mensualidades',
            error: error.message
        });
    }
};


export const getFreeTrialStudents = async (req, res) => {
    try {
        const alumnos = await alumnosModel.getAllFreeTrial();

        if (alumnos.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No se encontraron alumnos de prueba',
                error: false
            });
        }

        // Formatear datos para el frontend
        const alumnosFormatted = alumnos.map(alumno => ({
            ...alumno,
            firma: Boolean(alumno.firma), // Convertir a boolean para el frontend
            fecha_nacimiento: alumno.fecha_nacimiento ?
                alumno.fecha_nacimiento.toISOString().split('T')[0] : null
        }));

        res.status(200).json({
            data: alumnosFormatted,
            message: 'Alumnos de prueba obtenidos correctamente',
            error: false
        });

    } catch (error) {
        console.log("Error al obtener todos los alumnos: ",error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los alumnos de prueba',
            error: error.message
        });
    }
}

export const ConvertFreeTrialToRegular = async (req, res) => {
    try {
        const {id} = req.params;

        // Validación del ID
        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Es necesario el ID del alumno a modificar',
                error: true
            });
        }
        const update = await alumnosModel.convertToRegular(id);

        console.log("alumnos: ", update);
        if(update){
            return res.status(200).json({
                data: true,
                message: 'Alumno convertido a regular correctamente',
                error: false
            });
        }

        res.status(400).json({
            data: false,
            message: 'Alumno no encontrado o no es de prueba',
            error: true
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            data: false,
            message: 'Error interno al convertir el alumno de prueba a regular',
            error: error.message
        });
    }
}
