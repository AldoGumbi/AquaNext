import db from '../config/db.js';

class gruposModel {

    // Crear un nuevo grupo con sus horarios en una transacción
    static async crearConHorarios(grupo, horarios) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [grupoResult] = await connection.query(`
                INSERT INTO grupos (
                    codigo, 
                    nombre, 
                    tipo, 
                    nivel, 
                    descripcion, 
                    activo,
                    deleted
                ) VALUES (?, ?, ?, ?, ?, ?, 0)
            `, [
                grupo.codigo,
                grupo.nombre,
                grupo.tipo,
                grupo.nivel,
                grupo.descripcion,
                grupo.activo
            ]);

            const grupoId = grupoResult.insertId;

            for (const horario of horarios) {
                await connection.query(`
                    INSERT INTO horarios (
                        grupo_id,
                        profesor_id,
                        dia,
                        hora_inicio,
                        hora_fin,
                        activo,
                        cupo_maximo,
                        deleted
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                `, [
                    grupoId,
                    horario.profesor_id || null,
                    horario.dia,
                    horario.hora_inicio,
                    horario.hora_fin,
                    true,
                    horario.cupo_maximo
                ]);
            }

            await connection.commit();
            return grupoId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener todos los grupos
    static async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    codigo,
                    nombre,
                    tipo,
                    nivel,
                    descripcion,
                    activo,
                    created_at,
                    deleted,
                    deleted_at
                FROM grupos
                WHERE deleted = 0
                ORDER BY created_at DESC
            `);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los grupos incluyendo eliminados
    static async getAllIncludingDeleted() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    codigo,
                    nombre,
                    tipo,
                    nivel,
                    descripcion,
                    activo,
                    created_at,
                    deleted,
                    deleted_at,
                    CASE 
                        WHEN deleted = 1 THEN 'ELIMINADO'
                        WHEN activo = 0 THEN 'INACTIVO' 
                        ELSE 'ACTIVO'
                    END as estado_display
                FROM grupos
                ORDER BY deleted ASC, created_at DESC
            `);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un grupo por ID
    static async getById(id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    codigo,
                    nombre,
                    tipo,
                    nivel,
                    descripcion,
                    activo,
                    created_at,
                    deleted,
                    deleted_at
                FROM grupos
                WHERE id = ? AND deleted = 0
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener grupo por código
    static async getByCodigo(codigo) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    codigo,
                    nombre,
                    tipo,
                    nivel,
                    descripcion,
                    activo,
                    created_at,
                    deleted,
                    deleted_at
                FROM grupos
                WHERE codigo = ? AND deleted = 0
            `, [codigo]);
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener grupos por tipo
    static async getByTipo(tipo) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    codigo,
                    nombre,
                    tipo,
                    nivel,
                    descripcion,
                    activo,
                    created_at,
                    deleted,
                    deleted_at
                FROM grupos
                WHERE tipo = ? AND deleted = 0 AND activo = 1
                ORDER BY nombre ASC
            `, [tipo]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los grupos con sus horarios
    static async getAllConHorarios() {
        try {
            const [grupos] = await db.query(`
                SELECT 
                    g.id,
                    g.codigo,
                    g.nombre,
                    g.tipo,
                    g.nivel,
                    g.descripcion,
                    g.activo,
                    g.created_at,
                    g.deleted,
                    g.deleted_at
                FROM grupos g
                WHERE g.deleted = 0 
                ORDER BY g.created_at DESC
            `);

            for (let grupo of grupos) {
                const [horarios] = await db.query(`
                    SELECT 
                        h.id,
                        h.dia,
                        h.hora_inicio,
                        h.hora_fin,
                        h.profesor_id,
                        h.cupo_maximo,
                        h.activo,
                        h.deleted,
                        h.deleted_at,
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
                `, [grupo.id]);

                grupo.horarios = horarios;
            }

            return grupos;
        } catch (error) {
            throw error;
        }
    }

    // Verificar si un horario tiene clases próximas con asistencias
    static async verificarHorarioConClasesProximas(connection, horarioId) {
        try {
            const [clases] = await connection.query(`
                SELECT 
                    c.id,
                    c.fecha,
                    c.horario_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    g.nombre as grupo_nombre,
                    g.codigo as grupo_codigo,
                    COUNT(a.id) as total_asistencias
                FROM clases c
                INNER JOIN horarios h ON c.horario_id = h.id
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN asistencias a ON c.id = a.clase_id
                WHERE c.horario_id = ?
                    AND c.fecha >= CURDATE()
                    AND c.cancelada = 0
                GROUP BY c.id
                HAVING total_asistencias > 0
                ORDER BY c.fecha ASC
            `, [horarioId]);

            return clases;
        } catch (error) {
            throw error;
        }
    }

    // Verificar múltiples horarios con clases próximas
    static async verificarHorariosConClasesProximas(connection, horariosIds) {
        try {
            if (!horariosIds || horariosIds.length === 0) {
                return [];
            }

            const placeholders = horariosIds.map(() => '?').join(',');
            
            const [horarios] = await connection.query(`
                SELECT 
                    h.id as horario_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    g.nombre as grupo_nombre,
                    g.codigo as grupo_codigo,
                    COUNT(DISTINCT c.id) as total_clases_proximas,
                    COUNT(a.id) as total_asistencias
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN clases c ON h.id = c.horario_id 
                    AND c.fecha >= CURDATE() 
                    AND c.cancelada = 0
                LEFT JOIN asistencias a ON c.id = a.clase_id
                WHERE h.id IN (${placeholders})
                GROUP BY h.id
                HAVING total_asistencias > 0
                ORDER BY h.dia, h.hora_inicio
            `, horariosIds);

            return horarios;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un grupo con sus horarios en una transacción (con validación)
    static async updateConHorarios(id, grupo, horarios = null) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(`
                UPDATE grupos 
                SET 
                    codigo = ?,
                    nombre = ?,
                    tipo = ?,
                    nivel = ?,
                    descripcion = ?,
                    activo = ?
                WHERE id = ? AND deleted = 0
            `, [
                grupo.codigo,
                grupo.nombre,
                grupo.tipo,
                grupo.nivel,
                grupo.descripcion,
                grupo.activo,
                id
            ]);

            if (horarios && Array.isArray(horarios)) {
                // Obtener todos los IDs de horarios existentes del grupo
                const [horariosExistentes] = await connection.query(`
                    SELECT id 
                    FROM horarios 
                    WHERE grupo_id = ? AND deleted = 0
                    ORDER BY id
                `, [id]);

                // Extraer los IDs que vienen en la actualización
                const idsEnActualizacion = horarios
                    .filter(h => h.id && h.id > 0)
                    .map(h => h.id);

                // Obtener IDs existentes en BD
                const idsExistentes = horariosExistentes.map(h => h.id);

                // Identificar horarios que se van a eliminar
                const idsAEliminar = idsExistentes.filter(idExistente => 
                    !idsEnActualizacion.includes(idExistente)
                );

                // Verificar si los horarios a eliminar tienen clases próximas con asistencias
                if (idsAEliminar.length > 0) {
                    const horariosConClases = await this.verificarHorariosConClasesProximas(
                        connection, 
                        idsAEliminar
                    );

                    if (horariosConClases.length > 0) {
                        await connection.rollback();
                        
                        const detallesHorarios = horariosConClases.map(h => 
                            `${h.dia} de ${h.hora_inicio} a ${h.hora_fin} (${h.total_clases_proximas} clases con ${h.total_asistencias} asistencias)`
                        ).join(', ');

                        const error = new Error(
                            `No se pueden eliminar los siguientes horarios porque tienen clases próximas con asistencias registradas: ${detallesHorarios}`
                        );
                        error.code = 'HORARIOS_CON_CLASES_PROXIMAS';
                        error.horariosAfectados = horariosConClases;
                        throw error;
                    }
                }

                // 1. ACTUALIZAR horarios que tienen ID (conservan su ID original)
                for (const horario of horarios) {
                    if (horario.id && horario.id > 0) {
                        await connection.query(`
                            UPDATE horarios 
                            SET 
                                profesor_id = ?,
                                dia = ?,
                                hora_inicio = ?,
                                hora_fin = ?,
                                cupo_maximo = ?,
                                activo = ?
                            WHERE id = ? AND grupo_id = ?
                        `, [
                            horario.profesor_id || null,
                            horario.dia,
                            horario.hora_inicio,
                            horario.hora_fin,
                            horario.cupo_maximo || 8,
                            true,
                            horario.id,
                            id
                        ]);
                    }
                }

                // 2. INSERTAR horarios nuevos (sin ID o ID = 0)
                for (const horario of horarios) {
                    if (!horario.id || horario.id === 0) {
                        await connection.query(`
                            INSERT INTO horarios (
                                grupo_id,
                                profesor_id,
                                dia,
                                hora_inicio,
                                hora_fin,
                                cupo_maximo,
                                activo,
                                deleted
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                        `, [
                            id,
                            horario.profesor_id || null,
                            horario.dia,
                            horario.hora_inicio,
                            horario.hora_fin,
                            horario.cupo_maximo || 8,
                            true
                        ]);
                    }
                }

                // 3. ELIMINAR horarios que ya no están en la actualización (solo si pasó la validación)
                for (const idAEliminar of idsAEliminar) {
                    await connection.query(`
                        UPDATE horarios 
                        SET deleted = 1, deleted_at = NOW()
                        WHERE id = ?
                    `, [idAEliminar]);
                }
            }

            await connection.commit();
            return result.affectedRows > 0;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Eliminar un grupo con sus horarios (con validación)
    static async deleteConHorarios(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Obtener todos los horarios del grupo
            const [horarios] = await connection.query(`
                SELECT id FROM horarios 
                WHERE grupo_id = ? AND deleted = 0
            `, [id]);

            const horariosIds = horarios.map(h => h.id);

            // VALIDACIÓN: Verificar si algún horario tiene clases próximas con asistencias
            if (horariosIds.length > 0) {
                const horariosConClases = await this.verificarHorariosConClasesProximas(
                    connection, 
                    horariosIds
                );

                if (horariosConClases.length > 0) {
                    await connection.rollback();
                    
                    const detallesHorarios = horariosConClases.map(h => 
                        `${h.dia} de ${h.hora_inicio} a ${h.hora_fin} (${h.total_clases_proximas} clases con ${h.total_asistencias} asistencias)`
                    ).join(', ');

                    const error = new Error(
                        `No se puede eliminar el grupo porque tiene horarios con clases próximas con asistencias registradas: ${detallesHorarios}`
                    );
                    error.code = 'GRUPO_CON_HORARIOS_ACTIVOS';
                    error.horariosAfectados = horariosConClases;
                    throw error;
                }
            }

            // Si no hay conflictos, proceder con la eliminación
            const [grupoResult] = await connection.query(`
                UPDATE grupos 
                SET deleted = 1, deleted_at = NOW()
                WHERE id = ? AND deleted = 0
            `, [id]);

            await connection.query(`
                UPDATE horarios 
                SET deleted = 1, deleted_at = NOW()
                WHERE grupo_id = ? AND deleted = 0
            `, [id]);

            await connection.commit();
            return grupoResult.affectedRows > 0;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Restaurar un grupo eliminado
    static async restore(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [grupoResult] = await connection.query(`
                UPDATE grupos 
                SET deleted = 0, deleted_at = NULL
                WHERE id = ? AND deleted = 1
            `, [id]);

            await connection.query(`
                UPDATE horarios 
                SET deleted = 0, deleted_at = NULL
                WHERE grupo_id = ? AND deleted = 1
            `, [id]);

            await connection.commit();
            return grupoResult.affectedRows > 0;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Eliminar permanentemente un grupo
    static async hardDelete(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(`
                DELETE FROM horarios 
                WHERE grupo_id = ?
            `, [id]);

            const [result] = await connection.query(`
                DELETE FROM grupos 
                WHERE id = ?
            `, [id]);

            await connection.commit();
            return result.affectedRows > 0;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener grupos eliminados
    static async getDeleted() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    codigo,
                    nombre,
                    tipo,
                    nivel,
                    descripcion,
                    activo,
                    created_at,
                    deleted_at,
                    DATEDIFF(NOW(), deleted_at) as dias_eliminado
                FROM grupos
                WHERE deleted = 1
                ORDER BY deleted_at DESC
            `);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Verificar si un grupo tiene clases activas o alumnos inscritos
    static async verificarClasesActivas(grupoId) {
        try {
            const [clases] = await db.query(`
                SELECT COUNT(*) as total
                FROM clases c
                INNER JOIN horarios h ON c.horario_id = h.id
                WHERE h.grupo_id = ? AND h.deleted = 0 AND c.cancelada = 0 AND c.fecha >= CURDATE()
            `, [grupoId]);

            const [inscripciones] = await db.query(`
                SELECT COUNT(*) as total
                FROM mensualidad_grupos mg
                INNER JOIN mensualidades m ON mg.mensualidad_id = m.id
                INNER JOIN horarios h ON mg.horario_id = h.id
                WHERE mg.grupo_id = ? AND h.deleted = 0 AND m.cancelada = 0
            `, [grupoId]);

            return clases[0].total > 0 || inscripciones[0].total > 0;
        } catch (error) {
            console.warn('Warning: No se pudieron verificar clases activas:', error.message);
            return false;
        }
    }

    // Verificar conflictos de horarios
    static async verificarConflictoHorarios(dia, horaInicio, horaFin, grupoId = null) {
        try {
            let query = `
                SELECT 
                    g.id as grupo_id,
                    g.codigo,
                    g.nombre,
                    h.id as horario_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    CONCAT(p.nombre, ' ', p.apellido) as nombre_profesor
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE h.dia = ? 
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
            
            const params = [dia, horaInicio, horaInicio, horaFin, horaFin, horaInicio, horaFin];
            
            if (grupoId) {
                query += ` AND h.grupo_id != ?`;
                params.push(grupoId);
            }

            const [rows] = await db.query(query, params);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de grupos
    static async getEstadisticas() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_grupos,
                    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as grupos_existentes,
                    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as grupos_eliminados,
                    SUM(CASE WHEN activo = 1 AND deleted = 0 THEN 1 ELSE 0 END) as grupos_activos,
                    SUM(CASE WHEN activo = 0 AND deleted = 0 THEN 1 ELSE 0 END) as grupos_inactivos,
                    SUM(CASE WHEN tipo = 'matronatacion' AND deleted = 0 THEN 1 ELSE 0 END) as matronatacion,
                    SUM(CASE WHEN tipo = 'nado_libre' AND deleted = 0 THEN 1 ELSE 0 END) as nado_libre,
                    SUM(CASE WHEN tipo = 'aqua_fitness' AND deleted = 0 THEN 1 ELSE 0 END) as aqua_fitness,
                    SUM(CASE WHEN tipo = 'natacion_infantil' AND deleted = 0 THEN 1 ELSE 0 END) as natacion_infantil,
                    SUM(CASE WHEN tipo = 'natacion_adultos' AND deleted = 0 THEN 1 ELSE 0 END) as natacion_adultos
                FROM grupos
            `);

            const [horariosStats] = await db.query(`
                SELECT 
                    COUNT(*) as total_horarios,
                    SUM(CASE WHEN h.deleted = 0 THEN 1 ELSE 0 END) as horarios_existentes,
                    SUM(CASE WHEN h.deleted = 1 THEN 1 ELSE 0 END) as horarios_eliminados,
                    SUM(CASE WHEN h.profesor_id IS NOT NULL AND h.deleted = 0 THEN 1 ELSE 0 END) as con_profesor,
                    SUM(CASE WHEN h.profesor_id IS NULL AND h.deleted = 0 THEN 1 ELSE 0 END) as sin_profesor
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                WHERE g.deleted = 0
            `);
            
            return {
                ...rows[0],
                ...horariosStats[0]
            };
        } catch (error) {
            throw error;
        }
    }

}

export default gruposModel;