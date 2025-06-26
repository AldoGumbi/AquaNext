import { toast } from "react-toastify";
import {
getOpenCashRegister,
  openCashRegister
} from "../../backend/connection.js";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to open a cash register
export const OpenCashRegisterThunk = createAsyncThunk("cash-register/open", async (data, { rejectWithValue }) => {
  try {
    return await openCashRegister(data);
  } catch (error) {
    console.error("Error opening cash register:", error);
    if(error?.API_message) {
      toast.error(`${error.API_message}`);
    }else {
      toast.error("Error al abrir la caja");
    }
    return rejectWithValue({ error });
  }
});

// Thunk to get the open cash register
export const GetOpenCashRegisterThunk = createAsyncThunk("cash-register/get-open", async (_, { rejectWithValue }) => {
  try {
    return await getOpenCashRegister();
  } catch (error) {
    return rejectWithValue({ error });
  }
});