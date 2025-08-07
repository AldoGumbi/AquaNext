// services/asistenciasService.js - Optimizado con Luxon
import db from '../config/db.js';
import { DateTime } from 'luxon';

class asistenciasService {

    // OPTIMIZACIÓN: Crear registros de asistencia en lote
    static async crearRegistrosAsistenciaEnLote(connection, alumno_id, clases_ids, mensualidad_id) {
        try {
            if (!clases_ids || clases_ids.length === 0) {
                return [];
            }

            console.log(`Creando asistencias en lote para alumno ${alumno_id}, clases:`, clases_ids);

            // Verificar asistencias existentes en una sola consulta
            const placeholders = clases_ids.map(() => '?').join(',');
            const [existentes] = await connection.query(`
                SELECT clase_id, id FROM asistencias 
                WHERE alumno_id = ? AND clase_id IN (${placeholders})
            `, [alumno_id, ...clases_ids]);

            console.log('Asistencias existentes encontradas:', existentes);

            // Crear mapa de asistencias existentes
            const existentesMap = new Set(existentes.map(a => a.clase_id));
            const asistenciasExistentesIds = existentes.map(a => a.id);

            // Filtrar clases que no tienen asistencia
            const clasesNuevas = clases_ids.filter(clase_id => !existentesMap.has(clase_id));

            console.log('Clases sin asistencia (nuevas):', clasesNuevas);

            let nuevasAsistenciasIds = [];

            // Insertar nuevas asistencias en lote
            if (clasesNuevas.length > 0) {
                try {
                    const asistenciasData = clasesNuevas.map(clase_id => [
                        alumno_id,
                        clase_id,
                        mensualidad_id,
                        0 // es_prueba = false
                    ]);

                    const placeholdersInsert = asistenciasData.map(() => '(?, ?, ?, ?)').join(',');
                    const flatValues = asistenciasData.flat();

                    console.log('Insertando asistencias en lote:', asistenciasData.length);

                    const [result] = await connection.query(`
                        INSERT INTO asistencias (alumno_id, clase_id, mensualidad_id, es_prueba) 
                        VALUES ${placeholdersInsert}
                    `, flatValues);

                    // Generar IDs de las nuevas asistencias
                    const firstInsertId = result.insertId;
                    for (let i = 0; i < clasesNuevas.length; i++) {
                        nuevasAsistenciasIds.push(firstInsertId + i);
                    }

                    console.log(`Insertadas ${clasesNuevas.length} asistencias, primer ID: ${firstInsertId}`);

                } catch (insertError) {
                    console.error('Error en inserción en lote de asistencias:', insertError);
                    
                    // Si hay error de duplicate key, intentar insertar una por una
                    if (insertError.code === 'ER_DUP_ENTRY') {
                        console.log('Duplicate entry detectado en asistencias, insertando una por una...');
                        
                        for (const clase_id of clasesNuevas) {
                            try {
                                const [singleResult] = await connection.query(`
                                    INSERT IGNORE INTO asistencias (alumno_id, clase_id, mensualidad_id, es_prueba) 
                                    VALUES (?, ?, ?, 0)
                                `, [alumno_id, clase_id, mensualidad_id]);
                                
                                if (singleResult.insertId > 0) {
                                    nuevasAsistenciasIds.push(singleResult.insertId);
                                } else {
                                    // La asistencia ya existía, buscar su ID
                                    const [existing] = await connection.query(`
                                        SELECT id FROM asistencias 
                                        WHERE alumno_id = ? AND clase_id = ?
                                    `, [alumno_id, clase_id]);
                                    
                                    if (existing.length > 0) {
                                        nuevasAsistenciasIds.push(existing[0].id);
                                    }
                                }
                            } catch (singleError) {
                                console.error(`Error insertando asistencia individual para clase ${clase_id}:`, singleError.message);
                            }
                        }
                    } else {
                        throw insertError;
                    }
                }
            }

            const todosLosIds = [...asistenciasExistentesIds, ...nuevasAsistenciasIds];
            console.log('IDs finales de asistencias:', todosLosIds);
            return todosLosIds;

        } catch (error) {
            console.error('Error al crear registros de asistencia en lote:', error);
            throw error;
        }
    }

    // Mantener método original para compatibilidad
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

