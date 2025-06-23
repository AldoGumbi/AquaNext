import { Link } from "react-router";
import checkImage from "assets/illustrations/check.png";
import { Button } from "components/ui";

export function UnderReview() {
  return (
    <div className="h-full text-center">
      <img
        src={checkImage}
        alt="Alumno registrado con éxito"
        className="mx-auto h-auto w-56 sm:w-64"
      />

      <p className="mt-6 pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
        Alumno guardado con éxito
      </p>
      <p className="mx-auto mt-2 max-w-lg text-balance sm:px-5">
        El alumno fue registrado correctamente. Puedes consultarlo en la lista
        de alumnos.
      </p>
      <Button
        color="primary"
        className="mt-8 w-full px-10 sm:w-auto"
        to="/students/all-students"
        component={Link}
      >
        Ir a lista de alumnos
      </Button>
    </div>
  );
}
