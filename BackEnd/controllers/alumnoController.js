import alumnosModel from '../models/alumnos.js';

export const insertAlumno = async (req, res) => {
	try {

        if(!req.body?.general){
            return res.status(400).json({
                message:'Error: Informacion general incorrecta',
                error: true
            })
        }
        const data =req.body;
        const todosLlenos = Object.values(data.general).every(val => val !== null && val !== undefined && val !== '');
        if(!todosLlenos){
            return res.status(400).json({
                message:'Error: Informacion incompleta',
                error: true
            })
        }
        
        const domicilioFormat = Object.values(data.domicilio).join(',');
        const fechaFormatted = new Date(data.general.dateOfBirth).toISOString().split('T')[0];

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
        }
        const id = await alumnosModel.crearAlumno(alumno);
        res.status(201).json({
            data: true,
            message: 'Alumno creado correctamente',
            id: id
        });

    }catch(error){
        res.status(500).json({
            data:false,
            message: 'Ocurrio un error al crear al alumno',
            error: error.message
        });
    }		
}
