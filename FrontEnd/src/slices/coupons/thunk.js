import {
  createDiscountCoupon,
  getDiscountCoupons,
  getAllAvaliableCoupons,
  getCouponById
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
// Thunk to get all avaliable cupons
export const avaliableCouponsThunk = createAsyncThunk("coupon/getAllAvaliableCoupons", async () => {
  try {
    return await getAllAvaliableCoupons();
  }catch (error) {
    return error;
  }
})
// thunk for get a coupon using id
export const GetCouponByIdThunk = createAsyncThunk("coupon/getCouponById", async (id) => {
  try{
    return await getCouponById(id);
  }catch (error) {
    return error;
  }
})
