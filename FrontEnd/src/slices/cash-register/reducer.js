import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  OpenCashRegisterThunk,
  GetOpenCashRegisterThunk,
  CloseCashRegisterThunk

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
      const ans = action.payload;

      console.error("Error opening cash register:", action.payload);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al abrir la caja");
      }

    });
    builder.addCase(OpenCashRegisterThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    // GET OPEN CASH REGISTER
    builder.addCase(GetOpenCashRegisterThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      const ans = action.payload.data;
      if (!ans || ans.length === 0) {
        toast.error("No hay cajas abiertas");
        console.error("No hay cajas abiertas");
        state.openCashRegister = null;
        return;
      }
      if (ans.length === 1) {
        state.openCashRegister = ans[0].id;
      } else {
        toast.info("Existen varias cajas abiertas, esto produce un error. reporte el problema al administrador.");
        console.error("Cajas abiertas:", ans);
        state.openCashRegister = null;
      }
    });
    builder.addCase(GetOpenCashRegisterThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      const ans = action.payload;

      if (ans?.error?.API_error) {
        // this error means that there are no open cash registers
        if (ans?.error?.API_error === 10001) {
          console.error("No hay cajas abiertas o reabiertas.");
          state.openCashRegister = -1; // No open cash register
          return;
        }
      }

      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al abrir la caja");
      }

      state.error_message = ans?.error?.API_message || "Error al abrir la caja";



      console.error("Error al verificar las cajas disponibles:", action.payload.error);
    });
    builder.addCase(GetOpenCashRegisterThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
    // CLOSE CASH REGISTER
    builder.addCase(CloseCashRegisterThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      const ans = action.payload;
      console.log("Caja cerrada correctamente:", ans);
      state.openCashRegister = null;
    });
    builder.addCase(CloseCashRegisterThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      const ans = action.payload;

      console.error("Error al cerrar la caja: ", action.payload.error);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al cerrar la caja");
      }
    });
    builder.addCase(CloseCashRegisterThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });




  }
})

export default cashRegisterSlice.reducer;