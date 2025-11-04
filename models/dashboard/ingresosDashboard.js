import db from "../../config/db.js";

class IngresosModel {
  /**
   * Helper interno: genera condición WHERE según tipo de usuario
   */
  static _whereUsuario(user) {
    if (!user || user === "admin") return "1=1"; // sin filtro
    return `u.username = '${user}'`; // filtra por usuario
  }

  /**
   * Totales de ingresos (sin filtro)
   */
  static async getIngresosTotales({ user = "admin" } = {}) {
    // console.log("🔥 [Model] getIngresosTotales");
    try {
      const whereUsuario = this._whereUsuario(user);
      
      const [rows] = await db.query(`
        SELECT 
          td.referencia_tipo AS tipo_ingreso,
          SUM(
            CASE 
              WHEN t.tipo_transaccion IN ('mensualidad', 'mixta', 'renovacion') 
                THEN td.total
              ELSE t.monto_total
            END
          ) AS total_ingresos
        FROM transacciones t
        INNER JOIN transaccion_detalles td 
          ON t.id = td.transaccion_id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND ${whereUsuario}
        GROUP BY td.referencia_tipo
      `);
      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosTotales:", error);
      throw new Error("No se pudieron obtener los ingresos totales.");
    }
  }

  /**
   * Totales de ingresos (con filtro de fecha o rango)
   */
  static async getIngresosTotalesByFecha({ user = "admin", fechaInicio, fechaFin }) {
    try {
      const whereUsuario = this._whereUsuario(user);
      // Ajustar fechaFin para incluir todo el día
      const fin = fechaFin ? `${fechaFin} 23:59:59` : null;

      const [rows] = await db.query(
        `
        SELECT 
          td.referencia_tipo AS tipo_ingreso,
          SUM(td.total) AS total_ingresos
        FROM transacciones t
        INNER JOIN transaccion_detalles td 
          ON t.id = td.transaccion_id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND ${whereUsuario}
          AND t.created_at BETWEEN ? AND ?
        GROUP BY td.referencia_tipo
        `,
        [fechaInicio, fin]
      );

      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosTotalesByFecha:", error);
      throw new Error("No se pudieron obtener los ingresos filtrados por fecha.");
    }
  }

  /**
   * Tabla global de ingresos (todas las transacciones)
   */
  static async getIngresosGlobales({ user = "admin", fechaInicio = null, fechaFin = null }) {

    // console.log("🔥 [Model] getIngresosGlobales:", { user, fechaInicio, fechaFin });
    try {
      const whereUsuario = this._whereUsuario(user);
      
      let query = `
        SELECT 
          t.folio AS \`Folio\`,
          CASE 
            WHEN t.tipo_transaccion = 'clase_prueba' THEN 'Clase de Prueba'
            ELSE t.tipo_transaccion
          END AS \`Tipo Transacción\`,
          CASE 
            WHEN td.referencia_tipo = 'inscripcion' THEN 'Inscripción'
            WHEN td.referencia_tipo = 'mensualidad' THEN 'Mensualidad'
            WHEN td.referencia_tipo = 'clase_prueba' THEN 'Clase de Prueba'
            WHEN td.referencia_tipo IN ('cafeteria','articulos_deportivos','trajes_bano', 'producto') THEN 'Tienda'
            ELSE 'Otro'
          END AS \`Tipo Ingreso\`,
          CASE 
            WHEN t.tipo_transaccion IN ('mensualidad', 'mixta', 'renovacion', 'inscripcion') 
              THEN td.subtotal
            WHEN t.tipo_transaccion = 'clase_prueba'
              THEN t.monto_subtotal
            ELSE t.monto_subtotal
          END AS \`Subtotal\`,
          CASE 
            WHEN t.tipo_transaccion IN ('mensualidad', 'mixta', 'renovacion', 'inscripcion', 'clase_prueba') 
              THEN td.descuento
            ELSE t.monto_descuento
          END AS \`Descuento\`,
          CASE 
            WHEN t.tipo_transaccion IN ('mensualidad', 'mixta', 'renovacion', 'inscripcion', 'clase_prueba') 
              THEN td.total
            ELSE t.monto_total
          END AS \`Importe\`,
          CASE 
            WHEN t.tipo_transaccion IN ('mensualidad', 'mixta') 
                 AND td.referencia_tipo = 'mensualidad'
              THEN COALESCE(m.metodo_pago, t.metodo_pago)
            WHEN t.tipo_transaccion IN ('inscripcion', 'mixta', 'renovacion') 
                 AND td.referencia_tipo = 'inscripcion'
              THEN COALESCE(i.metodo_pago, t.metodo_pago)
            WHEN t.tipo_transaccion = 'clase_prueba'
                 AND td.referencia_tipo = 'clase_prueba'
              THEN t.metodo_pago
            ELSE t.metodo_pago
          END AS \`Método Pago\`,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno,'')) AS \`Alumno\`,
          u.username AS \`Usuario\`,
          DATE_FORMAT(t.created_at, '%d-%m-%Y') AS \`Fecha Registro\`
        FROM transacciones t
        LEFT JOIN transaccion_detalles td 
          ON t.id = td.transaccion_id 
          AND t.tipo_transaccion IN ('mensualidad', 'mixta', 'renovacion', 'inscripcion', 'clase_prueba')
        LEFT JOIN mensualidades m 
          ON td.referencia_id = m.id AND td.referencia_tipo = 'mensualidad'
        LEFT JOIN inscripciones i 
          ON td.referencia_id = i.id AND td.referencia_tipo = 'inscripcion'
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND ${whereUsuario}
      `;
      
      const params = [];
      if (fechaInicio && fechaFin) {
        query += " AND t.created_at BETWEEN ? AND ?";
        params.push(fechaInicio, `${fechaFin} 23:59:59`);
      } else {
        query += " AND t.created_at BETWEEN CURDATE() AND CONCAT(CURDATE(), ' 23:59:59')";
      }
      
      query += " ORDER BY t.created_at DESC";
      
      const [rows] = await db.query(query, params);

      // console.log("🔥 [Model] getIngresosGlobales - filas obtenidas:", rows);
      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosGlobales:", error);
      throw new Error("No se pudieron obtener los ingresos globales.");
    }
  }

