import disponibilidadCuposModel from '../models/disponibilidadCupos.js';
import { DateTime } from 'luxon';

// Función helper para calcular cupos ajustados
const calcularCuposAjustados = (disponibilidad, year, mes) => {
    const now = DateTime.now().setZone('America/Mexico_City');
    const mesConsulta = DateTime.fromObject({ year, month: mes });
    const esMesActual = mesConsulta.hasSame(now, 'month') && mesConsulta.hasSame(now, 'year');
    const diaMes = now.day;

    return disponibilidad.map(item => {
        let cuposAjustados = Number(item.cupos_ocupados);
        let cuposDisponiblesAjustados = Number(item.cupos_disponibles);
        let estadoAjustado = item.estado_disponibilidad;
        
        // Parsear alumnos del mes anterior
        let alumnosMesAnterior = [];
        try {
            alumnosMesAnterior = item.alumnos_mes_anterior ? item.alumnos_mes_anterior : [];
            if (!Array.isArray(alumnosMesAnterior)) {
                alumnosMesAnterior = [];
            }
        } catch (e) {
            alumnosMesAnterior = [];
        }

        const cantidadAlumnosMesAnterior = alumnosMesAnterior.length;

        if (esMesActual && diaMes > 5) {
            // Si ya pasaron los 5 días del mes actual, no contar cupos del mes anterior
            // Los cupos quedan como están
        } else {
            // Si no han pasado los 5 días o no es el mes actual, contar cupos del mes anterior como ocupados
            cuposAjustados += cantidadAlumnosMesAnterior;
            cuposDisponiblesAjustados = item.cupo_maximo - cuposAjustados;
            
            // Recalcular estado
            if (cuposAjustados === 0) {
                estadoAjustado = 'Disponible';
            } else if (cuposAjustados >= item.cupo_maximo) {
                estadoAjustado = 'Lleno';
            } else {
                estadoAjustado = 'Parcialmente ocupado';
            }
        }

        return {
            ...item,
            cupos_ocupados_ajustados: cuposAjustados,
            cupos_disponibles_ajustados: cuposDisponiblesAjustados,
            estado_disponibilidad_ajustado: estadoAjustado,
            porcentaje_ocupacion_ajustado: item.cupo_maximo > 0 ? 
                Math.round((cuposAjustados / item.cupo_maximo) * 100 * 100) / 100 : 0,
            alumnos_mes_anterior_count: cantidadAlumnosMesAnterior,
            reserva_activa: !esMesActual || diaMes <= 5
        };
    });
};

export const getDisponibilidadPorMes = async (req, res) => {
    try {
        const { year, mes } = req.params;
        
        if (!year || !mes || isNaN(Number(year)) || isNaN(Number(mes))) {
            return res.status(400).json({
                data: false,
                message: 'Año y mes son requeridos y deben ser números válidos',
                error: true
            });
        }

        if (Number(mes) < 1 || Number(mes) > 12) {
            return res.status(400).json({
                data: false,
                message: 'El mes debe estar entre 1 y 12',
                error: true
            });
        }

        const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(
            Number(year), 
            Number(mes)
        );

        // Aplicar lógica de cupos ajustados
        const disponibilidadAjustada = calcularCuposAjustados(disponibilidad, Number(year), Number(mes));

        res.status(200).json({
            data: disponibilidadAjustada,
            message: `Disponibilidad de cupos para ${mes}/${year} obtenida correctamente`,
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad de cupos:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad de cupos',
            error: error.message
        });
    }
};

export const getDisponibilidadPorRango = async (req, res) => {
    try {
        const { yearInicio, mesInicio, yearFin, mesFin } = req.query;
        
        if (!yearInicio || !mesInicio || !yearFin || !mesFin) {
            return res.status(400).json({
                data: false,
                message: 'Se requieren yearInicio, mesInicio, yearFin, mesFin',
                error: true
            });
        }

        const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorRango(
            Number(yearInicio), 
            Number(mesInicio),
            Number(yearFin), 
            Number(mesFin)
        );

        res.status(200).json({
            data: disponibilidad,
            message: 'Disponibilidad de cupos por rango obtenida correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad de cupos por rango:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad de cupos',
            error: error.message
        });
    }
};