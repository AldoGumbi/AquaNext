import {
  createDiscountCoupon
} from "../../backend/connection.js";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to create a discount coupon
export const CreateCouponThunk = createAsyncThunk("coupon/create", async (data, { rejectWithValue }) => {
  try {
    return await createDiscountCoupon(data);
  } catch (error) {
    return rejectWithValue({ error });
  }
});
