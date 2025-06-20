// Import Dependencies
import * as yup from 'yup';
import { DateTime } from 'luxon';
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
const studentSchema = yup.object().shape({
  nombre: yup.string()
    .required('El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido_paterno: yup.string()
    .required('El apellido paterno es requerido')
    .max(100, 'El apellido paterno no puede exceder 100 caracteres'),
  apellido_materno: yup.string()
    .max(50, 'El apellido materno no puede exceder 50 caracteres'),
  fecha_nacimiento: yup.date()
    .nullable()
    .max(new Date(), 'La fecha de nacimiento no puede ser futura'),
  email: yup.string()
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  telefono: yup.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  telefono_emergencia: yup.string()
    .max(20, 'El teléfono de emergencia no puede exceder 20 caracteres'),
  domicilio: yup.string()
    .max(255, 'La dirección no puede exceder 255 caracteres'),
  estatus: yup.string()
    .required('El estado es requerido')
    .oneOf(['activo', 'inactivo', 'pendiente'], 'Estado inválido'),
});


const convertToUTC6 = (dateString) => {
  if (!dateString) return null;
  
  const dt = DateTime.fromISO(dateString, { zone: 'America/Mexico_City' });
  
  // Convertir a UTC y formatear como fecha ISO
  return dt.toUTC().toISODate();
};

export function EditModal({ isOpen, onClose, rowData, onSave }) {
  const [formData, setFormData] = useState(rowData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(rowData);
    setErrors({});
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await studentSchema.validate(formData, { abortEarly: false });
      setErrors({});
      
      // Preparar los datos para enviar, convirtiendo la fecha a UTC-6
      const dataToSend = {
        ...formData,
        fecha_nacimiento: convertToUTC6(formData.fecha_nacimiento)
      };
			// console.log('Datos a enviar:', dataToSend);
      
      await onSave(dataToSend);
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
          <DialogPanel className="relative flex w-full max-w-2xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
              <DialogTitle
                as="h3"
                className="text-base font-medium text-gray-800 dark:text-dark-100"
              >
                Edición de Alumno
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
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                    Información Personal
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="nombre"
                      type="text"
                      value={formData?.nombre || ''}
                      onChange={handleChange}
                      label="Nombre*"
                      placeholder="Nombre del alumno"
                      error={errors.nombre}
                    />
                    <Input
                      name="apellido_paterno"
                      type="text"
                      value={formData?.apellido_paterno || ''}
                      onChange={handleChange}
                      label="Apellido Paterno*"
                      placeholder="Apellido paterno"
                      error={errors.apellido_paterno}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="apellido_materno"
                      type="text"
                      value={formData?.apellido_materno || ''}
                      onChange={handleChange}
                      label="Apellido Materno"
                      placeholder="Apellido materno"
                      error={errors.apellido_materno}
                    />
                    <Input
                      name="fecha_nacimiento"
                      type="date"
                      value={formData?.fecha_nacimiento ? formData.fecha_nacimiento.split('T')[0] : ''}
                      onChange={handleChange}
                      label="Fecha de Nacimiento"
                      error={errors.fecha_nacimiento}
                    />
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                    Información de Contacto
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="email"
                      type="email"
                      value={formData?.email || ''}
                      onChange={handleChange}
                      label="Email"
                      placeholder="correo@ejemplo.com"
                      error={errors.email}
                    />
                    <Input
                      name="telefono"
                      type="tel"
                      value={formData?.telefono || ''}
                      onChange={handleChange}
                      label="Teléfono"
                      placeholder="123-456-7890"
                      error={errors.telefono}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="telefono_emergencia"
                      type="tel"
                      value={formData?.telefono_emergencia || ''}
                      onChange={handleChange}
                      label="Teléfono de Emergencia"
                      placeholder="123-456-7890"
                      error={errors.telefono_emergencia}
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                        Dirección
                      </label>
                      <Textarea
                        name="domicilio"
                        value={formData?.domicilio || ''}
                        onChange={handleChange}
                        placeholder="Dirección completa"
                        error={errors.domicilio}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Estado y Configuración */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                    Estado y Configuración
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <Select
                      name="estatus"
                      value={formData?.estatus || ''}
                      onChange={handleChange}
                      label="Estado*"
                      error={errors.estatus}
                      required
                      className="w-full p-2 border border-gray-300 rounded dark:bg-dark-800 dark:border-dark-500"
                    >
                      <option disabled value="">Selecciona un estado</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="pendiente">Pendiente</option>
                    </Select>
                    
                    <div className="flex items-center justify-center">
                      <Switch
                        name="firma"
                        checked={Boolean(formData?.firma)}
                        label="Tiene Firma"
                        onChange={(e) => handleChange({
                          target: {
                            name: 'firma',
                            value: e.target.checked ? 1 : 0,
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-600">
                <Button type="button" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  ref={saveRef}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}