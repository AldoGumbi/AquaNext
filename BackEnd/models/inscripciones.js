// models/inscripciones.js
import db from '../config/db.js';
import mensualidadesModel from './mensualidades.js';
import clasesService from '../services/clasesService.js';
import asistenciasService from '../services/asistenciasService.js';

class inscripcionesModel {

    // Crear inscripción sola (sin mensualidades)
    static async createInscripcionSola({ alumno_id, anos_inscripcion = 1, monto, metodo_pago, usuario_id, observaciones = null }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar si ya tiene inscripción vigente
            const inscripcionVigente = await this.getInscripcionVigenteInternal(connection, alumno_id);
            if (inscripcionVigente) {
                await connection.rollback();
                throw new Error('El alumno ya tiene una inscripción vigente');
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
                ) VALUES (?, 'inscripcion', ?, ?, ?, ?, ?)
            `, [folio, monto, monto, metodo_pago, usuario_id, alumno_id]);

            const transaccionId = transaccionResult.insertId;

            // Calcular fechas de inscripción
            const fechaInscripcion = new Date();
            const yearInscripcion = fechaInscripcion.getFullYear();
            const fechaFin = new Date(fechaInscripcion);
            fechaFin.setFullYear(fechaFin.getFullYear() + parseInt(anos_inscripcion));
            fechaFin.setDate(fechaFin.getDate() - 1); // Restar un día

            // Crear inscripción
            const [inscripcionResult] = await connection.query(`
                INSERT INTO inscripciones (
                    alumno_id,
                    fecha_inscripcion,
                    year_inscripcion,
                    fecha_fin,
                    anos_vigencia,
                    monto,
                    metodo_pago,
                    observaciones,
                    activa
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                alumno_id,
                fechaInscripcion.toISOString().split('T')[0],
                yearInscripcion,
                fechaFin.toISOString().split('T')[0],
                anos_inscripcion,
                monto,
                metodo_pago,
                observaciones
            ]);

