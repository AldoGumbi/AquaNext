// models/mensualidades.js - Optimizado
import db from '../config/db.js';
import clasesService from '../services/clasesService.js';
import asistenciasService from '../services/asistenciasService.js';
import alumnosModel from './alumnos.js';
import couponsModel from './discountCoupons.js';
import { DateTime } from 'luxon';

class mensualidadesModel {

    // Crear mensualidades solas (requiere inscripción vigente)
    static async createMensualidadesSolas({ alumno_id, inscripcion_id, mensualidades, metodo_pago, usuario_id, cash_register_id, monto_subtotal, monto_total }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Generar folio único
            const folio = await this.generateFolio(connection);

            // Crear transacción
            const [transaccionResult] = await connection.query(`
                INSERT INTO transacciones (
                    folio,
                    tipo_transaccion,
                    monto_subtotal,
                    monto_total,
                    monto_descuento,
                    metodo_pago,
                    usuario_id,
                    caja_registradora_id,
                    alumno_id
                ) VALUES (?, 'mensualidad', ?, ?, ?, ?, ?, ?, ?)
            `, [folio, monto_subtotal, monto_total, monto_subtotal - monto_total, metodo_pago, usuario_id, cash_register_id, alumno_id]);

            const transaccionId = transaccionResult.insertId;

            // Crear mensualidades
            const mensualidadesCreadas = await this.createMensualidadesInternas(
                connection,
                inscripcion_id,
                alumno_id,
                mensualidades,
                transaccionId
            );

            // Activar al alumno después de crear mensualidades exitosamente
            await alumnosModel.activarAlumnoPorMensualidad(connection, alumno_id);

            await connection.commit();

            return {
                transaccion_id: transaccionId,
                folio,
                mensualidades_creadas: mensualidadesCreadas,
                monto_total: monto_total
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Método createMensualidadesInternas
    static async createMensualidadesInternas(connection, inscripcion_id, alumno_id, mensualidades, transaccion_id, user_id) {
        const mensualidadesCreadas = [];

        const mensualidadesData = [];
        const detallesTransaccionData = [];

        for (const mensualidad of mensualidades) {
            console.log("Procesando mensualidad:", mensualidad);
            const fechaInicio = DateTime.fromISO(mensualidad.fecha_inicio);
            const fechaFin = DateTime.fromISO(mensualidad.fecha_fin);

            mensualidadesData.push([
                inscripcion_id,
                fechaInicio.toISODate(),
                fechaFin.toISODate(),
                mensualidad.monto_total,
                Number(mensualidad.monto_total) - (mensualidad.descuento_aplicado ? Number(mensualidad.descuento_aplicado) : 0),
                mensualidad.descuento_aplicado || 0,
                mensualidad.metodo_pago || 'efectivo',
                mensualidad.cupon_id || null 
            ]);

            // Para el detalle de transacción, usar mes/año de inicio como referencia
            const mes = fechaInicio.month;
            const year = fechaInicio.year;
            detallesTransaccionData.push([
                transaccion_id,
                `Mensualidad ${this.getMonthName(mes)} ${year}`,
                1,
                mensualidad.monto_total,
                mensualidad.monto_total,
                mensualidad.descuento_aplicado || 0,
                Number(mensualidad.monto_total) - (mensualidad.descuento_aplicado ? Number(mensualidad.descuento_aplicado) : 0),
            ]);
        }

        const placeholdersMensualidades = mensualidadesData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
        const flatValuesMensualidades = mensualidadesData.flat();

        const [mensualidadesResult] = await connection.query(`
            INSERT INTO mensualidades (
                inscripcion_id, fecha_inicio, fecha_fin,
                monto_total, monto_pagado, descuento_aplicado, metodo_pago, cupon_id
            ) VALUES ${placeholdersMensualidades}
        `, flatValuesMensualidades);

        const firstMensualidadId = mensualidadesResult.insertId;

        // Procesar cupones de descuento si existen
        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            const mensualidadId = firstMensualidadId + i;
            
            // Redimir cupón si existe
            if (mensualidad.cupon_id && mensualidad.descuento_aplicado > 0) {
                try {
                    await couponsModel.RedeemCoupon(
                        connection,
                        mensualidad.cupon_id,
                        transaccion_id,
                        (user_id || null),
                        mensualidad.descuento_aplicado,
                    );
                    console.log(`Cupón ${mensualidad.cupon_id} redimido exitosamente para mensualidad ${mensualidadId}`);
                } catch (error) {
                    console.error(`Error al redimir cupón ${mensualidad.cupon_id}:`, error);
                    throw new Error(`Error al redimir cupón de descuento: ${error.message}`);
                }
            }
        }


        // Insertar detalles de transacción
        const detallesCompletos = detallesTransaccionData.map((detalle, index) => [
            ...detalle,
            firstMensualidadId + index,
            'mensualidad'
        ]);

        const placeholdersDetalles = detallesCompletos.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
        const flatValuesDetalles = detallesCompletos.flat();

        await connection.query(`
            INSERT INTO transaccion_detalles (
                transaccion_id, concepto, cantidad, precio_unitario,
                subtotal, descuento, total, referencia_id, referencia_tipo
            ) VALUES ${placeholdersDetalles}
        `, flatValuesDetalles);

        // Procesar grupos y horarios por cada mes
        const gruposHorariosData = [];
        const todasLasClases = new Map();

        for (let i = 0; i < mensualidades.length; i++) {
            const mensualidad = mensualidades[i];
            const mensualidadId = firstMensualidadId + i;
            
            const fechaInicio = DateTime.fromISO(mensualidad.fecha_inicio);
            const fechaFin = DateTime.fromISO(mensualidad.fecha_fin);

            // Generar todos los meses que abarca esta mensualidad
            const mesesAbarcados = this.generarMesesEnPeriodo(fechaInicio, fechaFin);
            
            console.log(`Mensualidad ${mensualidadId} abarca meses:`, mesesAbarcados);

            for (const grupo of mensualidad.grupos) {
                for (const horario of grupo.horarios) {
                    // Crear un registro por cada mes que abarca
                    for (const mesInfo of mesesAbarcados) {
                        gruposHorariosData.push([
                            mensualidadId, 
                            grupo.grupo_id, 
                            horario.horario_id, 
                            mesInfo.mes, 
                            mesInfo.year
                        ]);
                    }

                    // Para clases, mantener lógica existente
                    const horarioKey = horario.horario_id;
                    if (!todasLasClases.has(horarioKey)) {
                        todasLasClases.set(horarioKey, {
                            horario_id: horario.horario_id,
                            periodos: [],
                            alumnos_mensualidades: []
                        });
                    }

                    todasLasClases.get(horarioKey).periodos.push({
                        fecha_inicio: mensualidad.fecha_inicio,
                        fecha_fin: mensualidad.fecha_fin
                    });

                    todasLasClases.get(horarioKey).alumnos_mensualidades.push({
                        alumno_id,
                        mensualidad_id: mensualidadId
                    });
                }
            }

            mensualidadesCreadas.push({
                mensualidad_id: mensualidadId,
                fecha_inicio: mensualidad.fecha_inicio,
                fecha_fin: mensualidad.fecha_fin,
                monto: mensualidad.monto_total,
                grupos: mensualidad.grupos,
                meses_abarcados: mesesAbarcados,
                descuento_aplicado: mensualidad.descuento_aplicado || 0,
                metodo_pago: mensualidad.metodo_pago || 'efectivo',
                cupon_id: mensualidad.cupon_id || null

            });
        }

        // CAMBIO: Insertar con mes y año
        if (gruposHorariosData.length > 0) {
            const placeholdersGrupos = gruposHorariosData.map(() => '(?, ?, ?, ?, ?)').join(',');
            const flatValuesGrupos = gruposHorariosData.flat();

            console.log('Insertando relaciones grupo-horario-mes:', gruposHorariosData.length);

            await connection.query(`
                INSERT INTO mensualidad_grupos (mensualidad_id, grupo_id, horario_id, mes, year) 
                VALUES ${placeholdersGrupos}
            `, flatValuesGrupos);
        }

        // Resto del código para clases y asistencias permanece igual...
        for (const [horarioId, datosHorario] of todasLasClases) {
            let fechaMinima = datosHorario.periodos[0].fecha_inicio;
            let fechaMaxima = datosHorario.periodos[0].fecha_fin;

            for (const periodo of datosHorario.periodos) {
                if (periodo.fecha_inicio < fechaMinima) fechaMinima = periodo.fecha_inicio;
                if (periodo.fecha_fin > fechaMaxima) fechaMaxima = periodo.fecha_fin;
            }

            const clasesGeneradas = await clasesService.generarClasesParaPeriodo(
                connection,
                horarioId,
                fechaMinima,
                fechaMaxima
            );

            for (const alumnoMensualidad of datosHorario.alumnos_mensualidades) {
                await asistenciasService.crearRegistrosAsistenciaEnLote(
                    connection,
                    alumnoMensualidad.alumno_id,
                    clasesGeneradas,
                    alumnoMensualidad.mensualidad_id
                );
            }
        }

        return mensualidadesCreadas;
    }

    /**
     * Obtiene una mensualidad específica por su ID
     * @param {number} mensualidad_id - ID de la mensualidad
     * @returns {Promise<Object|null>} Datos de la mensualidad o null si no existe
     */
    static async getById(mensualidad_id) {
        try {
            const [result] = await db.query(`
                SELECT 
                    m.*,
                    i.alumno_id,
                    i.fecha_inscripcion,
                    -- i.activo as inscripcion_activa,
                    a.nombre as alumno_nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    a.telefono as alumno_telefono,
                    a.email as alumno_email,
                    CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) as nombre_completo_alumno
                FROM mensualidades m
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE m.id = ? AND m.cancelada = 0
            `, [mensualidad_id]);

            if (result.length === 0) {
                return null;
            }

            const mensualidad = result[0];

            return mensualidad;

        } catch (error) {
            console.error('Error al obtener mensualidad por ID:', error);
            throw error;
        }
    }

    // Método getByAlumno
    static async getByAlumno(alumno_id, filters = {}) {
        try {
            let whereClause = 'WHERE m.inscripcion_id IN (SELECT id FROM inscripciones WHERE alumno_id = ?)';
            let params = [alumno_id];
            let havingClause = '';

            if (filters.year) {
                havingClause += havingClause ? ' AND ' : ' HAVING ';
                havingClause += 'FIND_IN_SET(?, GROUP_CONCAT(DISTINCT mg.year))';
                params.push(filters.year);
            }

            if (filters.mes) {
                havingClause += havingClause ? ' AND ' : ' HAVING ';
                havingClause += 'FIND_IN_SET(?, GROUP_CONCAT(DISTINCT mg.mes))';
                params.push(filters.mes);
            }

            if (!filters.incluir_canceladas) {
                whereClause += ' AND m.cancelada = 0';
            }

            const [rows] = await db.query(`
                SELECT 
                    m.*,
                    i.alumno_id,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    CASE 
                        WHEN m.cancelada = 0 AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin THEN 'ACTIVA'
                        WHEN m.cancelada = 0 AND CURDATE() > m.fecha_fin THEN 'FINALIZADA'
                        WHEN m.cancelada = 0 AND CURDATE() < m.fecha_inicio THEN 'PENDIENTE'
                        ELSE 'CANCELADA'
                    END as estado_mensualidad,
                    GROUP_CONCAT(DISTINCT CONCAT(mg.mes, '-', mg.year) ORDER BY mg.year, mg.mes) as meses_abarcados
                FROM mensualidades m
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                LEFT JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                ${whereClause}
                GROUP BY m.id
                ${havingClause}
                ORDER BY m.fecha_inicio DESC, m.created_at DESC
            `, params);

            // Obtener grupos para cada mensualidad 
            for (let mensualidad of rows) {
                const [grupos] = await db.query(`
                    SELECT 
                        mg.*,
                        g.codigo as grupo_codigo,
                        g.nombre as grupo_nombre,
                        g.tipo as grupo_tipo,
                        h.dia,
                        h.hora_inicio,
                        h.hora_fin,
                        CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor,
                        CONCAT(mg.mes, '-', mg.year) as periodo
                    FROM mensualidad_grupos mg
                    INNER JOIN grupos g ON mg.grupo_id = g.id
                    INNER JOIN horarios h ON mg.horario_id = h.id
                    LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                    WHERE mg.mensualidad_id = ?
                    ORDER BY mg.year, mg.mes,
                        CASE h.dia
                            WHEN 'lunes' THEN 1
                            WHEN 'martes' THEN 2
                            WHEN 'miercoles' THEN 3
                            WHEN 'jueves' THEN 4
                            WHEN 'viernes' THEN 5
                            WHEN 'sabado' THEN 6
                            WHEN 'domingo' THEN 7
                        END,
                        h.hora_inicio
                `, [mensualidad.id]);

                mensualidad.grupos = grupos;
            }

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // MODIFICACIÓN: Método getByInscripcion
    static async getByInscripcion(inscripcion_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    m.*,
                    CASE 
                        WHEN m.cancelada = 0 AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin THEN 'ACTIVA'
                        WHEN m.cancelada = 0 AND CURDATE() > m.fecha_fin THEN 'FINALIZADA'
                        WHEN m.cancelada = 0 AND CURDATE() < m.fecha_inicio THEN 'PENDIENTE'
                        ELSE 'CANCELADA'
                    END as estado_mensualidad,
                    GROUP_CONCAT(DISTINCT CONCAT(mg.mes, '-', mg.year) ORDER BY mg.year, mg.mes) as meses_abarcados
                FROM mensualidades m
                LEFT JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                WHERE m.inscripcion_id = ?
                GROUP BY m.id
                ORDER BY m.fecha_inicio DESC
            `, [inscripcion_id]);

            // Obtener grupos para cada mensualidad
            for (let mensualidad of rows) {
                const [grupos] = await db.query(`
                    SELECT 
                        mg.*,
                        g.codigo as grupo_codigo,
                        g.nombre as grupo_nombre,
                        g.tipo as grupo_tipo,
                        h.dia,
                        h.hora_inicio,
                        h.hora_fin,
                        CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor,
                        CONCAT(mg.mes, '-', mg.year) as periodo
                    FROM mensualidad_grupos mg
                    INNER JOIN grupos g ON mg.grupo_id = g.id
                    INNER JOIN horarios h ON mg.horario_id = h.id
                    LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                    WHERE mg.mensualidad_id = ?
                    ORDER BY mg.year, mg.mes, h.hora_inicio
                `, [mensualidad.id]);

                mensualidad.grupos = grupos;
            }

            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async cancelar(mensualidad_id, motivo = null) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar que la mensualidad existe y está activa
            const [mensualidad] = await connection.query(`
                SELECT * FROM mensualidades 
                WHERE id = ? AND pagada = 1
            `, [mensualidad_id]);

            if (mensualidad.length === 0) {
                await connection.rollback();
                return false;
            }

            const fechaInicio = new Date(mensualidad[0].fecha_inicio);
            const hoy = new Date();

            // Solo permitir cancelación si no ha empezado o está en los primeros 3 días
            if (hoy > fechaInicio) {
                const diasTranscurridos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
                if (diasTranscurridos > 3) {
                    await connection.rollback();
                    return { 
                        success: false, 
                        message: 'No se puede cancelar una mensualidad que ya lleva más de 3 días activa' 
                    };
                }
            }

            // Cancelar mensualidad
            await connection.query(`
                UPDATE mensualidades 
                SET pagada = 0,
                    updated_at = NOW()
                WHERE id = ?
            `, [mensualidad_id]);

            // Eliminar registros de asistencia futuros
            await connection.query(`
                DELETE a FROM asistencias a
                INNER JOIN clases c ON a.clase_id = c.id
                WHERE a.mensualidad_id = ? 
                AND c.fecha >= CURDATE()
                AND a.hora_entrada IS NULL
            `, [mensualidad_id]);

            await connection.commit();
            return { success: true, message: 'Mensualidad cancelada exitosamente' };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async generateFolio(connection) {
        const year = new Date().getFullYear();
        const [result] = await connection.query(`
            SELECT MAX(folio) as max_folio 
            FROM transacciones 
            WHERE YEAR(created_at) = ?
        `, [year]);

        const maxFolio = result[0].max_folio || (year * 10000);
        return maxFolio + 1;
    }

    static getMonthName(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || 'Mes desconocido';
    }

    // Método verificarDuplicada
    static async verificarDuplicada(inscripcion_id, mes, year) {
        try {
            const [rows] = await db.query(`
                SELECT DISTINCT m.id
                FROM mensualidades m
                INNER JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                WHERE m.inscripcion_id = ? 
                AND mg.mes = ? 
                AND mg.year = ?
                AND m.pagada = 1
                LIMIT 1
            `, [inscripcion_id, mes, year]);

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }


    // MODIFICACIÓN: Método getEstadisticas
    static async getEstadisticas(year = null) {
        try {
            const currentYear = year || new Date().getFullYear();

            // Estadísticas generales (basadas en fecha_inicio)
            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_mensualidades,
                    SUM(CASE WHEN pagada = 1 THEN 1 ELSE 0 END) as mensualidades_pagadas,
                    SUM(CASE WHEN cancelada = 1 THEN 1 ELSE 0 END) as mensualidades_canceladas,
                    SUM(CASE WHEN pagada = 1 AND CURDATE() BETWEEN fecha_inicio AND fecha_fin THEN 1 ELSE 0 END) as mensualidades_activas,
                    SUM(monto_total) as ingresos_total_mensualidades,
                    AVG(monto_total) as promedio_monto_mensualidad
                FROM mensualidades m
                WHERE YEAR(m.fecha_inicio) = ?
            `, [currentYear]);

            // Estadísticas por mes (basadas en mensualidad_grupos)
            const [monthlyStats] = await db.query(`
                SELECT 
                    mg.mes,
                    COUNT(DISTINCT m.id) as mensualidades_mes,
                    SUM(m.monto_total) as ingresos_mes
                FROM mensualidades m
                INNER JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                WHERE mg.year = ? AND m.pagada = 1
                GROUP BY mg.mes
                ORDER BY mg.mes
            `, [currentYear]);

            return {
                general: stats[0],
                por_mes: monthlyStats,
                year: currentYear
            };

        } catch (error) {
            throw error;
        }
    }

    static async getActivasByGrupo(grupo_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    m.*,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno
                FROM mensualidades m
                INNER JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE mg.grupo_id = ?
                AND m.cancelada = 0
                AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                ORDER BY a.apellido_paterno, a.nombre
            `, [grupo_id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getProximasAVencer(dias = 7) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    m.*,
                    i.alumno_id,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    a.telefono,
                    a.email,
                    DATEDIFF(m.fecha_fin, CURDATE()) as dias_restantes
                FROM mensualidades m
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE m.cancelada = 0
                AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                AND DATEDIFF(m.fecha_fin, CURDATE()) <= ?
                AND DATEDIFF(m.fecha_fin, CURDATE()) >= 0
                ORDER BY dias_restantes ASC
            `, [dias]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // NUEVO MÉTODO: Generar meses en un período
    static generarMesesEnPeriodo(fechaInicio, fechaFin) {
        const meses = [];
        let fechaActual = fechaInicio.startOf('month');
        const fechaFinMes = fechaFin.startOf('month');

        while (fechaActual <= fechaFinMes) {
            meses.push({
                mes: fechaActual.month,
                year: fechaActual.year
            });
            fechaActual = fechaActual.plus({ months: 1 });
        }

        return meses;
    }
}

export default mensualidadesModel;