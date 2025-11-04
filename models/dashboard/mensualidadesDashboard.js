// models/dashboard/mensualidadesDashboard.js
import db from "../../config/db.js";

class MensualidadesDashboard {
  static async getMensualidadesTablas() {
    try {
      // Base SELECT: información de mensualidades con JOINs
      const baseSelect = `
        SELECT 
          a.id AS \`ID Alumno\`,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) AS \`Alumno\`,
          DATE_FORMAT(i.fecha_inscripcion, '%d/%m/%Y') AS \`Fecha Inscripción\`,
          t.folio AS \`Folio Ticket\`,
          DATE_FORMAT(m.created_at, '%d/%m/%Y') AS \`Fecha Registro Mensualidad\`,
          g.nombre AS \`Grupo\`,
          g.nivel AS \`Nivel\`,
          GROUP_CONCAT(DISTINCT h.dia ORDER BY h.dia SEPARATOR ', ') AS \`Días Clase\`,
          CONCAT(
            LPAD(MIN(TIME_FORMAT(h.hora_inicio, '%H:%i')), 5, '0'),
            ' - ',
            LPAD(MAX(TIME_FORMAT(h.hora_fin, '%H:%i')), 5, '0')
          ) AS \`Horario\`,
          DATE_FORMAT(m.fecha_inicio, '%d/%m/%Y') AS \`Fecha Inicio\`,
          CONCAT(
            TIMESTAMPDIFF(MONTH, m.fecha_inicio, m.fecha_fin) + 1,
            ' ',
            IF(TIMESTAMPDIFF(MONTH, m.fecha_inicio, m.fecha_fin) + 1 = 1, 'mes', 'meses')
          ) AS \`Meses Vigencia\`,
          DATE_FORMAT(m.fecha_fin, '%d/%m/%Y') AS \`Fecha Vencimiento\`,
          COALESCE(td.total, m.monto_total) AS \`Importe\`
        FROM mensualidades m
        JOIN inscripciones i 
          ON i.id = m.inscripcion_id
        JOIN alumnos a 
          ON a.id = i.alumno_id
        LEFT JOIN mensualidad_grupos mg 
          ON mg.mensualidad_id = m.id
        LEFT JOIN grupos g 
          ON g.id = mg.grupo_id
        LEFT JOIN horarios h 
          ON h.id = mg.horario_id
        LEFT JOIN transaccion_detalles td 
          ON td.referencia_id = m.id 
          AND td.referencia_tipo = 'mensualidad'
        LEFT JOIN transacciones t 
          ON t.id = td.transaccion_id
        WHERE __CONDICION__
        GROUP BY 
          a.id, m.id, i.fecha_inscripcion, t.folio, m.created_at,
          g.nombre, g.nivel, m.fecha_inicio, m.fecha_fin, m.monto_total, td.total
        ORDER BY a.id, m.fecha_inicio
      `;

      // 1) Mensualidades Vigentes
      const [vigentes] = await db.query(
        baseSelect.replace("__CONDICION__", "m.fecha_fin >= CURDATE()")
      );

      // 2) Mensualidades Vencidas
      const [vencidas] = await db.query(
        baseSelect.replace("__CONDICION__", "m.fecha_fin < CURDATE()")
      );

      return {
        vigentes: {
          data: vigentes,
          columns: vigentes.length ? Object.keys(vigentes[0]) : [],
        },
        vencidas: {
          data: vencidas,
          columns: vencidas.length ? Object.keys(vencidas[0]) : [],
        },
      };
    } catch (error) {
      console.error("❌ Error en MensualidadesDashboard:", error);
      throw new Error("No se pudieron obtener las tablas de mensualidades.");
    }
  }
}

export default MensualidadesDashboard;
