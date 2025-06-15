// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import {  useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import PropTypes from "prop-types";

// Local Imports
import { ContextualHelp } from "components/shared/ContextualHelp";
import { Button, Input } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { addressInfoSchema } from "../schema";

// ----------------------------------------------------------------------

export function AddressInfo({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressInfoSchema),
    defaultValues: kycFormCtx.state.formData.addressInfo,
  });


  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { addressInfo: { ...data } },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { addressInfo: { isDone: true } },
    });
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <h6 className="mt-6 flex space-x-1.5 text-base font-medium text-gray-800 dark:text-dark-100 ">
        <span>Permanent Address</span>
        <ContextualHelp
          title="Permanent Address"
          content={
            <p>
              A permanent address is a physical address where you permanently
              reside or have a legal residence. It is different from a mailing
              address, which is where you receive your mail and can be in a
              different location from your permanent address.
            </p>
          }
        />
      </h6>
      <div className="mt-3 space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">

          {/* CIUDAD */}
          <Input
            {...register("city")}
            label={
              <>
                Ciudad {" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  (opcional)
              </span>
              </>
            }
            error={errors?.city?.message}
            placeholder="Ingresa la ciudad"
          />
          {/* ESTADO */}
          <Input
            {...register("state")}
            label={
              <>
                Estado {" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  (opcional)
              </span>
              </>
            }
            error={errors?.state?.message}
            placeholder="Ingresa el estado"
          />
          {/* CODIGO POSTAL */}
          <Input
            {...register("zipCode")}
            label={
              <>
                Código Postal {" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  (opcional)
              </span>
              </>
            }
            error={errors?.zipCode?.message}
            placeholder="Ingresa el código postal"
          />
          {/* COLONIA */}
          <Input
            {...register("colony")}
            label={
              <>
                Colonia {" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  (opcional)
              </span>
              </>
            }
            error={errors?.colony?.message}
            placeholder="Ingresa la colonia"
          />
        </div>

        {/* CALLE Y NUMERO */}
        <Input
          {...register("address")}
          component={TextareaAutosize}
          label={
            <>
              Calle y Numero {" "}
              <span className="text-xs text-gray-400 dark:text-dark-300">
                  (opcional)
              </span>
            </>
          }
          error={errors?.address?.message}
          placeholder="av. juan perez, Calle 56"
        />


      </div>


      <div className="mt-8 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(0)}>
          Back
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

AddressInfo.propTypes = {
  setCurrentStep: PropTypes.func,
};
