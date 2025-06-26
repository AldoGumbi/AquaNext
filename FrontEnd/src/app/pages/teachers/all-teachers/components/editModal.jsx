// Import Dependencies
import * as yup from 'yup';
import dayjs from 'dayjs';
import { DateTime } from 'luxon';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

// Local Imports
import {
  Textarea,
  Button,
  Input,
  Switch
} from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";

// ----------------------------------------------------------------------

const today = dayjs().endOf('day');

// Esquema de validación Yup para profesores
const teacherSchema = yup.object().shape({
  nombre: yup.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  apellido: yup.string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .required('El apellido es requerido'),
  fecha_nacimiento: yup.date()
    .typeError("Ingresa una fecha válida")
    .max(today.toDate(), "La fecha debe ser hoy o en el pasado")
    .test('age', 'El profesor debe ser mayor de edad', function(value) {
        if (!value) return false;
        const age = dayjs().diff(dayjs(value), 'year');
        return age >= 18;
    })
    .required("La fecha de nacimiento es obligatoria"),
  telefono: yup.string()
    .trim()
    .matches(/^[0-9]{10}$/, 'Ingrese un número de teléfono válido de 10 dígitos')
    .required('El número de teléfono es requerido'),
  direccion: yup.string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(255, 'La dirección no puede exceder 255 caracteres'),
  especialidad: yup.string()
    .trim()
    .min(3, 'La especialidad debe tener al menos 3 caracteres')
    .max(100, 'La especialidad no puede exceder 100 caracteres')
    .required('La especialidad es requerida'),
  fecha_contratacion: yup.date()
    .typeError("Ingresa una fecha válida")
    .max(today.toDate(), "La fecha debe ser hoy o en el pasado")
    .required("La fecha de contratación es obligatoria"),
  activo: yup.boolean()
    .required('El estado es requerido'),
});

const convertToUTC6 = (dateValue) => {
  if (!dateValue) return null;
  
  let dt;
  
  // Si es un objeto Date de JavaScript, usar fromJSDate
  if (dateValue instanceof Date) {
    dt = DateTime.fromJSDate(dateValue, { zone: 'America/Mexico_City' });
  } 
  // Si es un string, usar fromISO
  else if (typeof dateValue === 'string') {
    dt = DateTime.fromISO(dateValue, { zone: 'America/Mexico_City' });
  } 
  // Si ya es un DateTime de Luxon
  else if (DateTime.isDateTime(dateValue)) {
    dt = dateValue.setZone('America/Mexico_City');
  } 
  else {
    console.warn('Tipo de fecha no reconocido:', typeof dateValue, dateValue);
    return null;
  }
  
  // Verificar si la fecha es válida
  if (!dt.isValid) {
    console.warn('Fecha inválida:', dateValue, dt.invalidReason);
    return null;
  }
  
  // Convertir a UTC y formatear como fecha ISO
  return dt.toUTC().toISODate();
};

export function EditModal({ isOpen, onClose, rowData, onSave }) {
  const saveRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm({
    resolver: yupResolver(teacherSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      fecha_nacimiento: null,
      telefono: '',
      direccion: '',
      especialidad: '',
      fecha_contratacion: null,
      activo: true,
    },
  });

  // Resetear el formulario cuando cambian los datos
  useEffect(() => {
    if (rowData) {
      reset({
        ...rowData,
        fecha_nacimiento: rowData.fecha_nacimiento ? rowData.fecha_nacimiento.split('T')[0] : null,
        fecha_contratacion: rowData.fecha_contratacion ? rowData.fecha_contratacion.split('T')[0] : null,
        activo: Boolean(rowData.activo),
      });
    }
  }, [rowData, reset]);

  const onSubmit = async (data) => {
    try {
      // Preparar los datos para enviar, convirtiendo las fechas a UTC-6
      const dataToSend = {
        ...data,
        fecha_nacimiento: convertToUTC6(data.fecha_nacimiento),
        fecha_contratacion: convertToUTC6(data.fecha_contratacion)
      };
      
      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

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
                Edición de Profesor
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

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                    Información Personal
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register("nombre")}
                      label="Nombre*"
                      placeholder="Nombre del profesor"
                      error={errors.nombre?.message}
                    />
                    <Input
                      {...register("apellido")}
                      label="Apellido*"
                      placeholder="Apellido del profesor"
                      error={errors.apellido?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DatePicker para fecha de nacimiento con Controller */}
                    <Controller
                      render={({ field: { onChange, value, ...rest } }) => (
                        <DatePicker
                          onChange={onChange}
                          value={value || ""}
                          label="Fecha de Nacimiento"
                          error={errors.fecha_nacimiento?.message}
                          options={{ 
                            disableMobile: true,
                            maxDate: new Date()
                          }}
                          placeholder="Selecciona una fecha"
                          {...rest}
                        />
                      )}
                      control={control}
                      name="fecha_nacimiento"
                    />
                    
                    <Input
                      {...register("telefono")}
                      type="tel"
                      label="Teléfono"
                      placeholder="123-456-7890"
                      error={errors.telefono?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                      Dirección
                    </label>
                    <Textarea
                      {...register("direccion")}
                      placeholder="Dirección completa"
                      error={errors.direccion?.message}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                    Información Profesional
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register("especialidad")}
                      label="Especialidad"
                      placeholder="Ej: Natación infantil, Crol avanzado"
                      error={errors.especialidad?.message}
                    />
                    
                    {/* DatePicker para fecha de contratación con Controller */}
                    <Controller
                      render={({ field: { onChange, value, ...rest } }) => (
                        <DatePicker
                          onChange={onChange}
                          value={value || ""}
                          label="Fecha de Contratación*"
                          error={errors.fecha_contratacion?.message}
                          options={{ 
                            disableMobile: true,
                            maxDate: new Date()
                          }}
                          placeholder="Selecciona una fecha"
                          {...rest}
                        />
                      )}
                      control={control}
                      name="fecha_contratacion"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                    Estado
                  </h4>
                  
                  <div className="flex items-center justify-center">
                    <Controller
                      render={({ field: { onChange, value, ...rest } }) => (
                        <Switch
                          checked={Boolean(value)}
                          label="Profesor Activo"
                          onChange={(e) => onChange(e.target.checked)}
                          {...rest}
                        />
                      )}
                      control={control}
                      name="activo"
                    />
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