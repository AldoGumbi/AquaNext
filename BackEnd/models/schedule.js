import db from '../config/db.js';

class horariosModel {

    // Crear un nuevo horario
    static async crear(horario) {
        try {
            const [result] = await db.query(`
                INSERT INTO horarios (
                    grupo_id,
                    profesor_id,
                    dia,
                    hora_inicio,
                    hora_fin,
                    activo,
                    deleted
                ) VALUES (?, ?, ?, ?, ?, ?, 0)
            `, [
                horario.grupo_id,
                horario.profesor_id || null,
                horario.dia,
                horario.hora_inicio,
                horario.hora_fin,
                horario.activo || true
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los horarios activos
    static async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.grupo_id,
                    h.profesor_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    h.activo,
                    h.created_at,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE h.deleted = 0 AND g.deleted = 0 AND h.activo = 1 AND g.activo = 1
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
                    h.hora_inicio,
                    g.nombre
            `);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener horario por ID
    static async getById(id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.grupo_id,
                    h.profesor_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    h.activo,
                    h.created_at,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE h.id = ? AND h.deleted = 0 AND g.deleted = 0
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener horarios por grupo
    static async getByGrupoId(grupoId) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.grupo_id,
                    h.profesor_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    h.activo,
                    h.created_at,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                FROM horarios h
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE h.grupo_id = ? AND h.deleted = 0
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
            `, [grupoId]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener horarios por profesor
    static async getByProfesorId(profesorId) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.grupo_id,
                    h.profesor_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    h.activo,
                    h.created_at,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE h.profesor_id = ? AND h.deleted = 0 AND g.deleted = 0 AND h.activo = 1 AND g.activo = 1
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
            `, [profesorId]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener horarios por día
    static async getByDia(dia) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.grupo_id,
                    h.profesor_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    h.activo,
                    h.created_at,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE h.dia = ? AND h.deleted = 0 AND g.deleted = 0 AND h.activo = 1 AND g.activo = 1
                ORDER BY h.hora_inicio, g.nombre
            `, [dia]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar horario
    static async update(id, horario) {
        try {
            const [result] = await db.query(`
                UPDATE horarios 
                SET 
                    grupo_id = ?,
                    profesor_id = ?,
                    dia = ?,
                    hora_inicio = ?,
                    hora_fin = ?,
                    activo = ?
                WHERE id = ? AND deleted = 0
            `, [
                horario.grupo_id,
                horario.profesor_id || null,
                horario.dia,
                horario.hora_inicio,
                horario.hora_fin,
                horario.activo,
                id
            ]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar horario
    static async delete(id) {
        try {
            const [result] = await db.query(`
                UPDATE horarios 
                SET deleted = 1 
                WHERE id = ? AND deleted = 0
            `, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar todos los horarios de un grupo
    static async deleteByGrupoId(grupoId) {
        try {
            const [result] = await db.query(`
                UPDATE horarios 
                SET deleted = 1 
                WHERE grupo_id = ? AND deleted = 0
            `, [grupoId]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Verificar conflictos de horarios para un profesor
    static async verificarConflictoProfesor(profesorId, dia, horaInicio, horaFin, horarioId = null) {
        try {
            let query = `
                SELECT 
                    h.id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE h.profesor_id = ? 
                AND h.dia = ? 
                AND h.deleted = 0 
                AND g.deleted = 0
                AND h.activo = 1 
                AND g.activo = 1
                AND (
                    (h.hora_inicio <= ? AND h.hora_fin > ?) OR
                    (h.hora_inicio < ? AND h.hora_fin >= ?) OR
                    (h.hora_inicio >= ? AND h.hora_fin <= ?)
                )
            `;
            
            const params = [profesorId, dia, horaInicio, horaInicio, horaFin, horaFin, horaInicio, horaFin];
            
            if (horarioId) {
                query += ` AND h.id != ?`;
                params.push(horarioId);
            }

            const [rows] = await db.query(query, params);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener horarios disponibles para un día específico
    static async getHorariosDisponibles(dia) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.hora_inicio,
                    h.hora_fin,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE h.dia = ? AND h.deleted = 0 AND g.deleted = 0 AND h.activo = 1 AND g.activo = 1
                ORDER BY h.hora_inicio
            `, [dia]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de horarios
    static async getEstadisticas() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_horarios,
                    SUM(CASE WHEN h.activo = 1 AND h.deleted = 0 THEN 1 ELSE 0 END) as horarios_activos,
                    SUM(CASE WHEN h.profesor_id IS NOT NULL AND h.deleted = 0 THEN 1 ELSE 0 END) as con_profesor,
                    SUM(CASE WHEN h.profesor_id IS NULL AND h.deleted = 0 THEN 1 ELSE 0 END) as sin_profesor,
                    SUM(CASE WHEN h.dia = 'lunes' AND h.deleted = 0 THEN 1 ELSE 0 END) as lunes,
                    SUM(CASE WHEN h.dia = 'martes' AND h.deleted = 0 THEN 1 ELSE 0 END) as martes,
                    SUM(CASE WHEN h.dia = 'miercoles' AND h.deleted = 0 THEN 1 ELSE 0 END) as miercoles,
                    SUM(CASE WHEN h.dia = 'jueves' AND h.deleted = 0 THEN 1 ELSE 0 END) as jueves,
                    SUM(CASE WHEN h.dia = 'viernes' AND h.deleted = 0 THEN 1 ELSE 0 END) as viernes,
                    SUM(CASE WHEN h.dia = 'sabado' AND h.deleted = 0 THEN 1 ELSE 0 END) as sabado,
                    SUM(CASE WHEN h.dia = 'domingo' AND h.deleted = 0 THEN 1 ELSE 0 END) as domingo
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE g.deleted = 0
            `);
            
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Obtener horarios de un profesor en un día específico
    static async getHorariosPorProfesorYDia(profesorId, dia) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    h.id,
                    h.hora_inicio,
                    h.hora_fin,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE h.profesor_id = ? 
                AND h.dia = ? 
                AND h.deleted = 0 
                AND g.deleted = 0
                AND h.activo = 1 
                AND g.activo = 1
                ORDER BY h.hora_inicio
            `, [profesorId, dia]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener el próximo horario disponible para un profesor
    static async getProximoHorarioDisponible(profesorId, dia, horaMinima = '06:00') {
        try {
            const [rows] = await db.query(`
                SELECT 
                    MAX(h.hora_fin) as ultima_hora
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE h.profesor_id = ? 
                AND h.dia = ? 
                AND h.deleted = 0 
                AND g.deleted = 0
                AND h.activo = 1 
                AND g.activo = 1
                AND h.hora_fin > ?
            `, [profesorId, dia, horaMinima]);
            
            return rows[0]?.ultima_hora || horaMinima;
        } catch (error) {
            throw error;
        }
    }

    // Crear múltiples horarios en una transacción
    static async crearMultiples(horarios) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const horariosCreados = [];
            
            for (const horario of horarios) {
                const [result] = await connection.query(`
                    INSERT INTO horarios (
                        grupo_id,
                        profesor_id,
                        dia,
                        hora_inicio,
                        hora_fin,
                        activo,
                        deleted
                    ) VALUES (?, ?, ?, ?, ?, ?, 0)
                `, [
                    horario.grupo_id,
                    horario.profesor_id || null,
                    horario.dia,
                    horario.hora_inicio,
                    horario.hora_fin,
                    horario.activo || true
                ]);

                horariosCreados.push({
                    id: result.insertId,
                    ...horario
                });
            }

            await connection.commit();
            return horariosCreados;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

}

export default horariosModel;