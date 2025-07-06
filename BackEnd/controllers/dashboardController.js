import dashboardModel from "../models/dashboard.js";

// 1. Estadísticas generales de alumnos
export const getDashboardStats = async (req, res) => {
  try {
    const result = await dashboardModel.getAlumnosStats();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Alumnos actualmente en alberca
export const getAlumnosEnAlberca = async (req, res) => {
  try {
    const result = await dashboardModel.getAlumnosEnAlberca();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Estado de inscripciones
export const getInscripcionesStatus = async (req, res) => {
  try {
    const result = await dashboardModel.getInscripcionesStats();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Estado de mensualidades
export const getMensualidadesStatus = async (req, res) => {
  try {
    const result = await dashboardModel.getMensualidadesStats();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Ingresos por inscripciones, mensualidades, tienda
export const getIngresos = async (req, res) => {
  try {
    const result = await dashboardModel.getIngresos();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVentasTienda = async (req, res) => {
  try {
    res.status(200).json([
      {
        Tienda: 12700,
        Tabla: {}, // si quieres mantener la estructura común
      },
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// (opcional) Endpoint global resumen del dashboard
export const obtenerDashboardResumen = async (req, res) => {
  try {
    const datos = await dashboardModel.getIngresos(); // O cambia por `obtenerResumen` si la implementas
    res.status(200).json({
      data: datos,
      message: "Resumen del dashboard obtenido correctamente",
      error: false
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: "Error al obtener datos del dashboard",
      error: error.message
    });
  }
};
