import db from '../config/db.js';

class profesoresModel {
  // Obtener todos los profesores activos
  static async getAll() {
    const [profesores] = await db.query(`
      SELECT 
        id,
        nombre, 
        apellido, 
        fecha_nacimiento,
        direccion,
        telefono, 
        especialidad,
        fecha_contratacion,
        activo,
        fecha_creacion,
        fecha_modificacion
      FROM profesores 
      WHERE deleted = 0
      ORDER BY fecha_creacion DESC
    `);
    return profesores;
  }

  // Obtener un profesor por su id
  static async getById(id) {
    const [profesor] = await db.query(`
      SELECT 
        id,
        nombre, 
        apellido, 
        fecha_nacimiento,
        direccion,
        telefono, 
        especialidad,
        fecha_contratacion,
        activo,
        fecha_creacion,
        fecha_modificacion
      FROM profesores 
      WHERE id = ? AND deleted = 0
    `, [id]);
    return profesor[0];
  }

  // Crear un profesor
  static async create(profesor) {
    const [result] = await db.query(`
      INSERT INTO profesores (
        nombre, 
        apellido, 
        fecha_nacimiento, 
        direccion, 
        telefono, 
        especialidad,
        fecha_contratacion,
        activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      profesor.nombre, 
      profesor.apellido, 
      profesor.fecha_nacimiento, 
      profesor.direccion, 
      profesor.telefono, 
      profesor.especialidad,
      profesor.fecha_contratacion,
      profesor.activo ?? 1
    ]);
    return result.insertId;
  }

  // Editar profesor
  static async update(id, profesor) {
    const [result] = await db.query(`
      UPDATE profesores 
      SET 
        nombre = ?, 
        apellido = ?, 
        fecha_nacimiento = ?,
        direccion = ?,
        telefono = ?, 
        especialidad = ?,
        fecha_contratacion = ?,
        activo = ?
      WHERE id = ? AND deleted = 0
    `, [
      profesor.nombre, 
      profesor.apellido, 
      profesor.fecha_nacimiento,
      profesor.direccion,
      profesor.telefono, 
      profesor.especialidad,
      profesor.fecha_contratacion,
      profesor.activo ?? 1,
      id
    ]);
    return result.affectedRows;
  }

  // Eliminar un profesor (soft delete)
  static async delete(id) {
    const [result] = await db.query(`
      UPDATE profesores SET deleted = 1 WHERE id = ?
    `, [id]);
    return result.affectedRows > 0;
  }

  // Verificar si el teléfono ya existe
  static async telefonoAvailability(telefono) {
    const [result] = await db.query(`
      SELECT COUNT(*) as count FROM profesores WHERE telefono = ? AND deleted = 0
    `, [telefono]);
    return result[0].count > 0;
  }

  // Obtener profesores por especialidad
  static async getByEspecialidad(especialidad) {
    const [profesores] = await db.query(`
      SELECT 
        id,
        nombre, 
        apellido, 
        telefono, 
        especialidad,
        fecha_contratacion
      FROM profesores
      WHERE especialidad LIKE ? AND deleted = 0
      ORDER BY fecha_contratacion DESC
    `, [`%${especialidad}%`]);
    return profesores;
  }

  // Obtener estadísticas de profesores
  static async getEstadisticas() {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(DISTINCT especialidad) as especialidades_diferentes
      FROM profesores
      WHERE deleted = 0
    `);
    return stats[0];
  }

