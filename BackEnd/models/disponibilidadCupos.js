import db from '../config/db.js';

class disponibilidadCuposModel {
    
    // Obtener disponibilidad de cupos por mes específico
    static async getDisponibilidadPorMes(year, mes) {
        try {
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
                    CONCAT(p.nombre, ' ', p.apellido) as profesor_asignado
                FROM grupos g
                INNER JOIN horarios h ON g.id = h.grupo_id
                LEFT JOIN mensualidad_grupos mg ON h.id = mg.horario_id 
                    AND mg.year = ? AND mg.mes = ?
                LEFT JOIN mensualidades m ON mg.mensualidad_id = m.id
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
            `, [year, mes]);

            return rows;
        } catch (error) {
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
            const mesesUnion = mesesRango.map((m, index) => 
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
                    END as estado_disponibilidad
                FROM grupos g
                INNER JOIN horarios h ON g.id = h.grupo_id
                CROSS JOIN (
                    ${mesesUnion}
                ) AS meses_rango
                LEFT JOIN mensualidad_grupos mg ON h.id = mg.horario_id 
                    AND mg.year = meses_rango.year 
                    AND mg.mes = meses_rango.mes
                LEFT JOIN mensualidades m ON mg.mensualidad_id = m.id
                WHERE g.deleted = 0 
                    AND g.activo = 1
                    AND h.deleted = 0 
                    AND h.activo = 1
                GROUP BY g.id, h.id, meses_rango.year, meses_rango.mes
                ORDER BY meses_rango.year, meses_rango.mes, g.codigo, h.hora_inicio
            `);

            return rows;
        } catch (error) {
            throw error;
        }
    }
}

export default disponibilidadCuposModel;