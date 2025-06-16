// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useState } from "react";
// import { Controller, useForm } from "react-hook-form";
import {  useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
// import { ContextualHelp } from "components/shared/ContextualHelp";
// import { DatePicker } from "components/shared/form/Datepicker";
// import { PreviewImg } from "components/shared/PreviewImg";
import {
  Button,
  // Checkbox,
  GhostSpinner,
  // Input,
  // InputErrorMsg,
} from "components/ui";
// import { countries } from "constants/countries.constant";
import { useKYCFormContext } from "../KYCFormContext";
import { declarationSchema } from "../schema";
import { useDispatch } from "react-redux";
import { addAlumnoThunk } from "slices/thunk";

// ----------------------------------------------------------------------

export function Declaration({ setCurrentStep, setFinished }) {
  const kycFormCtx = useKYCFormContext();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const {
    // register,
    handleSubmit,
    // formState: { errors },
    // control,
  } = useForm({
    resolver: yupResolver(declarationSchema),
    defaultValues: kycFormCtx.state.formData.declaration,
  });

  const onSubmit = (data) => {
    console.log(data)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      kycFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { declaration: { ...data } },
      });
      kycFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { declaration: { isDone: true } },
      });
      setFinished(true);
    }, 2000);
  };

  const addSubmit = () => {
    const nuevoAlumno = {
      general : kycFormCtx.state.formData.personalInfo,
      domicilio: kycFormCtx.state.formData.addressInfo,
      foto: ''
    }
    console.log('Informacion del alumno: \n');
    console.log(nuevoAlumno);
    dispatch(addAlumnoThunk(nuevoAlumno));
    setFinished(true);

  }

  const personalInfo = kycFormCtx.state.formData.personalInfo;
  const addressInfo = kycFormCtx.state.formData.addressInfo;
  // const identifyDocument = kycFormCtx.state.formData.identifyDocument;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="max-w-3xl"
    >
      <h6 className="mt-8 border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
        Personal Information:
      </h6>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Nombre(s):
          </p>
          <p>{personalInfo.firstName || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Apellido Paterno:
          </p>
          <p>{personalInfo.lastNamePaternal || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Apellido Materno:
          </p>
          <p>{personalInfo.lastNameMaternal || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Correo Electrónico:
          </p>
          <p>{personalInfo.email || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Teléfono:
          </p>
          <p>
            {personalInfo.dialCode} {personalInfo.phone}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Telefono de Emergencia:
          </p>
          <p>{personalInfo.dialCode} {personalInfo.emergencyPhone}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Fecha de Nacimiento:
          </p>
          <p>{dayjs(personalInfo.dateOfBirth).format("DD/MM/YYYY")}</p>
        </div>
      </div>

      <h6 className="mt-8 border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
        Permanent Address:
      </h6>

      {getAddressNode(addressInfo)}


      <h6 className="mt-8 border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
        Foto del alumno:
      </h6>

      <div className="mt-4">
        {/*<div>*/}
        {/*  <p className="text-sm font-medium text-gray-800 dark:text-dark-100">*/}
        {/*    Document Type:*/}
        {/*  </p>*/}
        {/*  <p>{identifyDocument.type}</p>*/}
        {/*</div>*/}
        {/*<div className="mt-4 flex flex-col gap-4 sm:flex-row">*/}
        {/*  <div>*/}
        {/*    <p className="text-sm font-medium text-gray-800 dark:text-dark-100">*/}
        {/*      {identifyDocument.type === "passport"*/}
        {/*        ? "Passport Cover:"*/}
        {/*        : "Front Image:"}*/}
        {/*    </p>*/}
        {/*    <div className="mt-2 h-64 rounded-md border p-2 dark:border-dark-500">*/}
        {/*      <PreviewImg*/}
        {/*        file={identifyDocument.imageFront}*/}
        {/*        className="h-full w-full object-contain"*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*<div className="mt-4 space-y-4">*/}
        {/*  <div className="flex flex-col">*/}
        {/*    <Checkbox*/}
        {/*      {...register("agreed")}*/}
        {/*      label={*/}
        {/*        <>*/}
        {/*          I agree to the{" "}*/}
        {/*          <a*/}
        {/*            href="##"*/}
        {/*            className="text-primary-600 hover:underline dark:text-primary-400"*/}
        {/*          >*/}
        {/*            terms and conditions*/}
        {/*          </a>*/}
        {/*        </>*/}
        {/*      }*/}
        {/*    />*/}
        {/*    <InputErrorMsg when={errors?.agreed}>*/}
        {/*      {errors?.agreed?.message}*/}
        {/*    </InputErrorMsg>*/}
        {/*  </div>*/}
        {/*  <div className="grid gap-4 sm:grid-cols-2">*/}
        {/*    <Input*/}
        {/*      {...register("fullName")}*/}
        {/*      label="Signature"*/}
        {/*      placeholder="Enter Your Full Name"*/}
        {/*      error={errors?.fullName?.message}*/}
        {/*      suffix={*/}
        {/*        <ContextualHelp*/}
        {/*          title="Important Note!"*/}
        {/*          content={*/}
        {/*            <p>*/}
        {/*              By typing your full name above, you are providing us with*/}
        {/*              your digital signature, which is as legally binding as*/}
        {/*              your physical signature. Please note that your signature*/}
        {/*              must exactly match the first and last names that you*/}
        {/*              entered at the top of this web form in order for your*/}
        {/*              submission to be successful.*/}
        {/*            </p>*/}
        {/*          }*/}
        {/*        />*/}
        {/*      }*/}
        {/*    />*/}

        {/*    <div className="flex flex-col">*/}
        {/*      <Controller*/}
        {/*        render={({ field: { onChange, value, ...rest } }) => (*/}
        {/*          <DatePicker*/}
        {/*            onChange={onChange}*/}
        {/*            value={value || ""}*/}
        {/*            label="Date Signed"*/}
        {/*            error={errors?.dateSigned?.message}*/}
        {/*            options={{ disableMobile: true }}*/}
        {/*            placeholder="Choose date..."*/}
        {/*            {...rest}*/}
        {/*          />*/}
        {/*        )}*/}
        {/*        control={control}*/}
        {/*        name="dateSigned"*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
      <div className="mt-8 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(2)}>
          Back
        </Button>
        <Button
          type="submit"
          className="min-w-[7rem] space-x-2 "
          color="primary"
          disabled={loading}
          onClick = {addSubmit}
        >
          {loading && <GhostSpinner className="size-4 border-2" />}

          <span>Finish</span>
        </Button>
      </div>
    </form>
  );
}

function getAddressNode(address) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
          Ciudad:
        </p>
        <p>{address.city || "---"} </p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
          Estado:
        </p>
        <p>{address.state || "---"}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
          Código Postal:
        </p>
        <p>{address.zipCode || "---"}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
          Colonia:
        </p>
        <p>{address.colony || "---"}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
          Domicilio:
        </p>
        <p>{address.address || "---"}</p>
      </div>
    </div>
  );
}

Declaration.propTypes = {
  setCurrentStep: PropTypes.func,
  setFinished: PropTypes.func,
};
