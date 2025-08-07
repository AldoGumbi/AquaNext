import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDisponibilidadPorMes,
  getDisponibilidadPorRango
} from "../../backend/connection.js";

// Get disponibilidad by specific month
export const getDisponibilidadPorMesThunk = createAsyncThunk(
  "disponibilidad/getByMonth", 
  async ({ year, mes }, { rejectWithValue }) => {
    try {
      const response = await getDisponibilidadPorMes({ year, mes });
      console.log("Response from getDisponibilidadPorMesThunk: ", response);
      return {
        data: response.data,
        month: mes,
        year: year,
        message: response.message
      };
    } catch (error) {
      console.log("Error al obtener disponibilidad por mes, thunk.js: ", error);
      return rejectWithValue({ 
        error: error.message,
        API_message: error.message 
      });
    }
  }
);

// Get disponibilidad by date range
export const getDisponibilidadPorRangoThunk = createAsyncThunk(
  "disponibilidad/getByRange", 
  async ({ yearInicio, mesInicio, yearFin, mesFin }, { rejectWithValue }) => {
    try {
      const response = await getDisponibilidadPorRango({ 
        yearInicio, 
        mesInicio, 
        yearFin, 
        mesFin 
      });
      return {
        data: response.data,
        range: {
          yearInicio,
          mesInicio,
          yearFin,
          mesFin
        },
        message: response.message
      };
    } catch (error) {
      console.log("Error al obtener disponibilidad por rango, thunk.js: ", error);
      return rejectWithValue({ 
        error: error.message,
        API_message: error.message 
      });
    }
  }
);