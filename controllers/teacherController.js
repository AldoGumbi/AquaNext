import profesoresModel from '../models/teacher.js';

import { DateTime } from 'luxon';

export const insertProfesor = async (req, res) => {

  console.log('Datos recibidos para crear profesor:', req.body);
  try {
    if (!req.body || !req.body.nombre || !req.body.apellido) {
      return res.status(400).send({
        data: false,
        message: 'El cuerpo de la solicitud es inválido o incompleto, nombre y apellido son obligatorios.'
      });
    }

    const { 
      nombre, 
      apellido, 
      fecha_nacimiento, 
      direccion, 
      telefono, 
      especialidad, 
      fecha_contratacion,
      activo 
    } = req.body;

    // Parsear fecha de nacimiento y fecha de contratación
    const fechaNacimientoParsed = fecha_nacimiento ? DateTime.fromISO(fecha_nacimiento).toFormat('yyyy-MM-dd') : null;
    const fechaContratacionParsed = fecha_contratacion ? DateTime.fromISO(fecha_contratacion).toFormat('yyyy-MM-dd') : null;

    console.log('Fecha de nacimiento parseada:', fechaNacimientoParsed);
    console.log('Fecha de contratación parseada:', fechaContratacionParsed);

    if (nombre.length < 2 || apellido.length < 2) {
      return res.status(400).json({
        data: false,
        message: 'El nombre y apellido deben tener al menos 2 caracteres.'
      });
    }

    if (!fechaContratacionParsed) {
      return res.status(400).json({
        data: false,
        message: 'La fecha de contratación es obligatoria.'
      });
    }

    // Verificar si el teléfono ya existe (si se proporciona)
    if (telefono) {
      const telefonoExiste = await profesoresModel.telefonoAvailability(telefono);
      if (telefonoExiste) {
        return res.status(409).json({
          data: false,
          message: 'Este número de teléfono ya está registrado.'
        });
      }
    }

    const nuevoProfesor = {
      nombre,
      apellido,
      fecha_nacimiento: fechaNacimientoParsed,
      direccion,
      telefono,
      especialidad,
      fecha_contratacion: fechaContratacionParsed,
      activo: activo ?? 1
    };

    const profesorId = await profesoresModel.create(nuevoProfesor);

    if (!profesorId) {
      return res.status(400).send({
        data: false,
        message: 'No se pudo crear el profesor, por favor verifica los datos enviados.'
      });
    }

    res.status(201).json({
      message: 'Profesor creado con éxito!',
      data: {
        profesor_id: profesorId,
        profesor: nuevoProfesor
      }
    });

  } catch (error) {
    // Error de duplicado de columna única de SQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        data: false,
        message: 'Ya existe un profesor con estos datos únicos.',
        code: error.errno
      });
    }
    console.log(error);
    res.status(500).json({
      data: false,
      message: 'Ocurrió un error al crear el profesor!',
      error: error.message
    });
  }
};

export const getAllProfesores = async (req, res) => {
  try {
    const profesores = await profesoresModel.getAll();
    if (profesores.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No se encontraron profesores!'
      });
    }
    res.status(200).json({
      data: profesores,
      message: 'Obtención de profesores exitosa'
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno al obtener los profesores',
      error: error.message
    });
  }
};

export const getProfesorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un ID de profesor válido!'
      });
    }

    const profesor = await profesoresModel.getById(id);

    if (!profesor) {
      return res.status(404).json({
        data: false,
        message: 'Profesor no encontrado!'
      });
    }

    res.status(200).json({
      data: profesor,
      message: 'Profesor encontrado'
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno al obtener el profesor',
      error: error.message
    });
  }
};

export const updateProfesor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario el ID del profesor a modificar!'
      });
    }

    const { nombre, apellido } = req.body;

    if (!nombre || nombre.length < 2 || !apellido || apellido.length < 2) {
      return res.status(400).json({
        data: false,
        message: 'El nombre y apellido son necesarios y deben tener al menos 2 caracteres.'
      });
    }

    // Verificar si el profesor existe
    const profesorExistente = await profesoresModel.getById(id);
    if (!profesorExistente) {
      return res.status(404).json({
        data: false,
        message: 'Profesor no encontrado!'
      });
    }

    // Verificar teléfono duplicado (si se está actualizando y es diferente al actual)
    if (req.body.telefono && req.body.telefono !== profesorExistente.telefono) {
      const telefonoExiste = await profesoresModel.telefonoAvailability(req.body.telefono);
      if (telefonoExiste) {
        return res.status(409).json({
          data: false,
          message: 'Este número de teléfono ya está registrado.'
        });
      }
    }

    const profesorActualizado = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      fecha_nacimiento: req.body.fecha_nacimiento,
      direccion: req.body.direccion,
      telefono: req.body.telefono,
      especialidad: req.body.especialidad,
      fecha_contratacion: req.body.fecha_contratacion,
      activo: req.body.activo ?? profesorExistente.activo
    };

    const isUpdated = await profesoresModel.update(id, profesorActualizado);

    if (isUpdated) {
      res.status(200).json({ 
        message: 'Profesor actualizado correctamente!', 
        data: profesorActualizado 
      });
    } else {
      res.status(404).json({
        data: false, 
        message: 'Profesor no actualizado, puede que no exista!' 
      });
    }

  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno en el servidor',
      error: error.message
    });
  }
};

