
import db from '../config/db.js';

class clasesService {
    
    // Generar clases para un período específico
    static async generarClasesParaPeriodo(connection, horario_id, fecha_inicio, fecha_fin) {
        try {
            // Obtener información del horario
            const [horarioInfo] = await connection.query(`
                SELECT h.*, g.tipo as grupo_tipo
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE h.id = ?
            `, [horario_id]);

            if (horarioInfo.length === 0) {
                throw new Error(`Horario ${horario_id} no encontrado`);
            }

            const horario = horarioInfo[0];
            const clasesCreadas = [];

            // Calcular todas las fechas que coinciden con el día de la semana del horario
            const fechaInicioDate = new Date(fecha_inicio);
            const fechaFinDate = new Date(fecha_fin);
            const diaSemanaNombre = horario.dia;

            // Mapeo de días de la semana
            const diasSemana = {
                'domingo': 0,
                'lunes': 1,
                'martes': 2,
                'miercoles': 3,
                'jueves': 4,
                'viernes': 5,
                'sabado': 6
            };

            const diaNumero = diasSemana[diaSemanaNombre];
            
            // Encontrar la primera fecha que coincida con el día de la semana
            let fechaActual = new Date(fechaInicioDate);
            while (fechaActual.getDay() !== diaNumero && fechaActual <= fechaFinDate) {
                fechaActual.setDate(fechaActual.getDate() + 1);
            }

            // Generar clases para todas las fechas que coincidan
            while (fechaActual <= fechaFinDate) {
                const fechaClase = fechaActual.toISOString().split('T')[0];

                // Verificar si la clase ya existe
                const [claseExistente] = await connection.query(`
                    SELECT id FROM clases 
                    WHERE horario_id = ? AND fecha = ?
                `, [horario_id, fechaClase]);

                let claseId;
                if (claseExistente.length > 0) {
                    claseId = claseExistente[0].id;
                } else {
                    // Crear nueva clase
                    const [result] = await connection.query(`
                        INSERT INTO clases (
                            horario_id,
                            fecha,
                            cancelada,
                            observaciones
                        ) VALUES (?, ?, 0, ?)
                    `, [
                        horario_id,
                        fechaClase,
                        `Clase generada automáticamente para ${diaSemanaNombre} ${fechaClase}`
                    ]);

                    claseId = result.insertId;
                }

                clasesCreadas.push(claseId);

                // Avanzar a la siguiente semana
                fechaActual.setDate(fechaActual.getDate() + 7);
            }

            return clasesCreadas;

        } catch (error) {
            console.error('Error al generar clases:', error);
            throw error;
        }
    }

    // Obtener clases por horario y rango de fechas
    static async getClasesByHorarioYRango(horario_id, fecha_inicio, fecha_fin) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.*,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor,
                    ps.nombre as nombre_profesor_suplente
                FROM clases c
                INNER JOIN horarios h ON c.horario_id = h.id
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id
                LEFT JOIN profesores ps ON c.profesor_suplente_id = ps.id
                WHERE c.horario_id = ?
                AND c.fecha BETWEEN ? AND ?
                ORDER BY c.fecha ASC
            `, [horario_id, fecha_inicio, fecha_fin]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Cancelar clase
    static async cancelarClase(clase_id, motivo = null, usuario_id = null) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(`
                UPDATE clases 
                SET cancelada = 1,
                    observaciones = CONCAT(
                        COALESCE(observaciones, ''), 
                        '\nClase cancelada el ', 
                        NOW(), 
                        CASE WHEN ? IS NOT NULL THEN CONCAT('. Motivo: ', ?) ELSE '' END
                    )
                WHERE id = ?
            `, [motivo, motivo, clase_id]);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            // Registrar en log de cancelaciones si es necesario
            if (usuario_id) {
                await connection.query(`
                    INSERT INTO log_cancelaciones (
                        tipo_entidad,
                        entidad_id,
                        usuario_id,
                        motivo,
                        fecha_cancelacion
                    ) VALUES ('clase', ?, ?, ?, NOW())
                `, [clase_id, usuario_id, motivo]);
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener estadísticas de clases
    static async getEstadisticas(fecha_inicio = null, fecha_fin = null) {
        try {
            let whereClause = 'WHERE 1=1';
            let params = [];

            if (fecha_inicio && fecha_fin) {
                whereClause += ' AND c.fecha BETWEEN ? AND ?';
                params.push(fecha_inicio, fecha_fin);
            } else if (fecha_inicio) {
                whereClause += ' AND c.fecha >= ?';
                params.push(fecha_inicio);
            } else if (fecha_fin) {
                whereClause += ' AND c.fecha <= ?';
                params.push(fecha_fin);
            }

            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_clases,
                    SUM(CASE WHEN c.cancelada = 0 THEN 1 ELSE 0 END) as clases_activas,
                    SUM(CASE WHEN c.cancelada = 1 THEN 1 ELSE 0 END) as clases_canceladas,
                    COUNT(DISTINCT c.horario_id) as horarios_con_clases,
                    COUNT(DISTINCT h.grupo_id) as grupos_con_clases
                FROM clases c
                INNER JOIN horarios h ON c.horario_id = h.id
                ${whereClause}
            `, params);

            return stats[0];

        } catch (error) {
            throw error;
        }
    }
}

export default clasesService;