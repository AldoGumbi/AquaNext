import {
  getOpenCashRegister,
  openCashRegister,
  closeCashRegister
} from "../../backend/connection.js";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to open a cash register
export const OpenCashRegisterThunk = createAsyncThunk("cash-register/open", async (data, { rejectWithValue }) => {
  try {
    return await openCashRegister(data);
  } catch (error) {
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

// Thunk to close a cash register
export const CloseCashRegisterThunk = createAsyncThunk("cash-register/close", async (data
  , { rejectWithValue }) => {
  try {
    const { cash_register_id, amount_closing, comment } = data;
    return await closeCashRegister(cash_register_id, { amount_closing, comment });
  } catch (error) {
    return rejectWithValue({ error });
  }
});