import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  CreateCouponThunk,
} from "./thunk.js";

const initialState = {
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
  }
})

export default couponsSlice.reducer;