// Import Dependencies
import dayjs from "dayjs";
import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";

// Local Imports
import {
  Button,
  GhostSpinner,
} from "components/ui";
import { useTeacherFormContext } from "../TeacherFormContext";
import { useDispatch } from "react-redux";
import { addProfesorThunk } from "slices/thunk";

// ----------------------------------------------------------------------

export function Declaration({ setCurrentStep, setFinished }) {
  const teacherFormCtx = useTeacherFormContext();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const personalInfo = teacherFormCtx.state.formData.personalInfo;
  const addressInfo = teacherFormCtx.state.formData.addressInfo;
  const professionalInfo = teacherFormCtx.state.formData.professionalInfo;

  const handleFinalize = async () => {
    console.log('Finalizando registro del profesor...');
    try {
      setLoading(true);

      // Construir la dirección completa concatenando los campos
      const direccionCompleta = [
        addressInfo.calle,
        addressInfo.colonia,
        addressInfo.ciudad,
        addressInfo.estado,
        addressInfo.codigoPostal
      ].filter(Boolean).join(', ');

      const nuevoProfesor = {
        nombre: personalInfo.nombre,
        apellido: personalInfo.apellido,
        telefono: personalInfo.telefono,
        fecha_nacimiento: personalInfo.fecha_nacimiento,
        direccion: direccionCompleta,
        especialidad: professionalInfo.especialidad,
        fecha_contratacion: professionalInfo.fecha_contratacion,
        activo: true
      };

      // Enviar al servidor y manejar la respuesta de la API
      // Cualquier codigo de error que regrese la api, el unwrap lo atrapa, y lo manda al catch
      const result = await dispatch(addProfesorThunk(nuevoProfesor)).unwrap();
      
      console.log('Respuesta del servidor:', result);

      // Si llegamos aquí, fue exitoso
      toast.success('Profesor registrado exitosamente');
      
      // Actualizar el contexto
      teacherFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { declaration: { agreed: true, completedAt: new Date().toISOString() } },
      });
      
      teacherFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { declaration: { isDone: true } },
      });
      
      setFinished(true);

    } catch (error) {
      console.error('Error al registrar profesor:', error);
      toast.error(error.error.API_message || 'Error al registrar el profesor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Resumen de información */}
      <h6 className="mt-8 border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
        Información Personal:
      </h6>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Nombre:
          </p>
          <p>{personalInfo.nombre || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Apellido:
          </p>
          <p>{personalInfo.apellido || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Teléfono:
          </p>
          <p>{personalInfo.telefono || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Fecha de Nacimiento:
          </p>
          <p>{personalInfo.fecha_nacimiento ? dayjs(personalInfo.fecha_nacimiento).format("DD/MM/YYYY") : "---"}</p>
        </div>
      </div>

      <h6 className="mt-8 border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
        Domicilio:
      </h6>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Calle y número:
          </p>
          <p>{addressInfo.calle || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Colonia:
          </p>
          <p>{addressInfo.colonia || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Código postal:
          </p>
          <p>{addressInfo.codigoPostal || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Ciudad:
          </p>
          <p>{addressInfo.ciudad || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Estado:
          </p>
          <p>{addressInfo.estado || "---"}</p>
        </div>
        {addressInfo.referencias && (
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
              Referencias:
            </p>
            <p>{addressInfo.referencias}</p>
          </div>
        )}
      </div>

      <h6 className="mt-8 border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
        Información Profesional:
      </h6>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Especialidad:
          </p>
          <p>{professionalInfo.especialidad || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
            Fecha de Contratación:
          </p>
          <p>{professionalInfo.fecha_contratacion ? dayjs(professionalInfo.fecha_contratacion).format("DD/MM/YYYY") : "---"}</p>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h6 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          📋 Confirmación de registro
        </h6>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Verifica que toda la información sea correcta antes de finalizar. 
          Una vez confirmado, el profesor será registrado en el sistema.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-500">
        <Button 
          type="button"
          className="min-w-[7rem]" 
          onClick={() => setCurrentStep(2)}
          disabled={loading}
          variant="outline"
        >
          Regresar
        </Button>
        <Button
          type="button"
          onClick={handleFinalize}
          className="min-w-[7rem] space-x-2"
          color="primary"
          disabled={loading}
        >
          {loading && <GhostSpinner className="size-4 border-2" />}
          <span>{loading ? 'Guardando...' : 'Finalizar'}</span>
        </Button>
      </div>
    </div>
  );
}

Declaration.propTypes = {
  setCurrentStep: PropTypes.func,
  setFinished: PropTypes.func,
};