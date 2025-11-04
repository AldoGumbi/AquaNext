// BackEnd/models/userModel.js
import db from '../config/db.js';

class usuariosModel {
  
  // Crear un nuevo usuario
  static async create(usuario) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(`
        INSERT INTO usuarios (
          username,
          email,
          password,
          rol,
          activo,
          turno
        ) VALUES (?, ?, ?, ?, ?, ?);
      `, [
        usuario.username,
        usuario.email,
        usuario.password, // Se recomienda encriptar antes en el controlador
        usuario.rol || 'usuario',
        usuario.activo ?? 1,
        usuario.turno || null
      ]);

      const userId = result.insertId;
      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener todos los usuarios
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          id            AS 'ID',
          username      AS 'Usuario',
          email         AS 'Correo',
          rol           AS 'Rol',
          turno         AS 'Turno',
          CASE 
            WHEN activo = 1 THEN 'Activo' 
            ELSE 'Inactivo' 
          END           AS 'Estado',
          created_at    AS 'Fecha de Creación',
          updated_at    AS 'Última Modificación'
        FROM usuarios
        ORDER BY created_at DESC;
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT 
          id            AS 'ID',
          username      AS 'Usuario',
          email         AS 'Correo',
          rol           AS 'Rol',
          turno         AS 'Turno',
          CASE 
            WHEN activo = 1 THEN 'Activo' 
            ELSE 'Inactivo' 
          END           AS 'Estado',
          created_at    AS 'Fecha de Creación',
          updated_at    AS 'Última Modificación'
        FROM usuarios
        WHERE id = ?;
      `, [id]);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar información del usuario
  static async update(id, usuario) {
    try {
      const [result] = await db.query(`
        UPDATE usuarios
        SET 
          username = ?,
          email = ?,
          rol = ?,
          activo = ?,
          turno = ?
        WHERE id = ?;
      `, [
        usuario.username,
        usuario.email,
        usuario.rol,
        usuario.activo ?? 1,
        usuario.turno || null,
        id
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar contraseña (separado por seguridad)
  static async updatePassword(id, passwordHash) {
    try {
      const [result] = await db.query(`
        UPDATE usuarios
        SET password = ?
        WHERE id = ?;
      `, [passwordHash, id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Activar o desactivar usuario
  static async toggleActivo(id, activo) {
    try {
      const [result] = await db.query(`
        UPDATE usuarios
        SET activo = ?
        WHERE id = ?;
      `, [activo, id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  static async delete(id) {
    try {
      const [result] = await db.query(`
        DELETE FROM usuarios
        WHERE id = ?;
      `, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Generar reporte por usuario y rol
  static async getReportByRole(rol) {
    try {
      const [rows] = await db.query(`
        SELECT 
          id            AS 'ID',
          username      AS 'Usuario',
          email         AS 'Correo',
          rol           AS 'Rol',
          turno         AS 'Turno',
          CASE 
            WHEN activo = 1 THEN 'Activo' 
            ELSE 'Inactivo' 
          END           AS 'Estado',
          created_at    AS 'Fecha de Creación',
          updated_at    AS 'Última Modificación'
        FROM usuarios
        WHERE rol = ?
        ORDER BY created_at DESC;
      `, [rol]);

      return rows;
    } catch (error) {
      throw error;
    }
  }

}

export default usuariosModel;
