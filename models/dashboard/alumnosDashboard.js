import db from "../../config/db.js";

class AlumnosModel {
  /**
   * ==============================
   * Obtener estadísticas de alumnos
   * ==============================
   * Devuelve:
   * - Total de alumnos
   * - Activos
   * - Inactivos
   */
  static async getAlumnosStats() {
    try {
      const [rows] = await db.query(`
        SELECT 
          COUNT(*) AS Total,
          SUM(CASE WHEN estatus = 'activo' THEN 1 ELSE 0 END) AS Activos,
          SUM(CASE WHEN estatus = 'inactivo' THEN 1 ELSE 0 END) AS Inactivos
        FROM alumnos
        WHERE deleted = "0"
      `);

      const data = rows; // ya es un array con un solo objeto
      const columns = Object.keys(rows[0]);

      return { data, columns };
    } catch (error) {
      console.error("❌ Error en getAlumnosStats:", error);
      throw new Error("No se pudieron obtener las estadísticas de alumnos.");
    }
  }
}
export default AlumnosModel;
