// Import Dependencies
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { DatePicker } from "components/shared/form/Datepicker";
import { Button, Input } from "components/ui";
import { useTeacherFormContext } from "../TeacherFormContext";
import { professionalInfoSchema } from "../schema";

// ----------------------------------------------------------------------

export function ProfessionalInfo({ setCurrentStep }) {
  const teacherFormCtx = useTeacherFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(professionalInfoSchema),
    defaultValues: teacherFormCtx.state.formData.professionalInfo,
  });

  const onSubmit = (data) => {
    teacherFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { professionalInfo: { ...data } },
    });
    teacherFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { professionalInfo: { isDone: true } },
    });
    setCurrentStep(3);
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="mt-6 space-y-6">
          {/* Información de enseñanza */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Especialidad en natación
            </h6>
            
            <Input
              {...register("especialidad")}
              prefix={<AcademicCapIcon className="size-5" />}
              label="Especialidad*"
              error={errors?.especialidad?.message}
              placeholder="Ej: Natación infantil, Crol avanzado, Aqua aeróbicos, Natación terapéutica"
            />
          </div>

          {/* Información laboral */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Información laboral
            </h6>
            
            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
                render={({ field: { onChange, value, ...rest } }) => (
                  <DatePicker
                    onChange={onChange}
                    value={value || ""}
                    label="Fecha de contratación*"
                    error={errors?.fecha_contratacion?.message}
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
              {/* Espacio vacío para mantener el grid balanceado */}
              <div></div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h6 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Ejemplos de especialidades para natación:
            </h6>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div>• <strong>Natación infantil:</strong> Enseñanza para niños de 3-12 años</div>
              <div>• <strong>Estilos específicos:</strong> Crol, espalda, pecho, mariposa</div>
              <div>• <strong>Natación terapéutica:</strong> Para rehabilitación y terapia</div>
              <div>• <strong>Aqua aeróbicos:</strong> Ejercicios acuáticos grupales</div>
              <div>• <strong>Natación competitiva:</strong> Entrenamiento para competencias</div>
              <div>• <strong>Aqua fitness:</strong> Fitness y acondicionamiento en agua</div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-500">
          <Button 
            type="button"
            className="min-w-[7rem]" 
            onClick={() => setCurrentStep(1)}
            variant="outline"
          >
            Regresar
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

ProfessionalInfo.propTypes = {
  setCurrentStep: PropTypes.func,
};