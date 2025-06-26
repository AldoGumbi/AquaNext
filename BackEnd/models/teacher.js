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
}

export default profesoresModel;