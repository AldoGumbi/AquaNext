import { createSlice } from '@reduxjs/toolkit';
import {
  addProfesorThunk,
  getProfesoresThunk,
  updateProfesorThunk,
  deleteProfesorThunk
} from "./thunk.js";

const initialState = {
	profesores: [],
	loading: false,
	error: false,
	error_message: "",
}


const profesoresSlice = createSlice({
	name: "global_state_profesors",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
    // INSERT PROFESOR
    builder.addCase(addProfesorThunk.fulfilled, (state, action) => {
      state.profesores.push(action.payload);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(addProfesorThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(addProfesorThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET ALL PROFESORES
    builder.addCase(getProfesoresThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.profesores = action.payload;
    });
    builder.addCase(getProfesoresThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(getProfesoresThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // EDIT PROFESOR
    builder.addCase(updateProfesorThunk.fulfilled, (state, action) => {
      const index = state.profesores.findIndex(profesor => profesor.id === action.payload.id);
      if (index !== -1) {
        state.profesores[index] = action.payload;
      }
      state.loading = false;
      state.error = false;
    });
    builder.addCase(updateProfesorThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(updateProfesorThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // DELETE PROFESOR
    builder.addCase(deleteProfesorThunk.fulfilled, (state, action) => {
      state.profesores = state.profesores.filter(profesor => profesor.id !== action.payload);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(deleteProfesorThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(deleteProfesorThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
}
})

export default profesoresSlice.reducer;