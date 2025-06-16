import { createSlice } from '@reduxjs/toolkit';
import {
  addAlumnoThunk
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
    builder.addCase(addAlumnoThunk.fulfilled, (state) => {
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

}
})

export default alumnosSlice.reducer;