  // Buscar profesores por nombre o apellido
  static async buscarPorNombre(nombre) {
    const [profesores] = await db.query(`
      SELECT 
        id,
        nombre, 
        apellido, 
        telefono, 
        especialidad,
        fecha_contratacion,
        activo
      FROM profesores 
      WHERE (nombre LIKE ? OR apellido LIKE ?) AND activo = 1
      ORDER BY nombre, apellido
    `, [`%${nombre}%`, `%${nombre}%`]);
    return profesores;
  }

static async getClasesPorFecha(fecha) {
  const [rows] = await db.query(
    `
    SELECT
      c.fecha                                   AS fecha_clase,
      COALESCE(ps.id, pt.id)                   AS id_profesor,
      COALESCE(CONCAT(ps.nombre, ' ', ps.apellido),
               CONCAT(pt.nombre, ' ', pt.apellido)) AS nombre_profesor,
      g.id                                      AS id_grupo,
      g.nombre                                  AS nombre_grupo,
      h.id                                      AS id_horario,
      h.dia,
      h.hora_inicio,
      h.hora_fin,
      h.cupo_maximo,
      CASE WHEN COALESCE(h.cupo_maximo,1)=1 THEN 'personalizada' ELSE 'grupal' END AS tipo_clase,
      a.id                                      AS id_alumno,
      CONCAT(a.nombre,' ',a.apellido_paterno,' ',COALESCE(a.apellido_materno,'')) AS nombre_alumno,
      asi.id                                    AS id_asistencia,
      asi.hora_entrada,
      asi.hora_salida,
      asi.es_prueba
    FROM clases c
    JOIN horarios h 
      ON h.id = c.horario_id
     AND h.activo = 1
     AND COALESCE(h.deleted,0) = 0
    -- profesor titular (del horario)
    JOIN profesores pt
      ON pt.id = h.profesor_id
     AND pt.activo = 1
     AND COALESCE(pt.deleted,0) = 0
    -- profesor suplente (si existe en clases)
    LEFT JOIN profesores ps
      ON ps.id = c.profesor_suplente_id
     AND ps.activo = 1
     AND COALESCE(ps.deleted,0) = 0
    JOIN grupos g
      ON g.id = h.grupo_id
     AND g.activo = 1
     AND COALESCE(g.deleted,0) = 0
    LEFT JOIN asistencias asi
      ON asi.clase_id = c.id
    LEFT JOIN alumnos a
      ON a.id = asi.alumno_id
     AND COALESCE(a.deleted,0) = 0
    WHERE c.fecha = ?
    ORDER BY id_profesor, h.hora_inicio, g.id, a.id;
    `,
    [fecha]
  );

  return rows;
}

static async getClasesConDetallesByProfesor(profesorId) {
  const [rows] = await db.query(
    `
    SELECT 
        c.id AS id_clase,
        c.horario_id,
        h.dia,
        h.hora_inicio,
        h.hora_fin,
        c.fecha AS fecha_clase,
        g.nombre AS nombre_grupo,
        c.cancelada,
        c.profesor_suplente_id,   -- 👈 agregar este campo
        CASE 
          WHEN c.cancelada = 1 THEN 0 
          ELSE 1 
        END AS activa
    FROM clases c
    JOIN horarios h ON c.horario_id = h.id
    JOIN grupos g ON h.grupo_id = g.id
    WHERE h.deleted = 0
      AND g.deleted = 0
      AND h.activo = 1
      AND g.activo = 1
      AND (
            h.profesor_id = ?              -- titular
            OR c.profesor_suplente_id = ?  -- suplente
          )
    ORDER BY c.fecha, h.hora_inicio;
    `,
    [profesorId, profesorId]
  );

  return rows;
}


static async updateClaseProfesor({ id_clase, profesor_suplente_id }) {
  // 1️⃣ Buscar el titular de la clase
  const [clase] = await db.query(
    `
    SELECT 
      c.id AS id_clase,
      h.profesor_id AS profesor_titular
    FROM clases c
    JOIN horarios h ON h.id = c.horario_id
    WHERE c.id = ?
    `,
    [id_clase]
  );

  if (!clase.length) {
    throw new Error(`Clase con id ${id_clase} no encontrada`);
  }

  const profesorTitular = clase[0].profesor_titular;

  // 2️⃣ Validar suplente: si es igual al titular → lo limpiamos (NULL)
  const suplenteFinal =
    profesor_suplente_id && Number(profesor_suplente_id) === Number(profesorTitular)
      ? null
      : profesor_suplente_id || null;

  // 3️⃣ Actualizar la clase
  const [result] = await db.query(
    `
    UPDATE clases
    SET profesor_suplente_id = ?
    WHERE id = ?
    `,
    [suplenteFinal, id_clase]
  );

  return result.affectedRows > 0;
}

// Obtener grupos y horarios asignados a un profesor
static async getGruposYHorariosByProfesor(profesorId) {
  const [rows] = await db.query(
    `
    SELECT 
      h.id            AS id_horario,
      h.dia,
      h.hora_inicio,
      h.hora_fin,
      h.cupo_maximo,
      g.id            AS id_grupo,
      g.codigo        AS codigo_grupo,
      g.nombre        AS nombre_grupo,
      g.tipo          AS tipo_grupo,
      g.nivel         AS nivel_grupo,
      g.descripcion   AS descripcion_grupo
    FROM horarios h
    JOIN grupos g 
      ON g.id = h.grupo_id
     AND g.activo = 1
     AND COALESCE(g.deleted,0) = 0
    WHERE h.profesor_id = ?
      AND h.activo = 1
      AND COALESCE(h.deleted,0) = 0
    ORDER BY h.dia, h.hora_inicio;
    `,
    [profesorId]
  );

  return rows;
}

}





export default profesoresModel;