// Import Dependencies
import * as yup from 'yup';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
// Local Imports
import {
  Textarea,
  Button,
  Input,
  Select,
  Switch
} from "components/ui";

// ----------------------------------------------------------------------

// Esquema de validación Yup
const productSchema = yup.object().shape({
  name: yup.string()
    .required('El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  sku: yup.string()
    .required('El SKU es requerido')
    .max(50, 'El SKU no puede exceder 20 caracteres'),
  category: yup.string()
    .required('La categoría es requerida')
    .oneOf(['cafeteria', 'articulo_deportivo', 'accesorios', 'otros'], 'Categoría inválida'),
  price: yup.number()
    .required('El precio es requerido')
    .min(0, 'El precio no puede ser negativo')
    .max(10000, 'El costo tiene que ser un numero razonable')
    .typeError('Debe ser un número válido'),
  cost: yup.number()
    .required('El costo es requerido')
    .min(0, 'El costo no puede ser negativo')
    .max(10000, 'El costo tiene que ser un numero razonable')
    .typeError('Debe ser un número válido'),
  description: yup.string()
    .max(200, 'La descripción no puede exceder 500 caracteres'),
});

export function EditModal({ isOpen, onClose, rowData, onSave }) {
  const [formData, setFormData] = useState(rowData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(rowData);
    setErrors({}); // Limpiar errores al cambiar los datos
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar los datos
      await productSchema.validate(formData, { abortEarly: false });
      setErrors({});
      await onSave(formData);
      onClose();
    } catch (validationErrors) {
      const newErrors = {};
      if (validationErrors.inner) {
        validationErrors.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
      }
      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveRef = useRef(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
        initialFocus={saveRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
              <DialogTitle
                as="h3"
                className="text-base font-medium text-gray-800 dark:text-dark-100"
              >
                Edición de Producto
              </DialogTitle>
              <Button
                onClick={onClose}
                variant="flat"
                isIcon
                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
              >
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    name="name"
                    type="text"
                    value={formData?.name || ''}
                    onChange={handleChange}
                    label="Nombre*"
                    placeholder="Nombre del producto"
                    error={errors.name}
                  />
                  <Input
                    name="sku"
                    type="text"
                    placeholder="PRODUCTO-XXX"
                    value={formData?.sku || ''}
                    onChange={handleChange}
                    label="Sku*"
                    error={errors.sku}
                  />
                </div>

                <Select
                  name="category"
                  value={formData?.category || ''}
                  onChange={handleChange}
                  label="Categoría*"
                  error={errors.category}
                  required
                  className="w-full p-2 border border-gray-300 rounded dark:bg-dark-800 dark:border-dark-500"
                >
                  <option disabled value="">Selecciona una categoría</option>
                  <option value="cafeteria">Cafeteria</option>
                  <option value="articulo_deportivo">Articulo Deportivo</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="otros">Otros</option>
                </Select>

                <div className="flex gap-4">
                  <Input
                    name="price"
                    type="number"
                    value={formData?.price || ''}
                    onChange={handleChange}
                    label="Precio*"
                    placeholder="0.00"
                    error={errors.price}
                  />
                  <Input
                    name="cost"
                    type="number"
                    value={formData?.cost || ''}
                    onChange={handleChange}
                    label="Costo*"
                    placeholder="0.00"
                    error={errors.cost}
                  />
                  <div className="flex justify-center">
                    <Switch
                      name="is_available"
                      checked={formData?.is_available || false}
                      label="Disponible"
                      onChange={(e) => handleChange({
                        target: {
                          name: 'is_available',
                          value: e.target.checked,
                        }
                      })}
                    />
                  </div>
                </div>

                <Textarea
                  name="description"
                  value={formData?.description || ''}
                  onChange={handleChange}
                  label="Descripción"
                  placeholder="Descripción del producto"
                  error={errors.description}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 p-4">
                <Button type="button" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  ref={saveRef}
                  disabled={isSubmitting}
                >
                  Guardar
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}