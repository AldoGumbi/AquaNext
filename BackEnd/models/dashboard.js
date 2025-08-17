import db from '../config/db.js';

class dashboardModel {
  
  static async getAlumnosStats() {
    try {
      const [rows] = await db.query(`
        SELECT 
          COUNT(*) AS Total,
          SUM(CASE WHEN estatus = 'activo' THEN 1 ELSE 0 END) AS Activos,
          SUM(CASE WHEN estatus = 'inactivo' THEN 1 ELSE 0 END) AS Inactivos
        FROM alumnos
        WHERE deleted_at IS NULL
      `);

      const data = rows; // ya es un array con un solo objeto
      const columns = Object.keys(rows[0]);

      return { data, columns };
    } catch (error) {
      console.error("❌ Error en getAlumnosStats:", error);
      throw new Error("No se pudieron obtener las estadísticas de alumnos.");
    }
  }




  static async getAlumnosEnAlberca() {
    const rows = [
      {
        En_Alberca: 32,
        Tabla: {
          id: 2,
          tipo_alumno: "prueba",
          nombre: "Lucía",
          apellido_paterno: "Ramírez",
          apellido_materno: "Gómez",
          fecha_nacimiento: "2012-09-20",
          domicilio: "Av. Reforma 456",
          email: "lucia.ramirez@example.com",
          telefono: "5554443322",
          telefono_emergencia: "1112223333",
          foto: null,
          estatus: "activo",
          firma: false,
          fecha_creacion: "2023-02-01",
          fecha_modificacion: "2023-02-10",
          deleted: 0,
          deleted_at: null
        }
      }
    ];
    const columns = Object.keys(rows[0]);
    return { data: rows, columns };
  }

  static async getInscripcionesStats() {
  try {
    // 1) Totales (Ingreso, Total, Activas, Inactivas)
    const [statsRows] = await db.query(`
      SELECT
        COALESCE(SUM(COALESCE(p.ingreso, i.monto)), 0) AS Ingreso,
        COUNT(i.id)                                     AS Total,
        COUNT(CASE WHEN i.activa = 1 THEN 1 END) AS Activas,
        COUNT(CASE WHEN COALESCE(i.activa,0) = 0 THEN 1 END) AS Inactivas
      FROM inscripciones i
      LEFT JOIN (
        SELECT
          td.referencia_id AS inscripcion_id,
          SUM(
            COALESCE(td.total, td.cantidad * td.precio_unitario - COALESCE(td.descuento, 0))
          ) AS ingreso
        FROM transaccion_detalles td
        JOIN transacciones t 
              ON t.id = td.transaccion_id
             AND COALESCE(t.cancelada, 0) = 0
        WHERE td.referencia_tipo = 'INSCRIPCION'
        GROUP BY td.referencia_id
      ) p ON p.inscripcion_id = i.id
    `);

    // 2) Tabla (detalle por inscripción ACTIVA y vigente)
    const [tabla] = await db.query(`
      SELECT
        i.id AS ID,
        a.id AS \`ID Alumno\`,
        CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) AS \`Alumno\`,
        a.telefono,
        a.estatus,
        i.fecha_inscripcion                 AS \`Fecha Inscripción\`,
        COALESCE(i.year_inscripcion, YEAR(i.fecha_inscripcion)) AS \`Año Inscripción\`,
        i.anos_vigencia                     AS \`Años\`,
        i.fecha_fin                         AS \`Fecha Vencimiento\`,
        i.created_at                        AS \`Fecha Creacion\`,
        COALESCE(p.ingreso, i.monto)        AS \`Monto\`,
        COALESCE(p.metodo_pago, i.metodo_pago) AS \`Método Pago\`,
        p.folios                            AS \`Folio(s)\`,
        (i.activa = 1)                      AS \`Activa\`
      FROM inscripciones i
      JOIN alumnos a ON a.id = i.alumno_id
      LEFT JOIN (
        SELECT
          td.referencia_id AS inscripcion_id,
          SUM(
            COALESCE(td.total, td.cantidad * td.precio_unitario - COALESCE(td.descuento, 0))
          ) AS ingreso,
          ANY_VALUE(t.metodo_pago) AS metodo_pago,
          GROUP_CONCAT(DISTINCT t.folio ORDER BY t.created_at SEPARATOR ',') AS folios
        FROM transaccion_detalles td
        JOIN transacciones t 
              ON t.id = td.transaccion_id
             AND COALESCE(t.cancelada, 0) = 0
        WHERE td.referencia_tipo = 'INSCRIPCION'
        GROUP BY td.referencia_id
      ) p ON p.inscripcion_id = i.id
      WHERE i.activa = 1
        AND CURDATE() BETWEEN i.fecha_inscripcion AND i.fecha_fin
      ORDER BY \`Alumno\`, i.fecha_inscripcion DESC
      LIMIT 200
    `);

    const fila = { ...statsRows[0], Tabla: tabla };
    const data = [fila];
    const columns = Object.keys(fila);
    return { data, columns };
  } catch (error) {
    console.error("❌ Error en getInscripcionesStats:", error);
    throw new Error("No se pudieron obtener las estadísticas de inscripciones.");
  }
}


