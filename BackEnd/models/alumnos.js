import db from '../config/db.js';


class alumnosModel {
    static async crearAlumno(alumno){
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
                ,[alumno.nombre, 
                  alumno.apellido_paterno, 
                  alumno.apellido_materno, 
                  alumno.fecha_nacimiento, 
                  alumno.domicilio, 
                  alumno.email, 
                  alumno.telefono, 
                  alumno.telefono_emergencia, 
                  alumno.foto,
                  alumno.estatus, 
                  alumno.tipo]
            )
            return result.insertId;
        }catch(error){
            throw error;
        }
    }

}

export default alumnosModel;