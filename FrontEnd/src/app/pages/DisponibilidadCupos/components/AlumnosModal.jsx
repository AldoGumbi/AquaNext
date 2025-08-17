// Import Dependencies
import PropTypes from "prop-types";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";

// Local Imports
import { Badge, Button } from "components/ui";

// Icons
import { 
  XMarkIcon, 
  UserIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function AlumnosModal({ isOpen, onClose, grupoCodigo, horario, alumnos, alumnosMesAnterior, cupoMaximo }) {
  const alumnosActuales = alumnos?.filter(a => a !== null) || [];
  const alumnosPrevios = alumnosMesAnterior?.filter(a => a !== null) || [];
  
  // Calcular cupos disponibles
  const totalOcupados = alumnosActuales.length + alumnosPrevios.length;
  const cuposDisponibles = (cupoMaximo || 16) - totalOcupados;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative flex w-full max-w-3xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
              <div>
                <DialogTitle
                  as="h3"
                  className="text-base font-medium text-gray-800 dark:text-dark-100"
                >
                  Alumnos en {grupoCodigo}
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                  {horario}
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="flat"
                isIcon
                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
              >
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6 max-h-96 overflow-y-auto sm:p-5">
              {/* Alumnos actuales */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-gray-900 dark:text-dark-100">
                    Alumnos Activos ({alumnosActuales.length})
                  </h4>
                </div>
                
                {alumnosActuales.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {alumnosActuales.map((alumno, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                            {alumno.nombre_completo}
                          </p>
                          <Badge color="success" size="sm">
                            Pagado
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-dark-400 italic">
                      No hay alumnos registrados en este grupo
                    </p>
                  </div>
                )}
              </div>

              {/* Alumnos del mes anterior */}
              {alumnosPrevios.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="font-medium text-gray-900 dark:text-dark-100">
                      Cupos Reservados - Mes Anterior ({alumnosPrevios.length})
                    </h4>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Cupos en período de gracia
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Estos alumnos pagaron el mes anterior pero aún no el actual. 
                          Tienen 5 días para renovar o se liberará su cupo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {alumnosPrevios.map((alumno, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                          <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                            {alumno.nombre_completo}
                          </p>
                          <Badge color="warning" size="sm">
                            Pendiente renovación
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de Ocupación */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600 pb-2">
                  Resumen de Ocupación
                </h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {alumnosActuales.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      Activos
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {alumnosPrevios.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      Reservados
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.max(0, cuposDisponibles)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      Disponibles
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600 dark:text-dark-300">
                      {cupoMaximo || 16}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      Total
                    </p>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-dark-300">
                    <span>Ocupación del grupo</span>
                    <span>{Math.round((totalOcupados / (cupoMaximo || 16)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      {/* Alumnos activos */}
                      <div 
                        className="bg-blue-600 transition-all duration-300"
                        style={{ 
                          width: `${(alumnosActuales.length / (cupoMaximo || 16)) * 100}%` 
                        }}
                      />
                      {/* Alumnos reservados */}
                      <div 
                        className="bg-yellow-500 transition-all duration-300"
                        style={{ 
                          width: `${(alumnosPrevios.length / (cupoMaximo || 16)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-dark-400">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                      Activos
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                      Reservados
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-dark-500 rounded-full mr-1"></div>
                      Disponibles
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-600 sm:px-5">
              <Button
                type="button"
                onClick={onClose}
                color="primary"
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

AlumnosModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  grupoCodigo: PropTypes.string.isRequired,
  horario: PropTypes.string.isRequired,
  alumnos: PropTypes.array,
  alumnosMesAnterior: PropTypes.array,
  cupoMaximo: PropTypes.number
};