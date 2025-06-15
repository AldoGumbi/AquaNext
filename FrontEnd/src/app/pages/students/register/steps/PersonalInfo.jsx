// Import Dependencies
import { UserIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { DatePicker } from "components/shared/form/Datepicker";
import { Button, Input, InputErrorMsg } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { personalInfoSchema } from "../schema";

// ----------------------------------------------------------------------

export function PersonalInfo({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: kycFormCtx.state.formData.personalInfo,
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { personalInfo: { ...data } },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { personalInfo: { isDone: true } },
    });
    setCurrentStep(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <Input
          {...register("firstName")}
          prefix={<UserIcon className="size-5" />}
          label={
            <>
              Nombre{" "}
              <span className="text-xs text-gray-400 dark:text-dark-300">
                (s)
              </span>*
            </>
          }
          error={errors?.firstName?.message}
          placeholder="Ingregsa los nombres "
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("lastNamePaternal")}
            prefix={<UserIcon className="size-5" />}
            label={
              <>
                Apellido {" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                (Paterno)
              </span>*
              </>
            }
            error={errors?.lastNamePaternal?.message}
            placeholder="Ingresa el apellido paterno"
          />
          <Input
            {...register("lastNameMaternal")}
            prefix={<UserIcon className="size-5" />}
            label={
              <>
                Apellido {" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                (Materno) (opcional)
              </span>
              </>
            }
            error={errors?.lastNameMaternal?.message}
            placeholder="Ingresa el apellido materno"
          />
        </div>



        <Input
          {...register("email")}
          prefix={<EnvelopeIcon className="size-5" />}
          label="Ingresa el correo electrónico*"
          error={errors?.email?.message}
          placeholder="ejemplo@gmail.com"
        />
        {/* // Phones */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* // Phone */}
          <div className="flex flex-col">
            <span>Telefono*</span>
            <div className="mt-1.5 flex -space-x-px ">
              <Input
                {...register("phone")}
                classNames={{
                  root: "flex-1",
                  input:
                    "hover:z-1 focus:z-1 ltr:rounded-l-none rtl:rounded-r-none",
                }}
                error={Boolean(errors?.phone)}
                placeholder="Telefono personal"
              />
            </div>
            <InputErrorMsg when={errors?.dialCode || errors?.phone}>
              {errors?.dialCode?.message ?? errors?.phone?.message}
            </InputErrorMsg>
          </div>

          {/* // Emergency Phone */}
          <div className="flex flex-col">
            <span>Telefono de emergencia*</span>
            <div className="mt-1.5 flex -space-x-px ">

              <Input
                {...register("emergencyPhone")}
                classNames={{
                  root: "flex-1",
                  input:
                    "hover:z-1 focus:z-1 ltr:rounded-l-none rtl:rounded-r-none",
                }}
                error={Boolean(errors?.emergencyPhone)}
                placeholder="Telefono de emergencia"
              />
            </div>
            <InputErrorMsg when={errors?.dialCode || errors?.emergencyPhone}>
              {errors?.dialCode?.message ?? errors?.emergencyPhone?.message}
            </InputErrorMsg>
          </div>
        </div>



        <div className="grid gap-4 lg:grid-cols-2">


          <div className="flex flex-col">
            <Controller
              render={({ field: { onChange, value, ...rest } }) => (
                <DatePicker
                  onChange={onChange}
                  value={value || ""}
                  label="Fecha de nacimiento*"
                  error={errors?.dateOfBirth?.message}
                  options={{ disableMobile: true }}
                  placeholder="Escoja un fecha..."
                  {...rest}
                />
              )}
              control={control}
              name="dateOfBirth"
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]">Cancel</Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

PersonalInfo.propTypes = {
  setCurrentStep: PropTypes.func,
};
