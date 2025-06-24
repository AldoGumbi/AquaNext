// Import Dependencies
import { useState } from "react";
import clsx from "clsx";

// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { TeacherFormProvider } from "./TeacherFormProvider.jsx";
import { Stepper } from "./Stepper";
import { UnderReview } from "./UnderReview";
import { AddressInfo } from "./steps/AddressInfo";
import { Declaration } from "./steps/Declaration";
import { PersonalInfo } from "./steps/PersonalInfo";
import { ProfessionalInfo } from "./steps/ProfessionalInfo";

// ----------------------------------------------------------------------

const steps = [
  {
    key: "personalInfo",
    component: PersonalInfo,
    label: "Información Personal",
    description: "Por favor, ingrese la información personal del profesor",
  },
  {
    key: "addressInfo",
    component: AddressInfo,
    label: "Domicilio",
    description: "Ingrese el domicilio del profesor.",
  },
  {
    key: "professionalInfo",
    component: ProfessionalInfo,
    label: "Información Profesional",
    description: "Ingrese la especialidad y fecha de contratación.",
  },
  {
    key: "declaration",
    component: Declaration,
    label: "Confirmación",
    description: "Verifique la información ingresada y click en Finalizar para guardar.",
  },
];

const TeacherForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      <div className="col-span-12 sm:order-last sm:col-span-4 lg:col-span-3">
        <div className="sticky top-24 sm:mt-3">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
        <Card className="h-full p-4 sm:p-5">
          <h5 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            {steps[currentStep].label}
          </h5>
          <p className="text-sm text-gray-500 dark:text-dark-200">
            {steps[currentStep].description}
          </p>
          {!finished && (
            <ActiveForm
              setCurrentStep={setCurrentStep}
              setFinished={setFinished}
            />
          )}
        </Card>
      </div>
    </>
  );

  return (
    <Page title="Nuevo Profesor">
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <h2 className="py-5 text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:py-6 lg:text-2xl">
          Nuevo Profesor
        </h2>

        <TeacherFormProvider>
          <div
            className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
              !finished && "grid-rows-[auto_1fr] sm:grid-rows-none "
            )}
          >
            {finished ? (
              <div className="col-span-12 place-self-center">
                <UnderReview />
              </div>
            ) : (
              stepsNode
            )}
          </div>
        </TeacherFormProvider>
      </div>
    </Page>
  );
};

export default TeacherForm;