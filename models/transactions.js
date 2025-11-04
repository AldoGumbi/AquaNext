// models/transacciones.js
import db from '../config/db.js';

class transaccionesModel {

  // Obtener todas las transacciones con sus detalles
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          t.id,
          t.folio,
          t.tipo_transaccion,
          t.monto_subtotal,
          t.monto_descuento,
          t.monto_total,
          t.metodo_pago,
          t.usuario_id,
          t.alumno_id,
          t.cancelada,
          t.created_at as fecha_transaccion,
          t.updated_at as fecha_modificacion,
          -- Información del alumno
          a.nombre,
          a.apellido_paterno,
          a.apellido_materno,
          a.email,
          a.telefono,
          -- Información del usuario que realizó la venta (opcional)
          u.nombre as usuario_nombre,
          u.apellido as usuario_apellido
        FROM transacciones t
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        -- WHERE t.cancelada = 0
        ORDER BY t.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener transacciones con detalles específicos (inscripciones y mensualidades)
  static async getVentasInscripcionesYMensualidades({ tipo_usuario = null, user_id = null } = {}) {
    try {
      let query = `
        SELECT 
          t.id,
          t.folio,
          t.tipo_transaccion,
          t.monto_subtotal,
          t.monto_descuento,
          t.monto_total,
          t.metodo_pago,
          t.usuario_id,
          t.alumno_id,
          t.cancelada,
          t.created_at as fecha_transaccion,
          -- Información del alumno
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) as nombre_completo_alumno,
          a.nombre,
          a.apellido_paterno,
          a.apellido_materno,
          a.email,
          a.telefono,
          -- Información del usuario que realizó la venta
          CONCAT(IFNULL(u.username, ''), ' ', IFNULL(u.email, '')) as usuario_nombre_completo,
          u.username as usuario_nombre,
          u.email as usuario_apellido,
          -- Detalles de la transacción
          GROUP_CONCAT(
            DISTINCT CONCAT(
              td.concepto, 
              ' (','$', td.precio_unitario, ')'
            ) SEPARATOR ', '
          ) as conceptos,
          COUNT(td.id) as cantidad_items
        FROM transacciones t
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        LEFT JOIN transaccion_detalles td ON t.id = td.transaccion_id
        WHERE t.tipo_transaccion IN ('inscripcion', 'mensualidad', 'mixta', 'renovacion')
          AND td.referencia_tipo IN ('INSCRIPCION', 'MENSUALIDAD', 'inscripcion', 'mensualidad')
      `;

      const params = [];

      // Si se proporciona tipo_usuario y es diferente de 'admin', filtrar por fecha actual
      if (tipo_usuario !== null && tipo_usuario !== 'admin') {
        query += ` AND DATE(t.created_at) = CURDATE()`;
        
        // Si además se proporciona user_id, filtrar por ese usuario
        if (user_id !== null) {
          query += ` AND t.usuario_id = ?`;
          params.push(user_id);
        }
      }

      query += `
        GROUP BY 
          t.id, t.folio, t.tipo_transaccion, t.monto_subtotal, t.monto_descuento,
          t.monto_total, t.metodo_pago, t.usuario_id, t.alumno_id, t.cancelada,
          t.created_at, nombre_completo_alumno, a.nombre, a.apellido_paterno,
          a.apellido_materno, a.email, a.telefono, usuario_nombre_completo,
          u.username, u.email
        ORDER BY t.created_at DESC
      `;

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener detalles de una transacción específica
  static async getDetallesTransaccion(transaccionId) {
    try {
      // Primera query: Obtener los detalles básicos
      const [detalles] = await db.query(`
        SELECT 
          td.id,
          td.concepto,
          td.cantidad,
          td.precio_unitario,
          td.subtotal,
          td.descuento,
          td.total,
          td.referencia_id,
          td.referencia_tipo,
          CASE 
            WHEN td.referencia_tipo IN ('INSCRIPCION', 'inscripcion') THEN
              (SELECT CONCAT('Vigencia: ', DATE_FORMAT(i.fecha_inscripcion, '%d/%m/%Y'), ' - ', DATE_FORMAT(i.fecha_fin, '%d/%m/%Y'))
              FROM inscripciones i WHERE i.id = td.referencia_id)
            WHEN td.referencia_tipo IN ('MENSUALIDAD', 'mensualidad') THEN
              (SELECT CONCAT(
                'Período: ', DATE_FORMAT(m.fecha_inicio, '%d/%m/%Y'), ' - ', DATE_FORMAT(m.fecha_fin, '%d/%m/%Y'),
                ' | Monto pagado: $', FORMAT(m.monto_pagado, 2),
                CASE WHEN m.descuento_aplicado > 0 THEN CONCAT(' | Descuento: $', FORMAT(m.descuento_aplicado, 2)) ELSE '' END
              )
              FROM mensualidades m WHERE m.id = td.referencia_id)
            ELSE 'Sin información adicional'
          END as informacion_adicional,
          CASE 
            WHEN td.referencia_tipo IN ('INSCRIPCION', 'inscripcion') THEN
              (SELECT i.metodo_pago FROM inscripciones i WHERE i.id = td.referencia_id)
            WHEN td.referencia_tipo IN ('MENSUALIDAD', 'mensualidad') THEN
              (SELECT m.metodo_pago FROM mensualidades m WHERE m.id = td.referencia_id)
            ELSE NULL
          END as metodo_pago_referencia
        FROM transaccion_detalles td
        WHERE td.transaccion_id = ?
        ORDER BY td.id
      `, [transaccionId]);

      // Procesar cada detalle para agregar información de mensualidades
      for (const detalle of detalles) {
        if (detalle.referencia_tipo === 'MENSUALIDAD' || detalle.referencia_tipo === 'mensualidad') {
          // Obtener información básica de la mensualidad
          const [mensualidadInfo] = await db.query(`
            SELECT 
              DATE_FORMAT(fecha_inicio, '%Y-%m-%d') as fecha_inicio,
              DATE_FORMAT(fecha_fin, '%Y-%m-%d') as fecha_fin,
              monto_total,
              monto_pagado,
              descuento_aplicado,
              metodo_pago,
              pagada,
              fecha_pago
            FROM mensualidades
            WHERE id = ?
          `, [detalle.referencia_id]);

          if (mensualidadInfo.length > 0) {
            const mensualidad = mensualidadInfo[0];

            // Obtener grupos únicos de la mensualidad
            const [gruposUnicos] = await db.query(`
              SELECT DISTINCT
                g.id as grupo_id,
                g.codigo as grupo_codigo,
                g.nombre as grupo_nombre,
                g.tipo as grupo_tipo,
                g.nivel as grupo_nivel
              FROM mensualidad_grupos mg
              JOIN grupos g ON g.id = mg.grupo_id
              WHERE mg.mensualidad_id = ? 
                AND g.deleted = 0
              ORDER BY g.id
            `, [detalle.referencia_id]);

            // Para cada grupo, obtener sus horarios únicos
            for (const grupo of gruposUnicos) {
              const [horarios] = await db.query(`
                SELECT DISTINCT
                  h.id as horario_id,
                  h.dia,
                  TIME_FORMAT(h.hora_inicio, '%H:%i') as hora_inicio,
                  TIME_FORMAT(h.hora_fin, '%H:%i') as hora_fin,
                  h.cupo_maximo,
                  p.id as profesor_id,
                  CONCAT(IFNULL(p.nombre, ''), ' ', IFNULL(p.apellido, '')) as profesor_nombre,
                  p.especialidad as profesor_especialidad
                FROM mensualidad_grupos mg
                JOIN horarios h ON h.id = mg.horario_id
                LEFT JOIN profesores p ON p.id = h.profesor_id
                WHERE mg.mensualidad_id = ? 
                  AND mg.grupo_id = ?
                  AND h.deleted = 0 
                  AND (p.deleted IS NULL OR p.deleted = 0)
                ORDER BY 
                  FIELD(h.dia, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
                  TIME_FORMAT(h.hora_inicio, '%H:%i')
              `, [detalle.referencia_id, grupo.grupo_id]);

              // Limpiar nombres de profesores vacíos
              const horariosLimpios = horarios.map(horario => ({
                ...horario,
                profesor_nombre: horario.profesor_nombre.trim() || null
              }));

              grupo.horarios = horariosLimpios;
            }

            // Construir el objeto de detalles de mensualidad
            detalle.detalles_mensualidad = {
              ...mensualidad,
              grupos: gruposUnicos
            };
          } else {
            detalle.detalles_mensualidad = null;
          }
        } else {
          detalle.detalles_mensualidad = null;
        }
      }

      return detalles;
    } catch (error) {
      console.error('Error en getDetallesTransaccion:', error);
      throw error;
    }
  }

  // Obtener transacciones por alumno
  static async getTransaccionesByAlumno(alumnoId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          t.id,
          t.folio,
          t.tipo_transaccion,
          t.monto_total,
          t.metodo_pago,
          t.created_at as fecha_transaccion,
          t.cancelada,
          -- Detalles resumidos
          GROUP_CONCAT(td.concepto SEPARATOR ', ') as conceptos
        FROM transacciones t
        LEFT JOIN transaccion_detalles td ON t.id = td.transaccion_id
        WHERE t.alumno_id = ?
        GROUP BY t.id, t.folio, t.tipo_transaccion, t.monto_total, t.metodo_pago, t.created_at, t.cancelada
        ORDER BY t.created_at DESC
      `, [alumnoId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de ventas
  static async getEstadisticasVentas(fechaInicio = null, fechaFin = null) {
    try {
      let whereClause = 'WHERE t.cancelada = 0';
      let params = [];

      if (fechaInicio && fechaFin) {
        whereClause += ' AND DATE(t.created_at) BETWEEN ? AND ?';
        params.push(fechaInicio, fechaFin);
      }

      const [rows] = await db.query(`
        SELECT 
          COUNT(*) as total_transacciones,
          SUM(CASE WHEN t.tipo_transaccion = 'inscripcion' THEN 1 ELSE 0 END) as total_inscripciones,
          SUM(CASE WHEN t.tipo_transaccion = 'mensualidad' THEN 1 ELSE 0 END) as total_mensualidades,
          SUM(CASE WHEN t.tipo_transaccion = 'inscripcion_mensualidades' THEN 1 ELSE 0 END) as total_mixtas,
          SUM(t.monto_total) as ingresos_totales,
          SUM(CASE WHEN t.tipo_transaccion = 'inscripcion' THEN t.monto_total ELSE 0 END) as ingresos_inscripciones,
          SUM(CASE WHEN t.tipo_transaccion = 'mensualidad' THEN t.monto_total ELSE 0 END) as ingresos_mensualidades,
          SUM(CASE WHEN t.tipo_transaccion = 'inscripcion_mensualidades' THEN t.monto_total ELSE 0 END) as ingresos_mixtos,
          AVG(t.monto_total) as promedio_venta,
          SUM(CASE WHEN t.metodo_pago = 'efectivo' THEN t.monto_total ELSE 0 END) as ingresos_efectivo,
          SUM(CASE WHEN t.metodo_pago = 'tarjeta' THEN t.monto_total ELSE 0 END) as ingresos_tarjeta,
          SUM(CASE WHEN t.metodo_pago = 'transferencia' THEN t.monto_total ELSE 0 END) as ingresos_transferencia
        FROM transacciones t
        ${whereClause}
      `, params);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener transacciones por rango de fechas
  static async getTransaccionesByDateRange(fechaInicio, fechaFin) {
    try {
      const [rows] = await db.query(`
        SELECT 
          t.id,
          t.folio,
          t.tipo_transaccion,
          t.monto_subtotal,
          t.monto_descuento,
          t.monto_total,
          t.metodo_pago,
          t.created_at as fecha_transaccion,
          t.cancelada,
          -- Información del alumno
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) as nombre_completo_alumno,
          a.email,
          a.telefono,
          -- Usuario
          CONCAT(IFNULL(u.nombre, ''), ' ', IFNULL(u.apellido, '')) as usuario_nombre_completo,
          -- Conceptos
          GROUP_CONCAT(td.concepto SEPARATOR ', ') as conceptos
        FROM transacciones t
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        LEFT JOIN transaccion_detalles td ON t.id = td.transaccion_id
        WHERE t.cancelada = 0 
          AND DATE(t.created_at) BETWEEN ? AND ?
          AND t.tipo_transaccion IN ('inscripcion', 'mensualidad', 'inscripcion_mensualidades')
        GROUP BY 
          t.id, t.folio, t.tipo_transaccion, t.monto_subtotal, t.monto_descuento,
          t.monto_total, t.metodo_pago, t.created_at, t.cancelada,
          nombre_completo_alumno, a.email, a.telefono, usuario_nombre_completo
        ORDER BY t.created_at DESC
      `, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar transacción e invalidar inscripciones/mensualidades relacionadas
   * @param {number} transaccion_id - ID de la transacción a cancelar
   * @param {number} usuario_id - ID del usuario que cancela
   * @returns {Promise<Object>} - Resultado de la cancelación
   */
  static async cancelarTransaccion(transaccion_id, usuario_id) {
      const connection = await db.getConnection();
      try {
          await connection.beginTransaction();

          // 1. Verificar que la transacción existe y no está cancelada
          const [transaccion] = await connection.query(`
              SELECT 
                  t.*,
                  a.nombre,
                  a.apellido_paterno,
                  a.apellido_materno
              FROM transacciones t
              LEFT JOIN alumnos a ON t.alumno_id = a.id
              WHERE t.id = ?
          `, [transaccion_id]);

          if (transaccion.length === 0) {
              await connection.rollback();
              return {
                  success: false,
                  message: 'Transacción no encontrada'
              };
          }

          if (transaccion[0].cancelada === true) {
              await connection.rollback();
              return {
                  success: false,
                  message: 'La transacción ya está cancelada'
              };
          }

          const tipoTransaccion = transaccion[0].tipo_transaccion;
          const nombreAlumno = transaccion[0].nombre 
              ? `${transaccion[0].nombre} ${transaccion[0].apellido_paterno} ${transaccion[0].apellido_materno || ''}`
              : 'No especificado';

          // 2. Obtener detalles de la transacción
          const [detalles] = await connection.query(`
              SELECT 
                  td.*
              FROM transaccion_detalles td
              WHERE td.transaccion_id = ?
          `, [transaccion_id]);

          let mensualidadesCanceladas = 0;
          let inscripcionesCanceladas = 0;
          let asistenciasEliminadas = 0;
          let renovacionesInvalidadas = 0;
          const gruposAfectados = new Set();

          // 3. MANEJO ESPECIAL PARA RENOVACIONES (debe procesarse primero)
          if (tipoTransaccion === 'renovacion') {
              const [inscripcionRenovada] = await connection.query(`
                  SELECT 
                      td.referencia_id as inscripcion_id,
                      i.fecha_fin,
                      i.anos_vigencia,
                      i.observaciones,
                      t.created_at as fecha_transaccion
                  FROM transaccion_detalles td
                  INNER JOIN inscripciones i ON td.referencia_id = i.id
                  INNER JOIN transacciones t ON td.transaccion_id = t.id
                  WHERE td.transaccion_id = ? 
                  AND td.referencia_tipo = 'inscripcion'
                  LIMIT 1
              `, [transaccion_id]);

              if (inscripcionRenovada.length > 0) {
                  const inscripcionId = inscripcionRenovada[0].inscripcion_id;
                  const fechaTransaccion = new Date(inscripcionRenovada[0].fecha_transaccion);
                  
                  // Formatear fecha de transacción: "DD/MM/YYYY, HH:MM:SS"
                  const diaTransaccion = String(fechaTransaccion.getDate()).padStart(2, '0');
                  const mesTransaccion = String(fechaTransaccion.getMonth() + 1).padStart(2, '0');
                  const yearTransaccion = fechaTransaccion.getFullYear();
                  const horaTransaccion = String(fechaTransaccion.getHours()).padStart(2, '0');
                  const minutoTransaccion = String(fechaTransaccion.getMinutes()).padStart(2, '0');
                  const segundoTransaccion = String(fechaTransaccion.getSeconds()).padStart(2, '0');
                  
                  const fechaBuscar = `${diaTransaccion}/${mesTransaccion}/${yearTransaccion}, ${horaTransaccion}:${minutoTransaccion}:${segundoTransaccion}`;
                  
                  // console.log(`Buscando renovación con fecha: ${fechaBuscar}`);
                  
                  // Buscar la línea específica de renovación que coincida con la fecha
                  const regex = new RegExp(`Renovada por (\\d+) año[s]? el ${fechaBuscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
                  const obsMatch = inscripcionRenovada[0].observaciones?.match(regex);
                  
                  let anosRenovacion = 1; // Valor por defecto
                  
                  if (obsMatch) {
                      anosRenovacion = parseInt(obsMatch[1]);
                      // console.log(`Años de renovación encontrados: ${anosRenovacion}`);
                  } else {
                      // Fallback: buscar solo por fecha (sin hora)
                      const fechaSoloRegex = new RegExp(`Renovada por (\\d+) año[s]? el ${diaTransaccion}/${mesTransaccion}/${yearTransaccion}`, 'i');
                      const obsMatchFecha = inscripcionRenovada[0].observaciones?.match(fechaSoloRegex);
                      
                      if (obsMatchFecha) {
                          anosRenovacion = parseInt(obsMatchFecha[1]);
                          // console.log(`Años de renovación encontrados (solo por fecha): ${anosRenovacion}`);
                      } else {
                          console.warn('No se encontró la renovación en observaciones, usando valor por defecto: 1 año');
                      }
                  }

                  // Revertir la fecha de fin restando los años de renovación
                  const nuevaFechaFin = new Date(inscripcionRenovada[0].fecha_fin);
                  nuevaFechaFin.setFullYear(nuevaFechaFin.getFullYear() - anosRenovacion);

                  // Actualizar inscripción a su estado previo
                  await connection.query(`
                      UPDATE inscripciones_base 
                      SET fecha_fin = ?,
                          anos_vigencia = anos_vigencia - ?,
                          observaciones = CONCAT(
                              COALESCE(observaciones, ''), 
                              '\nRenovación invalidada el ',
                              NOW(),
                              ' - Transacción cancelada (revertidos ',
                              ?, ' año', 
                              CASE WHEN ? > 1 THEN 's' ELSE '' END,
                              ')'
                          )
                      WHERE id = ?
                  `, [
                      nuevaFechaFin.toISOString().split('T')[0],
                      anosRenovacion,
                      anosRenovacion,
                      anosRenovacion,
                      inscripcionId
                  ]);

                  renovacionesInvalidadas++;
                  // console.log(`Renovación invalidada: ${anosRenovacion} año(s) revertido(s). Nueva fecha fin: ${nuevaFechaFin.toISOString().split('T')[0]}`);
              }
          }

          // 4. Procesar cada detalle según su tipo
          for (const detalle of detalles) {
              const referenciaId = detalle.referencia_id;
              const referenciaTipo = detalle.referencia_tipo;

              if (!referenciaId) continue;

              // CANCELAR MENSUALIDADES
              if (referenciaTipo === 'mensualidad') {
                  const [mensualidadInfo] = await connection.query(`
                      SELECT 
                          m.id,
                          m.fecha_inicio,
                          m.fecha_fin,
                          m.cancelada,
                          GROUP_CONCAT(DISTINCT g.nombre SEPARATOR ', ') as grupos
                      FROM mensualidades m
                      LEFT JOIN mensualidad_grupos mg ON m.id = mg.mensualidad_id
                      LEFT JOIN grupos g ON mg.grupo_id = g.id AND g.deleted = 0
                      WHERE m.id = ?
                      GROUP BY m.id
                  `, [referenciaId]);

                  // console.log("Mensualidad info:", mensualidadInfo);

                  if (mensualidadInfo.length > 0 && mensualidadInfo[0].cancelada === false) {
                      // Cancelar mensualidad
                      await connection.query(`
                          UPDATE mensualidades 
                          SET cancelada = 1,
                              fecha_cancelacion = NOW(),
                              motivo_cancelacion = 'Transacción cancelada',
                              updated_at = NOW()
                          WHERE id = ?
                      `, [referenciaId]);

                      // Eliminar asistencias futuras
                      const [asistenciasResult] = await connection.query(`
                          DELETE a FROM asistencias a
                          INNER JOIN clases c ON a.clase_id = c.id
                          WHERE a.mensualidad_id = ?
                          AND c.fecha >= CURDATE()
                          AND a.hora_entrada IS NULL
                      `, [referenciaId]);

                      // console.log(`Asistencias futuras eliminadas para mensualidad ${referenciaId}: ${asistenciasResult.affectedRows}`);

                      asistenciasEliminadas += asistenciasResult.affectedRows;
                      mensualidadesCanceladas++;

                      if (mensualidadInfo[0].grupos) {
                          mensualidadInfo[0].grupos.split(', ').forEach(g => gruposAfectados.add(g));
                      }

                      // console.log(`Mensualidad ${referenciaId} cancelada: ${mensualidadInfo[0].grupos || 'Sin grupos'}`);
                  }
              }

              // DESACTIVAR INSCRIPCIONES (solo si no es renovación)
              if (referenciaTipo === 'inscripcion' && tipoTransaccion !== 'renovacion') {
                  const [inscripcionInfo] = await connection.query(`
                      SELECT 
                          i.id,
                          i.activa
                      FROM inscripciones i
                      WHERE i.id = ?
                  `, [referenciaId]);

                  // console.log("Inscripción info:", inscripcionInfo);

                  if (inscripcionInfo.length > 0 && inscripcionInfo[0].activa === true) {
                      // Desactivar inscripción
                      await connection.query(`
                          UPDATE inscripciones_base 
                          SET activa = 0,
                              observaciones = CONCAT(
                                  COALESCE(observaciones, ''), 
                                  '\nInscripción cancelada el ',
                                  NOW(),
                                  ' - Transacción cancelada (Folio: ', ?, ')'
                              )
                          WHERE id = ?
                      `, [transaccion[0].folio, referenciaId]);

                      // Cancelar mensualidades asociadas
                      const [mensualidadesInscripcion] = await connection.query(`
                          SELECT id FROM mensualidades 
                          WHERE inscripcion_id = ? 
                          AND cancelada = 0
                      `, [referenciaId]);

                      for (const mens of mensualidadesInscripcion) {
                          // Cancelar mensualidad
                          await connection.query(`
                              UPDATE mensualidades 
                              SET cancelada = 1,
                                  fecha_cancelacion = NOW(),
                                  motivo_cancelacion = 'Inscripción cancelada por transacción',
                                  updated_at = NOW()
                              WHERE id = ?
                          `, [mens.id]);

                          // Eliminar asistencias futuras
                          const [asistResult] = await connection.query(`
                              DELETE a FROM asistencias a
                              INNER JOIN clases c ON a.clase_id = c.id
                              WHERE a.mensualidad_id = ?
                              AND c.fecha >= CURDATE()
                              AND a.hora_entrada IS NULL
                          `, [mens.id]);

                          asistenciasEliminadas += asistResult.affectedRows;
                          mensualidadesCanceladas++;
                      }

                      inscripcionesCanceladas++;
                      // console.log(`Inscripción ${referenciaId} desactivada`);
                  }
              }
          }

          // 5. Cancelar la transacción principal
          await connection.query(`
              UPDATE transacciones 
              SET cancelada = 1,
                  fecha_cancelacion = NOW()
              WHERE id = ?
          `, [transaccion_id]);

          await connection.commit();

          return {
              success: true,
              data: {
                  transaccion_cancelada: true,
                  folio: transaccion[0].folio,
                  tipo_transaccion: tipoTransaccion,
                  alumno: nombreAlumno,
                  detalles_cancelacion: {
                      mensualidades_canceladas: mensualidadesCanceladas,
                      inscripciones_desactivadas: inscripcionesCanceladas,
                      renovaciones_invalidadas: renovacionesInvalidadas,
                      asistencias_futuras_eliminadas: asistenciasEliminadas,
                      grupos_afectados: Array.from(gruposAfectados)
                  }
              },
              message: 'Transacción cancelada correctamente'
          };

      } catch (error) {
          await connection.rollback();
          console.error('Error al cancelar transacción en modelo:', error);
          throw error;
      } finally {
          connection.release();
      }
  }

  // Obtener transacciones por tipo
  static async getTransaccionesByTipo(tipo) {
    try {
      const [rows] = await db.query(`
        SELECT 
          t.id,
          t.folio,
          t.tipo_transaccion,
          t.monto_total,
          t.metodo_pago,
          t.created_at as fecha_transaccion,
          t.cancelada,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) as nombre_completo_alumno,
          GROUP_CONCAT(td.concepto SEPARATOR ', ') as conceptos
        FROM transacciones t
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN transaccion_detalles td ON t.id = td.transaccion_id
        WHERE t.cancelada = 0 AND t.tipo_transaccion = ?
        GROUP BY t.id, t.folio, t.tipo_transaccion, t.monto_total, t.metodo_pago, t.created_at, t.cancelada, nombre_completo_alumno
        ORDER BY t.created_at DESC
      `, [tipo]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default transaccionesModel;