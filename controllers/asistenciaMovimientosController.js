import AsistenciaMovimientosModel from '../models/asistenciaMovimientos.js';
import db from '../config/db.js';
import { DateTime } from 'luxon';

/**
 * Obtener horarios compatibles para mover una asistencia
 * Devuelve TODOS los horarios compatibles con información de cupos POR MES
 * basándose en los meses que abarca la mensualidad asociada a la asistencia
 */
export const getHorariosCompatiblesParaMover = async (req, res) => {
  try {
    const { asistencia_id } = req.params;

    if (!asistencia_id || isNaN(Number(asistencia_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de asistencia inválido',
        error: true
      });
    }

    const resultado = await AsistenciaMovimientosModel.getHorariosCompatiblesParaMoverAsistencia(asistencia_id);

    const { asistencia_original, meses_mensualidad, horarios_compatibles } = resultado;

    if (horarios_compatibles.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          horarios_elegibles: [],
          horario_actual: null,
          total: 0,
          info_asistencia_original: null,
          meses_abarcados: [],
          cupos_por_mes: {}
        },
        message: 'No se encontraron horarios compatibles',
        error: false
      });
    }

    // Separar horarios elegibles del horario actual
    const horariosElegibles = horarios_compatibles.filter(h => h.es_horario_actual === 0);
    const horarioActual = horarios_compatibles.find(h => h.es_horario_actual === 1);

    // Generar información de meses abarcados
    const mesesAbarcados = meses_mensualidad.map(m => ({
      mes: m.mes,
      year: m.year,
      nombre_mes: getNombreMes(m.mes),
      fecha_str: `${m.year}-${m.mes.toString().padStart(2, '0')}`
    }));

    // Preparar estructura de cupos por mes para todos los horarios elegibles
    const cuposPorMes = {};
    horariosElegibles.forEach(horario => {
      cuposPorMes[horario.horario_id] = horario.cupos_por_mes;
    });

    res.status(200).json({
      success: true,
      data: {
        horarios_elegibles: horariosElegibles,
        horario_actual: horarioActual || null,
        total: horarios_compatibles.length,
        meses_abarcados: mesesAbarcados,
        cupos_por_mes: cuposPorMes,
                info_asistencia_original: {
          asistencia_id: asistencia_original.asistencia_id,
          fecha_clase_original: asistencia_original.fecha_clase_original,
          dia_original: asistencia_original.dia_original,
          hora_inicio_original: asistencia_original.hora_inicio_original,
          hora_fin_original: asistencia_original.hora_fin_original,
          tipo_original: asistencia_original.tipo_original,
          nivel_original: asistencia_original.nivel_original,
          mensualidad_inicio: asistencia_original.mensualidad_inicio,
          mensualidad_fin: asistencia_original.mensualidad_fin
        }
      },
      message: `Se encontraron ${horariosElegibles.length} horarios elegibles para mover la asistencia`,
      error: false
    });

  } catch (error) {
    console.error('Error al obtener horarios compatibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios compatibles para mover la asistencia',
      error: error.message
    });
  }
};

/**
 * Función auxiliar para obtener nombre del mes
 */
function getNombreMes(numeroMes) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[numeroMes - 1] || 'Mes desconocido';
}

/**
 * Obtener fechas disponibles en un horario específico (calendario)
 * Con información de cupos por fecha
 */
export const getFechasDisponiblesEnHorario = async (req, res) => {
  try {
    const { horario_id } = req.params;
    const { mensualidad_id, alumno_id, asistencia_id } = req.query;

    // Validaciones
    if (!horario_id || isNaN(Number(horario_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de horario inválido',
        error: true
      });
    }

    if (!mensualidad_id || isNaN(Number(mensualidad_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de mensualidad es requerido',
        error: true
      });
    }

    if (!alumno_id || isNaN(Number(alumno_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de alumno es requerido',
        error: true
      });
    }

    if (!asistencia_id || isNaN(Number(asistencia_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de asistencia es requerido',
        error: true
      });
    }

    const fechas = await AsistenciaMovimientosModel.getFechasDisponiblesEnHorario(
      horario_id,
      mensualidad_id,
      alumno_id,
      asistencia_id
    );

    res.status(200).json({
      success: true,
      data: fechas,
      message: `Se encontraron ${fechas.total_disponibles} fechas disponibles`,
      error: false
    });

  } catch (error) {
    console.error('Error al obtener fechas disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener fechas disponibles en el horario',
      error: error.message
    });
  }
};

/**
 * Mover asistencia a nueva fecha
 * Verifica cupo real desde la tabla de asistencias
 */
export const moverAsistenciaANuevaClase = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { asistencia_id } = req.params;
    const { fecha_destino, horario_destino_id, motivo } = req.body;

    // Validaciones
    if (!asistencia_id || isNaN(Number(asistencia_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de asistencia inválido',
        error: true
      });
    }

    if (!horario_destino_id || isNaN(Number(horario_destino_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de horario destino inválido',
        error: true
      });
    }

    if (!fecha_destino) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar fecha_destino',
        error: true
      });
    }

    await connection.beginTransaction();

    const resultado = await AsistenciaMovimientosModel.moverAsistenciaANuevaFecha(
      connection,
      asistencia_id,
      fecha_destino,
      horario_destino_id,
      motivo || 'Movimiento solicitado por administración'
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      data: resultado,
      message: 'Asistencia movida correctamente',
      error: false
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al mover asistencia:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al mover la asistencia',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Obtener historial de movimientos de una asistencia
 */
export const getHistorialMovimientosAsistencia = async (req, res) => {
  try {
    const { asistencia_id } = req.params;

    if (!asistencia_id || isNaN(Number(asistencia_id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de asistencia inválido',
        error: true
      });
    }

    const historial = await AsistenciaMovimientosModel.getHistorialMovimientosAsistencia(asistencia_id);

    res.status(200).json({
      success: true,
      data: historial,
      total: historial.length,
      message: 'Historial obtenido correctamente',
      error: false
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de movimientos',
      error: error.message
    });
  }
};