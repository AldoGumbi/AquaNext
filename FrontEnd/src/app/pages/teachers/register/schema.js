// Import Dependencies
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Yup from 'yup'

// ----------------------------------------------------------------------

dayjs.extend(isBetween)
const today = dayjs().endOf('day');

export const personalInfoSchema = Yup.object().shape({
    // Personal Information
    nombre: Yup.string()
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .required('El nombre es requerido'),
    apellido: Yup.string()
        .trim()
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(100, 'El apellido no puede exceder 100 caracteres')
        .required('El apellido es requerido'),
    telefono: Yup.string()
        .trim()
        .matches(/^[0-9]{10}$/, 'Ingrese un número de teléfono válido de 10 dígitos')
        .required('El número de teléfono es requerido'),
    fecha_nacimiento: Yup.date()
        .typeError("Ingresa una fecha válida")
        .max(today.toDate(), "La fecha debe ser hoy o en el pasado")
        .test('age', 'El profesor debe ser mayor de edad', function(value) {
            if (!value) return false;
            const age = dayjs().diff(dayjs(value), 'year');
            return age >= 18;
        })
        .required("La fecha de nacimiento es obligatoria"),
})

export const addressInfoSchema = Yup.object().shape({
    calle: Yup.string()
        .trim()
        .min(5, 'La dirección debe tener al menos 5 caracteres')
        .max(200, 'La dirección no puede exceder 200 caracteres')
        .required('La calle y número son requeridos'),
    colonia: Yup.string()
        .trim()
        .min(3, 'La colonia debe tener al menos 3 caracteres')
        .max(100, 'La colonia no puede exceder 100 caracteres')
        .required('La colonia es requerida'),
    codigoPostal: Yup.string()
        .trim()
        .matches(/^[0-9]{5}$/, 'Ingrese un código postal válido de 5 dígitos')
        .required('El código postal es requerido'),
    ciudad: Yup.string()
        .trim()
        .min(2, 'La ciudad debe tener al menos 2 caracteres')
        .max(100, 'La ciudad no puede exceder 100 caracteres')
        .required('La ciudad es requerida'),
    estado: Yup.string()
        .trim()
        .min(2, 'El estado debe tener al menos 2 caracteres')
        .max(100, 'El estado no puede exceder 100 caracteres')
        .required('El estado es requerido'),
    referencias: Yup.string()
        .trim()
        .max(255, 'Las referencias no pueden exceder 255 caracteres'),
})

export const professionalInfoSchema = Yup.object().shape({
    especialidad: Yup.string()
        .trim()
        .min(3, 'La especialidad debe tener al menos 3 caracteres')
        .max(100, 'La especialidad no puede exceder 100 caracteres')
        .required('La especialidad es requerida'),
    fecha_contratacion: Yup.date()
        .typeError("Ingresa una fecha válida")
        .max(today.toDate(), "La fecha debe ser hoy o en el pasado")
        .required("La fecha de contratación es obligatoria"),
})

export const declarationSchema = Yup.object().shape({
    agreed: Yup.boolean()
        .oneOf([true], 'Para usar nuestro servicio, necesita consentir los términos y condiciones.')
        .required('Acuerdo requerido'),
    fullName: Yup.string()
        .required('Nombre completo requerido'),
    dateSigned: Yup.date('Seleccionar')
        .test("valid-date-signed", "La fecha de firma debe estar dentro de los últimos siete días", (value) => {
            return dayjs(value).isBetween(dayjs(), dayjs().subtract(7, "day"));
        })
        .max(new Date())
        .required()
})