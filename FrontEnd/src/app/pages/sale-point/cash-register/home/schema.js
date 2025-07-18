import * as yup from "yup";


// Schemas de validación
export const openCashSchema = yup.object().shape({
  amount_opening: yup
    .number()
    .required("La cantidad es requerida")
    .min(0.01, "La cantidad debe ser mayor a 0")
    .typeError("Debe ser un número válido"),
  shift: yup.string().required("El turno es requerido"),
});

export const closeCashSchema = yup.object().shape({
  amount_closing: yup
    .number()
    .required("La cantidad es requerida")
    .min(0, "La cantidad no puede ser negativa")
    .typeError("Debe ser un número válido"),
  comment: yup.string().optional(),
});
