import { createAsyncThunk } from "@reduxjs/toolkit";

import {
    sign_in
} from "../../backend/connection.js";

// Create an async thunk for signing in
export const signInThunk = createAsyncThunk("auth/signIn", async (data, { rejectWithValue }) => {
    try {
      const response = await sign_in(data);
      // localStorage.setItem("authUser", JSON.stringify(response));
      return response;
    } catch (error) {
      console.log("Error 500 al iniciar sesion, thunk.js: ",error);
      return rejectWithValue({error});
    }
  }
);


