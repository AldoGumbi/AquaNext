import { createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import {
	addAlumno,
	getAlumnos,
	getActiveAlumnos,
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

export const getActiveAlumnosThunk = createAsyncThunk("alumnos/getActive", async (_, { rejectWithValue }) => {
		try {
			const response = await getActiveAlumnos();
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
			const updatedData = {
				...data.data,
				fecha_modificacion: DateTime.now().setZone('America/Mexico_City').toISO() // Add fecha_modificacion timestamp
			};
			// console.log("data: ", updatedData)
			return updatedData; // Return the data to be added to the state
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


