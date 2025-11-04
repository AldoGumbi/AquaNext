import db from "../config/db.js";

class AccesoAlumnosModel {
  // Encabezados para el frontend
  static getHeaders() {
    return [
      "id_alumno",
      "alumno",
      "estatus",
      "vencimiento_inscripcion",
      "vencimiento_mensualidad",
      "clase",
      "tipo_clase",
      "nivel",
      "dia_clase",
      "hora_inicio",
      "hora_fin",
    ];
  }

  // Obtener info del alumno por ID (credencial)
  static async getAccesoById(id) {
    try {
      const [rows] = await db.query(
        `
          SELECT
            a.id AS id_alumno,
            a.tipo_alumno,
            CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) AS alumno,
            a.estatus,
            MAX(i.fecha_fin) AS vencimiento_inscripcion,
            MAX(m.fecha_fin) AS vencimiento_mensualidad,
            COALESCE(g.nombre, g_prueba.nombre) AS clase,
            COALESCE(g.tipo, g_prueba.tipo) AS tipo_clase,
            COALESCE(g.nivel, g_prueba.nivel) AS nivel,
            COALESCE(h.dia, h_prueba.dia) AS dia_clase,
            COALESCE(h.hora_inicio, h_prueba.hora_inicio) AS hora_inicio,
            COALESCE(h.hora_fin, h_prueba.hora_fin) AS hora_fin
          FROM alumnos a
                 -- Path para alumnos REGULARES (inscripciones/mensualidades)
                 LEFT JOIN inscripciones i
                           ON i.alumno_id = a.id
                             AND i.activa = 1
                             AND a.tipo_alumno = 'regular'
                 LEFT JOIN mensualidades m
                           ON m.inscripcion_id = i.id
                             AND m.pagada = 0
                             AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                 LEFT JOIN mensualidad_grupos mg
                           ON mg.mensualidad_id = m.id
                 LEFT JOIN grupos g
                           ON g.id = mg.grupo_id
                             AND g.activo = 1
                             AND g.deleted = 0
                 LEFT JOIN horarios h
                           ON h.id = mg.horario_id
                             AND h.activo = 1
                             AND h.deleted = 0

            -- Path para alumnos de PRUEBA (asistencias/clases)
                 LEFT JOIN asistencias asis
                           ON asis.alumno_id = a.id
                             AND a.tipo_alumno = 'prueba'
                 LEFT JOIN clases c
                           ON c.id = asis.clase_id
                 LEFT JOIN horarios h_prueba
                           ON h_prueba.id = c.horario_id
                             AND h_prueba.activo = 1
                             AND h_prueba.deleted = 0
                 LEFT JOIN grupos g_prueba
                           ON g_prueba.id = h_prueba.grupo_id
                             AND g_prueba.activo = 1
                             AND g_prueba.deleted = 0

          WHERE a.id = ?
          GROUP BY
            a.id, a.nombre, a.apellido_paterno, a.apellido_materno, a.estatus, a.tipo_alumno,
            COALESCE(g.nombre, g_prueba.nombre),
            COALESCE(g.tipo, g_prueba.tipo),
            COALESCE(g.nivel, g_prueba.nivel),
            COALESCE(h.dia, h_prueba.dia),
            COALESCE(h.hora_inicio, h_prueba.hora_inicio),
            COALESCE(h.hora_fin, h_prueba.hora_fin);
        `,
        [id]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en getAccesoById:", error);
      throw error;
    }
  }
}

export default AccesoAlumnosModel;
