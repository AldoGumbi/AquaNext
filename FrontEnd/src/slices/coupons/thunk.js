import {
  createDiscountCoupon,
  getDiscountCoupons
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
// Thunk to get all discount coupons
export const GetCouponsThunk = createAsyncThunk("coupon/get", async (_, { rejectWithValue }) => {
  try {
    return await getDiscountCoupons();
  } catch (error) {
    return rejectWithValue({ error });
  }
});
