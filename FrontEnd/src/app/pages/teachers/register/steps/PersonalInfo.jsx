// Import Dependencies
import { UserIcon } from "@heroicons/react/20/solid";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { DatePicker } from "components/shared/form/Datepicker";
import { Button, Input } from "components/ui";
import { useTeacherFormContext } from "../TeacherFormContext";
import { personalInfoSchema } from "../schema";

// ----------------------------------------------------------------------

export function PersonalInfo({ setCurrentStep }) {
  const teacherFormCtx = useTeacherFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: teacherFormCtx.state.formData.personalInfo,
  });

  const onSubmit = (data) => {
    teacherFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { personalInfo: { ...data } },
    });
    teacherFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { personalInfo: { isDone: true } },
    });
    setCurrentStep(1);
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="mt-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Información básica
            </h6>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                {...register("nombre")}
                prefix={<UserIcon className="size-5" />}
                label="Nombre completo*"
                error={errors?.nombre?.message}
                placeholder="Ej: Juan Carlos"
              />
              <Input
                {...register("apellido")}
                prefix={<UserIcon className="size-5" />}
                label="Apellidos*"
                error={errors?.apellido?.message}
                placeholder="Ej: García López"
              />
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Información de contacto
            </h6>
            
            <Input
              {...register("telefono")}
              prefix={<PhoneIcon className="size-5" />}
              label="Número de teléfono*"
              error={errors?.telefono?.message}
              placeholder="Ej: 4441234567"
              maxLength="10"
            />
          </div>

          {/* Información personal */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Información personal
            </h6>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                render={({ field: { onChange, value, ...rest } }) => (
                  <DatePicker
                    onChange={onChange}
                    value={value || ""}
                    label="Fecha de nacimiento*"
                    error={errors?.fecha_nacimiento?.message}
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
              {/* Espacio vacío para mantener el grid balanceado */}
              <div></div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-500">
          <Button 
            type="button"
            className="min-w-[7rem]"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="min-w-[7rem]" 
            color="primary"
          >
            Siguiente
          </Button>
        </div>
      </form>
    </div>
  );
}

PersonalInfo.propTypes = {
  setCurrentStep: PropTypes.func,
};