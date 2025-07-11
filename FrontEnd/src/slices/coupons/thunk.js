import {
  createDiscountCoupon,
  getDiscountCoupons,
  getAllAvaliableCoupons,
  getCouponById,
  applyCouponBasket,
  unApplyCouponToBasket
} from "../../backend/connection.js";
import { createAsyncThunk } from "@reduxjs/toolkit";

import {toast} from "sonner";

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
// Create an async thunk for applying the coupon to the whole basket
export const applyCouponToBasketThunk = createAsyncThunk("coupon/applyCouponToBasket", async (data, { rejectWithValue }) => {
  try{
    const answer = await applyCouponBasket(data);
    
    if(answer?.data?.coupon_id){
      return await getCouponById(answer.data?.coupon_id);
    }else{
      if(answer?.data?.message){
        return toast.error(answer?.data?.message);
      }
      toast.error("Error al applicar el cupon de descuento!");
    }
    
  }catch(error){
    return rejectWithValue({ error });
  }
})

// Async thunk for un applying the coupon to the basket
export const unApplyCouponToBasketThunk = createAsyncThunk("coupon/unApplyCouponToBasket", async (id) => {
  try{
    return await unApplyCouponToBasket(id);
  }catch(error){
    return error;
  }
})
