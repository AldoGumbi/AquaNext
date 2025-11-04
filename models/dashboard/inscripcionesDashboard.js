import db from "../../config/db.js";

class InscripcionesModel {
  /**
   * Tablas de inscripciones por última inscripción de cada alumno.
   * Clasificación por fecha de vencimiento usando CURDATE().
   */
  static async getInscripcionesTablas({ user }) {
    try {
      // Subquery de pagos/folios por inscripción (último folio primero)
      const pagosSubquery = `
        SELECT
          td.referencia_id AS inscripcion_id,
          GROUP_CONCAT(DISTINCT t.folio ORDER BY t.created_at DESC SEPARATOR ',') AS folios
        FROM transaccion_detalles td
        JOIN transacciones t
              ON t.id = td.transaccion_id
             AND COALESCE(t.cancelada, 0) = 0
        WHERE td.referencia_tipo = 'INSCRIPCION'
        GROUP BY td.referencia_id
      `;

      // SELECT base: última inscripción por alumno + formateo de fechas dd-mm-YYYY
      const baseSelect = `
        SELECT
          a.id AS \`ID\`,
          CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno,'')) AS \`Alumno\`,
          a.telefono AS \`Teléfono\`,
          a.estatus AS \`Estatus\`,
          COALESCE(DATE_FORMAT(a.fecha_creacion, '%d-%m-%Y'), '') AS \`Fecha Registro\`,
          COALESCE(DATE_FORMAT(i.fecha_inscripcion, '%d-%m-%Y'), '') AS \`Última Fecha Inscripción\`,
          COALESCE(DATE_FORMAT(i.fecha_fin, '%d-%m-%Y'), '') AS \`Fecha Vencimiento\`,
          i.anos_vigencia AS \`Años\`,
          SUBSTRING_INDEX(p.folios, ',', 1) AS \`Folio\`
        FROM inscripciones i
        JOIN alumnos a
          ON a.id = i.alumno_id
        JOIN (
          SELECT i3.alumno_id, MAX(i3.fecha_inscripcion) AS max_fecha
          FROM inscripciones i3
          GROUP BY i3.alumno_id
        ) ult
          ON ult.alumno_id = i.alumno_id
         AND ult.max_fecha = i.fecha_inscripcion
        LEFT JOIN (${pagosSubquery}) p
          ON p.inscripcion_id = i.id
      `;

      // 1) Vigentes
      const [vigentes] = await db.query(
        `
        ${baseSelect}
        WHERE i.fecha_fin >= CURDATE()
        ORDER BY \`Alumno\` ASC
        `
      );

      // 2) Vencidas
      const [vencidas] = await db.query(
        `
        ${baseSelect}
        WHERE i.fecha_fin < CURDATE()
        ORDER BY \`Alumno\` ASC
        `
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
      console.error("❌ Error en getInscripcionesTablas:", error);
      throw new Error("No se pudieron obtener las tablas de inscripciones.");
    }
  }
}

export default InscripcionesModel;
