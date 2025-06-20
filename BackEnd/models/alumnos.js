import db from '../config/db.js';


class alumnosModel {

  // Método para crear un nuevo alumno
  static async crearAlumno(alumno) {
    try{
      const [result] = await db.query(`
        INSERT INTO alumnos (
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento, 
          domicilio, 
          email, 
          telefono, 
          telefono_emergencia, 
          foto, 
          estatus, 
          tipo_alumno)
        VALUES (?,?,?,?,?,?,?,?,?,?,?);
        `
        ,[
          alumno.nombre, 
          alumno.apellido_paterno, 
          alumno.apellido_materno, 
          alumno.fecha_nacimiento, 
          alumno.domicilio, 
          alumno.email, 
          alumno.telefono, 
          alumno.telefono_emergencia, 
          alumno.foto,
          alumno.estatus, 
          alumno.tipo
        ]
      )
      return result.insertId;
    } catch(error) {
      throw error;
    }
  }

  // Método para obtener todos los alumnos
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          tipo_alumno,
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento,
          -- curp eliminado
          domicilio,
          email, 
          telefono, 
          telefono_emergencia, 
          foto,
          estatus,
          firma,
          fecha_creacion,
          fecha_modificacion
        FROM alumnos
				WHERE deleted = 0
        ORDER BY fecha_creacion DESC;
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener un alumno por ID
  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          tipo_alumno,
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento,
          -- curp eliminado
          domicilio,
          email, 
          telefono, 
          telefono_emergencia, 
          foto,
          estatus,
          firma,
          fecha_creacion,
          fecha_actualizacion
        FROM alumnos 
        WHERE id = ?;
      `, [id]);
        
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Método para actualizar un alumno
  static async update(id, alumno) {
    try {
      const [result] = await db.query(`
        UPDATE alumnos 
        SET 
          tipo_alumno = ?,
          nombre = ?, 
          apellido_paterno = ?, 
          apellido_materno = ?, 
          fecha_nacimiento = ?,
          -- curp eliminado por aldon, pero lo dejo por si las mosquis
          domicilio = ?,
          email = ?, 
          telefono = ?, 
          telefono_emergencia = ?, 
          foto = ?,
          estatus = ?,
          firma = ?
        WHERE id = ?;
        `, [
          alumno.tipo_alumno,
          alumno.nombre, 
          alumno.apellido_paterno, 
          alumno.apellido_materno, 
          alumno.fecha_nacimiento,
          // alumno.curp eliminado
          alumno.domicilio,
          alumno.email, 
          alumno.telefono, 
          alumno.telefono_emergencia, 
          alumno.foto,
          alumno.estatus,
          alumno.firma,
          id
        ]
      );
        
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Método para eliminar un alumno (soft delete)
  static async delete(id) {
    try {
      
      // const [result] = await db.query(`
      //     DELETE FROM alumnos 
      //     WHERE id = ?;
      // `, [id]);
      
      // return result.affectedRows > 0;
      
      // soft delete
      const [result] = await db.query(`
        UPDATE alumnos 
        SET deleted = 1
        WHERE id = ?;
      `, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // // Método adicional para buscar por CURP
  // static async getByCurp(curp) {
  //     try {
  //         const [rows] = await db.query(`
  //             SELECT 
  //                 id,
  //                 tipo,
  //                 nombre, 
  //                 apellido_paterno, 
  //                 apellido_materno, 
  //                 fecha_nacimiento,
  //                 curp,
  //                 direccion, 
  //                 email, 
  //                 telefono, 
  //                 telefono_emergencia, 
  //                 foto,
  //                 estado,
  //                 firma,
  //                 created_at,
  //                 updated_at
  //             FROM alumnos 
  //             WHERE curp = ?;
  //         `, [curp]);
      
  //         return rows.length > 0 ? rows[0] : null;
  //     } catch (error) {
  //         throw error;
  //     }
  // }

  // Método para obtener alumnos por estatus 
  static async getByEstatus(estatus) { 
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          tipo_alumno,
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          fecha_nacimiento,
          -- curp, el aldo lo eliminó, pero lo dejo comentado por si las moscas
          domicilio,
          email, 
          telefono, 
          telefono_emergencia, 
          foto,
          estatus,
          firma,
          fecha_creacion,
          fecha_actualizacion
        FROM alumnos 
        WHERE estatus = ?
        ORDER BY fecha_creacion DESC;
      `, [estatus]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener estadísticas
  static async getEstadisticas() {
    try {
      const [rows] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estatus = 'activo' THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN estatus = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
          SUM(CASE WHEN estatus = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN firma = 1 THEN 1 ELSE 0 END) as con_firma,
          SUM(CASE WHEN tipo_alumno = 'regular' THEN 1 ELSE 0 END) as regulares,
          SUM(CASE WHEN tipo_alumno = 'prueba' THEN 1 ELSE 0 END) as prueba
        FROM alumnos;
      `);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

}

export default alumnosModel;