    // Registrar asistencia (entrada) - OPTIMIZADO con Luxon
    static async registrarEntrada(alumno_id, clase_id, hora_entrada = null) {
        try {
            // Usar Luxon para manejo consistente de tiempo
            const horaEntrada = hora_entrada || DateTime.now().toFormat('HH:mm:ss');

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

    // Registrar salida - OPTIMIZADO con Luxon
    static async registrarSalida(alumno_id, clase_id, hora_salida = null) {
        try {
            // Usar Luxon para manejo consistente de tiempo
            const horaSalida = hora_salida || DateTime.now().toFormat('HH:mm:ss');

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

    // Obtener asistencias por alumno - OPTIMIZADO con Luxon
    static async getAsistenciasByAlumno(alumno_id, fecha_inicio = null, fecha_fin = null) {
        try {
            let whereClause = 'WHERE a.alumno_id = ?';
            let params = [alumno_id];

            if (fecha_inicio && fecha_fin) {
                // Validar y convertir fechas usando Luxon si es necesario
                const fechaInicioStr = typeof fecha_inicio === 'string' ? fecha_inicio : DateTime.fromJSDate(fecha_inicio).toISODate();
                const fechaFinStr = typeof fecha_fin === 'string' ? fecha_fin : DateTime.fromJSDate(fecha_fin).toISODate();
                
                whereClause += ' AND c.fecha BETWEEN ? AND ?';
                params.push(fechaInicioStr, fechaFinStr);
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

    // Obtener estadísticas de asistencias - OPTIMIZADO con Luxon
    static async getEstadisticas(fecha_inicio = null, fecha_fin = null) {
        try {
            let whereClause = 'WHERE 1=1';
            let params = [];

            if (fecha_inicio && fecha_fin) {
                // Validar y convertir fechas usando Luxon si es necesario
                const fechaInicioStr = typeof fecha_inicio === 'string' ? fecha_inicio : DateTime.fromJSDate(fecha_inicio).toISODate();
                const fechaFinStr = typeof fecha_fin === 'string' ? fecha_fin : DateTime.fromJSDate(fecha_fin).toISODate();
                
                whereClause += ' AND c.fecha BETWEEN ? AND ?';
                params.push(fechaInicioStr, fechaFinStr);
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

    // Eliminar asistencias futuras por mensualidad (para cancelaciones) - OPTIMIZADO con Luxon
    static async eliminarAsistenciasFuturas(connection, mensualidad_id) {
        try {
            // Usar Luxon para obtener la fecha actual
            const fechaActual = DateTime.now().toISODate();

            const [result] = await connection.query(`
                DELETE a FROM asistencias a
                INNER JOIN clases c ON a.clase_id = c.id
                WHERE a.mensualidad_id = ? 
                AND c.fecha >= ?
                AND a.hora_entrada IS NULL
            `, [mensualidad_id, fechaActual]);

            return result.affectedRows;

        } catch (error) {
            throw error;
        }
    }

    // Obtener reporte de asistencias por grupo - OPTIMIZADO con Luxon
    static async getReporteAsistenciasPorGrupo(grupo_id, fecha_inicio, fecha_fin) {
        try {
            // Validar y convertir fechas usando Luxon si es necesario
            const fechaInicioStr = typeof fecha_inicio === 'string' ? fecha_inicio : DateTime.fromJSDate(fecha_inicio).toISODate();
            const fechaFinStr = typeof fecha_fin === 'string' ? fecha_fin : DateTime.fromJSDate(fecha_fin).toISODate();
            const fechaActual = DateTime.now().toISODate();

            const [rows] = await db.query(`
                SELECT 
                    al.id as alumno_id,
                    al.nombre,
                    al.apellido_paterno,
                    al.apellido_materno,
                    COUNT(a.id) as total_clases_programadas,
                    SUM(CASE WHEN a.hora_entrada IS NOT NULL THEN 1 ELSE 0 END) as clases_asistidas,
                    SUM(CASE WHEN a.hora_entrada IS NULL AND c.cancelada = 0 AND c.fecha < ? THEN 1 ELSE 0 END) as ausencias,
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
            `, [fechaActual, grupo_id, fechaInicioStr, fechaFinStr]);

            return rows;

        } catch (error) {
            throw error;
        }
    }

    // MÉTODO ADICIONAL: Validar formato de hora usando Luxon
    static validarFormatoHora(hora) {
        try {
            if (!hora) return null;
            
            // Si ya es string en formato correcto, retornarlo
            if (typeof hora === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(hora)) {
                return hora;
            }
            
            // Si es objeto Date, convertir usando Luxon
            if (hora instanceof Date) {
                return DateTime.fromJSDate(hora).toFormat('HH:mm:ss');
            }
            
            // Si es string pero en otro formato, intentar parsearlo
            if (typeof hora === 'string') {
                const parsed = DateTime.fromISO(hora);
                if (parsed.isValid) {
                    return parsed.toFormat('HH:mm:ss');
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error validando formato de hora:', error);
            return null;
        }
    }

    // MÉTODO ADICIONAL: Obtener fecha actual en formato consistente
    static getFechaActual() {
        return DateTime.now().toISODate(); // YYYY-MM-DD
    }

    // MÉTODO ADICIONAL: Obtener hora actual en formato consistente
    static getHoraActual() {
        return DateTime.now().toFormat('HH:mm:ss'); // HH:mm:ss
    }
}

export default asistenciasService;