  /**
   * Tabla ingresos de inscripciones
   */
  static async getIngresosInscripciones({ user = "admin", fechaInicio = null, fechaFin = null }) {
    try {
      const whereUsuario = this._whereUsuario(user);
      
      let query = `
        SELECT 
          t.folio AS \`Folio\`,
          'Inscripción' AS \`Tipo Ingreso\`,
          td.total AS \`Importe\`,
          COALESCE(i.metodo_pago, t.metodo_pago) AS \`Método Pago\`,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno,'')) AS \`Alumno\`,
          u.username AS \`Usuario\`,
          DATE_FORMAT(t.created_at, '%d-%m-%Y') AS \`Fecha Registro\`
        FROM transacciones t
        INNER JOIN transaccion_detalles td ON t.id = td.transaccion_id
        LEFT JOIN inscripciones i ON td.referencia_id = i.id AND td.referencia_tipo = 'inscripcion'
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND td.referencia_tipo = 'inscripcion'
          AND ${whereUsuario}
      `;

      const params = [];
      if (fechaInicio && fechaFin) {
        query += " AND t.created_at BETWEEN ? AND ?";
        params.push(fechaInicio, `${fechaFin} 23:59:59`);
      } else {
        query += " AND t.created_at BETWEEN CURDATE() AND CONCAT(CURDATE(), ' 23:59:59')";
      }

      query += " ORDER BY t.created_at DESC";

      const [rows] = await db.query(query, params);

      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosInscripciones:", error);
      throw new Error("No se pudieron obtener los ingresos de inscripciones.");
    }
  }

  /**
   * Tabla ingresos de mensualidades
   */
  static async getIngresosMensualidades({ user = "admin", fechaInicio = null, fechaFin = null }) {
    try {
      const whereUsuario = this._whereUsuario(user);
      
      let query = `
        SELECT 
          t.folio AS \`Folio\`,
          'Mensualidad' AS \`Tipo Ingreso\`,
          td.total AS \`Importe\`,
          COALESCE(m.metodo_pago, t.metodo_pago) AS \`Método Pago\`,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno,'')) AS \`Alumno\`,
          u.username AS \`Usuario\`,
          DATE_FORMAT(t.created_at, '%d-%m-%Y') AS \`Fecha Registro\`
        FROM transacciones t
        INNER JOIN transaccion_detalles td ON t.id = td.transaccion_id
        LEFT JOIN mensualidades m ON td.referencia_id = m.id AND td.referencia_tipo = 'mensualidad'
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND td.referencia_tipo = 'mensualidad'
          AND ${whereUsuario}
      `;

      const params = [];
      if (fechaInicio && fechaFin) {
        query += " AND t.created_at BETWEEN ? AND ?";
        params.push(fechaInicio, `${fechaFin} 23:59:59`);
      } else {
        query += " AND t.created_at BETWEEN CURDATE() AND CONCAT(CURDATE(), ' 23:59:59')";
      }

      query += " ORDER BY t.created_at DESC";

      const [rows] = await db.query(query, params);

      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosMensualidades:", error);
      throw new Error("No se pudieron obtener los ingresos de mensualidades.");
    }
  }

