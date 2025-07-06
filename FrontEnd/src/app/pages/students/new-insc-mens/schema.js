// Import Dependencies
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Yup from 'yup'

// ----------------------------------------------------------------------

dayjs.extend(isBetween)

export const inscripcionSchema = Yup.object().shape({
  classType: Yup.string().required("El tipo de clase es obligatorio"),
  subType: Yup.string().when("classType", {
    is: (val) => val === "Grupales",
    then: (schema) => schema.required("El subtipo es obligatorio"),
    otherwise: (schema) => schema,
  }),
  startDate: Yup.date()
    .typeError("La fecha es inválida")
    .required("La fecha de inicio es obligatoria"),
  months: Yup.number()
    .typeError("Debe ser un número")
    .min(1, "Debe ser al menos 1 mes")
    .required("La cantidad de meses es obligatoria"),
  coupon: Yup.string().nullable(),
  schedule: Yup.object().test(
    "at-least-one",
    "Debes seleccionar al menos un horario",
    (value) => {
      return Object.values(value || {}).some(
        (day) => !!day.time && !!day.teacher
      );
    }
  ),
});
