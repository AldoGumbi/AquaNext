import { createAsyncThunk } from "@reduxjs/toolkit";

import {
	addAlumno
} from "../../backend/connection.js";

// Create an async thunk for adding a product
export const addAlumnoThunk = createAsyncThunk("alumnos/add", async (data, { rejectWithValue }) => {
		try {
			return  await addAlumno(data);
		} catch (error) {
			console.log("Error 500 al insertar el alumno, thunk.js: ",error);
			return rejectWithValue({error});
		}
	}
);


