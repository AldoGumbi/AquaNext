import dashboardModel from "../models/dashboard.js";
import AlumnosModel from "../models/dashboard/alumnosDashboard.js";
import InscripcionesModel from "../models/dashboard/inscripcionesDashboard.js";
import MensualidadesDashboard from "../models/dashboard/mensualidadesDashboard.js";
import IngresosModel from "../models/dashboard/ingresosDashboard.js";

// ----------------------------------------------------------------------
// Helper: normalizar params de fecha
// ----------------------------------------------------------------------
const parseFechas = (query) => {
  let { fechaInicio, fechaFin } = query;

  if (!fechaInicio || fechaInicio === "undefined" || fechaInicio === "") {
    fechaInicio = null;
  }
  if (!fechaFin || fechaFin === "undefined" || fechaFin === "") {
    fechaFin = null;
  }

  return { fechaInicio, fechaFin };
};

// ----------------------------------------------------------------------
// 1️⃣ Estadísticas generales de alumnos
// ----------------------------------------------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    // console.log("🔥 [Controller] getDashboardStats ejecutado");
    const result = await AlumnosModel.getAlumnosStats();
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getDashboardStats:", error);
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------------------
// 2️⃣ Alumnos actualmente en alberca
// ----------------------------------------------------------------------
export const getAlumnosEnAlberca = async (req, res) => {
  try {
    // console.log("🔥 [Controller] getAlumnosEnAlberca ejecutado");
    const result = await dashboardModel.getAlumnosEnAlberca();
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getAlumnosEnAlberca:", error);
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------------------
// 3️⃣ Tablas de inscripciones (vigentes/vencidas)
// ----------------------------------------------------------------------
export const getInscripcionesTablas = async (req, res) => {
  try {
    const { tipo, user } = req.query;
    // console.log("🔥 [Controller] getInscripcionesTablas:", { tipo, user });

    const result = await InscripcionesModel.getInscripcionesTablas({ user });

    let data = [];
    let columns = [];

    if (tipo === "vigentes") {
      data = result.vigentes.data;
      columns = result.vigentes.columns;
    } else if (tipo === "vencidas") {
      data = result.vencidas.data;
      columns = result.vencidas.columns;
    }

    return res.status(200).json({ success: true, data, columns });
  } catch (error) {
    console.error("❌ [Controller] Error en getInscripcionesTablas:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------------
// 4️⃣ Tablas de mensualidades (vigentes/vencidas)
// ----------------------------------------------------------------------
export const getMensualidadesTablas = async (req, res) => {
  try {
    const { tipo, user } = req.query;
    // console.log("🔥 [Controller] getMensualidadesTablas:", { tipo, user });

    const result = await MensualidadesDashboard.getMensualidadesTablas({ user });

    let data = [];
    let columns = [];

    if (tipo === "vigentes") {
      data = result.vigentes.data;
      columns = result.vigentes.columns;
    } else if (tipo === "vencidas") {
      data = result.vencidas.data;
      columns = result.vencidas.columns;
    }

    return res.status(200).json({ success: true, data, columns });
  } catch (error) {
    console.error("❌ [Controller] Error en getMensualidadesTablas:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------------
// 5️⃣ Ingresos 💰
// ----------------------------------------------------------------------

// Totales sin filtro
export const getTotalIngresos = async (req, res) => {
  try {
    const { user } = req.query;
    // console.log("🔥 [Controller] getTotalIngresos:", { user, tipoDato: typeof user });

    const result = await IngresosModel.getIngresosTotales({ user });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getTotalIngresos:", error);
    res.status(500).json({ error: error.message });
  }
};

// Totales con filtro de fecha/rango
export const getTotalIngresosByFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = parseFechas(req.query);
    const { user } = req.query;

    // console.log("🔥 [Controller] getTotalIngresosByFecha:", {
    //   fechaInicio,
    //   fechaFin,
    //   user,
    //   tipoDato: typeof user,
    // });

    const result = await IngresosModel.getIngresosTotalesByFecha({
      fechaInicio,
      fechaFin,
      user,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getTotalIngresosByFecha:", error);
    res.status(500).json({ error: error.message });
  }
};

// Tabla global
export const getIngresosGlobales = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = parseFechas(req.query);
    const { user } = req.query;

    // console.log("🔥 [Controller] getIngresosGlobales:", {
    //   fechaInicio,
    //   fechaFin,
    //   user,
    //   tipoDato: typeof user,
    // });

    const result = await IngresosModel.getIngresosGlobales({
      fechaInicio,
      fechaFin,
      user,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getIngresosGlobales:", error);
    res.status(500).json({ error: error.message });
  }
};

// Tabla solo inscripciones
export const getIngresosInscripciones = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = parseFechas(req.query);
    const { user } = req.query;

    // console.log("🔥 [Controller] getIngresosInscripciones:", {
    //   fechaInicio,
    //   fechaFin,
    //   user,
    //   tipoDato: typeof user,
    // });

    const result = await IngresosModel.getIngresosInscripciones({
      fechaInicio,
      fechaFin,
      user,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getIngresosInscripciones:", error);
    res.status(500).json({ error: error.message });
  }
};

// Tabla solo mensualidades
export const getIngresosMensualidades = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = parseFechas(req.query);
    const { user } = req.query;

    // console.log("🔥 [Controller] getIngresosMensualidades:", {
    //   fechaInicio,
    //   fechaFin,
    //   user,
    //   tipoDato: typeof user,
    // });

    const result = await IngresosModel.getIngresosMensualidades({
      fechaInicio,
      fechaFin,
      user,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getIngresosMensualidades:", error);
    res.status(500).json({ error: error.message });
  }
};

// Tabla solo clases de prueba
export const getIngresosClasesPrueba = async (req, res) => {
  try {

    // console.log("params: ", req.query);
    const { fechaInicio, fechaFin } = parseFechas(req.query); 
    const { user } = req.query;

    // console.log("🔥 [Controller] getIngresosClasesPrueba:", {
    //   fechaInicio,
    //   fechaFin,
    //   user,
    //   tipoDato: typeof user,
    // });

    const result = await IngresosModel.getIngresosClasesPrueba({
      fechaInicio,
      fechaFin,
      user,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getIngresosClasesPrueba:", error);
    res.status(500).json({ error: error.message });
  }
};

// Tabla solo tienda
export const getIngresosTienda = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = parseFechas(req.query);
    const { user } = req.query;

    // console.log("🔥 [Controller] getIngresosTienda:", {
    //   fechaInicio,
    //   fechaFin,
    //   user,
    //   tipoDato: typeof user,
    // });

    const result = await IngresosModel.getIngresosTienda({
      fechaInicio,
      fechaFin,
      user,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error en getIngresosTienda:", error);
    res.status(500).json({ error: error.message });
  }
};