// services/clasesService.js - Optimizado con Luxon
import db from '../config/db.js';
import { DateTime } from 'luxon';

class clasesService {
    
    // Generar clases para un período específico - OPTIMIZADO con Luxon
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
            const diaSemanaNombre = horario.dia;

            // Usar Luxon para manejo consistente de fechas
            const fechaInicio = DateTime.fromISO(fecha_inicio);
            const fechaFin = DateTime.fromISO(fecha_fin);

            // Mapeo de días de la semana para Luxon (1 = lunes, 7 = domingo)
            const diasSemana = {
                'lunes': 1,
                'martes': 2, 
                'miercoles': 3,
                'jueves': 4,
                'viernes': 5,
                'sabado': 6,
                'domingo': 7
            };

            const diaNumero = diasSemana[diaSemanaNombre];
            
            if (!diaNumero) {
                throw new Error(`Día de la semana inválido: ${diaSemanaNombre}`);
            }
            
            // Calcular todas las fechas usando Luxon
            const fechasClases = [];
            let fechaActual = fechaInicio;
            
            // Encontrar la primera fecha que coincida con el día de la semana
            while (fechaActual.weekday !== diaNumero && fechaActual <= fechaFin) {
                fechaActual = fechaActual.plus({ days: 1 });
            }

            // Generar todas las fechas del día específico
            while (fechaActual <= fechaFin) {
                fechasClases.push(fechaActual.toISODate()); // Formato YYYY-MM-DD
                fechaActual = fechaActual.plus({ weeks: 1 }); // Siguiente semana
            }

            if (fechasClases.length === 0) {
                // console.log(`No se encontraron fechas para ${diaSemanaNombre} entre ${fecha_inicio} y ${fecha_fin}`);
                return [];
            }

            // console.log('Fechas a procesar:', fechasClases);

            // OPTIMIZACIÓN: Verificar clases existentes en una sola consulta
            const placeholders = fechasClases.map(() => '?').join(',');
            const [clasesExistentes] = await connection.query(`
                SELECT DATE(fecha) as fecha_str, fecha, id FROM clases 
                WHERE horario_id = ? AND DATE(fecha) IN (${placeholders})
            `, [horario_id, ...fechasClases]);

            // console.log('Clases existentes encontradas:', clasesExistentes);

            // Crear mapa de clases existentes usando fecha en formato string para comparación correcta
            const clasesExistentesMap = new Map();
            clasesExistentes.forEach(clase => {
                // Usar la fecha en formato string para comparación
                const fechaStr = DateTime.fromJSDate(clase.fecha).toISODate();
                clasesExistentesMap.set(fechaStr, clase.id);
            });

            // console.log('Mapa de clases existentes:', clasesExistentesMap);

            // OPTIMIZACIÓN: Preparar datos para inserción en lote
            const clasesNuevas = [];
            const clasesIds = [];

            for (const fechaStr of fechasClases) {
                // console.log(`Procesando fecha: ${fechaStr}, existe: ${clasesExistentesMap.has(fechaStr)}`);
                
                if (clasesExistentesMap.has(fechaStr)) {
                    // Usar clase existente
                    clasesIds.push(clasesExistentesMap.get(fechaStr));
                    // console.log(`Usando clase existente ID: ${clasesExistentesMap.get(fechaStr)}`);
                } else {
                    // Preparar para crear nueva clase
                    clasesNuevas.push([
                        horario_id,
                        fechaStr, // Usar formato YYYY-MM-DD
                        0, // cancelada = false
                        `Clase generada automáticamente para ${diaSemanaNombre} ${fechaStr}`
                    ]);
                    // console.log(`Preparando nueva clase para: ${fechaStr}`);
                }
            }

            // console.log('Clases nuevas a insertar:', clasesNuevas.length);

            // OPTIMIZACIÓN: Insertar todas las clases nuevas de una vez
            if (clasesNuevas.length > 0) {
                try {
                    const placeholdersInsert = clasesNuevas.map(() => '(?, ?, ?, ?)').join(',');
                    const flatValues = clasesNuevas.flat();
                    
                    // console.log('SQL a ejecutar:', `INSERT INTO clases (horario_id, fecha, cancelada, observaciones) VALUES ${placeholdersInsert}`);
                    // console.log('Valores:', flatValues);

                    const [result] = await connection.query(`
                        INSERT INTO clases (horario_id, fecha, cancelada, observaciones) 
                        VALUES ${placeholdersInsert}
                    `, flatValues);

                    // Agregar los IDs de las clases recién creadas
                    const firstInsertId = result.insertId;
                    for (let i = 0; i < clasesNuevas.length; i++) {
                        clasesIds.push(firstInsertId + i);
                    }

                    // console.log(`Insertadas ${clasesNuevas.length} clases nuevas, primer ID: ${firstInsertId}`);
                } catch (insertError) {
                    console.error('Error en inserción de clases:', insertError);
                    
                    // Si hay error de duplicate key, intentar insertar una por una e ignorar duplicados
                    if (insertError.code === 'ER_DUP_ENTRY') {
                        // console.log('Duplicate entry detectado, insertando una por una...');
                        
                        for (const claseData of clasesNuevas) {
                            try {
                                const [singleResult] = await connection.query(`
                                    INSERT IGNORE INTO clases (horario_id, fecha, cancelada, observaciones) 
                                    VALUES (?, ?, ?, ?)
                                `, claseData);
                                
                                if (singleResult.insertId > 0) {
                                    clasesIds.push(singleResult.insertId);
                                    // console.log(`Clase individual insertada: ${singleResult.insertId}`);
                                } else {
                                    // La clase ya existía, buscar su ID
                                    const [existing] = await connection.query(`
                                        SELECT id FROM clases 
                                        WHERE horario_id = ? AND DATE(fecha) = ?
                                    `, [claseData[0], claseData[1]]);
                                    
                                    if (existing.length > 0) {
                                        clasesIds.push(existing[0].id);
                                        // console.log(`Usando clase existente encontrada: ${existing[0].id}`);
                                    }
                                }
                            } catch (singleError) {
                                console.error(`Error insertando clase individual ${claseData[1]}:`, singleError.message);
                            }
                        }
                    } else {
                        throw insertError;
                    }
                }
            }

            // console.log('IDs finales de clases:', clasesIds);
            return clasesIds;

        } catch (error) {
            console.error('Error al generar clases:', error);
            throw error;
        }
    }

    // Resto de métodos sin cambios...
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