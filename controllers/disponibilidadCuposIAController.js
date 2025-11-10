import { DateTime } from 'luxon';
import { calcularDisponibilidadIA } from '../services/disponibilidadCuposIAService.js';
import disponibilidadCuposModel from '../models/disponibilidadCupos.js';

// Función helper para procesar y enriquecer la salida IA
const procesarResultadosIA = (resultados, year, mes) => {
    const now = DateTime.now().setZone('America/Mexico_City');
    const mesConsulta = DateTime.fromObject({ year, month: mes });
    const mesActualInicio = now.startOf('month');

    const esMesActual = mesConsulta.hasSame(now, 'month') && mesConsulta.hasSame(now, 'year');
    const esMesFuturo = mesConsulta > mesActualInicio;

    const periodoActivo = esMesFuturo || (esMesActual && now.day <= 8);

    return resultados.map(item => ({
        ...item,
        periodo_ajuste_activo: periodoActivo,
        fecha_consulta: `${mes}/${year}`,
        timestamp: now.toISO()
    }));
};

// Obtener sugerencias inteligentes por IA (por mes)
export const getDisponibilidadIA = async (req, res) => {
    try {
        const { year, mes } = req.params;
        const preferencias = req.body;

        // Validación de parámetros de tiempo
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

        // Validación de preferencias IA
        if (!preferencias || !preferencias.tipo_clase || !preferencias.nivel_alumno) {
            return res.status(400).json({
                data: false,
                message: 'Faltan parámetros requeridos en el body (tipo_clase, nivel_alumno, etc.)',
                error: true
            });
        }

        // Calcular recomendaciones IA
        const resultadosIA = await calcularDisponibilidadIA(preferencias);

        // Procesar y enriquecer la salida
        const resultadosFinales = procesarResultadosIA(resultadosIA, Number(year), Number(mes));

        res.status(200).json({
            data: resultadosFinales,
            message: `Sugerencias inteligentes de cupos (IA) para ${mes}/${year} obtenidas correctamente`,
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad de cupos con IA:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad de cupos con IA',
            error: error.message
        });
    }
};

// Obtener sugerencias IA por rango de meses (extensión futura)
export const getDisponibilidadIAPorRango = async (req, res) => {
    try {
        const { yearInicio, mesInicio, yearFin, mesFin } = req.query;
        const preferencias = req.body;

        if (!yearInicio || !mesInicio || !yearFin || !mesFin) {
            return res.status(400).json({
                data: false,
                message: 'Se requieren yearInicio, mesInicio, yearFin, mesFin',
                error: true
            });
        }

        if (!preferencias || !preferencias.tipo_clase || !preferencias.nivel_alumno) {
            return res.status(400).json({
                data: false,
                message: 'Faltan parámetros requeridos en el body (tipo_clase, nivel_alumno, etc.)',
                error: true
            });
        }

        // Por ahora usaremos solo el mes final para IA (versión futura podría promediar)
        const resultadosIA = await calcularDisponibilidadIA(preferencias);
        const resultadosFinales = procesarResultadosIA(resultadosIA, Number(yearFin), Number(mesFin));

        res.status(200).json({
            data: resultadosFinales,
            message: 'Sugerencias inteligentes de cupos (IA) por rango obtenidas correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad de cupos IA por rango:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad de cupos IA por rango',
            error: error.message
        });
    }

};


export const getListaGruposYHorarios = async (req, res) => {
  try {
    const data = await disponibilidadCuposModel.getListaGruposYHorarios();
    res.status(200).json({
      success: true,
      message: "Lista de grupos y horarios obtenida correctamente",
      data
    });
  } catch (error) {
    console.error("Error en getListaGruposYHorarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la lista de grupos y horarios",
    });
  }
};
