import db from '../config/db.js';

class asistenciasService {

    // Crear registro de asistencia para una clase y alumno
    static async crearRegistroAsistencia(connection, alumno_id, clase_id, mensualidad_id) {
        try {
            // Verificar si ya existe el registro
            const [existente] = await connection.query(`
                SELECT id FROM asistencias 
                WHERE alumno_id = ? AND clase_id = ?
            `, [alumno_id, clase_id]);

            if (existente.length > 0) {
                return existente[0].id;
            }

            // Crear nuevo registro de asistencia
            const [result] = await connection.query(`
                INSERT INTO asistencias (
                    alumno_id,
                    clase_id,
                    mensualidad_id,
                    es_prueba
                ) VALUES (?, ?, ?, 0)
            `, [alumno_id, clase_id, mensualidad_id]);

            return result.insertId;

        } catch (error) {
            console.error('Error al crear registro de asistencia:', error);
            throw error;
        }
    }

    // Registrar asistencia (entrada)
    static async registrarEntrada(alumno_id, clase_id, hora_entrada = null) {
        try {
            const horaEntrada = hora_entrada || new Date().toTimeString().split(' ')[0];

            const [result] = await db.query(`
                UPDATE asistencias 
                SET hora_entrada = ?
                WHERE alumno_id = ? AND clase_id = ?
            `, [horaEntrada, alumno_id, clase_id]);

            return result.affectedRows > 0;

        } catch (error) {
            throw error;
        }
    }

    // Registrar salida
    static async registrarSalida(alumno_id, clase_id, hora_salida = null) {
        try {
            const horaSalida = hora_salida || new Date().toTimeString().split(' ')[0];

            const [result] = await db.query(`
                UPDATE asistencias 
                SET hora_salida = ?
                WHERE alumno_id = ? AND clase_id = ? AND hora_entrada IS NOT NULL
            `, [horaSalida, alumno_id, clase_id]);

            return result.affectedRows > 0;

        } catch (error) {
            throw error;
        }
    }

    // Obtener asistencias por clase
    static async getAsistenciasByClase(clase_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    a.*,
                    al.nombre,
                    al.apellido_paterno,
                    al.apellido_materno,
                    al.foto,
                    CASE 
                        WHEN a.hora_entrada IS NOT NULL AND a.hora_salida IS NOT NULL THEN 'COMPLETA'
                        WHEN a.hora_entrada IS NOT NULL THEN 'EN_CURSO'
                        ELSE 'PENDIENTE'
                    END as estado_asistencia
                FROM asistencias a
                INNER JOIN alumnos al ON a.alumno_id = al.id
                WHERE a.clase_id = ?
                ORDER BY al.apellido_paterno, al.nombre
            `, [clase_id]);

            return rows;

        } catch (error) {
            throw error;
        }
    }

    // Obtener asistencias por alumno
    static async getAsistenciasByAlumno(alumno_id, fecha_inicio = null, fecha_fin = null) {
        try {
            let whereClause = 'WHERE a.alumno_id = ?';
            let params = [alumno_id];

            if (fecha_inicio && fecha_fin) {
                whereClause += ' AND c.fecha BETWEEN ? AND ?';
                params.push(fecha_inicio, fecha_fin);
            }

            const [rows] = await db.query(`
                SELECT 
                    a.*,
                    c.fecha,
                    c.cancelada,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    CASE 
                        WHEN c.cancelada = 1 THEN 'CANCELADA'
                        WHEN a.hora_entrada IS NOT NULL AND a.hora_salida IS NOT NULL THEN 'COMPLETA'
                        WHEN a.hora_entrada IS NOT NULL THEN 'EN_CURSO'
                        ELSE 'PENDIENTE'
                    END as estado_asistencia
                FROM asistencias a
                INNER JOIN clases c ON a.clase_id = c.id
                INNER JOIN horarios h ON c.horario_id = h.id
                INNER JOIN grupos g ON h.grupo_id = g.id
                ${whereClause}
                ORDER BY c.fecha DESC, h.hora_inicio DESC
            `, params);

            return rows;

        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de asistencias
    static async getEstadisticas(fecha_inicio = null, fecha_fin = null) {
        try {
            let whereClause = 'WHERE 1=1';
            let params = [];

            if (fecha_inicio && fecha_fin) {
                whereClause += ' AND c.fecha BETWEEN ? AND ?';
                params.push(fecha_inicio, fecha_fin);
            }

            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_asistencias_programadas,
                    SUM(CASE WHEN a.hora_entrada IS NOT NULL THEN 1 ELSE 0 END) as asistencias_realizadas,
                    SUM(CASE WHEN a.hora_entrada IS NULL AND c.cancelada = 0 AND c.fecha < CURDATE() THEN 1 ELSE 0 END) as ausencias,
                    SUM(CASE WHEN c.cancelada = 1 THEN 1 ELSE 0 END) as clases_canceladas,
                    ROUND(
                        (SUM(CASE WHEN a.hora_entrada IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / 
                        NULLIF(SUM(CASE WHEN c.cancelada = 0 THEN 1 ELSE 0 END), 0), 
                        2
                    ) as porcentaje_asistencia
                FROM asistencias a
                INNER JOIN clases c ON a.clase_id = c.id
                ${whereClause}
            `, params);

            return stats[0];

        } catch (error) {
            throw error;
        }
    }

    // Eliminar asistencias futuras por mensualidad (para cancelaciones)
    static async eliminarAsistenciasFuturas(connection, mensualidad_id) {
        try {
            const [result] = await connection.query(`
                DELETE a FROM asistencias a
                INNER JOIN clases c ON a.clase_id = c.id
                WHERE a.mensualidad_id = ? 
                AND c.fecha >= CURDATE()
                AND a.hora_entrada IS NULL
            `, [mensualidad_id]);

            return result.affectedRows;

        } catch (error) {
            throw error;
        }
    }

    // Obtener reporte de asistencias por grupo
    static async getReporteAsistenciasPorGrupo(grupo_id, fecha_inicio, fecha_fin) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    al.id as alumno_id,
                    al.nombre,
                    al.apellido_paterno,
                    al.apellido_materno,
                    COUNT(a.id) as total_clases_programadas,
                    SUM(CASE WHEN a.hora_entrada IS NOT NULL THEN 1 ELSE 0 END) as clases_asistidas,
                    SUM(CASE WHEN a.hora_entrada IS NULL AND c.cancelada = 0 AND c.fecha < CURDATE() THEN 1 ELSE 0 END) as ausencias,
                    ROUND(
                        (SUM(CASE WHEN a.hora_entrada IS NOT NULL THEN 1 ELSE 0 END) * 100.0) / 
                        NULLIF(COUNT(CASE WHEN c.cancelada = 0 THEN a.id END), 0), 
                        2
                    ) as porcentaje_asistencia
                FROM alumnos al
                INNER JOIN asistencias a ON al.id = a.alumno_id
                INNER JOIN clases c ON a.clase_id = c.id
                INNER JOIN horarios h ON c.horario_id = h.id
                WHERE h.grupo_id = ?
                AND c.fecha BETWEEN ? AND ?
                GROUP BY al.id, al.nombre, al.apellido_paterno, al.apellido_materno
                ORDER BY al.apellido_paterno, al.nombre
            `, [grupo_id, fecha_inicio, fecha_fin]);

            return rows;

        } catch (error) {
            throw error;
        }
    }
}

export default asistenciasService;