import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  OpenCashRegisterThunk,
  GetOpenCashRegisterThunk

} from "./thunk.js";


const initialState = {
  loading: false,
  error: false,
  error_message: "",
  openCashRegister: null, // This will hold the open cash register data
}


const cashRegisterSlice = createSlice({
  name: "cashRegister",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // OPEN CASH REGISTE
    builder.addCase(OpenCashRegisterThunk.fulfilled, (state) => {
      toast.success("Coupon de descuento creado correctamente");
      state.loading = false;
      state.error = false;
    });
    builder.addCase(OpenCashRegisterThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
      toast.error(`Error al crear el cupón de descuento`);
      console.error("Error al crear el cupón de descuento:", action.payload);
    });
    builder.addCase(OpenCashRegisterThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    builder.addCase(GetOpenCashRegisterThunk.fulfilled, (state,action) => {
      state.loading = false;
      state.error = false;
      const ans = action.payload.data;
      if( !ans || ans.length === 0) {
        toast.error("No hay cajas abiertas");
        console.error("No hay cajas abiertas");
        state.openCashRegister = null;
        return;
      }
      if(ans.length === 1) {
        state.openCashRegister = ans[0].id;
      } else {
        toast.info("Existen varias cajas abiertas, esto produce un error. reporte el problema al administrador.");
        console.error("Cajas abiertas:", ans);
        state.openCashRegister = null;
      }
    });
    builder.addCase(GetOpenCashRegisterThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
      toast.error(`Error al verificar las cajas disponibles`);
      console.error("Error al verificar las cajas disponibles:", action.payload);
    });
    builder.addCase(GetOpenCashRegisterThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });




  }
})

export default cashRegisterSlice.reducer;