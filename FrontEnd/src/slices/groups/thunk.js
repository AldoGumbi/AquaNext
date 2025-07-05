import { createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import {
	addGrupo,
	getGrupos,
	updateGrupo,
	deleteGrupo,
	getGruposConHorarios,
	getGruposPorTipo
} from "../../backend/connection.js";

// Create an async thunk for adding a grupo
export const addGrupoThunk = createAsyncThunk("grupos/add", async (data, { rejectWithValue }) => {
		try {
			await addGrupo(data);
			return data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al insertar el grupo, thunk.js: ",error);
			return rejectWithValue({error});
		}
	}
);

export const getGruposThunk = createAsyncThunk("grupos/getAll", async (_, { rejectWithValue }) => {
		try {
			const response = await getGrupos();
			return response.data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al obtener los grupos, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);

export const getGruposConHorariosThunk = createAsyncThunk("grupos/getAllConHorarios", async (_, { rejectWithValue }) => {
		try {
			const response = await getGruposConHorarios();
			return response.data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al obtener los grupos con horarios, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);

export const getGruposPorTipoThunk = createAsyncThunk("grupos/getByTipo", async (tipo, { rejectWithValue }) => {
		try {
			const response = await getGruposPorTipo(tipo);
			return response.data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al obtener los grupos por tipo, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);

export const updateGrupoThunk = createAsyncThunk("grupos/edit", async (data, { rejectWithValue }) => {
		try {
			await updateGrupo(data);
			const updatedData = {
				...data.data,
				fecha_modificacion: DateTime.now().setZone('America/Mexico_City').toISO() // Add fecha_modificacion timestamp
			};
			// console.log("data: ", updatedData)
			return updatedData; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al editar el grupo, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);

export const deleteGrupoThunk = createAsyncThunk("grupos/delete", async (id, { rejectWithValue }) => {
		try {
			await deleteGrupo({ id });
			return id; // Return the id of the deleted group
		} catch (error) {
			console.log("Error 500 al eliminar el grupo, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);