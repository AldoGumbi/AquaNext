// Import Dependencies
import * as Yup from "yup";

// Local Imports
// import { isDeltaNotEmpty } from 'utils/quillUtils';

// ----------------------------------------------------------------------

export const generalSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, "Nombre del producto demasiado corto!")
    .max(99, "El nombre del producto es demasiado largo!")
    .required("Nombre del producto es requerido"),
  price: Yup.number("El valor del precio debe ser un número")
    .transform((val) => (isNaN(val) ? null : val))
    .positive("El precio debe de ser positivo")
    .required("El precio del producto es requerido"),
  cost: Yup.number("El valor del costo debe ser un número")
    .transform((val) => (isNaN(val) ? null : val))
    .positive("El costo debe de ser positivo")
    .required("El costo del producto es requerido"),
  sku: Yup.string()
    .trim()
    .max(99, "El SKU del producto es demasiado largo!")
    .required("El SKU del producto es requerido"),
  category_id: Yup.string()
    .required("Secciona una categoría de producto"),
  is_available: Yup.boolean()
    .required("Required"),
});

export const descriptionSchema = Yup.object().shape({
  // description: Yup.object()
  //     .required('Product Description Required')
  //     .test("notEmpty", "Content Can't be empty", isDeltaNotEmpty),
  description: Yup.string()
    .trim()
    .max(160, "Excediste los caracteres máximos del producto!")
});

export const imageSchema = Yup.object().shape({
  cover: Yup.mixed()
    .nullable()
    .required("Es necesario subir una imagen del producto")
    .test(
      "fileSize",
      "El tamaño maximo de la imagen permitido es de 4MB",
      (value) => value && value.size <= 4194304,
    ),
});
