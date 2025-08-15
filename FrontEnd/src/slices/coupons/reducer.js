import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
  CreateCouponThunk,
  GetCouponsThunk,
  avaliableCouponsThunk,
  GetCouponByIdThunk,
  applyCouponToBasketThunk,
  unApplyCouponToBasketThunk,
} from "./thunk.js";
import { DateTime } from "luxon";

const initialState = {
  // all the coupons
  coupons: [],

  // all the avaliable coupons
  avaliableCoupons: [],

  // Coupon that is active in the BASKET THAT IS ACTIVE
  activeCoupon: null,

  // extras
  loading: false,
  error: false,
  error_message: "",
};

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    resetActiveCoupon(state) {
      state.activeCoupon = null;
    },
  },
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
      const data = action.payload.data;
      state.coupons = [
        ...data.map((coupon) => ({
          ...coupon,

          fecha_inicio: DateTime.fromISO(coupon.fecha_inicio, { zone: "utc-6" })
            .setLocale("es")
            .toFormat("dd 'de' LLLL 'del' yyyy"),

          fecha_fin: DateTime.fromISO(coupon.fecha_fin, { zone: "utc-6" })
            .setLocale("es")
            .toFormat("dd 'de' LLLL 'del' yyyy"),

          created_at: DateTime.fromISO(coupon.created_at, { zone: "utc-6" })
            .setLocale("es")
            .toFormat("dd 'de' LLLL 'del' yyyy"),
          valor_formateado:
            coupon.tipo === "porcentaje" ? `${parseFloat(coupon.valor)}%` : `$${parseFloat(coupon.valor).toFixed(2)} MXN`,
        })),
      ];
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
      console.error(
        "Error al obtener todos los cupones de descuento:",
        action.payload,
      );
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

      console.error(
        "Error al obtener los cupones de descuento:",
        action.payload,
      );
    });
    builder.addCase(avaliableCouponsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET THE COUPON BY THE ID
    builder.addCase(GetCouponByIdThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      // SETTING THE ONLY ONE OBJET THAT COMES FROM THE API
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

    // APPLY COUPON TO BASKET
    builder.addCase(applyCouponToBasketThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.activeCoupon = action.payload.data[0];
    });
    builder.addCase(applyCouponToBasketThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
      const ans = action.payload;

      console.error(
        "Error al aplicar codigo de descuento al carrito: ",
        action.payload.error,
      );
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al aplicar codigo de descuento!");
      }
    });
    builder.addCase(applyCouponToBasketThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    // APPLY COUPON TO BASKET
    builder.addCase(unApplyCouponToBasketThunk.fulfilled, (state) => {
      // need to reset de active coupon
      state.activeCoupon = null;
      state.loading = false;
      state.error = false;
    });
    builder.addCase(unApplyCouponToBasketThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
      const ans = action.payload;

      console.error(
        "Error al eliminar el codigo de descuento al carrito: ",
        action.payload.error,
      );
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al eliminar codigo de descuento al carrito!");
      }
    });
    builder.addCase(unApplyCouponToBasketThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
  },
});
export const { resetActiveCoupon } = couponsSlice.actions;
export default couponsSlice.reducer;
