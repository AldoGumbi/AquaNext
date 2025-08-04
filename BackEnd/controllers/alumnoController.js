import alumnosModel from '../models/alumnos.js';

export const insertAlumno = async (req, res) => {
    try {

        if (!req.body?.general){
            return res.status(400).json({
                message:'Error: Informacion general incorrecta',
                error: true
            })
        }
        const data =req.body;
        const todosLlenos = Object.values(data.general).every(val => val !== null && val !== undefined && val !== '');
        if (!todosLlenos) {
            return res.status(400).json({
                message:'Error: Informacion incompleta',
                error: true
            })
        }
        
        const domicilioFormat = Object.values(data.domicilio)
        .map(val => val?.trim())          // limpia espacios
        .filter(val => val)               // elimina nulos, undefined, ""
        .join(', ');
        const fechaFormatted = new Date(data.general.dateOfBirth).toISOString().split('T')[0];
        const foto = data?.foto || "";

        const alumno = {
            nombre: data.general.firstName,
            apellido_paterno:data.general.lastNamePaternal,
            apellido_materno: data.general.lastNameMaternal,
            email:data.general.email,
            telefono: data.general.phone,
            telefono_emergencia: data.general.emergencyPhone,
            fecha_nacimiento: fechaFormatted,
            domicilio: domicilioFormat,
            tipo:'regular',
            estatus: 'inactivo',
            foto: foto, 
        }
        const id = await alumnosModel.crearAlumno(alumno);
        res.status(201).json({
            data: true,
            message: 'Alumno creado correctamente',
            id: id
        });

    } catch(error) {
        res.status(500).json({
            data:false,
            message: 'Ocurrio un error al crear al alumno',
            error: error.message
        });
    }		
}

export const getAllAlumnos = async (req, res) => {
    try {
        const alumnos = await alumnosModel.getAll();
        
        if (alumnos.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No se encontraron alumnos',
                error: false
            });
        }

        // Formatear datos para el frontend
        const alumnosFormatted = alumnos.map(alumno => ({
            ...alumno,
            firma: Boolean(alumno.firma), // Convertir a boolean para el frontend
            fecha_nacimiento: alumno.fecha_nacimiento ? 
                alumno.fecha_nacimiento.toISOString().split('T')[0] : null
        }));

        res.status(200).json({
            data: alumnosFormatted,
            message: 'Alumnos obtenidos correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los alumnos',
            error: error.message
        });
    }
};

export const getActiveAlumnos = async (req, res) => {
    try {
        const alumnos = await alumnosModel.getActiveAlumnos();
        
        if (alumnos.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'No se encontraron alumnos',
                error: falseç
                +''
            });
        }

        // Formatear datos para el frontend
        const alumnosFormatted = alumnos.map(alumno => ({
            ...alumno,
            firma: Boolean(alumno.firma), // Convertir a boolean para el frontend
            fecha_nacimiento: alumno.fecha_nacimiento ? 
                alumno.fecha_nacimiento.toISOString().split('T')[0] : null
        }));

        res.status(200).json({
            data: alumnosFormatted,
            message: 'Alumnos obtenidos correctamente',
            error: false
        });

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener los alumnos',
            error: error.message
        });
    }
};

export const updateAlumno = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación del ID
        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Es necesario el ID del alumno a modificar',
                error: true
            });
        }

        // console.log('Datos recibidos para actualizar:', req.body);

        const {
            tipo_alumno,
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
            firma
        } = req.body;

        // Validaciones básicas
        if (!nombre || !apellido_paterno) {
            return res.status(400).json({
                data: false,
                message: 'Nombre y apellido paterno son requeridos',
                error: true
            });
        }

        // Formatear fecha si existe
        let fechaFormatted = null;
        if (fecha_nacimiento) {
            fechaFormatted = new Date(fecha_nacimiento).toISOString().split('T')[0];
        }

        const updatedAlumno = {
            tipo_alumno: tipo_alumno || 'regular',
            nombre: nombre.trim(),
            apellido_paterno: apellido_paterno.trim(),
            apellido_materno: apellido_materno?.trim() || null,
            fecha_nacimiento: fechaFormatted,
            // curp eliminado - ya no existe
            domicilio: domicilio?.trim() || null,
            email: email?.trim() || null,
            telefono: telefono?.trim() || null,
            telefono_emergencia: telefono_emergencia?.trim() || null,
            foto: foto || null,
            estatus: estatus || 'activo',
            firma: firma ? 1 : 0
        };

        const isUpdated = await alumnosModel.update(id, updatedAlumno);
        
        if (isUpdated) {
            res.status(200).json({
                data: true,
                message: 'Alumno actualizado correctamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Alumno no encontrado',
                error: true
            });
        }

    } catch (error) {
        // Nota: Ya no hay validación de CURP duplicada porque el campo fue eliminado
        
        res.status(500).json({
            data: false,
            message: 'Error interno al actualizar el alumno',
            error: error.message
        });
    }
};

export const deleteAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Es necesario el ID del alumno a eliminar',
                error: true
            });
        }

        const isDeleted = await alumnosModel.delete(id);
        
        if (isDeleted) {
            res.status(200).json({
                data: true,
                message: 'Alumno eliminado correctamente',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Alumno no encontrado',
                error: true
            });
        }

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al eliminar el alumno',
            error: error.message
        });
    }
};

// Función adicional para obtener un alumno por ID
export const getAlumnoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Es necesario el ID del alumno',
                error: true
            });
        }

        const alumno = await alumnosModel.getById(id);
        
        if (alumno) {
            // Formatear datos para el frontend
            const alumnoFormatted = {
                ...alumno,
                firma: Boolean(alumno.firma),
                fecha_nacimiento: alumno.fecha_nacimiento ? 
                    alumno.fecha_nacimiento.toISOString().split('T')[0] : null
            };

            res.status(200).json({
                data: alumnoFormatted,
                message: 'Alumno encontrado',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Alumno no encontrado',
                error: true
            });
        }

    } catch (error) {
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener el alumno',
            error: error.message
        });
    }
};

