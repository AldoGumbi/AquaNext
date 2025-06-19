// Import Dependencies
import * as Yup from "yup";

// Local Imports

// ----------------------------------------------------------------------

export const schema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, "Nombre demasiado corto!")
    .max(70, "Nombre demasiado largo!")
    .required("Nombre es obligatorio!"),
  code: Yup.string()
    .trim()
    .min(2, "Código muy corto!")
    .max(50, "Código demasiado largo!")
    .required("El código es obligatorio!"),
  discount_type: Yup.string().required("Selecciona el tipo de descuento"),
  discount_amount: Yup.number()
    .nullable()
    .when('discount_type', {
      is: "cantidad",
      then: (schema) => schema
        .typeError("Debe ser un número válido")
        .positive("La cantidad debe ser mayor a 0")
        .required("La cantidad es obligatoria"),
    }),
  discount_porcentaje: Yup.number()
    .nullable()
    .when('discount_type', {
      is: "porcentaje",
      then: (schema) => schema
        .typeError("Debe ser un número válido")
        .min(1, "Mínimo 1%")
        .max(100, "Máximo 100%")
        .required("El porcentaje es obligatorio"),
    }),
  max_uses : Yup.number()
    .required('Máximo de usos requerido')
    .typeError('El máximo de usos debe ser un número')
    .min(1, 'El máximo de usos debe ser al menos 1'),
  start_day: Yup.date()
    .required("Fecha de inicio es obligatoria")
    .typeError("La fecha de inicio debe ser una fecha válida")
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "La fecha de inicio debe ser hoy o posterior"
    )
    .max(
      Yup.ref("expiration_day"),
      "La fecha de inicio debe ser anterior a la fecha de finalización"
    ),
  expiration_day: Yup.date()
    .required("Fecha de finalización es obligatoria")
    .typeError("La fecha de finalización debe ser una fecha válida")
    .min(Yup.ref("start_day"), "La fecha de finalización debe ser posterior a la fecha de inicio"),
});