  static async getMensualidadesStats() {
    const rows = [
      {
        Ingreso: 3200,
        Total: 90,
        Activas: 80,
        Inactivas: 10,
        Tabla: {
          id: 12,
          inscripcion_id: 5,
          mes: "julio",
          year: 2025,
          fecha_inicio: "2025-07-01",
          fecha_fin: "2025-07-31",
          monto_total: 1000,
          monto_pagado: 1000,
          descuento_aplicado: 0,
          metodo_pago: "Efectivo",
          pagada: true,
          fecha_pago: "2025-07-01",
          created_at: "2025-06-30",
          updated_at: "2025-07-01"
        }
      }
    ];
    const columns = Object.keys(rows[0]);
    return { data: rows, columns };
  }

static async getIngresos() {
  try {
    // ======= KPI: total por INSCRIPCIÓN (ventas reales, no canceladas) =======
    const [kpiRows] = await db.query(`
      SELECT
        COALESCE(
          SUM(
            COALESCE(td.total,
                     td.cantidad * td.precio_unitario - COALESCE(td.descuento, 0))
          ), 0
        ) AS Inscripciones
      FROM transaccion_detalles td
      JOIN transacciones t
        ON t.id = td.transaccion_id
       AND COALESCE(t.cancelada, 0) = 0
      WHERE td.referencia_tipo = 'INSCRIPCION'
    `);

    const inscripcionesTotal = Number(kpiRows?.[0]?.Inscripciones || 0);

    // ======= Valores estáticos por ahora (ajústalos cuando tengas consulta) =======
    const MENSUALIDADES_E_CLASES = 45300; // <- estático temporal
    const TIENDA = 12700;                 // <- estático temporal

    // ======= Global =======
    const globalTotal = inscripcionesTotal + MENSUALIDADES_E_CLASES + TIENDA;

    // ======= TABLA: detalle por transacción (solo conceptos INSCRIPCION) =======
    const [tabla] = await db.query(`
      SELECT
        a.id AS id_alumno,
        CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno,'')) AS alumno,
        t.folio,
        t.tipo_transaccion AS tipo_venta,
        t.created_at       AS fecha_venta,
        -- Importes SOLO de renglones INSCRIPCION dentro de cada transacción:
        SUM(COALESCE(td.subtotal, td.cantidad * td.precio_unitario))                                    AS subtotal,
        SUM(COALESCE(td.descuento, 0))                                                                  AS descuento,
        SUM(COALESCE(td.total, td.cantidad * td.precio_unitario - COALESCE(td.descuento, 0)))          AS total,
        t.metodo_pago,
        t.usuario_id     AS usuario,
        CASE WHEN COALESCE(t.cancelada, 0) = 1 THEN 'cancelada' ELSE 'finalizada' END AS status
      FROM transaccion_detalles td
      JOIN transacciones t
        ON t.id = td.transaccion_id
      LEFT JOIN alumnos a
        ON a.id = t.alumno_id
      WHERE td.referencia_tipo = 'INSCRIPCION'
      GROUP BY
        t.id, a.id, alumno, t.folio, t.tipo_transaccion, t.created_at, t.metodo_pago, t.usuario_id, status
      ORDER BY t.created_at DESC
      LIMIT 500
    `);

    // ======= Forma de salida consistente con tu UI =======
    const data = [{
      Inscripciones: inscripcionesTotal,
      "Mensualidades y Clases": MENSUALIDADES_E_CLASES,
      Tienda: TIENDA,
      Global: globalTotal,
      Tabla: tabla, // ← array con filas: alumno, id_alumno, folio, tipo_venta, fecha_venta, subtotal, descuento, total, metodo_pago, usuario, status
    }];

    const columns = Object.keys(data[0] || {});
    return { data, columns };
  } catch (error) {
    console.error("❌ Error en getIngresos:", error);
    throw new Error("No se pudieron obtener los ingresos.");
  }
}

  
}

export default dashboardModel;

  // ===============================
  // Consulta dinámica como plantilla
  // ===============================
  /*
  static async getDemoQuery() {
    const [rows] = await db.query(`
      SELECT 
        i.id AS ID,
        a.nombre AS Alumno,
        i.fecha_inicio AS 'Inicio',
        i.fecha_fin AS 'Fin',
        i.monto AS 'Monto Inscripción',
        CASE WHEN i.activa = 1 THEN 'Activa' ELSE 'Inactiva' END AS Estado
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id
      WHERE i.deleted = 0
      LIMIT 20;
    `);

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      data: rows,
      columns
    };
  }
  */


