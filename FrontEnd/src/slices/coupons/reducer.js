import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import {
  CreateCouponThunk,
  GetCouponsThunk,
  avaliableCouponsThunk,
  GetCouponByIdThunk
} from "./thunk.js";

const initialState = {
  // all the coupons
  coupons: [],
  // all the avaliable coupons
  avaliableCoupons: [],
  //coupons that active in the basket that is active
  activeCoupon: null,
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
      
      const ans = action.payload;
      
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al insertar los cupones de descuento!");
      }
      console.error("Error al insert el cupon; ", action.payload);
      
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
      
      
      const ans = action.payload;
      
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al obtener los cupones de descuento!");
      }
      console.error("Error al obtener todos los cupones de descuento:", action.payload);
    });
    builder.addCase(GetCouponsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    
    // GET ALL AVAILABLE COUPONS
    builder.addCase(avaliableCouponsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.avaliableCoupons = action.payload.data;
    });
    builder.addCase(avaliableCouponsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      
      const ans = action.payload;
      
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al obtener los cupones de descuento!");
      }
      
      state.error_message = ans?.error?.API_message || "Error al abrir la caja";
      
      console.error("Error al obtener los cupones de descuento:", action.payload);
    });
    builder.addCase(avaliableCouponsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    
    // GET ALL AVAILABLE COUPONS
    builder.addCase(GetCouponByIdThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.activeCoupon = action.payload.data[0];
    });
    builder.addCase(GetCouponByIdThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      
      const defaultError = "Error al obtener los cupon de descuento! ";
      
      const ans = action.payload;
      
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error(defaultError);
      }
      
      state.error_message = ans?.error?.API_message || defaultError;
      
      console.error(defaultError, action.payload);
    });
    builder.addCase(GetCouponByIdThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    
  }
})

export default couponsSlice.reducer;