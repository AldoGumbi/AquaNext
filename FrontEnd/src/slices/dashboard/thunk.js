import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAlumnosStats,
  getDashboardStats,
  getIngresosDashboard,
  getInscripcionesStatus,
  getMensualidadesStatus,
  getAlumnosEnAlberca,
  getVentasTiendaDashboard
} from "../../backend/connection.js";

// Estadísticas globales
export const getDashboardStatsThunk = createAsyncThunk(
  "dashboard/stats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardStats();
      //console.log("✅ [THUNK] /dashboard/stats →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/stats:", error);
      return rejectWithValue({ error: "No se pudieron cargar las estadísticas generales del dashboard." });
    }
  }
);

export const getAlumnosStatsThunk = createAsyncThunk(
  "dashboard/alumnosStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAlumnosStats();
      //console.log("📊 [THUNK] /dashboard/alumnosStats →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/alumnosStats:", error);
      return rejectWithValue({ error: "No se pudieron obtener las estadísticas de alumnos para el dashboard." });
    }
  }
);


// Ingresos globales
export const getIngresosDashboardThunk = createAsyncThunk(
  "dashboard/ingresos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getIngresosDashboard();
      //console.log("✅ [THUNK] /dashboard/ingresos →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/ingresos:", error);
      return rejectWithValue({ error: "No se pudieron obtener los datos de ingresos para el dashboard." });
    }
  }
);

// Inscripciones
export const getInscripcionesStatusThunk = createAsyncThunk(
  "dashboard/inscripciones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInscripcionesStatus();
      //console.log("✅ [THUNK] /dashboard/inscripciones →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/inscripciones:", error);
      return rejectWithValue({ error: "No se pudo obtener el estado de inscripciones." });
    }
  }
);

// Mensualidades
export const getMensualidadesStatusThunk = createAsyncThunk(
  "dashboard/mensualidades",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMensualidadesStatus();
      //console.log("✅ [THUNK] /dashboard/mensualidades →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/mensualidades:", error);
      return rejectWithValue({ error: "No se pudo obtener el estado de mensualidades." });
    }
  }
);

// Alumnos en alberca
export const getAlumnosEnAlbercaThunk = createAsyncThunk(
  "dashboard/alberca",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAlumnosEnAlberca();
      //console.log("✅ [THUNK] /dashboard/alberca →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/alberca:", error);
      return rejectWithValue({ error: "No se pudo obtener el número de alumnos en alberca." });
    }
  }
);

// Ventas tienda
export const getVentasTiendaDashboardThunk = createAsyncThunk(
  "dashboard/tienda",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getVentasTiendaDashboard();
      //console.log("✅ [THUNK] /dashboard/tienda →", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [Dashboard] Error en /dashboard/tienda:", error);
      return rejectWithValue({ error: "No se pudieron obtener las ventas de tienda." });
    }
  }
);
