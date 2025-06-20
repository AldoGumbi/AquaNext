import { createSlice } from '@reduxjs/toolkit';
import {
  addAlumnoThunk,
  getAlumnosThunk,
  updateAlumnoThunk,
  deleteAlumnoThunk
} from "./thunk.js";

const initialState = {
	alumnos: [],
	loading: false,
	error: false,
	error_message: "",
}


const alumnosSlice = createSlice({
	name: "global_state_alumnos",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
    // INSERT ALUMNO
    builder.addCase(addAlumnoThunk.fulfilled, (state, action) => {
      state.alumnos.push(action.payload);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(addAlumnoThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(addAlumnoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET ALL ALUMNOS
    builder.addCase(getAlumnosThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.alumnos = action.payload;
    });
    builder.addCase(getAlumnosThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(getAlumnosThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // EDIT ALUMNO
    builder.addCase(updateAlumnoThunk.fulfilled, (state, action) => {
      const index = state.alumnos.findIndex(alumno => alumno.id === action.payload.id);
      if (index !== -1) {
        state.alumnos[index] = action.payload;
      }
      state.loading = false;
      state.error = false;
    });
    builder.addCase(updateAlumnoThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(updateAlumnoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // DELETE ALUMNO
    builder.addCase(deleteAlumnoThunk.fulfilled, (state, action) => {
      state.alumnos = state.alumnos.filter(alumno => alumno.id !== action.payload);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(deleteAlumnoThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(deleteAlumnoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
}
})

export default alumnosSlice.reducer;