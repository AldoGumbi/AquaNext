import AccesoAlumnosModel from "../models/acceso-alumnos.js";

// Obtener información de acceso de un alumno por ID (credencial)
export const getAccesoAlumnoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación de ID recibido
    if (!id || id.trim() === "" || id === ":id" || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Error al escanear credencial, intente de nuevo.",
      });
    }

    // Consultar en el modelo
    const alumno = await AccesoAlumnosModel.getAccesoById(id);

    // 👀 DEBUG: ver qué devuelve la consulta cruda

    if (!alumno) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado.",
      });
    }

    const hoy = new Date();
    const diaHoy = hoy
      .toLocaleDateString("es-MX", { weekday: "long" })
      .toLowerCase(); // ej: "martes"

    let accesoPermitido = true;
    let mensajes = [];

    // 1. Estado activo - Contracaso: no se aplica en caso que el alumno sea pueba
    if (alumno.estatus !== "activo" && alumno.tipo_alumno != "prueba") {
      accesoPermitido = false;
      mensajes.push("El alumno no está activo.");
    }

    // 2. Inscripción - Contracaso: no se aplica en caso que el alumno sea pueba
    if (!alumno.vencimiento_inscripcion && alumno.tipo_alumno != "prueba") {
      accesoPermitido = false;
      mensajes.push("El alumno no tiene inscripción.");
    } else if (new Date(alumno.vencimiento_inscripcion) < hoy && alumno.tipo_alumno != "prueba") {
      accesoPermitido = false;
      mensajes.push(
        `La inscripción venció el ${alumno.vencimiento_inscripcion}.`
      );
    }

    // 3. Mensualidad - Contracaso: no se aplica en caso que el alumno sea pueba
    if (!alumno.vencimiento_mensualidad && alumno.tipo_alumno != "prueba") {
      accesoPermitido = false;
      mensajes.push("El alumno no tiene mensualidad.");
    } else if (new Date(alumno.vencimiento_mensualidad) < hoy && alumno.tipo_alumno != "prueba") {
      accesoPermitido = false;
      mensajes.push(
        `La mensualidad venció el ${alumno.vencimiento_mensualidad}.`
      );
    }

    // 4. Clase y horario
    // se aplica en caso que sea alumno de prueba
    if (!alumno.clase) {
      accesoPermitido = false;
      mensajes.push("El alumno no tiene clase registrada.");
    } else {
      // Verificar si la clase corresponde al día actual
      if (!alumno.dia_clase || alumno.dia_clase.toLowerCase() !== diaHoy) {
        accesoPermitido = false;
        mensajes.push("El alumno no tiene clase asignada hoy.");
      } else if (alumno.hora_inicio) {
        // Validar ventana de tiempo (15 min antes o después)
        const [horaInicioH, horaInicioM] = alumno.hora_inicio
          .split(":")
          .map(Number);

        const inicioClase = new Date(hoy);
        inicioClase.setHours(horaInicioH, horaInicioM, 0);

        const ventanaInicio = new Date(inicioClase.getTime() - 15 * 60000);
        const ventanaFin = new Date(inicioClase.getTime() + 15 * 60000);

        if (hoy < ventanaInicio || hoy > ventanaFin) {
          accesoPermitido = false;
          mensajes.push("Fuera del horario permitido de la clase.");
        }
      }
    }

    // 5. Próxima clase (placeholder, habría que traer varias desde el modelo)
    // se aplica en caso que sea alumno de prueba
    let proximaClase = null;
    if (!accesoPermitido && alumno.dia_clase && alumno.hora_inicio) {
      proximaClase = {
        dia: alumno.dia_clase,
        hora: alumno.hora_inicio,
      };
      mensajes.push(
        `Su próxima clase es el ${alumno.dia_clase} a las ${alumno.hora_inicio}.`
      );
    }

    // 6. Default
    if (mensajes.length === 0) {
      mensajes.push("Error al escanear credencial, intente de nuevo.");
    }

    // ✅ Respuesta final
    res.status(200).json({
      success: true,
      acceso: accesoPermitido,
      mensajes,
      data: {
        id_alumno: alumno.id_alumno,
        alumno: alumno.alumno,
        tipo_alumno: alumno.tipo_alumno,
        estatus: alumno.estatus,
        vencimiento_inscripcion: alumno.vencimiento_inscripcion,
        vencimiento_mensualidad: alumno.vencimiento_mensualidad,
        clase: alumno.clase,
        tipo_clase: alumno.tipo_clase,
        nivel: alumno.nivel,
        dia_clase: alumno.dia_clase,
        hora_inicio: alumno.hora_inicio,
        hora_fin: alumno.hora_fin,
        proximaClase,
      },
    });
  } catch (error) {
    console.error("❌ Error en getAccesoAlumnoById:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
};
