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
    const rows = [
      {
        Ingreso: 1000,
        Total: 100,
        Activas: 80,
        Inactivas: 12,
        Tabla: {
          ID: 1,
          "ID Alumno": 101,
          "Fecha Inscripción": "2023-01-15",
          "Año Inscripción": 2023,
          Monto: 1000,
          "Método Pago": "Tarjeta de Crédito",
          Activa: true,
          "Fecha Creacion": "2023-01-01"
        }
      }
    ];
    const columns = Object.keys(rows[0]);
    return { data: rows, columns };
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
    const rows = [
      {
        Inscripciones: 28000,
        "Mensualidades y Clases": 45300,
        Tienda: 12700,
        Global: 86000,
        Tabla: {
          id: 101,
          folio: "VNT-0001",
          tipo_transaccion: "venta",
          monto_subtotal: 1100,
          monto_descuento: 100,
          monto_total: 1000,
          metodo_pago: "Tarjeta",
          usuario_id: 3,
          alumno_id: 4,
          cancelada: false,
          fecha_cancelacion: null,
          created_at: "2025-06-30"
        }
      }
    ];
    const columns = Object.keys(rows[0]);
    return { data: rows, columns };
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


