// models/mensualidadMovimientos.js
import db from '../config/db.js';
import { DateTime } from 'luxon';

class MensualidadMovimientosModel {

    /**
     * Inicia el proceso de movimiento de una mensualidad
     */
    static async iniciarMovimiento({ 
        mensualidad_id, 
        usuario_id, 
        motivo, 
        periodo_desde, 
        periodo_hasta, 
        tipo_periodo, 
        horarios_anteriores, 
        horarios_nuevos,
        clasificacion_horarios
    }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Crear registro del movimiento CON LA CLASIFICACIÓN
            const [movimientoResult] = await connection.query(`
                INSERT INTO mensualidad_movimientos (
                    mensualidad_id,
                    usuario_id,
                    motivo,
                    periodo_desde,
                    periodo_hasta,
                    tipo_periodo,
                    horarios_anteriores,
                    horarios_nuevos,
                    estatus,
                    detalles_adicionales
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_proceso', ?)
            `, [
                mensualidad_id,
                usuario_id,
                motivo,
                periodo_desde,
                periodo_hasta,
                tipo_periodo,
                JSON.stringify(horarios_anteriores),
                JSON.stringify(horarios_nuevos),
                JSON.stringify({
                    clasificacion: clasificacion_horarios,
                    fecha_procesamiento: DateTime.now().toISO()
                })
            ]);

            const movimientoId = movimientoResult.insertId;
            await connection.commit();

            return {
                success: true,
                movimiento_id: movimientoId,
                message: 'Movimiento iniciado correctamente'
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error al iniciar movimiento:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Ejecuta el movimiento de mensualidad completo
     * MODIFICADO: Ahora usa la clasificación de horarios
     */
    static async ejecutarMovimiento(movimiento_id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Obtener datos del movimiento
            const [movimiento] = await connection.query(`
                SELECT * FROM mensualidad_movimientos 
                WHERE id = ? AND estatus = 'en_proceso'
            `, [movimiento_id]);

            if (movimiento.length === 0) {
                throw new Error('Movimiento no encontrado o ya procesado');
            }

            const mov = movimiento[0];
            let horariosAnteriores, horariosNuevos, detallesAdicionales;
        
            try {
                horariosAnteriores = typeof mov.horarios_anteriores === 'string' 
                    ? JSON.parse(mov.horarios_anteriores) 
                    : mov.horarios_anteriores;
                    
                horariosNuevos = typeof mov.horarios_nuevos === 'string' 
                    ? JSON.parse(mov.horarios_nuevos) 
                    : mov.horarios_nuevos;

                detallesAdicionales = typeof mov.detalles_adicionales === 'string'
                    ? JSON.parse(mov.detalles_adicionales)
                    : mov.detalles_adicionales;
                    
                if (!Array.isArray(horariosAnteriores)) {
                    throw new Error('horarios_anteriores no es un array válido');
                }
                if (!Array.isArray(horariosNuevos)) {
                    throw new Error('horarios_nuevos no es un array válido');
                }
                    
            } catch (parseError) {
                console.error('❌ Error al parsear horarios:', parseError);
                throw new Error(`Datos de horarios inválidos: ${parseError.message}`);
            }

            // 2. Obtener clasificación de horarios
            const clasificacion = detallesAdicionales?.clasificacion || 
                this.clasificarHorariosEnMovimiento(horariosAnteriores, horariosNuevos);

            console.log('📊 Clasificación de horarios:', {
                mantenidos: clasificacion.horarios_mantenidos.length,
                eliminados: clasificacion.horarios_eliminados.length,
                agregados: clasificacion.horarios_agregados.length
            });

            // 3. Crear backup solo de horarios que se van a eliminar
            if (clasificacion.horarios_eliminados.length > 0) {
                await this.crearBackupHorarios(
                    connection, 
                    movimiento_id, 
                    mov.mensualidad_id, 
                    clasificacion.horarios_eliminados, 
                    'eliminado'
                );
            }

            // 4. Eliminar asistencias futuras SOLO de horarios que se eliminan
            const asistenciasEliminadas = await this.eliminarAsistenciasFuturasPorHorarios(
                connection, 
                mov.mensualidad_id, 
                mov.periodo_desde,
                clasificacion.horarios_eliminados
            );

            console.log(`🗑️ Asistencias eliminadas: ${asistenciasEliminadas}`);

            // 5. Actualizar horarios en mensualidad_grupos
            await this.actualizarHorariosMensualidadConClasificacion(
                connection,
                mov.mensualidad_id,
                mov.periodo_desde,
                mov.periodo_hasta,
                clasificacion
            );

            // 6. Generar nuevas clases SOLO para horarios agregados
            const clasesGeneradas = await this.generarNuevasClasesPorHorarios(
                connection,
                mov.mensualidad_id,
                mov.periodo_desde,
                mov.periodo_hasta,
                clasificacion.horarios_agregados
            );

            // 7. Crear backup de nuevos horarios agregados
            if (clasificacion.horarios_agregados.length > 0) {
                await this.crearBackupHorarios(
                    connection, 
                    movimiento_id, 
                    mov.mensualidad_id, 
                    clasificacion.horarios_agregados, 
                    'agregado'
                );
            }

            // 8. Actualizar estado del movimiento
            await connection.query(`
                UPDATE mensualidad_movimientos 
                SET estatus = 'completado',
                    asistencias_eliminadas = ?,
                    clases_nuevas_generadas = ?,
                    detalles_adicionales = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [
                asistenciasEliminadas, 
                clasesGeneradas,
                JSON.stringify({
                    ...detallesAdicionales,
                    clasificacion: clasificacion,
                    resultado: {
                        horarios_mantenidos: clasificacion.horarios_mantenidos.length,
                        horarios_eliminados: clasificacion.horarios_eliminados.length,
                        horarios_agregados: clasificacion.horarios_agregados.length,
                        asistencias_eliminadas: asistenciasEliminadas,
                        clases_generadas: clasesGeneradas
                    }
                }),
                movimiento_id
            ]);

            await connection.commit();

            return {
                success: true,
                movimiento_id: movimiento_id,
                asistencias_eliminadas: asistenciasEliminadas,
                clases_nuevas_generadas: clasesGeneradas,
                horarios_mantenidos: clasificacion.horarios_mantenidos.length,
                horarios_cambiados: clasificacion.horarios_agregados.length,
                message: 'Movimiento ejecutado correctamente'
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error al ejecutar movimiento:', error);
            
            await this.marcarMovimientoFallido(movimiento_id, error.message);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * NUEVA FUNCIÓN: Clasifica horarios en el movimiento
     * SIMPLIFICADO: Todos los horarios deben tener los mismos períodos
     */
    static clasificarHorariosEnMovimiento(horarios_anteriores, horarios_nuevos) {
        const horariosMantenidos = [];
        const horariosEliminados = [];
        const horariosAgregados = [];

        const mapaAnteriores = new Map(
            horarios_anteriores.map(h => [h.horario_id, h])
        );
        const mapaNuevos = new Map(
            horarios_nuevos.map(h => [h.horario_id, h])
        );

        // Identificar mantenidos y eliminados
        horarios_anteriores.forEach(horario => {
            if (mapaNuevos.has(horario.horario_id)) {
                horariosMantenidos.push(horario);
            } else {
                horariosEliminados.push(horario);
            }
        });

        // Identificar agregados
        // IMPORTANTE: Todos ya deben tener períodos asignados antes de llegar aquí
        horarios_nuevos.forEach(horario => {
            if (!mapaAnteriores.has(horario.horario_id)) {
                horariosAgregados.push(horario);
            }
        });

        console.log('📊 Clasificación detallada:', {
            mantenidos: horariosMantenidos.map(h => ({
                id: h.horario_id,
                dia: h.dia,
                hora: `${h.hora_inicio}-${h.hora_fin}`,
                periodos: h.periodos?.length || 0
            })),
            eliminados: horariosEliminados.map(h => ({
                id: h.horario_id,
                dia: h.dia,
                hora: `${h.hora_inicio}-${h.hora_fin}`,
                periodos: h.periodos?.length || 0
            })),
            agregados: horariosAgregados.map(h => ({
                id: h.horario_id,
                dia: h.dia,
                hora: `${h.hora_inicio}-${h.hora_fin}`,
                periodos: h.periodos?.length || 0
            }))
        });

        return {
            horarios_mantenidos: horariosMantenidos,
            horarios_eliminados: horariosEliminados,
            horarios_agregados: horariosAgregados
        };
    }

    /**
     * Crea backup de horarios durante el movimiento
     */
    static async crearBackupHorarios(connection, movimiento_id, mensualidad_id, horarios, accion) {
        if (!horarios || horarios.length === 0) return;

        const backupData = [];
        for (const horario of horarios) {
            for (const periodo of horario.periodos) {
                backupData.push([
                    movimiento_id,
                    mensualidad_id,
                    horario.grupo_id,
                    horario.horario_id,
                    periodo.mes,
                    periodo.year,
                    accion
                ]);
            }
        }

        if (backupData.length > 0) {
            const placeholders = backupData.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
            const flatValues = backupData.flat();

            await connection.query(`
                INSERT INTO mensualidad_grupos_backup (
                    movimiento_id, mensualidad_id, grupo_id, horario_id, 
                    mes, year, accion
                ) VALUES ${placeholders}
            `, flatValues);
        }
    }

    /**
     * MODIFICADO: Elimina asistencias futuras solo de horarios específicos
     */
    static async eliminarAsistenciasFuturasPorHorarios(connection, mensualidad_id, fecha_desde, horarios_a_eliminar) {
        if (!horarios_a_eliminar || horarios_a_eliminar.length === 0) {
            console.log('ℹ️ No hay horarios para eliminar, manteniendo todas las asistencias');
            return 0;
        }

        const parsearFecha = (fecha) => {
            if (!fecha) return null;
            if (fecha instanceof DateTime && fecha.isValid) return fecha;
            if (typeof fecha === 'string') {
                let dt = DateTime.fromISO(fecha);
                if (dt.isValid) return dt;
                dt = DateTime.fromSQL(fecha);
                if (dt.isValid) return dt;
                dt = DateTime.fromJSDate(new Date(fecha));
                if (dt.isValid) return dt;
            }
            if (fecha instanceof Date) {
                return DateTime.fromJSDate(fecha);
            }
            return null;
        };

        const fechaDesdeParseada = parsearFecha(fecha_desde);
        if (!fechaDesdeParseada) {
            throw new Error('No se pudo parsear la fecha_desde correctamente');
        }

        const fechaDesdeSQL = fechaDesdeParseada.toISODate();
        const horarios_ids = horarios_a_eliminar.map(h => h.horario_id);
        const placeholders = horarios_ids.map(() => '?').join(',');

        console.log(`🗑️ Eliminando asistencias de ${horarios_ids.length} horarios desde ${fechaDesdeSQL}`);

        const [result] = await connection.query(`
            DELETE a FROM asistencias a
            INNER JOIN clases c ON a.clase_id = c.id
            WHERE a.mensualidad_id = ?
            AND c.horario_id IN (${placeholders})
            AND c.fecha >= ?
            AND a.hora_entrada IS NULL
        `, [mensualidad_id, ...horarios_ids, fechaDesdeSQL]);

        return result.affectedRows || 0;
    }

    /**
     * NUEVA FUNCIÓN: Actualiza horarios usando clasificación
     */
    static async actualizarHorariosMensualidadConClasificacion(
        connection, 
        mensualidad_id, 
        fecha_desde, 
        fecha_hasta, 
        clasificacion
    ) {
        const parsearFecha = (fecha) => {
            if (!fecha) return null;
            if (fecha instanceof DateTime && fecha.isValid) return fecha;
            if (typeof fecha === 'string') {
                let dt = DateTime.fromISO(fecha);
                if (dt.isValid) return dt;
                dt = DateTime.fromSQL(fecha);
                if (dt.isValid) return dt;
                dt = DateTime.fromJSDate(new Date(fecha));
                if (dt.isValid) return dt;
            }
            if (fecha instanceof Date) return DateTime.fromJSDate(fecha);
            return null;
        };

        const fechaDesdeParseada = parsearFecha(fecha_desde);
        const fechaHastaParseada = parsearFecha(fecha_hasta);
        
        if (!fechaDesdeParseada || !fechaHastaParseada) {
            throw new Error('No se pudieron parsear las fechas del período correctamente');
        }

        // 1. Eliminar SOLO horarios que se eliminan
        if (clasificacion.horarios_eliminados && clasificacion.horarios_eliminados.length > 0) {
            console.log(`🗑️ Eliminando ${clasificacion.horarios_eliminados.length} horarios de mensualidad_grupos`);
            
            for (const horario of clasificacion.horarios_eliminados) {
                const periodosAEliminar = horario.periodos.filter(p => {
                    const fechaPeriodo = DateTime.fromObject({ year: p.year, month: p.mes });
                    return fechaPeriodo >= fechaDesdeParseada.startOf('month') && 
                           fechaPeriodo <= fechaHastaParseada.startOf('month');
                });

                for (const periodo of periodosAEliminar) {
                    await connection.query(`
                        DELETE FROM mensualidad_grupos 
                        WHERE mensualidad_id = ? 
                        AND horario_id = ? 
                        AND mes = ? 
                        AND year = ?
                    `, [mensualidad_id, horario.horario_id, periodo.mes, periodo.year]);
                }
            }
        }

        // 2. Insertar SOLO horarios nuevos (los mantenidos ya están en la DB)
        if (clasificacion.horarios_agregados && clasificacion.horarios_agregados.length > 0) {
            console.log(`➕ Agregando ${clasificacion.horarios_agregados.length} horarios nuevos a mensualidad_grupos`);
            
            const insertData = [];
            for (const horario of clasificacion.horarios_agregados) {
                for (const periodo of horario.periodos) {
                    const fechaPeriodo = DateTime.fromObject({ year: periodo.year, month: periodo.mes });
                    
                    if (fechaPeriodo >= fechaDesdeParseada.startOf('month') && 
                        fechaPeriodo <= fechaHastaParseada.startOf('month')) {
                        insertData.push([
                            mensualidad_id,
                            horario.grupo_id,
                            horario.horario_id,
                            periodo.mes,
                            periodo.year
                        ]);
                    }
                }
            }

            if (insertData.length > 0) {
                const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(',');
                const flatValues = insertData.flat();

                await connection.query(`
                    INSERT INTO mensualidad_grupos (mensualidad_id, grupo_id, horario_id, mes, year)
                    VALUES ${placeholders}
                `, flatValues);
            }
        }

        console.log(`✅ Horarios mantenidos: ${clasificacion.horarios_mantenidos.length} (sin cambios en DB)`);
    }

    /**
     * MODIFICADO: Genera clases solo para horarios nuevos
     * CORREGIDO: Maneja horarios sin períodos predefinidos
     */
    static async generarNuevasClasesPorHorarios(connection, mensualidad_id, fecha_desde, fecha_hasta, horarios_nuevos) {
        if (!horarios_nuevos || horarios_nuevos.length === 0) {
            console.log('ℹ️ No hay horarios nuevos, no se generan clases adicionales');
            return 0;
        }

        let totalClasesGeneradas = 0;

        const parsearFecha = (fecha) => {
            if (!fecha) return null;
            if (fecha instanceof DateTime && fecha.isValid) return fecha;
            if (typeof fecha === 'string') {
                let dt = DateTime.fromISO(fecha);
                if (dt.isValid) return dt;
                dt = DateTime.fromSQL(fecha);
                if (dt.isValid) return dt;
                dt = DateTime.fromJSDate(new Date(fecha));
                if (dt.isValid) return dt;
            }
            if (fecha instanceof Date) return DateTime.fromJSDate(fecha);
            return null;
        };

        const fechaDesdeParseada = parsearFecha(fecha_desde);
        const fechaHastaParseada = parsearFecha(fecha_hasta);
        
        if (!fechaDesdeParseada || !fechaHastaParseada) {
            throw new Error('No se pudieron parsear las fechas del período correctamente');
        }

        const fechaDesdeISO = fechaDesdeParseada.toISODate();
        const fechaHastaISO = fechaHastaParseada.toISODate();

        const [mensualidadInfo] = await connection.query(`
            SELECT i.alumno_id FROM mensualidades m
            INNER JOIN inscripciones i ON m.inscripcion_id = i.id
            WHERE m.id = ?
        `, [mensualidad_id]);

        if (mensualidadInfo.length === 0) {
            throw new Error('No se pudo obtener información del alumno');
        }

        const alumno_id = mensualidadInfo[0].alumno_id;

        const { default: clasesService } = await import('../services/clasesService.js');
        const { default: asistenciasService } = await import('../services/asistenciasService.js');

        console.log(`📅 Generando clases para ${horarios_nuevos.length} horarios nuevos`);

        for (const horario of horarios_nuevos) {
            try {
                const clasesIds = await clasesService.generarClasesParaPeriodo(
                    connection,
                    horario.horario_id,
                    fechaDesdeISO,
                    fechaHastaISO
                );

                console.log(`✅ Clases generadas para horario ${horario.horario_id}:`, clasesIds.length);

                if (clasesIds.length > 0) {
                    await asistenciasService.crearRegistrosAsistenciaEnLote(
                        connection,
                        alumno_id,
                        clasesIds,
                        mensualidad_id
                    );
                    
                    totalClasesGeneradas += clasesIds.length;
                }
            } catch (error) {
                console.error(`❌ Error generando clases para horario ${horario.horario_id}:`, error);
                // Continuar con los demás horarios incluso si uno falla
            }
        }

        console.log(`✅ Total de clases nuevas generadas: ${totalClasesGeneradas}`);
        return totalClasesGeneradas;
    }

    /**
     * Marca un movimiento como fallido
     */
    static async marcarMovimientoFallido(movimiento_id, error_message) {
        try {
            await db.query(`
                UPDATE mensualidad_movimientos 
                SET estatus = 'fallido',
                    detalles_adicionales = JSON_OBJECT('error', ?),
                    updated_at = NOW()
                WHERE id = ?
            `, [error_message, movimiento_id]);
        } catch (error) {
            console.error('Error al marcar movimiento como fallido:', error);
        }
    }

    /**
     * Obtiene el historial de movimientos de una mensualidad
     */
    static async getHistorialMovimientos(mensualidad_id) {
        try {
            const [movimientos] = await db.query(`
                SELECT 
                    mm.*,
                    u.username as usuario_nombre,
                    u.email as usuario_email
                FROM mensualidad_movimientos mm
                LEFT JOIN usuarios u ON mm.usuario_id = u.id
                WHERE mm.mensualidad_id = ?
                ORDER BY mm.created_at DESC
            `, [mensualidad_id]);

            const movimientosEnriquecidos = await Promise.all(
                movimientos.map(async (movimiento) => {
                    let horariosAnteriores = [];
                    let horariosNuevos = [];

                    try {
                        horariosAnteriores = typeof movimiento.horarios_anteriores === 'string' 
                            ? JSON.parse(movimiento.horarios_anteriores)
                            : movimiento.horarios_anteriores || [];
                        
                        horariosNuevos = typeof movimiento.horarios_nuevos === 'string'
                            ? JSON.parse(movimiento.horarios_nuevos)
                            : movimiento.horarios_nuevos || [];
                    } catch (e) {
                        console.error('Error al parsear horarios del movimiento:', e);
                    }

                    const horariosAnterioresEnriquecidos = await Promise.all(
                        horariosAnteriores.map(async (horario) => {
                            const infoHorario = await this.getInfoHorario(horario.horario_id);
                            return { ...horario, ...infoHorario };
                        })
                    );

                    const horariosNuevosEnriquecidos = await Promise.all(
                        horariosNuevos.map(async (horario) => {
                            const infoHorario = await this.getInfoHorario(horario.horario_id);
                            return { ...horario, ...infoHorario };
                        })
                    );

                    return {
                        ...movimiento,
                        horarios_anteriores: horariosAnterioresEnriquecidos,
                        horarios_nuevos: horariosNuevosEnriquecidos
                    };
                })
            );

            return movimientosEnriquecidos;

        } catch (error) {
            console.error('Error al obtener historial de movimientos:', error);
            throw error;
        }
    }

    /**
     * Obtiene información detallada de un horario
     */
    static async getInfoHorario(horario_id) {
        try {
            const [infoHorario] = await db.query(`
                SELECT 
                    h.id as horario_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    h.cupo_maximo,
                    h.activo as horario_activo,
                    g.id as grupo_id,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    g.nivel as grupo_nivel,
                    g.descripcion as grupo_descripcion,
                    p.id as profesor_id,
                    p.nombre as profesor_nombre,
                    p.apellido as profesor_apellido,
                    p.telefono as profesor_telefono
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id
                WHERE h.id = ?
                LIMIT 1
            `, [horario_id]);

            if (infoHorario.length === 0) {
                return {
                    horario_encontrado: false,
                    mensaje: 'Horario no encontrado o eliminado'
                };
            }

            const horario = infoHorario[0];

            return {
                horario_encontrado: true,
                grupo: {
                    id: horario.grupo_id,
                    codigo: horario.grupo_codigo,
                    nombre: horario.grupo_nombre,
                    tipo: horario.grupo_tipo,
                    nivel: horario.grupo_nivel,
                    descripcion: horario.grupo_descripcion
                },
                profesor: horario.profesor_id ? {
                    id: horario.profesor_id,
                    nombre: horario.profesor_nombre,
                    apellido: horario.profesor_apellido,
                    nombre_completo: `${horario.profesor_nombre} ${horario.profesor_apellido}`.trim(),
                    email: horario.profesor_email,
                    telefono: horario.profesor_telefono
                } : null,
                cupo_maximo: horario.cupo_maximo,
                horario_activo: Boolean(horario.horario_activo)
            };

        } catch (error) {
            console.error(`Error al obtener información del horario ${horario_id}:`, error);
            return {
                horario_encontrado: false,
                mensaje: 'Error al obtener información del horario',
                error: error.message
            };
        }
    }

    /**
     * Verifica si una mensualidad se puede mover
     */
    static async verificarSePuedeMovern(mensualidad_id, fecha_desde = null) {
        try {
            const [mensualidad] = await db.query(`
                SELECT 
                    m.*,
                    i.alumno_id,
                    a.nombre as alumno_nombre,
                    a.apellido_paterno,
                    a.apellido_materno
                FROM mensualidades m
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE m.id = ? AND m.cancelada = 0
            `, [mensualidad_id]);

            if (mensualidad.length === 0) {
                return {
                    puede_mover: false,
                    motivo: 'Mensualidad no encontrada o cancelada'
                };
            }

            const mens = mensualidad[0];
            const hoy = DateTime.now();
            const fechaInicio = DateTime.fromJSDate(mens.fecha_inicio);
            const fechaFin = DateTime.fromJSDate(mens.fecha_fin);

            if (fechaFin < hoy) {
                return {
                    puede_mover: false,
                    motivo: 'No se pueden mover mensualidades que ya terminaron'
                };
            }

            const fechaDesde = fecha_desde ? 
                DateTime.fromISO(fecha_desde) : 
                DateTime.max(hoy, fechaInicio);

            return {
                puede_mover: true,
                mensualidad: mens,
                fecha_minima_movimiento: fechaDesde.toISODate(),
                mensaje: 'La mensualidad se puede mover'
            };

        } catch (error) {
            console.error('Error al verificar si se puede mover:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de movimientos
     */
    static async getEstadisticasMovimientos(fecha_inicio = null, fecha_fin = null) {
        try {
            let whereClause = 'WHERE 1=1';
            let params = [];

            if (fecha_inicio) {
                whereClause += ' AND DATE(mm.fecha_movimiento) >= ?';
                params.push(fecha_inicio);
            }

            if (fecha_fin) {
                whereClause += ' AND DATE(mm.fecha_movimiento) <= ?';
                params.push(fecha_fin);
            }

            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_movimientos,
                    SUM(CASE WHEN estatus = 'completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN estatus = 'fallido' THEN 1 ELSE 0 END) as fallidos,
                    SUM(CASE WHEN estatus = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
                    SUM(asistencias_eliminadas) as total_asistencias_eliminadas,
                    SUM(clases_nuevas_generadas) as total_clases_generadas,
                    COUNT(DISTINCT mensualidad_id) as mensualidades_afectadas
                FROM mensualidad_movimientos mm
                ${whereClause}
            `, params);

            return stats[0];
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
}

export default MensualidadMovimientosModel;