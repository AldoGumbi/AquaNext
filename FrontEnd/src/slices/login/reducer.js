import { createSlice } from '@reduxjs/toolkit';
import {
  signInThunk,
} from './thunk.js';

import { setAuthorization } from "backend/api_model.js";


const initialState = {
  user: null,
  loading: false,
  error: false,
  error_message: "",
  isAuthenticated: false,
}


const authSlicer = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // SIGN IN
    builder.addCase(signInThunk.fulfilled, (state, action) => {
        state.loading = false;

      const authToken = window.localStorage.getItem("authToken");
        setAuthorization(authToken); // Set the session with the valid token
        state.error = false;
        state.user = action.payload; // Assuming the response contains user data
        state.isAuthenticated = true; // Set authenticated state to true
    });
    builder.addCase(signInThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error; // Assuming the error payload contains an error message
      state.error = true;
      state.isAuthenticated = false; // Set authenticated state to false on error
    });
    builder.addCase(signInThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
      state.isAuthenticated = false; // Reset authenticated state while loading
    });

  }
})

export default authSlicer.reducer;