  /**
   * Tabla ingresos de clases de prueba
   */
  static async getIngresosClasesPrueba({ user = "admin", fechaInicio = null, fechaFin = null }) {
    try {
      const whereUsuario = this._whereUsuario(user);
      
      let query = `
        SELECT 
          t.folio AS \`Folio\`,
          'Clase de Prueba' AS \`Tipo Ingreso\`,
          td.total AS \`Importe\`,
          t.metodo_pago AS \`Método Pago\`,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno,'')) AS \`Alumno\`,
          g.nombre AS \`Grupo\`,
          g.nivel AS \`Nivel\`,
          DATE_FORMAT(c.fecha, '%d-%m-%Y') AS \`Fecha Clase\`,
          CONCAT(h.dia, ' ', TIME_FORMAT(h.hora_inicio, '%H:%i'), '-', TIME_FORMAT(h.hora_fin, '%H:%i')) AS \`Horario\`,
          CONCAT(p.nombre, ' ', IFNULL(p.apellido, '')) AS \`Profesor\`,
          u.username AS \`Usuario\`,
          DATE_FORMAT(t.created_at, '%d-%m-%Y') AS \`Fecha Registro\`
        FROM transacciones t
        INNER JOIN transaccion_detalles td ON t.id = td.transaccion_id
        INNER JOIN clases c ON td.referencia_id = c.id AND td.referencia_tipo = 'clase_prueba'
        INNER JOIN horarios h ON c.horario_id = h.id
        INNER JOIN grupos g ON h.grupo_id = g.id
        LEFT JOIN profesores p ON h.profesor_id = p.id
        LEFT JOIN alumnos a ON t.alumno_id = a.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND t.tipo_transaccion = 'clase_prueba'
          AND td.referencia_tipo = 'clase_prueba'
          AND ${whereUsuario}
      `;

      const params = [];
      if (fechaInicio && fechaFin) {
        query += " AND t.created_at BETWEEN ? AND ?";
        params.push(fechaInicio, `${fechaFin} 23:59:59`);
      } else {
        query += " AND t.created_at BETWEEN CURDATE() AND CONCAT(CURDATE(), ' 23:59:59')";
      }

      query += " ORDER BY t.created_at DESC";

      const [rows] = await db.query(query, params);

      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosClasesPrueba:", error);
      throw new Error("No se pudieron obtener los ingresos de clases de prueba.");
    }
  }

  /**
   * Tabla ingresos de tienda (cafetería, artículos deportivos, trajes de baño)
   */
  static async getIngresosTienda({ user = "admin", fechaInicio = null, fechaFin = null }) {
    try {
      const whereUsuario = this._whereUsuario(user);
      
      let query = `
        SELECT 
          t.folio AS \`Folio\`,
          'Tienda' AS \`Tipo Ingreso\`,
          t.monto_total AS \`Importe\`,
          t.metodo_pago AS \`Método Pago\`,
          u.username AS \`Usuario\`,
          DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS \`Fecha Registro\`
        FROM transacciones t
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE COALESCE(t.cancelada, 0) = 0
          AND EXISTS (
            SELECT 1 
            FROM transaccion_detalles td 
            WHERE td.transaccion_id = t.id 
              AND td.referencia_tipo IN ('cafeteria','articulos_deportivos','trajes_bano', 'producto')
          )
          AND ${whereUsuario}
      `;
      
      const params = [];
      if (fechaInicio && fechaFin) {
        query += " AND t.created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')";
        params.push(fechaInicio, fechaFin);
      } else {
        query += " AND t.created_at BETWEEN CURDATE() AND CONCAT(CURDATE(), ' 23:59:59')";
      }
      
      query += " ORDER BY t.created_at DESC";
      
      const [rows] = await db.query(query, params);
      return {
        data: rows,
        columns: rows.length ? Object.keys(rows[0]) : [],
      };
    } catch (error) {
      console.error("❌ Error en getIngresosTienda:", error);
      throw new Error("No se pudieron obtener los ingresos de tienda.");
    }
  }
}

export default IngresosModel;