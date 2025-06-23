// Import Dependencies
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";
import { Button } from "components/ui";
import { useForm } from "react-hook-form";
import { CameraIcon } from "@heroicons/react/24/outline"; // ícono de cámara

// Local Imports
import { useKYCFormContext } from "../KYCFormContext";

// ----------------------------------------------------------------------

export function Idenfication({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const { handleSubmit, setValue } = useForm({
    defaultValues: {
      selfie: null,
    },
  });

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setValue("selfie", imageSrc);
    setShowCamera(false);
  };

  const onSubmit = (data) => {
    // Ya no es obligatorio tomar la foto antes de continuar
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { identifyDocument: { selfie: data.selfie } },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { identifyDocument: { isDone: true } },
    });
    setCurrentStep(3);
  };

  return (
    <form
      className="max-w-3xl mx-auto"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold mb-6 text-center">
        Toma una fotografía para el alumno
      </h2>

      <div className="flex flex-col items-center gap-4">
        {!showCamera && (
          <div
            className={`w-64 h-48 flex items-center justify-center border-2 ${
              capturedImage ? "border-green-500" : "border-dashed border-gray-400"
            } rounded cursor-pointer`}
            onClick={() => setShowCamera(true)}
          >
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="object-cover w-full h-full rounded"
              />
            ) : (
              <CameraIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
        )}

        {showCamera && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="rounded shadow-md w-full max-w-md"
            />
            <Button
              type="button"
              onClick={capture}
              className="bg-blue-600 text-white"
            >
              Tomar Foto
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(1)}>
          Regresar
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Siguiente
        </Button>
      </div>
    </form>
  );
}

Idenfication.propTypes = {
  setCurrentStep: PropTypes.func,
};
