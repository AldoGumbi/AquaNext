// Import Dependencies
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Yup from 'yup'

// ----------------------------------------------------------------------

dayjs.extend(isBetween)
const today = dayjs().endOf('day');
export const personalInfoSchema = Yup.object().shape({
    // Personal Information
    firstName: Yup.string()
        .trim()
        .required('El nombre es requerido'),
    lastNamePaternal: Yup.string()
        .trim()
        .required('El apellido paterno es requerido'),
    lastNameMaternal: Yup.string()
        .trim(),
    email: Yup.string()
        .trim()
        .email('Ingrese un correo electrónico válido')
        .required('El correo electrónico es requerido'),
    phone: Yup.string()
        .trim()
        .matches(/^[0-9\-s]+$/, 'Ingrese un número de teléfono válido')
        .required('Ingresa un número de teléfono'),
    emergencyPhone: Yup.string()
      .trim()
      .matches(/^[0-9\-s]+$/, 'Ingrese un número de teléfono válido')
      .required('Ingresa un número de teléfono de emergencia'),
    dateOfBirth: Yup.date()
    .typeError("Ingresa una fecha válida")
    .max(today.toDate(), "La fecha debe ser hoy o en el pasado")
    .required("La fecha de nacimiento es obligatoria"),
})

export const addressInfoSchema = Yup.object().shape({
  city: Yup.string()
    .trim(),
  state: Yup.string()
    .trim(),
  zipCode: Yup.string(),
  colony : Yup.string()
    .trim(),
  address: Yup.string()
    .trim(),
})

export const identifyDocumentSchema = Yup.object().shape({
    // type: Yup.string().oneOf(["passport", "driverLicense", "nationalID"]).required('Choose Your Document Type'),
    // imageFront: Yup.mixed().nullable()
    //     .required("You need to provide a file")
    //     .test("fileSize", "Max file size should be 4MB", value => value && value.size <= 4194304),
    // imageBack: Yup.mixed().nullable().when("type", {
    //     is: (type) => type !== "passport",
    //     then: () => Yup.mixed().required("You need to provide a file").test("fileSize", "Max file size should be 4MB", value => value && value.size <= 4194304),
    //     otherwise: (schema) => schema,
    // }),
    // passportPage: Yup.mixed().nullable().when("type", {
    //     is: "passport",
    //     then: () => Yup.mixed().required("You need to provide a file").test("fileSize", "Max file size should be 4MB", value => value && value.size <= 4194304),
    //     otherwise: (schema) => schema,
    // })
});

export const declarationSchema = Yup.object().shape({
    agreed: Yup.boolean().oneOf([true], 'To use our service, you need to consent to the terms and conditions.').required('Agreed Required'),
    fullName: Yup.string().required('Full Name Required'),
    dateSigned: Yup.date('Select')
        .test("valid-date-signed", "Date signed must be within the last seven days", (value) => {
            return dayjs(value).isBetween(dayjs(), dayjs().subtract(7, "day"));
        })
        .max(new Date()).required()
})
