// Import Dependencies
import * as Yup from "yup";

// Local Imports

// ----------------------------------------------------------------------

export const schema = Yup.object().shape({
  amount_opening: Yup.number()
    .required("El monto de apertura es requerido")
    .min(0, "El monto de apertura debe ser mayor o igual a 0")
    .typeError("El monto de apertura debe ser un número"),
  
  // selecciona el turno
  shift: Yup.string()
    .required("El turno es requerido")
    .typeError("El turno debe ser un número")
    .oneOf(["matutino", "vespertino"], "Turno no válido"),
    
});
