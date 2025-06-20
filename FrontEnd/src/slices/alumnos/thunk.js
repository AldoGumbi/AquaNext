import { createAsyncThunk } from "@reduxjs/toolkit";

import {
	addAlumno,
	getAlumnos,
	updateAlumno,
	deleteAlumno
} from "../../backend/connection.js";

// Create an async thunk for adding a product
export const addAlumnoThunk = createAsyncThunk("alumnos/add", async (data, { rejectWithValue }) => {
		try {
			await addAlumno(data);
			return data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al insertar el alumno, thunk.js: ",error);
			return rejectWithValue({error});
		}
	}
);

export const getAlumnosThunk = createAsyncThunk("alumnos/getAll", async (_, { rejectWithValue }) => {
		try {
			const response = await getAlumnos();
			return response.data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al obtener los alumnos, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);

export const updateAlumnoThunk = createAsyncThunk("alumnos/edit", async (data, { rejectWithValue }) => {
		try {
			await updateAlumno(data);
			return data.data; // Return the data to be added to the state
		} catch (error) {
			console.log("Error 500 al editar el alumno, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);

export const deleteAlumnoThunk = createAsyncThunk("alumnos/delete", async (id, { rejectWithValue }) => {
		try {
			await deleteAlumno({ id });
			return id; // Return the id of the deleted student
		} catch (error) {
			console.log("Error 500 al eliminar el alumno, thunk.js: ", error);
			return rejectWithValue({error});
		}
	}
);


