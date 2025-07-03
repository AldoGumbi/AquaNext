// Import Dependencies
import * as Yup from "yup";

// Local Imports

// ----------------------------------------------------------------------

export const schema = Yup.object().shape({
  amount_closing: Yup.number()
    .required("El monto de cierre es requerido")
    .min(1, "El monto de cierre debe ser mayor o igual a 0")
    .max(1000000, "El monto de cierre no puede ser mayor a 1,000,000")
    .typeError("El monto de cierre debe ser un número"),
  // comentario
  comment: Yup.string()
    .typeError("El comentario debe ser un texto")
    .max(100, "El comentario no puede tener más de 100 caracteres"),

});
