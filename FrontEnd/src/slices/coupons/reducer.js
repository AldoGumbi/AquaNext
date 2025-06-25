import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  CreateCouponThunk,
  GetCouponsThunk
} from "./thunk.js";

const initialState = {
  coupons: [],
  loading: false,
  error: false,
  error_message: "",
}


const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // INSERT CUPON
    builder.addCase(CreateCouponThunk.fulfilled, (state) => {
      toast.success("Coupon de descuento creado correctamente");
      state.loading = false;
      state.error = false;
    });
    builder.addCase(CreateCouponThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
    });
    builder.addCase(CreateCouponThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    // GET COUPONS
    builder.addCase(GetCouponsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.coupons = action.payload.data;
    });
    builder.addCase(GetCouponsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
      toast.error("Error al obtener los cupones de descuento");
      console.error("Error al obtener los cupones de descuento:", action.payload);
    });
    builder.addCase(GetCouponsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

  }
})

export default couponsSlice.reducer;