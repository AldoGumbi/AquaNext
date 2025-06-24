// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input } from "components/ui";
import { useTeacherFormContext } from "../TeacherFormContext";
import { addressInfoSchema } from "../schema";

// ----------------------------------------------------------------------

export function AddressInfo({ setCurrentStep }) {
  const teacherFormCtx = useTeacherFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressInfoSchema),
    defaultValues: teacherFormCtx.state.formData.addressInfo,
  });

  const onSubmit = (data) => {
    teacherFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { addressInfo: { ...data } },
    });
    teacherFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { addressInfo: { isDone: true } },
    });
    setCurrentStep(2);
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="mt-6 space-y-6">
          {/* Dirección principal */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Dirección principal
            </h6>
            
            <Input
              {...register("calle")}
              component={TextareaAutosize}
              label="Calle y número*"
              error={errors?.calle?.message}
              placeholder="Ej: Av. Revolución #123, entre Morelos y Hidalgo"
              minRows={2}
            />
          </div>

          {/* Ubicación específica */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Ubicación específica
            </h6>
            
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("colonia")}
                label="Colonia*"
                error={errors?.colonia?.message}
                placeholder="Ej: Centro Histórico"
              />
              <Input
                {...register("codigoPostal")}
                label="Código postal*"
                error={errors?.codigoPostal?.message}
                placeholder="Ej: 58000"
                maxLength="5"
              />
            </div>
          </div>

          {/* Ubicación geográfica */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Ubicación geográfica
            </h6>
            
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("ciudad")}
                label="Ciudad*"
                error={errors?.ciudad?.message}
                placeholder="Ej: Morelia"
              />
              <Input
                {...register("estado")}
                label="Estado*"
                error={errors?.estado?.message}
                placeholder="Ej: Michoacán"
              />
            </div>
          </div>

          {/* Referencias adicionales */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Referencias adicionales
              <span className="text-xs text-gray-400 dark:text-dark-300 font-normal ml-2">
                (opcional)
              </span>
            </h6>
            
            <Input
              {...register("referencias")}
              component={TextareaAutosize}
              label={
                <>
                  Referencias{" "}
                  <span className="text-xs text-gray-400 dark:text-dark-300">
                    (opcional)
                  </span>
                </>
              }
              error={errors?.referencias?.message}
              placeholder="Ej: Casa de color azul, junto a la farmacia San Pablo"
              minRows={2}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-500">
          <Button 
            type="button"
            className="min-w-[7rem]" 
            onClick={() => setCurrentStep(0)}
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

AddressInfo.propTypes = {
  setCurrentStep: PropTypes.func,
};