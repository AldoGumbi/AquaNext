import db from '../config/db.js';

class AsistenciaMovimientosModel {
  
  /**
   * Obtener horarios compatibles para mover una asistencia
   * Muestra TODOS los horarios del mismo tipo y nivel con información de cupos POR MES
   * basándose en los meses que abarca la mensualidad asociada a la asistencia
   */
  static async getHorariosCompatiblesParaMoverAsistencia(asistenciaId) {
    try {
      // 1. Obtener información de la asistencia original y su mensualidad
      const [asistenciaInfo] = await db.query(`
        SELECT 
          a.id as asistencia_id,
          a.mensualidad_id,
          a.alumno_id,
          c.fecha as fecha_clase_original,
          h_original.id as horario_original_id,
          h_original.dia as dia_original,
          h_original.hora_inicio as hora_inicio_original,
          h_original.hora_fin as hora_fin_original,
          g_original.tipo as tipo_original,
          g_original.nivel as nivel_original,
          g_original.nombre as grupo_original,
          m.fecha_inicio as mensualidad_inicio,
          m.fecha_fin as mensualidad_fin
        FROM asistencias a
        INNER JOIN clases c ON c.id = a.clase_id
        INNER JOIN horarios h_original ON h_original.id = c.horario_id
        INNER JOIN grupos g_original ON g_original.id = h_original.grupo_id
        INNER JOIN mensualidades m ON m.id = a.mensualidad_id
        WHERE a.id = ?
        AND a.hora_entrada IS NULL  -- Solo asistencias no registradas
        AND c.fecha >= CURDATE()  -- Solo clases futuras
        AND c.cancelada = 0  -- Clase original no cancelada
        AND m.cancelada = 0  -- Mensualidad activa
      `, [asistenciaId]);

      if (asistenciaInfo.length === 0) {
        throw new Error('Asistencia no válida para mover (ya registrada, clase pasada o no encontrada)');
      }

      const asistencia = asistenciaInfo[0];

      // 2. Obtener los meses que abarca la mensualidad
      const [mesesMensualidad] = await db.query(`
        SELECT DISTINCT mg.mes, mg.year
        FROM mensualidad_grupos mg
        WHERE mg.mensualidad_id = ?
        ORDER BY mg.year, mg.mes
      `, [asistencia.mensualidad_id]);

      // 3. Obtener todos los horarios compatibles (mismo tipo y nivel)
      const [horarios] = await db.query(`
        SELECT 
          h.id as horario_id,
          h.dia,
          h.hora_inicio,
          h.hora_fin,
          h.cupo_maximo,
          h.grupo_id,
          g.id as grupo_id,
          g.nombre as grupo_nombre,
          g.tipo as grupo_tipo,
          g.nivel as grupo_nivel,
          g.descripcion as grupo_descripcion,
          p.id as profesor_id,
          p.nombre as profesor_nombre,
          p.apellido as profesor_apellido,
          CASE 
            WHEN h.id = ? THEN 1
            ELSE 0
          END as es_horario_actual
        FROM horarios h
        INNER JOIN grupos g ON g.id = h.grupo_id
        LEFT JOIN profesores p ON p.id = h.profesor_id AND p.deleted = 0
        WHERE g.tipo = ? AND g.nivel = ?
        AND g.deleted = 0 AND g.activo = 1
        AND h.deleted = 0 AND h.activo = 1
        ORDER BY 
          h.dia,
          h.hora_inicio
      `, [
        asistencia.horario_original_id,
        asistencia.tipo_original,
        asistencia.nivel_original
      ]);

      // 4. Para cada horario, calcular cupos disponibles por cada mes de la mensualidad
      const horariosConCupos = await Promise.all(
        horarios.map(async (horario) => {
          const cuposPorMes = {};
          
          for (const mesInfo of mesesMensualidad) {
            try {
              // Obtener cupos ocupados en este horario para este mes específico
              const [cupoInfo] = await db.query(`
                SELECT 
                  COUNT(DISTINCT mg.mensualidad_id) as cupos_ocupados,
                  ? as cupo_maximo
                FROM mensualidad_grupos mg
                INNER JOIN mensualidades m ON m.id = mg.mensualidad_id
                INNER JOIN inscripciones i ON i.id = m.inscripcion_id
                INNER JOIN alumnos a ON a.id = i.alumno_id
                WHERE mg.horario_id = ?
                AND mg.year = ?
                AND mg.mes = ?
                AND m.cancelada = 0
                AND a.deleted = 0
              `, [horario.cupo_maximo, horario.horario_id, mesInfo.year, mesInfo.mes]);

              const cuposOcupados = cupoInfo[0].cupos_ocupados || 0;
              const cuposDisponibles = Math.max(0, horario.cupo_maximo - cuposOcupados);

              cuposPorMes[`${mesInfo.year}-${mesInfo.mes}`] = {
                mes: mesInfo.mes,
                year: mesInfo.year,
                mes_nombre: this.getNombreMes(mesInfo.mes),
                cupo_maximo: horario.cupo_maximo,
                cupos_ocupados: cuposOcupados,
                cupos_disponibles: cuposDisponibles,
                porcentaje_ocupacion: horario.cupo_maximo > 0 ? 
                  Math.round((cuposOcupados / horario.cupo_maximo) * 100 * 100) / 100 : 0,
                estado: this.getEstadoCupo(cuposDisponibles, horario.cupo_maximo)
              };
            } catch (error) {
              console.error(`Error al calcular cupos para horario ${horario.horario_id} en ${mesInfo.year}-${mesInfo.mes}:`, error);
              cuposPorMes[`${mesInfo.year}-${mesInfo.mes}`] = {
                mes: mesInfo.mes,
                year: mesInfo.year,
                mes_nombre: this.getNombreMes(mesInfo.mes),
                cupo_maximo: horario.cupo_maximo,
                cupos_ocupados: 0,
                cupos_disponibles: horario.cupo_maximo,
                porcentaje_ocupacion: 0,
                estado: 'Disponible',
                error: true
              };
            }
          }

          return {
            ...horario,
            cupos_por_mes: cuposPorMes,
            // Cupo general (promedio o mínimo para compatibilidad)
            cupo_disponible: Math.min(...Object.values(cuposPorMes).map(c => c.cupos_disponibles))
          };
        })
      );

      return {
        asistencia_original: asistencia,
        meses_mensualidad: mesesMensualidad,
        horarios_compatibles: horariosConCupos
      };

    } catch (error) {
      console.error('Error al obtener horarios compatibles:', error);
      throw error;
    }
  }

