// models/tarifas.js
import db from '../config/db.js';

class tarifasModel {

    // Crear nueva tarifa
    static async create({ tipo_clase, clases_por_semana, monto_mensual }) {
        try {
            const [result] = await db.query(`
                INSERT INTO tarifas_mensualidad (
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    activa
                ) VALUES (?, ?, ?, 1)
            `, [tipo_clase, clases_por_semana, monto_mensual]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las tarifas
    static async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    activa,
                    created_at,
                    CASE tipo_clase
                        WHEN 'grupo_adultos' THEN 'Grupo Adultos'
                        WHEN 'grupo_preescolar' THEN 'Grupo Preescolar'
                        WHEN 'grupo_escolar' THEN 'Grupo Escolar'
                        WHEN 'aquafitness' THEN 'Aquafitness'
                        WHEN 'nado_libre' THEN 'Nado Libre'
                        WHEN 'activacion_fisica_adulto_mayor' THEN 'Activación Física Adulto Mayor'
                        WHEN 'matronatacion' THEN 'Matronatación'
                        ELSE tipo_clase
                    END as tipo_clase_display
                FROM tarifas_mensualidad
                ORDER BY 
                    CASE tipo_clase
                        WHEN 'grupo_preescolar' THEN 1
                        WHEN 'grupo_escolar' THEN 2
                        WHEN 'grupo_adultos' THEN 3
                        WHEN 'matronatacion' THEN 4
                        WHEN 'aquafitness' THEN 5
                        WHEN 'activacion_fisica_adulto_mayor' THEN 6
                        WHEN 'nado_libre' THEN 7
                        ELSE 8
                    END,
                    clases_por_semana ASC
            `);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener tarifas activas
    static async getActivas() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    CASE tipo_clase
                        WHEN 'grupo_adultos' THEN 'Grupo Adultos'
                        WHEN 'grupo_preescolar' THEN 'Grupo Preescolar'
                        WHEN 'grupo_escolar' THEN 'Grupo Escolar'
                        WHEN 'aquafitness' THEN 'Aquafitness'
                        WHEN 'nado_libre' THEN 'Nado Libre'
                        WHEN 'activacion_fisica_adulto_mayor' THEN 'Activación Física Adulto Mayor'
                        WHEN 'matronatacion' THEN 'Matronatación'
                        ELSE tipo_clase
                    END as tipo_clase_display
                FROM tarifas_mensualidad
                WHERE activa = 1
                ORDER BY 
                    CASE tipo_clase
                        WHEN 'grupo_preescolar' THEN 1
                        WHEN 'grupo_escolar' THEN 2
                        WHEN 'grupo_adultos' THEN 3
                        WHEN 'matronatacion' THEN 4
                        WHEN 'aquafitness' THEN 5
                        WHEN 'activacion_fisica_adulto_mayor' THEN 6
                        WHEN 'nado_libre' THEN 7
                        ELSE 8
                    END,
                    clases_por_semana ASC
            `);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener tarifa por tipo y clases por semana
    static async getByTipoYClases(tipo_clase, clases_por_semana) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    activa
                FROM tarifas_mensualidad
                WHERE tipo_clase = ? 
                AND clases_por_semana = ?
                AND activa = 1
                LIMIT 1
            `, [tipo_clase, clases_por_semana]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener tarifas por tipo
    static async getByTipo(tipo_clase) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    activa,
                    created_at
                FROM tarifas_mensualidad
                WHERE tipo_clase = ?
                AND activa = 1
                ORDER BY clases_por_semana ASC
            `, [tipo_clase]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener tarifa por ID
    static async getById(tarifa_id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    activa,
                    created_at
                FROM tarifas_mensualidad
                WHERE id = ?
            `, [tarifa_id]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar tarifa
    static async update(tarifa_id, { tipo_clase, clases_por_semana, monto_mensual, activa }) {
        try {
            const updateFields = [];
            const params = [];

            if (tipo_clase !== undefined) {
                updateFields.push('tipo_clase = ?');
                params.push(tipo_clase);
            }

            if (clases_por_semana !== undefined) {
                updateFields.push('clases_por_semana = ?');
                params.push(clases_por_semana);
            }

            if (monto_mensual !== undefined) {
                updateFields.push('monto_mensual = ?');
                params.push(monto_mensual);
            }

            if (activa !== undefined) {
                updateFields.push('activa = ?');
                params.push(activa);
            }

            if (updateFields.length === 0) {
                return false;
            }

            params.push(tarifa_id);

            const [result] = await db.query(`
                UPDATE tarifas_mensualidad 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, params);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar (desactivar) tarifa
    static async delete(tarifa_id) {
        try {
            const [result] = await db.query(`
                UPDATE tarifas_mensualidad 
                SET activa = 0
                WHERE id = ?
            `, [tarifa_id]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar permanentemente tarifa
    static async hardDelete(tarifa_id) {
        try {
            // Verificar que no esté siendo usada en mensualidades
            const [mensualidades] = await db.query(`
                SELECT COUNT(*) as count
                FROM mensualidades m
                INNER JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                INNER JOIN grupos g ON mg.grupo_id = g.id
                INNER JOIN tarifas_mensualidad t ON g.tipo = t.tipo_clase
                WHERE t.id = ?
            `, [tarifa_id]);

            if (mensualidades[0].count > 0) {
                throw new Error('No se puede eliminar la tarifa porque está siendo usada en mensualidades existentes');
            }

            const [result] = await db.query(`
                DELETE FROM tarifas_mensualidad 
                WHERE id = ?
            `, [tarifa_id]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Calcular monto mensual basado en días
    static calcularMontoProporcional(monto_mensual, fecha_inicio, fecha_fin) {
        const fechaInicioDate = new Date(fecha_inicio);
        const fechaFinDate = new Date(fecha_fin);
        
        // Calcular días totales del mes
        const year = fechaInicioDate.getFullYear();
        const month = fechaInicioDate.getMonth();
        const diasTotalesMes = new Date(year, month + 1, 0).getDate();
        
        // Calcular días de la mensualidad
        const diasMensualidad = Math.ceil((fechaFinDate - fechaInicioDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Calcular monto proporcional
        const montoProporcional = (monto_mensual / diasTotalesMes) * diasMensualidad;
        
        return Math.round(montoProporcional * 100) / 100; // Redondear a 2 decimales
    }

    // Obtener estadísticas de tarifas
    static async getEstadisticas() {
        try {
            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total_tarifas,
                    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) as tarifas_activas,
                    SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) as tarifas_inactivas,
                    AVG(monto_mensual) as promedio_monto,
                    MIN(monto_mensual) as monto_minimo,
                    MAX(monto_mensual) as monto_maximo
                FROM tarifas_mensualidad
            `);

            const [porTipo] = await db.query(`
                SELECT 
                    tipo_clase,
                    COUNT(*) as cantidad_tarifas,
                    AVG(monto_mensual) as promedio_monto,
                    MIN(monto_mensual) as monto_minimo,
                    MAX(monto_mensual) as monto_maximo,
                    CASE tipo_clase
                        WHEN 'grupo_adultos' THEN 'Grupo Adultos'
                        WHEN 'grupo_preescolar' THEN 'Grupo Preescolar'
                        WHEN 'grupo_escolar' THEN 'Grupo Escolar'
                        WHEN 'aquafitness' THEN 'Aquafitness'
                        WHEN 'nado_libre' THEN 'Nado Libre'
                        WHEN 'activacion_fisica_adulto_mayor' THEN 'Activación Física Adulto Mayor'
                        WHEN 'matronatacion' THEN 'Matronatación'
                        ELSE tipo_clase
                    END as tipo_clase_display
                FROM tarifas_mensualidad
                WHERE activa = 1
                GROUP BY tipo_clase
                ORDER BY 
                    CASE tipo_clase
                        WHEN 'grupo_preescolar' THEN 1
                        WHEN 'grupo_escolar' THEN 2
                        WHEN 'grupo_adultos' THEN 3
                        WHEN 'matronatacion' THEN 4
                        WHEN 'aquafitness' THEN 5
                        WHEN 'activacion_fisica_adulto_mayor' THEN 6
                        WHEN 'nado_libre' THEN 7
                        ELSE 8
                    END
            `);

            return {
                general: stats[0],
                por_tipo: porTipo
            };

        } catch (error) {
            throw error;
        }
    }

    // Validar si una tarifa es única
    static async validateUnique(tipo_clase, clases_por_semana, tarifa_id = null) {
        try {
            let query = `
                SELECT id 
                FROM tarifas_mensualidad 
                WHERE tipo_clase = ? AND clases_por_semana = ?
            `;
            let params = [tipo_clase, clases_por_semana];

            if (tarifa_id) {
                query += ' AND id != ?';
                params.push(tarifa_id);
            }

            const [rows] = await db.query(query, params);
            return rows.length === 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener tipos de clase disponibles
    static getTiposClase() {
        return [
            { value: 'grupo_adultos', label: 'Grupo Adultos', icon: '🏊‍♀️' },
            { value: 'grupo_preescolar', label: 'Grupo Preescolar', icon: '👶' },
            { value: 'grupo_escolar', label: 'Grupo Escolar', icon: '🧒' },
            { value: 'aquafitness', label: 'Aquafitness', icon: '💪' },
            { value: 'nado_libre', label: 'Nado Libre', icon: '🏊‍♂️' },
            { value: 'activacion_fisica_adulto_mayor', label: 'Activación Física Adulto Mayor', icon: '🧓' },
            { value: 'matronatacion', label: 'Matronatación', icon: '👨‍👩‍👶' }
        ];
    }

    // Buscar tarifas por texto
    static async search(searchTerm) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    tipo_clase,
                    clases_por_semana,
                    monto_mensual,
                    activa,
                    created_at,
                    CASE tipo_clase
                        WHEN 'grupo_adultos' THEN 'Grupo Adultos'
                        WHEN 'grupo_preescolar' THEN 'Grupo Preescolar'
                        WHEN 'grupo_escolar' THEN 'Grupo Escolar'
                        WHEN 'aquafitness' THEN 'Aquafitness'
                        WHEN 'nado_libre' THEN 'Nado Libre'
                        WHEN 'activacion_fisica_adulto_mayor' THEN 'Activación Física Adulto Mayor'
                        WHEN 'matronatacion' THEN 'Matronatación'
                        ELSE tipo_clase
                    END as tipo_clase_display
                FROM tarifas_mensualidad
                WHERE (
                    tipo_clase LIKE ? OR
                    CAST(clases_por_semana AS CHAR) LIKE ? OR
                    CAST(monto_mensual AS CHAR) LIKE ?
                )
                ORDER BY 
                    CASE tipo_clase
                        WHEN 'grupo_preescolar' THEN 1
                        WHEN 'grupo_escolar' THEN 2
                        WHEN 'grupo_adultos' THEN 3
                        WHEN 'matronatacion' THEN 4
                        WHEN 'aquafitness' THEN 5
                        WHEN 'activacion_fisica_adulto_mayor' THEN 6
                        WHEN 'nado_libre' THEN 7
                        ELSE 8
                    END,
                    clases_por_semana ASC
            `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

            return rows;
        } catch (error) {
            throw error;
        }
    }
}

export default tarifasModel;