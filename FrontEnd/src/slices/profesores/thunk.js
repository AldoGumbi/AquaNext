import { createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import {
	addProfesor,
	getProfesores,
	updateProfesor,
	deleteProfesor
} from "../../backend/connection.js";

// Create an async thunk for adding a profesor
export const addProfesorThunk = createAsyncThunk("profesores/add", async (data, { rejectWithValue }) => {
	try {
		await addProfesor(data);
		return data; // Return the data to be added to the state
	} catch (error) {
		console.log("Error al insertar el profesor, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});

// Get all profesores
export const getProfesorsThunk = createAsyncThunk("profesores/getAll", async (_, { rejectWithValue }) => {
	try {
		const response = await getProfesores();
		return response.data; // Return the data to be added to the state
	} catch (error) {
		console.log("Error al obtener los profesores, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});

// Update profesor
export const updateProfesorThunk = createAsyncThunk("profesores/edit", async (data, { rejectWithValue }) => {
	try {
		await updateProfesor(data);
		const updatedData = {
			...data.data,
			fecha_modificacion: DateTime.now().setZone('America/Mexico_City').toISO() // Add fecha_modificacion timestamp
		};
		return updatedData; // Return the data to be added to the state
	} catch (error) {
		console.log("Error al editar el profesor, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});

// Delete profesor
export const deleteProfesorThunk = createAsyncThunk("profesores/delete", async (id, { rejectWithValue }) => {
	try {
		await deleteProfesor({ id });
		return id; // Return the id of the deleted profesor
	} catch (error) {
		console.log("Error al eliminar el profesor, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});




