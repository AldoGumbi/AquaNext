import { createSlice } from '@reduxjs/toolkit';
import {
  addProfesorThunk,
  getProfesorsThunk,
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
    // INSERT profesor
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

    // GET ALL profesorS
    builder.addCase(getProfesorsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.profesores = action.payload;
    });
    builder.addCase(getProfesorsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(getProfesorsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // EDIT profesor
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

    // DELETE profesor
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