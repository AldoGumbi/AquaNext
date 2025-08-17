import db from '../config/db.js';

class disponibilidadCuposModel {
    
    // Obtener disponibilidad de cupos por mes específico
    static async getDisponibilidadPorMes(year, mes) {
        try {
            // Calcular año y mes anterior
            const mesAnterior = mes === 1 ? 12 : mes - 1;
            const yearAnterior = mes === 1 ? year - 1 : year;

            const [rows] = await db.query(`
                SELECT 
                    g.id as grupo_id,
                    g.codigo,
                    g.nombre,
                    g.tipo,
                    h.id as horario_id,
                    h.dia,
                    TIME_FORMAT(h.hora_inicio, '%H:%i') as hora_inicio,
                    TIME_FORMAT(h.hora_fin, '%H:%i') as hora_fin,
                    COALESCE(h.cupo_maximo, 16) as cupo_maximo,
                    COUNT(DISTINCT mg.mensualidad_id) as cupos_ocupados,
                    COALESCE(h.cupo_maximo, 16) - COUNT(DISTINCT mg.mensualidad_id) as cupos_disponibles,
                    CASE 
                        WHEN COALESCE(h.cupo_maximo, 16) = 0 THEN 0
                        ELSE ROUND((COUNT(DISTINCT mg.mensualidad_id) / COALESCE(h.cupo_maximo, 16)) * 100, 2)
                    END as porcentaje_ocupacion,
                    CASE
                        WHEN COUNT(DISTINCT mg.mensualidad_id) = 0 THEN 'Disponible'
                        WHEN COUNT(DISTINCT mg.mensualidad_id) >= COALESCE(h.cupo_maximo, 16) THEN 'Lleno'
                        ELSE 'Parcialmente ocupado'
                    END as estado_disponibilidad,
                    CONCAT(p.nombre, ' ', p.apellido) as profesor_asignado,
                    
                    -- Información de alumnos actuales
                    JSON_ARRAYAGG(
                        CASE 
                            WHEN mg.mensualidad_id IS NOT NULL THEN
                                JSON_OBJECT(
                                    'alumno_id', a.id,
                                    'nombre_completo', CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', COALESCE(a.apellido_materno, '')),
                                    'mensualidad_id', mg.mensualidad_id,
                                    'fecha_inicio', m.fecha_inicio,
                                    'fecha_fin', m.fecha_fin,
                                    'pagada', m.pagada,
                                    'tipo_pago', 'actual'
                                )
                            ELSE NULL
                        END
                    ) as alumnos_actuales,
                    
                    -- Alumnos del mes anterior que no pagaron el actual
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'alumno_id', a_prev.id,
                                'nombre_completo', CONCAT(a_prev.nombre, ' ', a_prev.apellido_paterno, ' ', COALESCE(a_prev.apellido_materno, '')),
                                'mensualidad_id', mg_prev.mensualidad_id,
                                'fecha_inicio', m_prev.fecha_inicio,
                                'fecha_fin', m_prev.fecha_fin,
                                'tipo_pago', 'mes_anterior'
                            )
                        )
                        FROM mensualidad_grupos mg_prev
                        INNER JOIN mensualidades m_prev ON mg_prev.mensualidad_id = m_prev.id
                        INNER JOIN inscripciones i_prev ON m_prev.inscripcion_id = i_prev.id
                        INNER JOIN alumnos a_prev ON i_prev.alumno_id = a_prev.id
                        WHERE mg_prev.horario_id = h.id 
                            AND mg_prev.year = ?
                            AND mg_prev.mes = ?
                            AND a_prev.deleted = 0
                            AND a_prev.id NOT IN (
                                SELECT DISTINCT i_curr.alumno_id
                                FROM mensualidad_grupos mg_curr
                                INNER JOIN mensualidades m_curr ON mg_curr.mensualidad_id = m_curr.id
                                INNER JOIN inscripciones i_curr ON m_curr.inscripcion_id = i_curr.id
                                WHERE mg_curr.horario_id = h.id 
                                    AND mg_curr.year = ? 
                                    AND mg_curr.mes = ?
                                    AND i_curr.alumno_id IS NOT NULL
                            )
                    ) as alumnos_mes_anterior
                FROM grupos g
                INNER JOIN horarios h ON g.id = h.grupo_id
                LEFT JOIN mensualidad_grupos mg ON h.id = mg.horario_id 
                    AND mg.year = ? AND mg.mes = ?
                LEFT JOIN mensualidades m ON mg.mensualidad_id = m.id
                LEFT JOIN inscripciones i ON m.inscripcion_id = i.id
                LEFT JOIN alumnos a ON i.alumno_id = a.id AND a.deleted = 0
                LEFT JOIN profesores p ON h.profesor_id = p.id AND p.deleted = 0
                WHERE g.deleted = 0 
                    AND g.activo = 1
                    AND h.deleted = 0 
                    AND h.activo = 1
                GROUP BY g.id, h.id
                ORDER BY g.tipo, g.codigo, 
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
            `, [
                yearAnterior,  // Para mg_prev.year
                mesAnterior,   // Para mg_prev.mes
                year,          // Para mg_curr.year (subconsulta NOT IN)
                mes,           // Para mg_curr.mes (subconsulta NOT IN)
                year,          // Para mg.year (query principal)
                mes            // Para mg.mes (query principal)
            ]);

            return rows;
        } catch (error) {
            console.error('Error en getDisponibilidadPorMes:', error);
            throw error;
        }
    }