            const inscripcionId = inscripcionResult.insertId;

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
                transaccionId,
                `Inscripción ${anos_inscripcion} año${anos_inscripcion > 1 ? 's' : ''} - ${yearInscripcion}`,
                1,
                monto,
                monto,
                0,
                monto,
                inscripcionId,
                'inscripcion'
            ]);

            await connection.commit();

            return {
                transaccion_id: transaccionId,
                inscripcion_id: inscripcionId,
                folio,
                monto_total: monto,
                fecha_inscripcion: fechaInscripcion.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
                anos_vigencia: anos_inscripcion
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Crear inscripción con mensualidades en una sola transacción
    static async createInscripcionConMensualidades({ alumno_id, inscripcion, mensualidades, metodo_pago, usuario_id }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar si ya tiene inscripción vigente
            const inscripcionVigente = await this.getInscripcionVigenteInternal(connection, alumno_id);
            if (inscripcionVigente) {
                await connection.rollback();
                throw new Error('El alumno ya tiene una inscripción vigente');
            }

            // Calcular monto total
            let montoTotal = parseFloat(inscripcion.monto || 0);
            for (const mensualidad of mensualidades) {
                montoTotal += parseFloat(mensualidad.monto_total);
            }

            // Generar folio único
            const folio = await this.generateFolio(connection);

            // Crear transacción principal
            const [transaccionResult] = await connection.query(`
                INSERT INTO transacciones (
                    folio,
                    tipo_transaccion,
                    monto_subtotal,
                    monto_total,
                    metodo_pago,
                    usuario_id,
                    alumno_id
                ) VALUES (?, 'mixta', ?, ?, ?, ?, ?)
            `, [folio, montoTotal, montoTotal, metodo_pago, usuario_id, alumno_id]);

            const transaccionId = transaccionResult.insertId;

            // Crear inscripción
            const fechaInscripcion = new Date();
            const yearInscripcion = fechaInscripcion.getFullYear();
            const anosInscripcion = parseInt(inscripcion.anos_inscripcion || 1);
            const fechaFin = new Date(fechaInscripcion);
            fechaFin.setFullYear(fechaFin.getFullYear() + anosInscripcion);
            fechaFin.setDate(fechaFin.getDate() - 1); // Restar un día


            const [inscripcionResult] = await connection.query(`
                INSERT INTO inscripciones (
                    alumno_id,
                    fecha_inscripcion,
                    year_inscripcion,
                    fecha_fin,
                    anos_vigencia,
                    monto,
                    metodo_pago,
                    observaciones,
                    activa
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                alumno_id,
                fechaInscripcion.toISOString().split('T')[0],
                yearInscripcion,
                fechaFin.toISOString().split('T')[0],
                anosInscripcion,
                inscripcion.monto,
                metodo_pago,
                inscripcion.observaciones || null
            ]);

            const inscripcionId = inscripcionResult.insertId;

            // Crear detalle de inscripción en transacción
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
                transaccionId,
                `Inscripción ${anosInscripcion} año${anosInscripcion > 1 ? 's' : ''} - ${yearInscripcion}`,
                1,
                inscripcion.monto,
                inscripcion.monto,
                0,
                inscripcion.monto,
                inscripcionId,
                'inscripcion'
            ]);

            // Crear mensualidades usando el método del modelo de mensualidades
            const mensualidadesCreadas = await mensualidadesModel.createMensualidadesInternas(
                connection,
                inscripcionId,
                alumno_id,
                mensualidades,
                transaccionId
            );

            await connection.commit();

            return {
                transaccion_id: transaccionId,
                inscripcion_id: inscripcionId,
                folio,
                monto_total: montoTotal,
                inscripcion: {
                    fecha_inscripcion: fechaInscripcion.toISOString().split('T')[0],
                    fecha_fin: fechaFin.toISOString().split('T')[0],
                    anos_vigencia: anosInscripcion,
                    monto: inscripcion.monto
                },
                mensualidades_creadas: mensualidadesCreadas
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener todas las inscripciones con filtros
    static async getAll({ page = 1, limit = 50, alumno_nombre = null, year = null } = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE i.activa = 1';
            let params = [];

            if (alumno_nombre) {
                whereClause += ` AND (a.nombre LIKE ? OR a.apellido_paterno LIKE ? OR a.apellido_materno LIKE ?)`;
                const searchTerm = `%${alumno_nombre}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (year) {
                whereClause += ` AND i.year_inscripcion = ?`;
                params.push(year);
            }

            // Agregar parámetros de paginación
            params.push(limit, offset);

            const [rows] = await db.query(`
                SELECT 
                    i.*,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    a.telefono,
                    a.email,
                    CASE 
                        WHEN i.activa = 1 AND CURDATE() <= i.fecha_fin THEN 'VIGENTE'
                        WHEN i.activa = 1 AND CURDATE() > i.fecha_fin THEN 'VENCIDA'
                        ELSE 'CANCELADA'
                    END as estado_inscripcion,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes
                FROM inscripciones i
                INNER JOIN alumnos a ON i.alumno_id = a.id
                ${whereClause}
                ORDER BY i.created_at DESC
                LIMIT ? OFFSET ?
            `, params);

            // Contar total para paginación
            const countParams = params.slice(0, -2); // Remover limit y offset
            const [countResult] = await db.query(`
                SELECT COUNT(*) as total
                FROM inscripciones i
                INNER JOIN alumnos a ON i.alumno_id = a.id
                ${whereClause}
            `, countParams);

            return {
                inscripciones: rows,
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(countResult[0].total / limit)
            };

        } catch (error) {
            throw error;
        }
    }

    // Obtener inscripciones por alumno
    static async getByAlumno(alumno_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    i.*,
                    CASE 
                        WHEN i.activa = 1 AND CURDATE() <= i.fecha_fin THEN 'VIGENTE'
                        WHEN i.activa = 1 AND CURDATE() > i.fecha_fin THEN 'VENCIDA'
                        ELSE 'CANCELADA'
                    END as estado_inscripcion,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes,
                    i.anos_vigencia
                FROM inscripciones i
                WHERE i.alumno_id = ?
                ORDER BY i.created_at DESC
            `, [alumno_id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener inscripción vigente para un alumno
    static async getInscripcionVigente(alumno_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    i.*,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes
                FROM inscripciones i
                WHERE i.alumno_id = ?
                AND i.activa = 1
                AND CURDATE() <= i.fecha_fin
                ORDER BY i.fecha_fin DESC
                LIMIT 1
            `, [alumno_id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Método interno para obtener inscripción vigente (usado en transacciones)
    static async getInscripcionVigenteInternal(connection, alumno_id) {
        try {
            const [rows] = await connection.query(`
                SELECT 
                    i.*,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes
                FROM inscripciones i
                WHERE i.alumno_id = ?
                AND i.activa = 1
                AND CURDATE() <= i.fecha_fin
                ORDER BY i.fecha_fin DESC
                LIMIT 1
            `, [alumno_id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener inscripción por ID
    static async getById(inscripcion_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    i.*,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    a.telefono,
                    a.email,
                    CASE 
                        WHEN i.activa = 1 AND CURDATE() <= i.fecha_fin THEN 'VIGENTE'
                        WHEN i.activa = 1 AND CURDATE() > i.fecha_fin THEN 'VENCIDA'
                        ELSE 'CANCELADA'
                    END as estado_inscripcion,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes
                FROM inscripciones i
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE i.id = ?
            `, [inscripcion_id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Cancelar inscripción
    static async cancelar(inscripcion_id, motivo = null) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar que la inscripción existe y está activa
            const [inscripcion] = await connection.query(`
                SELECT * FROM inscripciones 
                WHERE id = ? AND activa = 1
            `, [inscripcion_id]);

            if (inscripcion.length === 0) {
                await connection.rollback();
                return false;
            }

            // Cancelar inscripción
            await connection.query(`
                UPDATE inscripciones 
                SET activa = 0,
                    observaciones = CONCAT(
                        COALESCE(observaciones, ''), 
                        '\nInscripción cancelada el ', 
                        NOW(),
                        CASE WHEN ? IS NOT NULL THEN CONCAT('. Motivo: ', ?) ELSE '' END
                    )
                WHERE id = ?
            `, [motivo, motivo, inscripcion_id]);

            // Cancelar mensualidades activas asociadas
            await connection.query(`
                UPDATE mensualidades 
                SET pagada = 0
                WHERE inscripcion_id = ? 
                AND pagada = 1
                AND fecha_fin >= CURDATE()
            `, [inscripcion_id]);

            // Eliminar asistencias futuras
            await connection.query(`
                DELETE a FROM asistencias a
                INNER JOIN mensualidades m ON a.mensualidad_id = m.id
                INNER JOIN clases c ON a.clase_id = c.id
                WHERE m.inscripcion_id = ?
                AND c.fecha >= CURDATE()
                AND a.hora_entrada IS NULL
            `, [inscripcion_id]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Renovar inscripción
    static async renovar(inscripcion_id, { anos_renovacion = 1, monto, metodo_pago, usuario_id }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Obtener inscripción actual
            const inscripcionActual = await this.getById(inscripcion_id);
            if (!inscripcionActual) {
                throw new Error('Inscripción no encontrada');
            }

            // Calcular nueva fecha de fin
            const fechaFinActual = new Date(inscripcionActual.fecha_fin);
            const nuevaFechaFin = new Date(fechaFinActual);
            nuevaFechaFin.setFullYear(nuevaFechaFin.getFullYear() + parseInt(anos_renovacion));

            // Actualizar inscripción existente
            await connection.query(`
                UPDATE inscripciones 
                SET fecha_fin = ?,
                    anos_vigencia = anos_vigencia + ?,
                    activa = 1,
                    observaciones = CONCAT(
                        COALESCE(observaciones, ''), 
                        '\nRenovada por ', ?, ' año', 
                        CASE WHEN ? > 1 THEN 's' ELSE '' END,
                        ' el ', NOW()
                    )
                WHERE id = ?
            `, [
                nuevaFechaFin.toISOString().split('T')[0],
                anos_renovacion,
                anos_renovacion,
                anos_renovacion,
                inscripcion_id
            ]);

            // Crear transacción de renovación
            const folio = await this.generateFolio(connection);
            const [transaccionResult] = await connection.query(`
                INSERT INTO transacciones (
                    folio,
                    tipo_transaccion,
                    monto_subtotal,
                    monto_total,
                    metodo_pago,
                    usuario_id,
                    alumno_id
                ) VALUES (?, 'inscripcion', ?, ?, ?, ?, ?)
            `, [folio, monto, monto, metodo_pago, usuario_id, inscripcionActual.alumno_id]);

            const transaccionId = transaccionResult.insertId;

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
                transaccionId,
                `Renovación inscripción ${anos_renovacion} año${anos_renovacion > 1 ? 's' : ''}`,
                1,
                monto,
                monto,
                0,
                monto,
                inscripcion_id,
                'renovacion_inscripcion'
            ]);

            await connection.commit();

            return {
                transaccion_id: transaccionId,
                folio,
                nueva_fecha_fin: nuevaFechaFin.toISOString().split('T')[0],
                anos_renovacion: anos_renovacion
            };

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

    // Obtener estadísticas de inscripciones
    static async getEstadisticas(year = null) {
        try {
            const currentYear = year || new Date().getFullYear();

            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_inscripciones,
                    SUM(CASE WHEN activa = 1 AND CURDATE() <= fecha_fin THEN 1 ELSE 0 END) as inscripciones_vigentes,
                    SUM(CASE WHEN activa = 1 AND CURDATE() > fecha_fin THEN 1 ELSE 0 END) as inscripciones_vencidas,
                    SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) as inscripciones_canceladas,
                    SUM(monto) as ingresos_total_inscripciones,
                    AVG(monto) as promedio_monto_inscripcion,
                    COUNT(DISTINCT alumno_id) as alumnos_con_inscripcion
                FROM inscripciones
                WHERE year_inscripcion = ?
            `, [currentYear]);

            const [monthlyStats] = await db.query(`
                SELECT 
                    MONTH(fecha_inscripcion) as mes,
                    COUNT(*) as inscripciones_mes,
                    SUM(monto) as ingresos_mes
                FROM inscripciones
                WHERE year_inscripcion = ? AND activa = 1
                GROUP BY MONTH(fecha_inscripcion)
                ORDER BY mes
            `, [currentYear]);

            // Próximas a vencer (30 días)
            const [proximasVencer] = await db.query(`
                SELECT COUNT(*) as proximas_vencer
                FROM inscripciones
                WHERE activa = 1 
                AND DATEDIFF(fecha_fin, CURDATE()) BETWEEN 0 AND 30
            `);

            return {
                general: stats[0],
                por_mes: monthlyStats,
                proximas_vencer: proximasVencer[0].proximas_vencer,
                year: currentYear
            };

        } catch (error) {
            throw error;
        }
    }

    // Obtener inscripciones próximas a vencer
    static async getProximasAVencer(dias = 30) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    i.*,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    a.telefono,
                    a.email,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes
                FROM inscripciones i
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE i.activa = 1
                AND DATEDIFF(i.fecha_fin, CURDATE()) BETWEEN 0 AND ?
                ORDER BY dias_restantes ASC
            `, [dias]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Verificar inscripción duplicada
    static async verificarDuplicada(alumno_id, year) {
        try {
            const [rows] = await db.query(`
                SELECT id
                FROM inscripciones
                WHERE alumno_id = ? 
                AND year_inscripcion = ?
                AND activa = 1
                LIMIT 1
            `, [alumno_id, year]);

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Buscar inscripciones
    static async search(searchTerm, { year = null, estado = null } = {}) {
        try {
            let whereClause = `WHERE (
                a.nombre LIKE ? OR 
                a.apellido_paterno LIKE ? OR 
                a.apellido_materno LIKE ? OR
                a.telefono LIKE ? OR
                a.email LIKE ?
            )`;
            
            const searchParam = `%${searchTerm}%`;
            let params = [searchParam, searchParam, searchParam, searchParam, searchParam];

            if (year) {
                whereClause += ` AND i.year_inscripcion = ?`;
                params.push(year);
            }

            if (estado) {
                switch (estado) {
                    case 'vigente':
                        whereClause += ` AND i.activa = 1 AND CURDATE() <= i.fecha_fin`;
                        break;
                    case 'vencida':
                        whereClause += ` AND i.activa = 1 AND CURDATE() > i.fecha_fin`;
                        break;
                    case 'cancelada':
                        whereClause += ` AND i.activa = 0`;
                        break;
                }
            }

            const [rows] = await db.query(`
                SELECT 
                    i.*,
                    a.nombre,
                    a.apellido_paterno,
                    a.apellido_materno,
                    a.telefono,
                    a.email,
                    CASE 
                        WHEN i.activa = 1 AND CURDATE() <= i.fecha_fin THEN 'VIGENTE'
                        WHEN i.activa = 1 AND CURDATE() > i.fecha_fin THEN 'VENCIDA'
                        ELSE 'CANCELADA'
                    END as estado_inscripcion,
                    DATEDIFF(i.fecha_fin, CURDATE()) as dias_restantes
                FROM inscripciones i
                INNER JOIN alumnos a ON i.alumno_id = a.id
                ${whereClause}
                ORDER BY i.created_at DESC
                LIMIT 100
            `, params);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener reporte de ingresos por inscripciones
    static async getReporteIngresos(fecha_inicio, fecha_fin) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    DATE(i.fecha_inscripcion) as fecha,
                    COUNT(*) as cantidad_inscripciones,
                    SUM(i.monto) as total_ingresos,
                    AVG(i.monto) as promedio_monto,
                    COUNT(DISTINCT i.alumno_id) as alumnos_diferentes
                FROM inscripciones i
                WHERE i.fecha_inscripcion BETWEEN ? AND ?
                AND i.activa = 1
                GROUP BY DATE(i.fecha_inscripcion)
                ORDER BY fecha DESC
            `, [fecha_inicio, fecha_fin]);

            const [totales] = await db.query(`
                SELECT 
                    COUNT(*) as total_inscripciones,
                    SUM(monto) as total_ingresos,
                    AVG(monto) as promedio_monto,
                    COUNT(DISTINCT alumno_id) as total_alumnos
                FROM inscripciones
                WHERE fecha_inscripcion BETWEEN ? AND ?
                AND activa = 1
            `, [fecha_inicio, fecha_fin]);

            return {
                detalle_diario: rows,
                resumen_total: totales[0],
                periodo: { fecha_inicio, fecha_fin }
            };

        } catch (error) {
            throw error;
        }
    }
}

export default inscripcionesModel;