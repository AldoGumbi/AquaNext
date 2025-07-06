// Import Dependencies
import { useState } from "react";
import clsx from "clsx";

// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { KYCFormProvider } from "./KYCFormProvider";
import { Basket } from "../../sale-point/pos/Basket";
import { UnderReview } from "./UnderReview";
import { AddressInfo } from "./steps/AddressInfo";
import { PersonalInfo } from "./steps/PersonalInfo";

// ----------------------------------------------------------------------

const steps = [
  {
    key: "personalInfo",
    component: PersonalInfo,
    label: "Inscripción",
    description:
      "Registrar / Renovar inscripción del alumno.",
  },
  {
    key: "addressInfo",
    component: AddressInfo,
    label: "Mensualidad",
    description: "Nueva mensualidad.",
  },
];

const KYCForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      <div className="col-span-12 sm:order-last sm:col-span-4 lg:col-span-3">
        <div className="sticky top-24 sm:mt-3">
          <Basket />
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
        <Card className="h-full p-4 sm:p-5">
          {/* Navegación horizontal de pasos */}
          {!finished && (
            <div className="mb-6 flex flex-wrap justify-center gap-2 rounded-lg bg-gray-800 p-1">
              {steps.map((step, index) => (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(index)}
                  className={clsx(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                    currentStep === index
                      ? "bg-white shadow dark:bg-surface-2 dark:text-dark-100"
                      : "hover:text-gray-800 focus:text-gray-800 dark:hover:text-dark-100 dark:focus:text-dark-100"
                  )}
                >
                  {step.label}
                </button>
              ))}
            </div>
          )}
          <h5 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            {steps[currentStep].label}
          </h5>
          <p className="text-sm text-gray-500 dark:text-dark-200 mb-4">
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
    <Page title="Nuevo Alumno">
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <h2 className="py-5 text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:py-6 lg:text-2xl">
          Nuevo Alumno
        </h2>

        <KYCFormProvider>
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
        </KYCFormProvider>
      </div>
    </Page>
  );
};

export default KYCForm;