    // Obtener disponibilidad por rango de meses
    static async getDisponibilidadPorRango(yearInicio, mesInicio, yearFin, mesFin) {
        try {
            // Generar todos los meses en el rango especificado
            const mesesRango = [];
            let currentYear = yearInicio;
            let currentMes = mesInicio;
            
            while (currentYear < yearFin || (currentYear === yearFin && currentMes <= mesFin)) {
                mesesRango.push({ year: currentYear, mes: currentMes });
                currentMes++;
                if (currentMes > 12) {
                    currentMes = 1;
                    currentYear++;
                }
            }

            // Crear la subconsulta UNION para los meses del rango
            const mesesUnion = mesesRango.map((m) => 
                `SELECT ${m.year} as year, ${m.mes} as mes`
            ).join(' UNION ALL ');

            const [rows] = await db.query(`
                SELECT 
                    g.id as grupo_id,
                    g.codigo,
                    g.nombre,
                    g.tipo,
                    h.id as horario_id,
                    h.dia,
                    TIME_FORMAT(h.hora_inicio, '%H:%i') as hora_inicio,
                    TIME_FORMAT(h.hora_fin, '%H:%i') as hora_fin,
                    COALESCE(h.cupo_maximo, 16) as cupo_maximo,
                    meses_rango.year,
                    meses_rango.mes,
                    CASE 
                        WHEN meses_rango.mes = 1 THEN 'Enero'
                        WHEN meses_rango.mes = 2 THEN 'Febrero'
                        WHEN meses_rango.mes = 3 THEN 'Marzo'
                        WHEN meses_rango.mes = 4 THEN 'Abril'
                        WHEN meses_rango.mes = 5 THEN 'Mayo'
                        WHEN meses_rango.mes = 6 THEN 'Junio'
                        WHEN meses_rango.mes = 7 THEN 'Julio'
                        WHEN meses_rango.mes = 8 THEN 'Agosto'
                        WHEN meses_rango.mes = 9 THEN 'Septiembre'
                        WHEN meses_rango.mes = 10 THEN 'Octubre'
                        WHEN meses_rango.mes = 11 THEN 'Noviembre'
                        WHEN meses_rango.mes = 12 THEN 'Diciembre'
                    END as mes_nombre,
                    COALESCE(COUNT(DISTINCT mg.mensualidad_id), 0) as cupos_ocupados,
                    COALESCE(h.cupo_maximo, 16) - COALESCE(COUNT(DISTINCT mg.mensualidad_id), 0) as cupos_disponibles,
                    COALESCE(ROUND((COUNT(DISTINCT mg.mensualidad_id) / COALESCE(h.cupo_maximo, 16)) * 100, 2), 0) as porcentaje_ocupacion,
                    CASE
                        WHEN COALESCE(COUNT(DISTINCT mg.mensualidad_id), 0) = 0 THEN 'Disponible'
                        WHEN COALESCE(COUNT(DISTINCT mg.mensualidad_id), 0) >= COALESCE(h.cupo_maximo, 16) THEN 'Lleno'
                        ELSE 'Parcialmente ocupado'
                    END as estado_disponibilidad,
                    -- Información de alumnos para cada mes
                    JSON_ARRAYAGG(
                        CASE 
                            WHEN mg.mensualidad_id IS NOT NULL THEN
                                JSON_OBJECT(
                                    'alumno_id', a.id,
                                    'nombre_completo', CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', COALESCE(a.apellido_materno, '')),
                                    'mensualidad_id', mg.mensualidad_id
                                )
                            ELSE NULL
                        END
                    ) as alumnos_mes
                FROM grupos g
                INNER JOIN horarios h ON g.id = h.grupo_id
                CROSS JOIN (
                    ${mesesUnion}
                ) AS meses_rango
                LEFT JOIN mensualidad_grupos mg ON h.id = mg.horario_id 
                    AND mg.year = meses_rango.year 
                    AND mg.mes = meses_rango.mes
                LEFT JOIN mensualidades m ON mg.mensualidad_id = m.id
                LEFT JOIN inscripciones i ON m.inscripcion_id = i.id
                LEFT JOIN alumnos a ON i.alumno_id = a.id AND a.deleted = 0
                WHERE g.deleted = 0 
                    AND g.activo = 1
                    AND h.deleted = 0 
                    AND h.activo = 1
                GROUP BY g.id, h.id, meses_rango.year, meses_rango.mes
                ORDER BY meses_rango.year, meses_rango.mes, g.codigo, h.hora_inicio
            `);

            return rows;
        } catch (error) {
            console.error('Error en getDisponibilidadPorRango:', error);
            throw error;
        }
    }

    // Método adicional para debugging - obtener alumnos específicos de un horario y mes
    static async getAlumnosPorHorarioYMes(horarioId, year, mes) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    a.id as alumno_id,
                    CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', COALESCE(a.apellido_materno, '')) as nombre_completo,
                    mg.mensualidad_id,
                    m.fecha_inicio,
                    m.fecha_fin,
                    m.pagada,
                    mg.year,
                    mg.mes
                FROM mensualidad_grupos mg
                INNER JOIN mensualidades m ON mg.mensualidad_id = m.id
                INNER JOIN inscripciones i ON m.inscripcion_id = i.id
                INNER JOIN alumnos a ON i.alumno_id = a.id
                WHERE mg.horario_id = ?
                    AND mg.year = ?
                    AND mg.mes = ?
                    AND a.deleted = 0
                ORDER BY a.nombre, a.apellido_paterno
            `, [horarioId, year, mes]);

            return rows;
        } catch (error) {
            console.error('Error en getAlumnosPorHorarioYMes:', error);
            throw error;
        }
    }
}

export default disponibilidadCuposModel;