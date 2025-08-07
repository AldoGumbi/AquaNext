import { createSlice } from '@reduxjs/toolkit';
import {
  getDisponibilidadPorMesThunk,
  getDisponibilidadPorRangoThunk
} from "./thunk.js";

const initialState = {
  disponibilidadMes: [],
  disponibilidadRango: [],
  currentMonth: null,
  currentYear: null,
  currentRange: null,
  loading: false,
  loadingRange: false,
  error: false,
  errorRange: false,
  error_message: "",
  error_message_range: "",
  stats: {
    totalGrupos: 0,
    gruposDisponibles: 0,
    gruposLlenos: 0,
    gruposParciales: 0,
    porcentajeOcupacionPromedio: 0
  }
};

const disponibilidadSlice = createSlice({
  name: "global_state_disponibilidad",
  initialState,
  reducers: {
    clearDisponibilidadMes: (state) => {
      state.disponibilidadMes = [];
      state.currentMonth = null;
      state.currentYear = null;
      state.error = false;
      state.error_message = "";
      state.stats = {
        totalGrupos: 0,
        gruposDisponibles: 0,
        gruposLlenos: 0,
        gruposParciales: 0,
        porcentajeOcupacionPromedio: 0
      };
    },
    clearDisponibilidadRango: (state) => {
      state.disponibilidadRango = [];
      state.currentRange = null;
      state.errorRange = false;
      state.error_message_range = "";
    },
    calculateStats: (state) => {
      const data = state.disponibilidadMes;
      if (data.length === 0) {
        state.stats = {
          totalGrupos: 0,
          gruposDisponibles: 0,
          gruposLlenos: 0,
          gruposParciales: 0,
          porcentajeOcupacionPromedio: 0
        };
        return;
      }

      const totalGrupos = data.length;
      const gruposDisponibles = data.filter(item => item.estado_disponibilidad === 'Disponible').length;
      const gruposLlenos = data.filter(item => item.estado_disponibilidad === 'Lleno').length;
      const gruposParciales = data.filter(item => item.estado_disponibilidad === 'Parcialmente ocupado').length;
      
      // Calcular promedio de ocupación de forma segura
      const sumaPorcentajes = data.reduce((sum, item) => {
        const porcentaje = parseFloat(item.porcentaje_ocupacion) || 0;
        return sum + porcentaje;
      }, 0);
      
      const promedioOcupacion = totalGrupos > 0 ? sumaPorcentajes / totalGrupos : 0;
      
      // Asegurar que el resultado sea un número válido
      const promedioFinal = isNaN(promedioOcupacion) ? 0 : Math.round(promedioOcupacion * 100) / 100;

      state.stats = {
        totalGrupos,
        gruposDisponibles,
        gruposLlenos,
        gruposParciales,
        porcentajeOcupacionPromedio: promedioFinal
      };
    }
  },
  extraReducers: (builder) => {
    // GET DISPONIBILIDAD POR MES
    builder.addCase(getDisponibilidadPorMesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.disponibilidadMes = action.payload.data;
      state.currentMonth = action.payload.month;
      state.currentYear = action.payload.year;
      
      // Calculate stats automatically
      const data = action.payload.data;
      if (data.length === 0) {
        state.stats = {
          totalGrupos: 0,
          gruposDisponibles: 0,
          gruposLlenos: 0,
          gruposParciales: 0,
          porcentajeOcupacionPromedio: 0
        };
      } else {
        const totalGrupos = data.length;
        const gruposDisponibles = data.filter(item => item.estado_disponibilidad === 'Disponible').length;
        const gruposLlenos = data.filter(item => item.estado_disponibilidad === 'Lleno').length;
        const gruposParciales = data.filter(item => item.estado_disponibilidad === 'Parcialmente ocupado').length;
        
        // Calcular promedio de ocupación de forma segura
        const sumaPorcentajes = data.reduce((sum, item) => {
          const porcentaje = parseFloat(item.porcentaje_ocupacion) || 0;
          return sum + porcentaje;
        }, 0);
        
        const promedioOcupacion = totalGrupos > 0 ? sumaPorcentajes / totalGrupos : 0;
        
        // Asegurar que el resultado sea un número válido
        const promedioFinal = isNaN(promedioOcupacion) ? 0 : Math.round(promedioOcupacion * 100) / 100;

        state.stats = {
          totalGrupos,
          gruposDisponibles,
          gruposLlenos,
          gruposParciales,
          porcentajeOcupacionPromedio: promedioFinal
        };
      }
    });
    builder.addCase(getDisponibilidadPorMesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload?.error || "Error al obtener disponibilidad";
      state.error = true;
    });
    builder.addCase(getDisponibilidadPorMesThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET DISPONIBILIDAD POR RANGO
    builder.addCase(getDisponibilidadPorRangoThunk.fulfilled, (state, action) => {
      state.loadingRange = false;
      state.errorRange = false;
      state.disponibilidadRango = action.payload.data;
      state.currentRange = action.payload.range;
    });
    builder.addCase(getDisponibilidadPorRangoThunk.rejected, (state, action) => {
      state.loadingRange = false;
      state.error_message_range = action.payload?.error || "Error al obtener disponibilidad por rango";
      state.errorRange = true;
    });
    builder.addCase(getDisponibilidadPorRangoThunk.pending, (state) => {
      state.errorRange = false;
      state.loadingRange = true;
    });
  }
});

export const { clearDisponibilidadMes, clearDisponibilidadRango, calculateStats } = disponibilidadSlice.actions;

export default disponibilidadSlice.reducer;