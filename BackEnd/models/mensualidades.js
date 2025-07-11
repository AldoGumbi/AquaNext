// models/mensualidades.js
import db from '../config/db.js';
import clasesService from '../services/clasesService.js';
import asistenciasService from '../services/asistenciasService.js';

class mensualidadesModel {

    // Crear mensualidades solas (requiere inscripción vigente)
    static async createMensualidadesSolas({ alumno_id, inscripcion_id, mensualidades, metodo_pago, usuario_id }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Calcular monto total
            let montoTotal = 0;
            for (const mensualidad of mensualidades) {
                montoTotal += parseFloat(mensualidad.monto_total);
            }

            // Generar folio único
            const folio = await this.generateFolio(connection);

            // Crear transacción
            const [transaccionResult] = await connection.query(`
                INSERT INTO transacciones (
                    folio,
                    tipo_transaccion,
                    monto_subtotal,
                    monto_total,
                    metodo_pago,
                    usuario_id,
                    alumno_id
                ) VALUES (?, 'mensualidad', ?, ?, ?, ?, ?)
            `, [folio, montoTotal, montoTotal, metodo_pago, usuario_id, alumno_id]);

            const transaccionId = transaccionResult.insertId;

            // Crear mensualidades
            const mensualidadesCreadas = await this.createMensualidadesInternas(
                connection,
                inscripcion_id,
                alumno_id,
                mensualidades,
                transaccionId
            );

            await connection.commit();

            return {
                transaccion_id: transaccionId,
                folio,
                mensualidades_creadas: mensualidadesCreadas,
                monto_total: montoTotal
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Método interno para crear mensualidades (usado por inscripciones y mensualidades solas)
    static async createMensualidadesInternas(connection, inscripcion_id, alumno_id, mensualidades, transaccion_id) {
        const mensualidadesCreadas = [];

        for (const mensualidad of mensualidades) {
            const fechaInicio = new Date(mensualidad.fecha_inicio);
            const fechaFin = new Date(mensualidad.fecha_fin);
            const mes = fechaInicio.getMonth() + 1;
            const year = fechaInicio.getFullYear();

            // Crear mensualidad principal
            const [mensualidadResult] = await connection.query(`
                INSERT INTO mensualidades (
                    inscripcion_id,
                    mes,
                    year,
                    fecha_inicio,
                    fecha_fin,
                    monto_total,
                    monto_pagado,
                    descuento_aplicado,
                    metodo_pago,
                    pagada,
                    fecha_pago
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
            `, [
                inscripcion_id,
                mes,
                year,
                mensualidad.fecha_inicio,
                mensualidad.fecha_fin,
                mensualidad.monto_total,
                mensualidad.monto_total,
                mensualidad.descuento_aplicado || 0,
                mensualidad.metodo_pago || 'efectivo'
            ]);

            const mensualidadId = mensualidadResult.insertId;

            // Crear detalle de transacción
            await connection.query(`
                INSERT INTO transaccion_detalles (
                    transaccion_id,
                    concepto,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    descuento,
                    total,
                    referencia_id,
                    referencia_tipo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                transaccion_id,
                `Mensualidad ${this.getMonthName(mes)} ${year}`,
                1,
                mensualidad.monto_total,
                mensualidad.monto_total,
                mensualidad.descuento_aplicado || 0,
                mensualidad.monto_total,
                mensualidadId,
                'mensualidad'
            ]);

            // Procesar grupos y horarios
            for (const grupo of mensualidad.grupos) {
                for (const horario of grupo.horarios) {
                    // Registrar relación mensualidad-grupo-horario
                    await connection.query(`
                        INSERT INTO mensualidad_grupos (
                            mensualidad_id,
                            grupo_id,
                            horario_id
                        ) VALUES (?, ?, ?)
                    `, [mensualidadId, grupo.grupo_id, horario.horario_id]);

                    // Generar clases para el período
                    const clasesGeneradas = await clasesService.generarClasesParaPeriodo(
                        connection,
                        horario.horario_id,
                        mensualidad.fecha_inicio,
                        mensualidad.fecha_fin
                    );

                    // Crear registros de asistencia para cada clase
                    for (const claseId of clasesGeneradas) {
                        await asistenciasService.crearRegistroAsistencia(
                            connection,
                            alumno_id,
                            claseId,
                            mensualidadId
                        );
                    }
                }
            }

            mensualidadesCreadas.push({
                mensualidad_id: mensualidadId,
                mes,
                year,
                monto: mensualidad.monto_total,
                grupos: mensualidad.grupos
            });
        }

        return mensualidadesCreadas;
    }

    // Obtener mensualidades por alumno
    static async getByAlumno(alumno_id, filters = {}) {
        try {
            let whereClause = 'WHERE m.inscripcion_id IN (SELECT id FROM inscripciones WHERE alumno_id = ?)';
            let params = [alumno_id];

            if (filters.year) {
                whereClause += ' AND m.year = ?';
                params.push(filters.year);
            }

            if (filters.mes) {
                whereClause += ' AND m.mes = ?';
                params.push(filters.mes);
            }

            if (!filters.incluir_canceladas) {
                whereClause += ' AND m.pagada = 1';
            }

            const [rows] = await db.query(`
                SELECT 
                    m.*,
                    i.alumno_id,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    CASE 
                        WHEN m.pagada = 1 AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin THEN 'ACTIVA'
                        WHEN m.pagada = 1 AND CURDATE() > m.fecha_fin THEN 'FINALIZADA'
                        WHEN m.pagada = 1 AND CURDATE() < m.fecha_inicio THEN 'PENDIENTE'
                        ELSE 'CANCELADA'
                    END as estado_mensualidad
                FROM mensualidades m
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                ${whereClause}
                ORDER BY m.year DESC, m.mes DESC, m.created_at DESC
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
                        CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                    FROM mensualidad_grupos mg
                    INNER JOIN grupos g ON mg.grupo_id = g.id
                    INNER JOIN horarios h ON mg.horario_id = h.id
                    LEFT JOIN profesores p ON h.profesor_id = p.id
                    WHERE mg.mensualidad_id = ?
                    ORDER BY 
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

    // Obtener mensualidades por inscripción
    static async getByInscripcion(inscripcion_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    m.*,
                    CASE 
                        WHEN m.pagada = 1 AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin THEN 'ACTIVA'
                        WHEN m.pagada = 1 AND CURDATE() > m.fecha_fin THEN 'FINALIZADA'
                        WHEN m.pagada = 1 AND CURDATE() < m.fecha_inicio THEN 'PENDIENTE'
                        ELSE 'CANCELADA'
                    END as estado_mensualidad
                FROM mensualidades m
                WHERE m.inscripcion_id = ?
                ORDER BY m.year DESC, m.mes DESC
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
                        CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                    FROM mensualidad_grupos mg
                    INNER JOIN grupos g ON mg.grupo_id = g.id
                    INNER JOIN horarios h ON mg.horario_id = h.id
                    LEFT JOIN profesores p ON h.profesor_id = p.id
                    WHERE mg.mensualidad_id = ?
                `, [mensualidad.id]);

                mensualidad.grupos = grupos;
            }

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Cancelar mensualidad
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

    // Generar folio único
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

    // Obtener nombre del mes
    static getMonthName(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || 'Mes desconocido';
    }

    // Verificar mensualidades duplicadas
    static async verificarDuplicada(inscripcion_id, mes, year) {
        try {
            const [rows] = await db.query(`
                SELECT id
                FROM mensualidades
                WHERE inscripcion_id = ? 
                AND mes = ? 
                AND year = ?
                AND pagada = 1
                LIMIT 1
            `, [inscripcion_id, mes, year]);

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de mensualidades
    static async getEstadisticas(year = null) {
        try {
            const currentYear = year || new Date().getFullYear();

            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_mensualidades,
                    SUM(CASE WHEN pagada = 1 THEN 1 ELSE 0 END) as mensualidades_pagadas,
                    SUM(CASE WHEN pagada = 0 THEN 1 ELSE 0 END) as mensualidades_canceladas,
                    SUM(CASE WHEN pagada = 1 AND CURDATE() BETWEEN fecha_inicio AND fecha_fin THEN 1 ELSE 0 END) as mensualidades_activas,
                    SUM(monto_total) as ingresos_total_mensualidades,
                    AVG(monto_total) as promedio_monto_mensualidad
                FROM mensualidades
                WHERE year = ?
            `, [currentYear]);

            const [monthlyStats] = await db.query(`
                SELECT 
                    mes,
                    COUNT(*) as mensualidades_mes,
                    SUM(monto_total) as ingresos_mes
                FROM mensualidades
                WHERE year = ? AND pagada = 1
                GROUP BY mes
                ORDER BY mes
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

    // Obtener mensualidades activas por grupo
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
                AND m.pagada = 1
                AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                ORDER BY a.apellido_paterno, a.nombre
            `, [grupo_id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener mensualidades próximas a vencer
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
                WHERE m.pagada = 1
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
}

export default mensualidadesModel;