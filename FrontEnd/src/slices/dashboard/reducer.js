import { createSlice } from '@reduxjs/toolkit';
import {
  getAlumnosStatsThunk,
  getDashboardStatsThunk,
  getIngresosDashboardThunk,
  getInscripcionesStatusThunk,
  getMensualidadesStatusThunk,
  getAlumnosEnAlbercaThunk,
  getVentasTiendaDashboardThunk,
} from "./thunk.js";

const initialState = {
  loading: false,
  error: false,
  error_message: "",

  stats: {},
  ingresos: {},
  inscripciones: [],
  mensualidades: [],
  alumnosEnAlberca: [],
  ventasTienda: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    // === STATS ===
    builder.addCase(getDashboardStatsThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getDashboardStatsThunk.fulfilled, (state, action) => {
      state.stats = action.payload?.[0] || {};
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getDashboardStatsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en stats";
    });

    // === ALUMNOS STATS (por nivel o categoría) ===
    builder.addCase(getAlumnosStatsThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getAlumnosStatsThunk.fulfilled, (state, action) => {
      state.alumnosStats = action.payload?.data || [];
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getAlumnosStatsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en estadísticas de alumnos";
    });

    // === INGRESOS ===
    builder.addCase(getIngresosDashboardThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getIngresosDashboardThunk.fulfilled, (state, action) => {
      state.ingresos = action.payload?.[0] || {};
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getIngresosDashboardThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en ingresos";
    });

    // === INSCRIPCIONES ===
    builder.addCase(getInscripcionesStatusThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getInscripcionesStatusThunk.fulfilled, (state, action) => {
      state.inscripciones = action.payload || [];
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getInscripcionesStatusThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en inscripciones";
    });

    // === MENSUALIDADES ===
    builder.addCase(getMensualidadesStatusThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getMensualidadesStatusThunk.fulfilled, (state, action) => {
      state.mensualidades = action.payload || [];
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getMensualidadesStatusThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en mensualidades";
    });

    // === ALUMNOS EN ALBERCA ===
    builder.addCase(getAlumnosEnAlbercaThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getAlumnosEnAlbercaThunk.fulfilled, (state, action) => {
      state.alumnosEnAlberca = action.payload || [];
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getAlumnosEnAlbercaThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en alumnos alberca";
    });

    // === VENTAS TIENDA ===
    builder.addCase(getVentasTiendaDashboardThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getVentasTiendaDashboardThunk.fulfilled, (state, action) => {
      state.ventasTienda = action.payload || [];
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getVentasTiendaDashboardThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error en ventas tienda";
    });
  },
});

export default dashboardSlice.reducer;
