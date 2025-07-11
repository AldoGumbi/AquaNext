// slices/thunk.js - Agregar estos thunks al archivo existente

import { createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import {
	// Importar las funciones de connection.js cuando las crees
	createInscripcionSola,
	createMensualidadSola,
	createInscripcionConMensualidades,
	getAllInscripciones,
	getInscripcionesByAlumno,
	validateInscripcionVigente,
	getMensualidadesByAlumno,
	getMensualidadesByInscripcion,
	cancelarInscripcion,
	cancelarMensualidad,
	getTarifasMensualidad,
	createTarifaMensualidad,
	updateTarifaMensualidad,
	deleteTarifaMensualidad,
	getEstadisticasInscripciones
} from "../../backend/connection.js";

// ============ THUNKS DE INSCRIPCIONES ============

// Crear solo inscripción
export const createInscripcionSolaThunk = createAsyncThunk(
	"inscripciones/createInscripcionSola", 
	async (inscripcionData, { rejectWithValue }) => {
		try {
			const response = await createInscripcionSola(inscripcionData);
			return response.data;
		} catch (error) {
			console.log("Error 500 al crear inscripción, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Crear solo mensualidades
export const createMensualidadSolaThunk = createAsyncThunk(
	"inscripciones/createMensualidadSola", 
	async (mensualidadData, { rejectWithValue }) => {
		try {
			const response = await createMensualidadSola(mensualidadData);
			return response.data;
		} catch (error) {
			console.log("Error 500 al crear mensualidades, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Crear inscripción con mensualidades
export const createInscripcionConMensualidadesThunk = createAsyncThunk(
	"inscripciones/createInscripcionConMensualidades", 
	async (data, { rejectWithValue }) => {
		try {
			const response = await createInscripcionConMensualidades(data);
			return response.data;
		} catch (error) {
			console.log("Error 500 al crear inscripción con mensualidades, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Obtener todas las inscripciones
export const getAllInscripcionesThunk = createAsyncThunk(
	"inscripciones/getAllInscripciones", 
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await getAllInscripciones(params);
			return response.data;
		} catch (error) {
			console.log("Error 500 al obtener inscripciones, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Obtener inscripciones por alumno
export const getInscripcionesByAlumnoThunk = createAsyncThunk(
	"inscripciones/getInscripcionesByAlumno", 
	async (alumnoId, { rejectWithValue }) => {
		try {
			const response = await getInscripcionesByAlumno(alumnoId);
			return response.data;
		} catch (error) {
			console.log("Error 500 al obtener inscripciones del alumno, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Validar inscripción vigente
export const validateInscripcionVigenteThunk = createAsyncThunk(
	"inscripciones/validateInscripcionVigente", 
	async (alumnoId, { rejectWithValue }) => {
		try {
			const response = await validateInscripcionVigente(alumnoId);
            console.log("Response al validar inscripción vigente: ", response);
			return response.data;
		} catch (error) {
			console.log("Error 500 al validar inscripción vigente, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Cancelar inscripción
export const cancelarInscripcionThunk = createAsyncThunk(
	"inscripciones/cancelarInscripcion", 
	async ({ inscripcionId, motivo }, { rejectWithValue }) => {
		try {
			const response = await cancelarInscripcion({ inscripcionId, motivo });
			return { inscripcionId, data: response.data };
		} catch (error) {
			console.log("Error 500 al cancelar inscripción, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// ============ THUNKS DE MENSUALIDADES ============

// Obtener mensualidades por alumno
export const getMensualidadesByAlumnoThunk = createAsyncThunk(
	"inscripciones/getMensualidadesByAlumno", 
	async ({ alumnoId, filters = {} }, { rejectWithValue }) => {
		try {
			const response = await getMensualidadesByAlumno({ alumnoId, filters });
			return response.data;
		} catch (error) {
			console.log("Error 500 al obtener mensualidades del alumno, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Obtener mensualidades por inscripción
export const getMensualidadesByInscripcionThunk = createAsyncThunk(
	"inscripciones/getMensualidadesByInscripcion", 
	async (inscripcionId, { rejectWithValue }) => {
		try {
			const response = await getMensualidadesByInscripcion(inscripcionId);
			return response.data;
		} catch (error) {
			console.log("Error 500 al obtener mensualidades de la inscripción, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Cancelar mensualidad
export const cancelarMensualidadThunk = createAsyncThunk(
	"inscripciones/cancelarMensualidad", 
	async ({ mensualidadId, motivo }, { rejectWithValue }) => {
		try {
			const response = await cancelarMensualidad({ mensualidadId, motivo });
			return { mensualidadId, data: response.data };
		} catch (error) {
			console.log("Error 500 al cancelar mensualidad, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// ============ THUNKS DE TARIFAS ============

// Obtener tarifas de mensualidad
export const getTarifasMensualidadThunk = createAsyncThunk(
	"inscripciones/getTarifasMensualidad", 
	async (_, { rejectWithValue }) => {
		try {
			const response = await getTarifasMensualidad();
            console.log("Response al obtener tarifas: ", response);
			return response.data;
		} catch (error) {
			console.log("Error 500 al obtener tarifas, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Crear tarifa de mensualidad
export const createTarifaMensualidadThunk = createAsyncThunk(
	"inscripciones/createTarifaMensualidad", 
	async (tarifaData, { rejectWithValue }) => {
		try {
			const response = await createTarifaMensualidad(tarifaData);
			const newTarifa = {
				...tarifaData,
				id: response.data.id,
				created_at: DateTime.now().setZone('America/Mexico_City').toISO()
			};
			return newTarifa;
		} catch (error) {
			console.log("Error 500 al crear tarifa, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Actualizar tarifa de mensualidad
export const updateTarifaMensualidadThunk = createAsyncThunk(
	"inscripciones/updateTarifaMensualidad", 
	async ({ tarifaId, tarifaData }, { rejectWithValue }) => {
		try {
			await updateTarifaMensualidad({ tarifaId, tarifaData });
			const updatedTarifa = {
				...tarifaData,
				id: tarifaId,
				updated_at: DateTime.now().setZone('America/Mexico_City').toISO()
			};
			return updatedTarifa;
		} catch (error) {
			console.log("Error 500 al actualizar tarifa, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// Eliminar tarifa de mensualidad
export const deleteTarifaMensualidadThunk = createAsyncThunk(
	"inscripciones/deleteTarifaMensualidad", 
	async (tarifaId, { rejectWithValue }) => {
		try {
			await deleteTarifaMensualidad(tarifaId);
			return tarifaId;
		} catch (error) {
			console.log("Error 500 al eliminar tarifa, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);

// ============ THUNKS DE ESTADÍSTICAS ============

// Obtener estadísticas de inscripciones
export const getEstadisticasInscripcionesThunk = createAsyncThunk(
	"inscripciones/getEstadisticasInscripciones", 
	async (year = null, { rejectWithValue }) => {
		try {
			const response = await getEstadisticasInscripciones(year);
			return response.data;
		} catch (error) {
			console.log("Error 500 al obtener estadísticas, thunk.js: ", error);
			return rejectWithValue({ error: error.message || error });
		}
	}
);