export const deleteProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: 'Se necesita un ID del profesor válido!'
      });
    }

    const isDeleted = await profesoresModel.delete(id);
    if (isDeleted) {
      res.status(200).json({
        data: id,
        message: 'Profesor desactivado con éxito!'
      });
    } else {
      res.status(404).json({
        data: false,
        message: 'Profesor no encontrado o ya fue desactivado'
      });
    }
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno al desactivar el profesor',
      error: error.message
    });
  }
};

export const checkTelefonoAvailability = async (req, res) => {
  try {
    const { telefono } = req.params;

    if (!telefono || telefono.trim() === '') {
      return res.status(400).json({
        data: false,
        message: 'El teléfono es necesario para verificar su disponibilidad.'
      });
    }

    const isAvailable = await profesoresModel.telefonoAvailability(telefono);

    if (!isAvailable) {
      return res.status(200).json({
        data: true,
        message: 'El teléfono está disponible.'
      });
    } else {
      return res.status(409).json({
        data: false,
        message: 'El teléfono ya está en uso.'
      });
    }
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno al verificar la disponibilidad del teléfono.',
      error: error.message
    });
  }
};

export const buscarProfesores = async (req, res) => {
  try {
    const { nombre, especialidad } = req.query;

    if (!nombre && !especialidad) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario proporcionar nombre o especialidad para buscar.'
      });
    }

    let profesores = [];

    if (nombre) {
      profesores = await profesoresModel.buscarPorNombre(nombre);
    } else if (especialidad) {
      profesores = await profesoresModel.getByEspecialidad(especialidad);
    }

    if (profesores.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No se encontraron profesores con los criterios especificados.'
      });
    }

    res.status(200).json({
      data: profesores,
      message: `Se encontraron ${profesores.length} profesores`
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno al buscar profesores',
      error: error.message
    });
  }
};

export const getEstadisticasProfesores = async (req, res) => {
  try {
    const estadisticas = await profesoresModel.getEstadisticas();
    res.status(200).json({
      data: estadisticas,
      message: 'Estadísticas de profesores obtenidas'
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error interno al obtener estadísticas',
      error: error.message
    });
  }
};

export const getClasesPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario proporcionar una fecha en el formato YYYY-MM-DD'
      });
    }

    const clases = await profesoresModel.getClasesPorFecha(fecha);


    if (!clases || clases.length === 0) {
      return res.status(404).json({
        data: false,
        message: `No se encontraron clases para la fecha ${fecha}`
      });
    }

    res.status(200).json({
      data: clases,
      message: `Clases encontradas para la fecha ${fecha}`
    });

  } catch (error) {
    console.error("[Clases Controller] Error:", error);
    res.status(500).json({
      data: false,
      message: 'Error interno al obtener las clases de los profesores',
      error: error.message
    });
  }
  
};

export const getClases = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "ID de profesor inválido" });
    }

    const clases = await profesoresModel.getClasesConDetallesByProfesor(id);

    if (!clases || clases.length === 0) {
      return res.status(404).json({
        data: [],
        message: `No se encontraron clases para el profesor ${id}`,
      });
    }

    res.status(200).json({
      data: clases,
      message: "Clases obtenidas con éxito",
    });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error);
    res.status(500).json({
      data: false,
      message: "Error interno al obtener clases",
      error: error.message,
    });
  }
};


// controllers/profesoresController.js

export const updateClaseProfesor = async (req, res) => {
  try {
    const { clases } = req.body;

    // 🔎 Validación de parámetros
    if (!clases || !Array.isArray(clases) || clases.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de clases con id_clase y profesor_suplente_id",
      });
    }

    const resultados = [];

    for (const c of clases) {
      const { id_clase, profesor_suplente_id } = c;

      if (!id_clase || profesor_suplente_id === undefined) {
        return res.status(400).json({
          success: false,
          error: "Cada objeto debe incluir id_clase y profesor_suplente_id",
        });
      }

      // 🔹 Llamada al modelo
      const updated = await profesoresModel.updateClaseProfesor({
        id_clase,
        profesor_suplente_id,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `No se encontró la clase con id ${id_clase}`,
        });
      }

      resultados.push({
        id_clase,
        profesor_suplente_id: profesor_suplente_id || null, // Si fue revertido, se manda null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Clases actualizadas correctamente",
      data: resultados,
    });
  } catch (error) {
    console.error("❌ Error en updateClaseProfesor:", error.message);
    return res.status(500).json({
      success: false,
      error: "Error interno al actualizar clases",
      details: error.message,
    });
  }
};



export const getGruposYHorariosByProfesor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: "ID de profesor inválido",
      });
    }

    const gruposHorarios = await profesoresModel.getGruposYHorariosByProfesor(id);

    if (!gruposHorarios || gruposHorarios.length === 0) {
      return res.status(404).json({
        data: [],
        message: `No se encontraron grupos u horarios para el profesor ${id}`,
      });
    }

    res.status(200).json({
      data: gruposHorarios,
      message: "Grupos y horarios obtenidos con éxito",
    });
  } catch (error) {
    console.error("❌ Error al obtener grupos y horarios:", error);
    res.status(500).json({
      data: false,
      message: "Error interno al obtener grupos y horarios",
      error: error.message,
    });
  }
};