  /**
   * Obtener fechas disponibles para mover asistencia con información de cupos
   */
  static async getFechasDisponiblesEnHorario(horarioId, mensualidadId, alumnoId, asistenciaId) {
    try {
      // Obtener el rango de fechas de la mensualidad
      const [mensualidad] = await db.query(`
        SELECT m.fecha_inicio, m.fecha_fin
        FROM mensualidades m
        WHERE m.id = ?
      `, [mensualidadId]);

      if (mensualidad.length === 0) {
        throw new Error('Mensualidad no encontrada');
      }

      const { fecha_inicio, fecha_fin } = mensualidad[0];

      // Obtener información del horario destino
      const [horarioInfo] = await db.query(`
        SELECT 
          h.id,
          h.dia,
          h.hora_inicio,
          h.hora_fin,
          h.cupo_maximo,
          g.nombre as grupo_nombre,
          g.tipo as grupo_tipo,
          g.nivel as grupo_nivel
        FROM horarios h
        INNER JOIN grupos g ON g.id = h.grupo_id
        WHERE h.id = ?
        AND h.deleted = 0
        AND h.activo = 1
      `, [horarioId]);

      if (horarioInfo.length === 0) {
        throw new Error('Horario no encontrado');
      }

      const horario = horarioInfo[0];

      // Mapeo de días de la semana
      const diasSemana = {
        'domingo': 1,
        'lunes': 2,
        'martes': 3,
        'miercoles': 4,
        'jueves': 5,
        'viernes': 6,
        'sabado': 7
      };

      const diaNumero = diasSemana[horario.dia.toLowerCase()];
      if (!diaNumero) {
        throw new Error(`Día de la semana inválido: ${horario.dia}`);
      }

      // Generar todas las fechas posibles del día de la semana
      const fechasPosibles = [];
      const fechaInicio = new Date(fecha_inicio);
      const fechaFin = new Date(fecha_fin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      let fechaActual = new Date(fechaInicio);
      while (fechaActual.getDay() + 1 !== diaNumero) {
        fechaActual.setDate(fechaActual.getDate() + 1);
        if (fechaActual > fechaFin) break;
      }

      while (fechaActual <= fechaFin) {
        if (fechaActual >= hoy && fechaActual >= fechaInicio) {
          fechasPosibles.push(new Date(fechaActual));
        }
        fechaActual.setDate(fechaActual.getDate() + 7);
      }

      if (fechasPosibles.length === 0) {
        return {
          horario_info: {
            horario_id: horario.id,
            dia: horario.dia,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin,
            grupo_nombre: horario.grupo_nombre,
            cupo_maximo: horario.cupo_maximo
          },
          rango_mensualidad: { fecha_inicio, fecha_fin },
          fechas_disponibles: [],
          fechas_ocupadas: [],
          total_disponibles: 0,
          total_ocupadas: 0
        };
      }

      // Verificar conflictos con otras asistencias del alumno
      const fechasPosiblesStr = fechasPosibles.map(f => f.toISOString().split('T')[0]);
      const placeholders = fechasPosiblesStr.map(() => '?').join(',');
      
      const [asistenciasAlumno] = await db.query(`
        SELECT DISTINCT DATE(c.fecha) as fecha_ocupada
        FROM asistencias a
        INNER JOIN clases c ON c.id = a.clase_id
        INNER JOIN horarios h ON h.id = c.horario_id
        WHERE a.alumno_id = ?
        AND a.id != ?
        AND c.fecha IN (${placeholders})
        AND h.hora_inicio = ?
        AND h.hora_fin = ?
      `, [alumnoId, asistenciaId, ...fechasPosiblesStr, horario.hora_inicio, horario.hora_fin]);

      const fechasOcupadasSet = new Set(
        asistenciasAlumno.map(row => new Date(row.fecha_ocupada).toISOString().split('T')[0])
      );

      // Obtener todas las clases existentes para este horario con cupos
      const [clasesConCupos] = await db.query(`
        SELECT 
          c.id as clase_id,
          DATE(c.fecha) as fecha,
          h.cupo_maximo,
          COUNT(a.id) as cupo_ocupado
        FROM clases c
        INNER JOIN horarios h ON h.id = c.horario_id
        LEFT JOIN asistencias a ON a.clase_id = c.id
        WHERE h.id = ?
        AND c.fecha IN (${placeholders})
        AND c.cancelada = 0
        GROUP BY c.id, c.fecha, h.cupo_maximo
      `, [horarioId, ...fechasPosiblesStr]);

      // Crear mapa de cupos por fecha
      const cuposPorFecha = {};
      clasesConCupos.forEach(clase => {
        cuposPorFecha[clase.fecha] = {
          cupo_maximo: clase.cupo_maximo,
          cupo_ocupado: clase.cupo_ocupado,
          cupo_disponible: clase.cupo_maximo - clase.cupo_ocupado
        };
      });

      // Clasificar fechas
      const fechasDisponibles = [];
      const fechasOcupadas = [];

      for (const fecha of fechasPosibles) {
        const fechaStr = fecha.toISOString().split('T')[0];
        
        if (fechasOcupadasSet.has(fechaStr)) {
          fechasOcupadas.push({ 
            fecha: fechaStr,
            motivo: 'Ya tienes una clase en este horario'
          });
        } else {
          const cupoInfo = cuposPorFecha[fechaStr] || {
            cupo_maximo: horario.cupo_maximo,
            cupo_ocupado: 0,
            cupo_disponible: horario.cupo_maximo
          };

          fechasDisponibles.push({ 
            fecha: fechaStr,
            ...cupoInfo
          });
        }
      }

      return {
        horario_info: {
          horario_id: horario.id,
          dia: horario.dia,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          grupo_nombre: horario.grupo_nombre,
          grupo_tipo: horario.grupo_tipo,
          grupo_nivel: horario.grupo_nivel,
          cupo_maximo: horario.cupo_maximo
        },
        rango_mensualidad: { fecha_inicio, fecha_fin },
        fechas_disponibles: fechasDisponibles,
        fechas_ocupadas: fechasOcupadas,
        total_disponibles: fechasDisponibles.length,
        total_ocupadas: fechasOcupadas.length
      };
    } catch (error) {
      console.error('Error al obtener fechas disponibles:', error);
      throw error;
    }
  }

  /**
   * Mover asistencia a una nueva fecha en un horario específico
   */
  static async moverAsistenciaANuevaFecha(connection, asistenciaId, fechaDestino, horarioDestinoId, motivo = 'Movimiento solicitado por el usuario') {
    try {
      // 1. Validar que la asistencia existe y no tiene entrada registrada
      const [asistenciaOriginal] = await connection.query(`
        SELECT 
          a.id,
          a.alumno_id,
          a.mensualidad_id,
          a.clase_id,
          a.hora_entrada,
          c.fecha as fecha_clase_original,
          c.horario_id as horario_original_id,
          h.grupo_id as grupo_original_id,
          m.inscripcion_id
        FROM asistencias a
        INNER JOIN clases c ON c.id = a.clase_id
        INNER JOIN horarios h ON h.id = c.horario_id
        INNER JOIN mensualidades m ON m.id = a.mensualidad_id
        WHERE a.id = ?
        AND a.hora_entrada IS NULL
        AND c.fecha >= CURDATE()
      `, [asistenciaId]);

      if (asistenciaOriginal.length === 0) {
        throw new Error('Asistencia no válida para mover (ya registrada, clase pasada o no encontrada)');
      }

      const asistencia = asistenciaOriginal[0];

      // 2. Buscar si existe la clase en la fecha destino
      let [claseDestino] = await connection.query(`
        SELECT 
          c.id,
          c.fecha,
          c.cancelada,
          h.id as horario_id,
          h.cupo_maximo,
          h.grupo_id,
          g.tipo,
          g.nivel
        FROM clases c
        INNER JOIN horarios h ON h.id = c.horario_id
        INNER JOIN grupos g ON g.id = h.grupo_id
        WHERE h.id = ?
        AND DATE(c.fecha) = DATE(?)
        AND c.cancelada = 0
      `, [horarioDestinoId, fechaDestino]);

      let nuevaClaseId;
      let nuevaClase;

      if (claseDestino.length === 0) {
        // 3. Si no existe la clase, crearla
        const [resultado] = await connection.query(`
          INSERT INTO clases (horario_id, fecha, cancelada, observaciones)
          VALUES (?, ?, 0, 'Clase creada automáticamente por movimiento de asistencia')
        `, [horarioDestinoId, fechaDestino]);

        nuevaClaseId = resultado.insertId;

        [claseDestino] = await connection.query(`
          SELECT 
            c.id,
            c.fecha,
            c.cancelada,
            h.id as horario_id,
            h.cupo_maximo,
            h.grupo_id,
            g.tipo,
            g.nivel
          FROM clases c
          INNER JOIN horarios h ON h.id = c.horario_id
          INNER JOIN grupos g ON g.id = h.grupo_id
          WHERE c.id = ?
        `, [nuevaClaseId]);
        
        nuevaClase = claseDestino[0];
      } else {
        nuevaClase = claseDestino[0];
        nuevaClaseId = nuevaClase.id;

        // Verificar cupo disponible REAL desde asistencias
        const [cupoInfo] = await connection.query(`
          SELECT COUNT(*) as total_asistencias
          FROM asistencias
          WHERE clase_id = ?
        `, [nuevaClaseId]);

        const cupoDisponible = nuevaClase.cupo_maximo - cupoInfo[0].total_asistencias;

        if (cupoDisponible <= 0) {
          throw new Error('La clase destino no tiene cupo disponible');
        }
      }

      // 4. Validar compatibilidad de tipo y nivel
      const [grupoOriginal] = await connection.query(`
        SELECT tipo, nivel 
        FROM grupos 
        WHERE id = ?
      `, [asistencia.grupo_original_id]);

      if (grupoOriginal[0].tipo !== nuevaClase.tipo || 
          grupoOriginal[0].nivel !== nuevaClase.nivel) {
        throw new Error('El grupo destino no es compatible (diferente tipo o nivel)');
      }

      // 5. Verificar que el alumno no tenga ya una asistencia en esta clase
      const [asistenciaExistente] = await connection.query(`
        SELECT COUNT(*) as count
        FROM asistencias
        WHERE alumno_id = ?
        AND clase_id = ?
        AND id != ?
      `, [asistencia.alumno_id, nuevaClaseId, asistenciaId]);

      if (asistenciaExistente[0].count > 0) {
        throw new Error('El alumno ya tiene una asistencia registrada en esta fecha y horario');
      }

      // 8. Actualizar la asistencia con la nueva clase
      await connection.query(`
        UPDATE asistencias
        SET clase_id = ?
        WHERE id = ?
      `, [nuevaClaseId, asistenciaId]);

      // 10. Registrar el movimiento en historial
      await connection.query(`
        INSERT INTO historial_movimientos_asistencias 
        (asistencia_id, clase_original_id, clase_nueva_id, horario_original_id, horario_nuevo_id, motivo, fecha_movimiento)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        asistenciaId,
        asistencia.clase_id,
        nuevaClaseId,
        asistencia.horario_original_id,
        horarioDestinoId,
        motivo
      ]);

      return {
        success: true,
        asistencia_id: asistenciaId,
        clase_original_id: asistencia.clase_id,
        clase_nueva_id: nuevaClaseId,
        fecha_nueva: fechaDestino,
        clase_creada: claseDestino.length === 0,
        // horario_inscrito_nuevo: debeInscribirse,
        // horario_eliminado_original: conteoAsistencias[0].count === 0,
        mensaje: 'Asistencia movida correctamente'
      };

    } catch (error) {
      console.error('Error al mover asistencia por fecha:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de movimientos de una asistencia
   */
  static async getHistorialMovimientosAsistencia(asistenciaId) {
    try {
      const [historial] = await db.query(`
        SELECT 
          h.id,
          h.asistencia_id,
          h.fecha_movimiento,
          h.motivo,
          c_orig.fecha as fecha_clase_original,
          h_orig.dia as dia_original,
          h_orig.hora_inicio as hora_inicio_original,
          h_orig.hora_fin as hora_fin_original,
          g_orig.nombre as grupo_original,
          c_nueva.fecha as fecha_clase_nueva,
          h_nueva.dia as dia_nuevo,
          h_nueva.hora_inicio as hora_inicio_nueva,
          h_nueva.hora_fin as hora_fin_nueva,
          g_nueva.nombre as grupo_nuevo
        FROM historial_movimientos_asistencias h
        LEFT JOIN clases c_orig ON c_orig.id = h.clase_original_id
        LEFT JOIN horarios h_orig ON h_orig.id = h.horario_original_id
        LEFT JOIN grupos g_orig ON g_orig.id = h_orig.grupo_id
        LEFT JOIN clases c_nueva ON c_nueva.id = h.clase_nueva_id
        LEFT JOIN horarios h_nueva ON h_nueva.id = h.horario_nuevo_id
        LEFT JOIN grupos g_nueva ON g_nueva.id = h_nueva.grupo_id
        WHERE h.asistencia_id = ?
        ORDER BY h.fecha_movimiento DESC
      `, [asistenciaId]);

      return historial;
    } catch (error) {
      console.error('Error al obtener historial de movimientos:', error);
      throw error;
    }
  }

  /**
   * Funciones auxiliares
   */
  static getNombreMes(numeroMes) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numeroMes - 1] || 'Mes desconocido';
  }

  static getEstadoCupo(cuposDisponibles, cupoMaximo) {
    if (cuposDisponibles === 0) return 'Lleno';
    if (cuposDisponibles === cupoMaximo) return 'Disponible';
    return 'Parcialmente ocupado';
  }
}

export default AsistenciaMovimientosModel;