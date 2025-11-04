import db from '../config/db.js';
import AsistenciaMovimientosModel from './asistenciaMovimientos.js';

class alumnosModel {

  // Método para crear un nuevo alumno
  static async crearAlumno(connection,alumno) {
    try {
      // Insertar alumno (sin foto)
      const [result] = await connection.query(`
        INSERT INTO alumnos (
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento, 
          domicilio, 
          email, 
          telefono, 
          telefono_emergencia, 
          estatus, 
          tipo_alumno
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        alumno.nombre, 
        alumno.apellido_paterno, 
        alumno.apellido_materno, 
        alumno.fecha_nacimiento, 
        alumno.domicilio, 
        alumno.email, 
        alumno.telefono, 
        alumno.telefono_emergencia, 
        alumno.estatus, 
        alumno.tipo
      ]);



      const alumnoId = result.insertId;



      // Insertar imagen en base64 en tabla fotos_alumnos
      if (alumno.foto) {
        await connection.query(`
          INSERT INTO fotos_alumnos (
            id_alumno, 
            base_64
          ) VALUES (?, ?);
        `, [alumnoId, alumno.foto]);
      }
      return alumnoId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Método para obtener todos los alumnos
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          tipo_alumno,
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento,
          domicilio,
          email, 
          telefono, 
          telefono_emergencia, 
          foto,
          estatus,
          firma,
          fecha_creacion,
          fecha_modificacion,
          proxima_clase,
          clases_proximas_count,
          ultima_asistencia
        FROM vista_alumnos_estatus
        WHERE deleted = 0 AND tipo_alumno = 'regular'
        ORDER BY fecha_creacion DESC;
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener alumnos activos
  static async getActiveAlumnos() {
    try {
      const [rows] = await db.query(`
        SELECT
          id,
          tipo_alumno,
          nombre, 
          apellido_paterno, 
          apellido_materno,
          fecha_nacimiento,
          domicilio,
          email, 
          telefono, 
          telefono_emergencia, 
          foto,
          estatus,
          firma,
          fecha_creacion,
          fecha_modificacion
        FROM vista_alumnos_estatus
        WHERE deleted = 0 AND estatus = 'activo'
        ORDER BY fecha_creacion DESC;
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener un alumno por ID
  static async getById(id) {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.tipo_alumno,
        a.nombre, 
        a.apellido_paterno, 
        a.apellido_materno, 
        a.fecha_nacimiento,
        a.domicilio,
        a.email, 
        a.telefono, 
        a.telefono_emergencia, 
        a.estatus,
        a.firma,
        a.fecha_creacion as fecha_registro,
        a.fecha_modificacion,
        fa.base_64 AS foto
      FROM vista_alumnos_estatus a
      LEFT JOIN fotos_alumnos fa 
        ON fa.id_alumno = a.id
      WHERE a.id = ? AND a.deleted = 0
      ORDER BY fa.fecha_creacion DESC
      LIMIT 1;
    `, [id]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
}


  /**
   * Actualiza un alumno y cancela mensualidades si se desactiva
   * @param {number} id - ID del alumno 
   * @param {Object} alumnoData - Datos del alumno a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async update(id, alumnoData) {
      const connection = await db.getConnection();
      try {
          await connection.beginTransaction();

          // 1. Obtener el estatus actual del alumno ANTES de actualizar
          const [alumnoActual] = await connection.query(
              'SELECT estatus FROM alumnos WHERE id = ? AND deleted = 0',
              [id]
          );

          if (alumnoActual.length === 0) {
              await connection.rollback();
              return {
                  success: false,
                  message: 'Alumno no encontrado'
              };
          }

          const estatusAnterior = alumnoActual[0].estatus;

          // 2. VALIDACIÓN: Impedir cambio manual a estatus "activo"
          if (estatusAnterior !== 'activo' && alumnoData.estatus === 'activo') {
              await connection.rollback();
              return {
                  success: false,
                  message: 'No se puede cambiar manualmente el estatus a "activo". Un alumno solo puede activarse al asignarle mensualidades.',
                  error_code: 'CAMBIO_ACTIVO_NO_PERMITIDO'
              };
          }

          // 3. Actualizar el alumno
          const [updateResult] = await connection.query(`
              UPDATE alumnos 
              SET tipo_alumno = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, 
                  fecha_nacimiento = ?, domicilio = ?, email = ?, telefono = ?, 
                  telefono_emergencia = ?, foto = ?, estatus = ?, firma = ?
              WHERE id = ? AND deleted = 0
          `, [
              alumnoData.tipo_alumno,
              alumnoData.nombre,
              alumnoData.apellido_paterno,
              alumnoData.apellido_materno,
              alumnoData.fecha_nacimiento,
              alumnoData.domicilio,
              alumnoData.email,
              alumnoData.telefono,
              alumnoData.telefono_emergencia,
              alumnoData.foto,
              alumnoData.estatus,
              alumnoData.firma,
              id
          ]);

          if (updateResult.affectedRows === 0) {
              await connection.rollback();
              return {
                  success: false,
                  message: 'No se pudo actualizar el alumno'
              };
          }

          let detallesCancelacion = null;

          // 4. Si el alumno cambió de activo/pendiente a inactivo, cancelar mensualidades vigentes
          if ((estatusAnterior === 'activo' || estatusAnterior === 'pendiente') && 
              alumnoData.estatus === 'inactivo') {
              
              // console.log(`Alumno ${id} cambió a inactivo. Cancelando mensualidades vigentes...`);

              // Usar método auxiliar para cancelar mensualidades
              const resultadoCancelacion = await this.cancelarMensualidadesVigentesAlDesactivar(
                  connection, 
                  id, 
                  'Alumno desactivado automáticamente'
              );

              if (resultadoCancelacion.success && resultadoCancelacion.mensualidades_canceladas > 0) {
                  detallesCancelacion = {
                      mensualidades_canceladas: resultadoCancelacion.mensualidades_canceladas,
                      asistencias_futuras_eliminadas: resultadoCancelacion.asistencias_eliminadas,
                      mensaje: resultadoCancelacion.mensaje,
                      grupos_afectados: resultadoCancelacion.cupos_liberados?.grupos_afectados || []
                  };
              }
          }

          await connection.commit();

          return {
              success: true,
              message: 'Alumno actualizado correctamente',
              detalles_cancelacion: detallesCancelacion
          };

      } catch (error) {
          await connection.rollback();
          console.error('Error al actualizar alumno con cancelación:', error);
          throw error;
      } finally {
          connection.release();
      }
  }


  // Método para eliminar un alumno (soft delete)
  static async delete(id) {
    try {
      const [result] = await db.query(`
        UPDATE alumnos 
        SET deleted = 1
        WHERE id = ?;
      `, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener inscripciones y mensualidades del alumno
  static async getInscripcionesMensualidadesByAlumno(alumnoId, incluirCanceladas = false) {
    try {
      let whereClause = `
        WHERE i.alumno_id = ? 
        `;
      const params = [alumnoId];
      if (!incluirCanceladas) {
        whereClause += ' AND i.activa = 1';
      }
      const [inscripciones] = await db.query(`
        SELECT 
          i.id,
          i.alumno_id,
          i.fecha_inscripcion,
          i.year_inscripcion,
          i.anos_vigencia,
          i.fecha_fin,
          i.monto as monto_inscripcion,
          i.metodo_pago as metodo_pago_inscripcion,
          i.descuento_aplicado,
          i.activa,
          i.observaciones,
          i.created_at,
          -- Datos del cupón aplicado
          i.cupon_id,
          c.codigo as cupon_codigo,
          c.nombre as cupon_nombre,
          c.tipo as cupon_tipo,
          c.valor as cupon_valor,
          -- Datos de transacción de la inscripción
          t_insc.folio as folio_inscripcion,
          t_insc.created_at as fecha_pago_inscripcion,
          CASE WHEN COALESCE(t_insc.cancelada, 0) = 1 THEN 'Cancelada' ELSE 'Pagada' END as status_pago_inscripcion
        FROM inscripciones i
        LEFT JOIN transaccion_detalles td_insc ON td_insc.referencia_id = i.id AND td_insc.referencia_tipo = 'INSCRIPCION'
        LEFT JOIN transacciones t_insc ON t_insc.id = td_insc.transaccion_id
        LEFT JOIN cupones c ON c.id = i.cupon_id
        ${whereClause}
        ORDER BY i.fecha_inscripcion DESC
      `, params);
      return inscripciones;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener mensualidades de una inscripción específica
  static async getMensualidadesByInscripcion(inscripcionId) {
    try {
      const [mensualidades] = await db.query(`
        SELECT 
          m.id,
          m.inscripcion_id,
          m.fecha_inicio,
          m.fecha_fin,
          g.nombre,
          g.nivel,
          g.tipo,
          m.monto_total,
          m.pagada,
          m.descuento_aplicado,
          m.cancelada,
          m.fecha_cancelacion,
          m.metodo_pago,
          m.fecha_pago,
          m.created_at,
          m.updated_at,
          -- Datos del cupón aplicado
          m.cupon_id,
          c.codigo as cupon_codigo,
          c.nombre as cupon_nombre,
          c.tipo as cupon_tipo,
          c.valor as cupon_valor,
          -- Datos de transacción de la mensualidad
          t_mens.folio as folio_mensualidad,
          t_mens.created_at as fecha_transaccion_mensualidad,
          CASE 
            WHEN COALESCE(t_mens.cancelada, 0) = 1 THEN 'Cancelada'
            ELSE 'Pagada'
          END as status_pago,
          -- Informacion de horarios
          GROUP_CONCAT(
            DISTINCT CONCAT(
              DATE_FORMAT(h.hora_inicio, '%H:%i'), ' - ', 
              DATE_FORMAT(h.hora_fin, '%H:%i'), ' (',
              CASE h.dia
                WHEN 'lunes' THEN 'Lun'
                WHEN 'martes' THEN 'Mar'
                WHEN 'miercoles' THEN 'Mié'
                WHEN 'jueves' THEN 'Jue'
                WHEN 'viernes' THEN 'Vie'
                WHEN 'sabado' THEN 'Sáb'
                WHEN 'domingo' THEN 'Dom'
              END, ')'
            )
            ORDER BY h.dia, h.hora_inicio
            SEPARATOR ', '
          ) as horarios
        FROM mensualidades m
        LEFT JOIN transaccion_detalles td_mens ON td_mens.referencia_id = m.id AND td_mens.referencia_tipo = 'MENSUALIDAD'
        LEFT JOIN transacciones t_mens ON t_mens.id = td_mens.transaccion_id
        LEFT JOIN cupones c ON c.id = m.cupon_id
        LEFT JOIN mensualidad_grupos mg ON mg.mensualidad_id = m.id
        LEFT JOIN horarios h ON h.id = mg.horario_id
        LEFT JOIN grupos g ON g.id = h.grupo_id
        WHERE m.inscripcion_id = ?
        GROUP BY m.id, m.inscripcion_id, m.fecha_inicio, m.fecha_fin, g.nombre, g.nivel, g.tipo, m.monto_total, 
          m.pagada, m.metodo_pago, m.fecha_pago, m.created_at, m.updated_at,
          m.cupon_id, c.codigo, c.nombre, c.tipo, c.valor,
          t_mens.folio, t_mens.created_at, t_mens.cancelada
        ORDER BY m.fecha_inicio DESC
      `, [inscripcionId]);
      return mensualidades;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener asistencias del alumno
  static async getAsistenciasByAlumno(alumnoId, filters = {}) {
    try {
      const { 
        year = new Date().getFullYear(), 
        mes = null,
        mensualidad_id = null,
        incluir_historial_movimientos = false
      } = filters;

      let whereClause = `
        WHERE i.alumno_id = ? 
        AND YEAR(c.fecha) = ?
        `;

      const params = [alumnoId, year];

      if (mes) {
        whereClause += ' AND MONTH(c.fecha) = ?';
        params.push(mes);
      }

      if (mensualidad_id) {
        whereClause += ' AND m.id = ?';
        params.push(mensualidad_id);
      }

      whereClause += ' ORDER BY c.fecha DESC, h.hora_inicio ASC';

      const [asistencias] = await db.query(`
        SELECT 
          a.id as asistencia_id,
          a.alumno_id,
          a.mensualidad_id,
          a.clase_id,
          a.hora_entrada,
          a.hora_salida,
          a.created_at as fecha_registro_asistencia,
          
          -- Información de la clase
          c.fecha as fecha_clase,
          h.hora_inicio,
          h.hora_fin,
          c.observaciones as observaciones_clase,
          c.cancelada,
          
          -- Información del horario y grupo
          DAYOFWEEK(c.fecha) as dia_semana,
          g.nombre as nombre_grupo,
          g.tipo as tipo_grupo,
          g.descripcion as descripcion_grupo,
          
          -- Información del profesor
          COALESCE(ps.nombre, p.nombre) as nombre_profesor,
          COALESCE(ps.apellido, p.apellido) as apellido_profesor,
          
          -- Información de la mensualidad
          m.fecha_inicio as mensualidad_inicio,
          m.fecha_fin as mensualidad_fin,
          m.pagada as mensualidad_pagada,
          
          -- Información de la inscripción
          i.year_inscripcion,
          i.activa as inscripcion_activa,
          
          -- Estado de la asistencia mejorado
          CASE 
            WHEN c.cancelada = 1 THEN 'Clase Cancelada'
            WHEN a.hora_entrada IS NOT NULL AND a.hora_salida IS NOT NULL THEN 'Asistió Completo'
            WHEN a.hora_entrada IS NOT NULL AND a.hora_salida IS NULL THEN 'Entrada Registrada'
            WHEN c.fecha > CURDATE() THEN 'Clase Pendiente'
            WHEN c.fecha = CURDATE() AND h.hora_inicio > CURTIME() THEN 'Clase Pendiente'
            WHEN a.hora_entrada IS NULL AND c.fecha <= CURDATE() THEN 'No Asistió'
            ELSE 'Sin Registrar'
          END as estado_asistencia
          
        FROM asistencias a
        INNER JOIN clases c ON c.id = a.clase_id
        INNER JOIN horarios h ON h.id = c.horario_id
        INNER JOIN grupos g ON g.id = h.grupo_id
        INNER JOIN mensualidades m ON m.id = a.mensualidad_id
        INNER JOIN inscripciones i ON i.id = m.inscripcion_id
        LEFT JOIN profesores p ON p.id = h.profesor_id
        LEFT JOIN profesores ps ON ps.id = c.profesor_suplente_id
        ${whereClause}
      `, params);

      // Si NO se solicita historial, retornar inmediatamente
      if (!incluir_historial_movimientos || asistencias.length === 0) {
        return asistencias;
      }

      // OPTIMIZACIÓN: Obtener TODO el historial en UNA SOLA consulta
      const asistenciaIds = asistencias.map(a => a.asistencia_id);
      const placeholders = asistenciaIds.map(() => '?').join(',');
      
      const [historialCompleto] = await db.query(`
        SELECT 
          h.id,
          h.asistencia_id,
          h.fecha_movimiento,
          h.motivo,
          
          -- Clase original
          c_orig.fecha as fecha_clase_original,
          h_orig.dia as dia_original,
          h_orig.hora_inicio as hora_inicio_original,
          h_orig.hora_fin as hora_fin_original,
          g_orig.nombre as grupo_original,
          
          -- Clase nueva
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
        
        WHERE h.asistencia_id IN (${placeholders})
        ORDER BY h.asistencia_id, h.fecha_movimiento DESC
      `, asistenciaIds);

      // Agrupar historial por asistencia_id
      const historialPorAsistencia = {};
      historialCompleto.forEach(registro => {
        if (!historialPorAsistencia[registro.asistencia_id]) {
          historialPorAsistencia[registro.asistencia_id] = [];
        }
        historialPorAsistencia[registro.asistencia_id].push(registro);
      });

      // Combinar asistencias con su historial correspondiente
      const asistenciasConHistorial = asistencias.map(asistencia => ({
        ...asistencia,
        historial_movimientos: historialPorAsistencia[asistencia.asistencia_id] || []
      }));

      return asistenciasConHistorial;

    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      throw error;
    }
  }

  // Método para obtener estadísticas de asistencias del alumno
  static async getEstadisticasAsistenciasByAlumno(alumnoId, filters = {}) {
    try {
      const { 
        year = new Date().getFullYear(), 
        mes = null,
        mensualidad_id = null 
      } = filters;

      let whereClause = `
        WHERE i.alumno_id = ? 
        AND YEAR(c.fecha) = ?
        `;

      const params = [alumnoId, year];

      if (mes) {
        whereClause += ' AND MONTH(c.fecha) = ?';
        params.push(mes);
      }

      if (mensualidad_id) {
        whereClause += ' AND m.id = ?';
        params.push(mensualidad_id);
      }

      const [estadisticas] = await db.query(`
        SELECT 
          COUNT(*) as total_clases,
          SUM(CASE WHEN c.cancelada = 1 THEN 1 ELSE 0 END) as clases_canceladas,
          SUM(CASE WHEN c.cancelada = 0 THEN 1 ELSE 0 END) as clases_programadas,
          SUM(CASE WHEN a.hora_entrada IS NOT NULL AND c.cancelada = 0 THEN 1 ELSE 0 END) as clases_asistidas,
          SUM(CASE 
            WHEN a.hora_entrada IS NULL 
            AND c.cancelada = 0 
            AND c.fecha <= CURDATE() 
            AND (c.fecha < CURDATE() OR h.hora_inicio <= CURTIME()) 
            THEN 1 ELSE 0 
          END) as clases_perdidas,
          SUM(CASE 
            WHEN c.cancelada = 0 
            AND (c.fecha > CURDATE() OR (c.fecha = CURDATE() AND h.hora_inicio > CURTIME())) 
            THEN 1 ELSE 0 
          END) as clases_pendientes,
          ROUND(
            (SUM(CASE WHEN a.hora_entrada IS NOT NULL AND c.cancelada = 0 THEN 1 ELSE 0 END) * 100.0) / 
            NULLIF(SUM(CASE 
              WHEN c.cancelada = 0 
              AND c.fecha <= CURDATE() 
              AND (c.fecha < CURDATE() OR h.hora_inicio <= CURTIME()) 
              THEN 1 ELSE 0 
            END), 0), 
            2
          ) as porcentaje_asistencia
        FROM asistencias a
        INNER JOIN clases c ON c.id = a.clase_id
        INNER JOIN horarios h ON h.id = c.horario_id
        INNER JOIN mensualidades m ON m.id = a.mensualidad_id
        INNER JOIN inscripciones i ON i.id = m.inscripcion_id
        ${whereClause}
      `, params);

      return estadisticas[0] || {
        total_clases: 0,
        clases_canceladas: 0,
        clases_programadas: 0,
        clases_asistidas: 0,
        clases_perdidas: 0,
        clases_pendientes: 0,
        porcentaje_asistencia: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener resumen general del alumno
  static async getResumenGeneralByAlumno(alumnoId) {
    try {
      const [resumen] = await db.query(`
        SELECT 
          -- Inscripciones
          COUNT(DISTINCT i.id) as total_inscripciones,
          COUNT(DISTINCT CASE WHEN i.activa = 1 THEN i.id END) as inscripciones_activas,
          MIN(i.fecha_inscripcion) as primera_inscripcion,
          MAX(i.fecha_inscripcion) as ultima_inscripcion,
          
          -- Mensualidades
          COUNT(DISTINCT m.id) as total_mensualidades,
          COUNT(DISTINCT m.id) as mensualidades_pagadas,
          
          -- Asistencias del año actual
          COUNT(DISTINCT CASE WHEN YEAR(c.fecha) = YEAR(CURDATE()) THEN a.id END) as total_clases_año_actual,
          COUNT(DISTINCT CASE WHEN YEAR(c.fecha) = YEAR(CURDATE()) AND a.hora_entrada IS NOT NULL THEN a.id END) as clases_asistidas_año_actual,
          
          -- Montos totales CORREGIDOS: usar subconsultas para evitar el problema de DISTINCT
          COALESCE(
            (SELECT SUM(i_sub.monto - COALESCE(i_sub.descuento_aplicado, 0)) 
            FROM inscripciones i_sub 
            WHERE i_sub.alumno_id = ?), 0
          ) as total_inscripciones_monto,
          
          COALESCE(
            (SELECT SUM(m_sub.monto_total - COALESCE(m_sub.descuento_aplicado, 0)) 
            FROM mensualidades m_sub 
            INNER JOIN inscripciones i_sub ON m_sub.inscripcion_id = i_sub.id 
            WHERE i_sub.alumno_id = ?), 0
          ) as total_mensualidades_monto
          
        FROM alumnos al
        LEFT JOIN inscripciones i ON i.alumno_id = al.id
        -- LEFT JOIN inscripciones i ON i.alumno_id = al.id AND i.deleted = 0
        LEFT JOIN mensualidades m ON m.inscripcion_id = i.id
        LEFT JOIN asistencias a ON a.mensualidad_id = m.id AND a.alumno_id = al.id
        LEFT JOIN clases c ON c.id = a.clase_id
        WHERE al.id = ? AND al.deleted = 0
      `, [alumnoId, alumnoId, alumnoId]);
      
      return resumen[0] || {};
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener alumnos por estatus 
  static async getByEstatus(estatus) { 
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          tipo_alumno,
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento,
          domicilio,
          email, 
          telefono, 
          telefono_emergencia, 
          foto,
          estatus,
          firma,
          fecha_creacion,
          fecha_modificacion
        FROM vista_alumnos_estatus 
        WHERE estatus = ? AND deleted = 0
        ORDER BY fecha_creacion DESC;
      `, [estatus]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener estadísticas
  static async getEstadisticas() {
    try {
      const [rows] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estatus = 'activo' THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN estatus = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
          SUM(CASE WHEN estatus = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN firma = 1 THEN 1 ELSE 0 END) as con_firma,
          SUM(CASE WHEN tipo_alumno = 'regular' THEN 1 ELSE 0 END) as regulares,
          SUM(CASE WHEN tipo_alumno = 'prueba' THEN 1 ELSE 0 END) as prueba
        FROM vista_alumnos_estatus
        WHERE deleted = 0;
      `);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }


  /**
   * Actualiza el estatus de un alumno a 'activo' cuando se crean mensualidades
   * Usado dentro de transacciones existentes para mantener consistencia
   * @param {Object} connection - Conexión de base de datos activa en transacción
   * @param {number} alumno_id - ID del alumno a activar
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  static async activarAlumnoPorMensualidad(connection, alumno_id) {
    try {
      const [result] = await connection.query(`
        UPDATE alumnos 
        SET estatus = 'activo',
            fecha_modificacion = NOW()
        WHERE id = ? AND deleted = 0
      `, [alumno_id]);

      if (result.affectedRows > 0) {
        // console.log(`Alumno ${alumno_id} activado correctamente tras crear mensualidades`);
        return true;
      } else {
        console.warn(`No se pudo activar al alumno ${alumno_id}: no encontrado o ya eliminado`);
        return false;
      }
    } catch (error) {
      console.error(`Error al activar alumno ${alumno_id}:`, error);
      // No lanzamos el error para no afectar la transacción principal
      return false;
    }
  }

  
  /**
   * Cancela mensualidades vigentes cuando un alumno se desactiva
   * @param {Object} connection - Conexión de base de datos activa en transacción
   * @param {number} alumno_id - ID del alumno
   * @param {string} motivo - Motivo de la cancelación
   * @returns {Promise<Object>} - Resultado de la cancelación
   */
  static async cancelarMensualidadesVigentesAlDesactivar(connection, alumno_id, motivo = 'Alumno desactivado automáticamente') {
      try {
          // 1. Obtener mensualidades vigentes (no canceladas y dentro del periodo)
          const [mensualidadesVigentes] = await connection.query(`
              SELECT 
                  m.id, 
                  m.fecha_inicio, 
                  m.fecha_fin,
                  m.monto_total,
                  m.monto_pagado,
                  GROUP_CONCAT(DISTINCT CONCAT(g.nombre, ' - ', g.nivel) SEPARATOR '; ') as grupos_info
              FROM mensualidades m
              INNER JOIN inscripciones i ON m.inscripcion_id = i.id
              LEFT JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
              LEFT JOIN grupos g ON mg.grupo_id = g.id AND g.deleted = 0
              WHERE i.alumno_id = ? 
              AND m.cancelada = 0
              AND (CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin 
                  OR m.fecha_inicio > CURDATE())
              GROUP BY m.id, m.fecha_inicio, m.fecha_fin, m.monto_total, m.monto_pagado
          `, [alumno_id]);

          if (mensualidadesVigentes.length === 0) {
              return {
                  success: true,
                  mensualidades_canceladas: 0,
                  asistencias_eliminadas: 0,
                  mensaje: 'No hay mensualidades vigentes para cancelar'
              };
          }

          // console.log(`Cancelando ${mensualidadesVigentes.length} mensualidades vigentes para alumno ${alumno_id}`);

          const mensualidadIds = mensualidadesVigentes.map(m => m.id);
          const placeholders = mensualidadIds.map(() => '?').join(',');
          
          // 2. Cancelar mensualidades usando la nueva columna
          const [cancelResult] = await connection.query(`
              UPDATE mensualidades 
              SET cancelada = 1,
                  fecha_cancelacion = NOW(),
                  motivo_cancelacion = ?,
                  updated_at = NOW()
              WHERE id IN (${placeholders})
          `, [motivo, ...mensualidadIds]);

          // 3. Eliminar asistencias futuras (solo las que no tienen hora_entrada)
          const [asistenciasResult] = await connection.query(`
              DELETE a FROM asistencias a
              INNER JOIN clases c ON a.clase_id = c.id
              WHERE a.mensualidad_id IN (${placeholders})
              AND c.fecha >= CURDATE()
              AND a.hora_entrada IS NULL
          `, mensualidadIds);

          // 4. Log detallado de la operación
          const detallesMensualidades = mensualidadesVigentes.map(m => 
              `ID:${m.id} (${m.fecha_inicio} - ${m.fecha_fin}) - ${m.grupos_info || 'Sin grupos'}`
          ).join('; ');

          // console.log(`Operación completada para alumno ${alumno_id}:`);
          // console.log(`- Mensualidades canceladas: ${cancelResult.affectedRows}`);
          // console.log(`- Asistencias futuras eliminadas: ${asistenciasResult.affectedRows}`);
          // console.log(`- Detalles: ${detallesMensualidades}`);

          // 5. Calcular cupos liberados
          const gruposAfectados = [...new Set(
              mensualidadesVigentes
                  .map(m => m.grupos_info)
                  .filter(Boolean)
                  .join('; ')
                  .split('; ')
          )];

          return {
              success: true,
              mensualidades_canceladas: cancelResult.affectedRows,
              asistencias_eliminadas: asistenciasResult.affectedRows,
              mensaje: `Se cancelaron ${cancelResult.affectedRows} mensualidades vigentes y se eliminaron ${asistenciasResult.affectedRows} asistencias futuras`,
              detalles_mensualidades: mensualidadesVigentes,
              cupos_liberados: {
                  total_mensualidades: mensualidadesVigentes.length,
                  grupos_afectados: gruposAfectados
              }
          };

      } catch (error) {
          console.error(`Error al cancelar mensualidades vigentes del alumno ${alumno_id}:`, error);
          throw error;
      }
  }

  /**
   * Obtener alumnos con información de mensualidades activas para movimiento
   * Versión optimizada para evitar "Out of sort memory"
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} - Lista de alumnos con info de mensualidades
   */
  static async getAlumnosConMensualidades(filters = {}) {
      try {
          const { 
              search = null,
              limit = 50,
              incluir_sin_mensualidades = true
          } = filters;

          let whereClause = 'WHERE a.deleted = 0';
          let params = [];

          // Filtro de búsqueda
          if (search) {
              whereClause += ` AND (
                  CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', COALESCE(a.apellido_materno, '')) LIKE ? OR
                  a.telefono LIKE ? OR
                  a.email LIKE ?
              )`;
              const searchTerm = `%${search}%`;
              params.push(searchTerm, searchTerm, searchTerm);
          }

          // PASO 1: Obtener alumnos básicos con orden simple
          const [alumnos] = await db.query(`
              SELECT 
                  a.id,
                  a.tipo_alumno,
                  a.nombre,
                  a.apellido_paterno,
                  a.apellido_materno,
                  a.fecha_nacimiento,
                  a.email,
                  a.telefono,
                  a.telefono_emergencia,
                  a.estatus,
                  a.fecha_creacion,
                  fa.base_64 AS foto
              FROM alumnos a
              LEFT JOIN fotos_alumnos fa ON fa.id_alumno = a.id
              ${whereClause}
              ORDER BY a.apellido_paterno, a.nombre
              -- LIMIT ?
          `, [...params, limit * 2]); // Obtener más registros para luego filtrar

          if (alumnos.length === 0) {
              return [];
          }

          const alumnoIds = alumnos.map(a => a.id);
          const placeholders = alumnoIds.map(() => '?').join(',');

          // PASO 2: Obtener mensualidades activas por separado
          const [mensualidades] = await db.query(`
              SELECT 
                  i.alumno_id,
                  m.id as mensualidad_id,
                  m.fecha_inicio,
                  m.fecha_fin,
                  m.monto_total,
                  CASE 
                      WHEN m.cancelada = 1 THEN 'CANCELADA'
                      WHEN CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin THEN 'ACTIVA'
                      WHEN CURDATE() > m.fecha_fin THEN 'FINALIZADA'
                      WHEN CURDATE() < m.fecha_inicio THEN 'PENDIENTE'
                      ELSE 'DESCONOCIDA'
                  END as estado_mensualidad
              FROM inscripciones i
              INNER JOIN mensualidades m ON m.inscripcion_id = i.id
              WHERE i.alumno_id IN (${placeholders})
              AND i.activa = 1
              AND m.cancelada = 0 
              AND m.fecha_fin >= CURDATE()
              ORDER BY i.alumno_id, m.fecha_fin
          `, alumnoIds);

          // PASO 3: Obtener meses abarcados por mensualidad (solo si hay mensualidades)
          const mesesAbarcados = {};
          if (mensualidades.length > 0) {
              const mensualidadIds = [...new Set(mensualidades.map(m => m.mensualidad_id))];
              const placeholdersMens = mensualidadIds.map(() => '?').join(',');

              const [meses] = await db.query(`
                  SELECT 
                      mensualidad_id,
                      GROUP_CONCAT(DISTINCT CONCAT(mes, '-', year) ORDER BY year, mes) as meses_abarcados
                  FROM mensualidad_grupos 
                  WHERE mensualidad_id IN (${placeholdersMens})
                  GROUP BY mensualidad_id
              `, mensualidadIds);

              meses.forEach(mes => {
                  mesesAbarcados[mes.mensualidad_id] = mes.meses_abarcados;
              });
          }

          // PASO 4: Procesar y combinar datos
          const alumnosConInfo = alumnos.map(alumno => {
              const mensualidadesAlumno = mensualidades.filter(m => m.alumno_id === alumno.id);
              
              let infoMensualidades;
              if (mensualidadesAlumno.length > 0) {
                  // Procesar mensualidades del alumno
                  const mensualidadesCompletas = mensualidadesAlumno.map(m => ({
                      id: m.mensualidad_id,
                      fecha_inicio: m.fecha_inicio,
                      fecha_fin: m.fecha_fin,
                      estado_mensualidad: m.estado_mensualidad,
                      monto_total: m.monto_total,
                      meses_abarcados: mesesAbarcados[m.mensualidad_id] || null
                  }));

                  // Calcular próxima expiración
                  const fechasExpiracion = mensualidadesAlumno.map(m => new Date(m.fecha_fin));
                  const proximaExpiracion = new Date(Math.min(...fechasExpiracion));

                  infoMensualidades = {
                      tiene_mensualidades: true,
                      cantidad: mensualidadesAlumno.length,
                      proxima_expiracion: proximaExpiracion,
                      mensualidades: mensualidadesCompletas
                  };

                  // Calcular días hasta expiración
                  const hoy = new Date();
                  const diasRestantes = Math.ceil((proximaExpiracion - hoy) / (1000 * 60 * 60 * 24));
                  infoMensualidades.dias_hasta_expiracion = diasRestantes;
                  infoMensualidades.expiracion_urgente = diasRestantes <= 7;
              } else {
                  infoMensualidades = { tiene_mensualidades: false };
              }

              return {
                  ...alumno,
                  info_mensualidades: infoMensualidades,
                  // Formatear fecha de nacimiento
                  fecha_nacimiento: alumno.fecha_nacimiento ? 
                      alumno.fecha_nacimiento.toISOString().split('T')[0] : null
              };
          });

          // PASO 5: Filtrar y ordenar resultado final
          let resultado = alumnosConInfo;
          
          // Filtrar por mensualidades si se especifica
          if (!incluir_sin_mensualidades) {
              resultado = resultado.filter(a => a.info_mensualidades.tiene_mensualidades);
          }

          // Ordenar: primero con mensualidades, luego alfabético
          resultado.sort((a, b) => {
              const tieneA = a.info_mensualidades.tiene_mensualidades ? 0 : 1;
              const tieneB = b.info_mensualidades.tiene_mensualidades ? 0 : 1;
              
              if (tieneA !== tieneB) {
                  return tieneA - tieneB;
              }
              
              // Orden alfabético
              const nombreA = `${a.apellido_paterno} ${a.nombre}`.toLowerCase();
              const nombreB = `${b.apellido_paterno} ${b.nombre}`.toLowerCase();
              return nombreA.localeCompare(nombreB);
          });

          // Limitar resultado final
          return resultado.slice(0, limit);

      } catch (error) {
          console.error('Error al obtener alumnos con mensualidades para movimiento:', error);
          throw error;
      }
  }

  // Método para obtener todos los alumnos QUE SON DE PRUEBA
  static async getAllFreeTrial() {
    try {
      const [rows] = await db.query(`

        SELECT
          a.id as alumno_id,
          concat(a.nombre, ' ', a.apellido_paterno, ' ', ifnull(a.apellido_materno, '')) as nombre_completo,
          a.fecha_nacimiento,
          a.domicilio,
          a.email,
          a.telefono,
          a.telefono_emergencia,
          a.estatus estado_alumno,
          a.firma,
          a.fecha_creacion,

          c.fecha as fecha_clase,
        
          fa.base_64 AS img,
          
          g.codigo as codigo_horario,
          g.nivel as nivel_horario,
          g.tipo as tipo_horario,
          g.nombre as grupo,
        
          p.nombre as nombre_profesor,
        
          h.hora_inicio,
          h.hora_fin,
          
          t.id as transaccion_id


        FROM alumnos a
               LEFT JOIN fotos_alumnos fa ON fa.id_alumno = a.id
               INNER JOIN asistencias asis ON a.id = asis.alumno_id
               INNER JOIN clases c ON asis.clase_id = c.id
               INNER JOIN horarios h on c.horario_id = h.id
               INNER JOIN grupos g on h.grupo_id = g.id
               LEFT JOIN profesores p ON p.id = h.profesor_id
                INNER JOIN transacciones t ON t.alumno_id = a.id 
        WHERE tipo_alumno = 'prueba' AND a.deleted = 0 
        ORDER BY a.fecha_creacion DESC;
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Metodo para pasar de alumno de prueba a regular
  static async convertToRegular(alumnoId) {
    try {
      const [rows] = await db.query(`
      UPDATE alumnos SET tipo_alumno = 'regular' WHERE id = ?;
      `,[alumnoId]);
      return rows.affectedRows > 0;
    }catch (error) {
      throw error;
    }
  }

  static async crearDetallesAlumnoPrueba(connection,alumnoId, claseId) {
    try {
      const [result] = await connection.query(`
        INSERT INTO alumnos_prueba_detalle (
          alumno_id,
          clase_id
        ) VALUES (?,?);
      `, [
        alumnoId,
        claseId
      ]);
      return result.insertId;

    }catch (error) {
      throw error;
    }
  }
}

export default alumnosModel;
