// views/inscripciones/components/TipoTransaccionSelector.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { 
    AcademicCapIcon, 
    CalendarDaysIcon, 
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

// Componentes
import { Button, Card } from "../../../../components/ui";

const TIPOS_TRANSACCION = {
    SOLO_INSCRIPCION: 'solo_inscripcion',
    SOLO_MENSUALIDADES: 'solo_mensualidades',
    INSCRIPCION_CON_MENSUALIDADES: 'inscripcion_con_mensualidades'
};

const TipoTransaccionSelector = ({ 
    tieneInscripcionVigente, 
    inscripcionVigente, 
    onTipoSeleccionado, 
    onVolver, 
    tipoActual 
}) => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState(tipoActual);

    // Opciones de transacción
    const opcionesTransaccion = [
        {
            id: TIPOS_TRANSACCION.SOLO_INSCRIPCION,
            titulo: "Solo Inscripción",
            descripcion: "Registrar únicamente la inscripción anual del alumno",
            icono: <AcademicCapIcon className="h-8 w-8" />,
            color: "blue",
            disponible: !tieneInscripcionVigente,
            motivoNoDisponible: "El alumno ya tiene una inscripción vigente",
            ventajas: [
                "Inscripción válida por 1 año",
                "Permite comprar mensualidades después",
                "Proceso rápido y sencillo"
            ],
            precioEjemplo: "$500 - $1,500",
            duracion: "1-3 años"
        },
        {
            id: TIPOS_TRANSACCION.SOLO_MENSUALIDADES,
            titulo: "Solo Mensualidades",
            descripcion: "Comprar mensualidades para el alumno (requiere inscripción vigente)",
            icono: <CalendarDaysIcon className="h-8 w-8" />,
            color: "green",
            disponible: tieneInscripcionVigente,
            motivoNoDisponible: "El alumno debe tener una inscripción vigente primero",
            ventajas: [
                "Acceso inmediato a clases",
                "Flexible en fechas y grupos",
                "Puede comprar múltiples mensualidades"
            ],
            precioEjemplo: "$300 - $800",
            duracion: "1 mes por cada mensualidad"
        },
        {
            id: TIPOS_TRANSACCION.INSCRIPCION_CON_MENSUALIDADES,
            titulo: "Inscripción + Mensualidades",
            descripcion: "Proceso completo: inscripción anual más mensualidades en una sola transacción",
            icono: <ClipboardDocumentListIcon className="h-8 w-8" />,
            color: "purple",
            disponible: !tieneInscripcionVigente,
            motivoNoDisponible: "El alumno ya tiene una inscripción vigente",
            ventajas: [
                "Proceso completo en un solo paso",
                "Posibles descuentos por paquete",
                "El alumno queda listo para asistir"
            ],
            precioEjemplo: "$800 - $2,300",
            duracion: "Inscripción + mensualidades seleccionadas"
        }
    ];

    // Manejar selección
    const handleSeleccionarTipo = (tipo) => {
        const opcion = opcionesTransaccion.find(o => o.id === tipo);
        if (opcion && opcion.disponible) {
            setTipoSeleccionado(tipo);
        }
    };

    // Confirmar selección
    const handleConfirmarSeleccion = () => {
        if (tipoSeleccionado && onTipoSeleccionado) {
            onTipoSeleccionado(tipoSeleccionado);
        }
    };

    // Obtener colores por tipo
    const getColores = (color, disponible) => {
        if (!disponible) {
            return {
                border: 'border-gray-300 dark:border-dark-600',
                bg: 'bg-gray-50 dark:bg-dark-700',
                text: 'text-gray-400 dark:text-dark-400',
                icon: 'text-gray-400 dark:text-dark-400'
            };
        }

        const colores = {
            blue: {
                border: 'border-blue-200 dark:border-blue-800 hover:border-blue-300',
                bg: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
                text: 'text-blue-900 dark:text-blue-100',
                icon: 'text-blue-600 dark:text-blue-400'
            },
            green: {
                border: 'border-green-200 dark:border-green-800 hover:border-green-300',
                bg: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
                text: 'text-green-900 dark:text-green-100',
                icon: 'text-green-600 dark:text-green-400'
            },
            purple: {
                border: 'border-purple-200 dark:border-purple-800 hover:border-purple-300',
                bg: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30',
                text: 'text-purple-900 dark:text-purple-100',
                icon: 'text-purple-600 dark:text-purple-400'
            }
        };

        return colores[color] || colores.blue;
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Tipo de Transacción
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
                            Selecciona qué tipo de transacción deseas realizar
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onVolver}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>Volver</span>
                    </Button>
                </div>

                {/* Estado de inscripción */}
                {inscripcionVigente && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Inscripción vigente encontrada
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    Válida desde {new Date(inscripcionVigente.fecha_inscripcion).toLocaleDateString()} 
                                    hasta {new Date(inscripcionVigente.fecha_fin).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    {Math.ceil((new Date(inscripcionVigente.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24))} días restantes
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!tieneInscripcionVigente && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                    Sin inscripción vigente
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    El alumno necesita una inscripción activa para poder comprar mensualidades
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Opciones de transacción */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {opcionesTransaccion.map((opcion) => {
                        const colores = getColores(opcion.color, opcion.disponible);
                        const isSelected = tipoSeleccionado === opcion.id;
                        
                        return (
                            <motion.div
                                key={opcion.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`
                                    relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                                    ${isSelected 
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                        : colores.border
                                    }
                                    ${opcion.disponible 
                                        ? 'hover:shadow-md' 
                                        : 'cursor-not-allowed opacity-60'
                                    }
                                `}
                                onClick={() => handleSeleccionarTipo(opcion.id)}
                            >
                                {/* Indicador de selección */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                                    </div>
                                )}

                                {/* Icono y título */}
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className={`${isSelected ? 'text-primary-600' : colores.icon}`}>
                                        {opcion.icono}
                                    </div>
                                    <h4 className={`font-semibold ${isSelected ? 'text-primary-900 dark:text-primary-100' : colores.text}`}>
                                        {opcion.titulo}
                                    </h4>
                                </div>

                                {/* Descripción */}
                                <p className={`text-sm mb-4 ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-dark-300'}`}>
                                    {opcion.descripcion}
                                </p>

                                {/* Información de precio y duración */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-dark-400">Precio aprox:</span>
                                        <span className={`font-medium ${isSelected ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>
                                            {opcion.precioEjemplo}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-dark-400">Duración:</span>
                                        <span className={`font-medium ${isSelected ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>
                                            {opcion.duracion}
                                        </span>
                                    </div>
                                </div>

                                {/* Ventajas */}
                                <div className="space-y-1">
                                    <h5 className={`text-xs font-medium ${isSelected ? 'text-primary-800 dark:text-primary-200' : 'text-gray-700 dark:text-dark-200'}`}>
                                        Ventajas:
                                    </h5>
                                    <ul className="space-y-1">
                                        {opcion.ventajas.map((ventaja, index) => (
                                            <li key={index} className={`text-xs flex items-start space-x-1 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-dark-400'}`}>
                                                <span>•</span>
                                                <span>{ventaja}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Motivo de no disponibilidad */}
                                {!opcion.disponible && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
                                        <div className="flex items-start space-x-2">
                                            <InformationCircleIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-dark-400">
                                                {opcion.motivoNoDisponible}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Botón de confirmación */}
                {tipoSeleccionado && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 dark:border-dark-600 pt-6"
                    >
                        <div className="flex justify-end">
                            <Button
                                onClick={handleConfirmarSeleccion}
                                className="min-w-[120px]"
                            >
                                Continuar
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Información adicional */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        📋 Información importante
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• La inscripción es requerida para poder comprar mensualidades</li>
                        <li>• Las inscripciones tienen una vigencia anual desde la fecha de compra</li>
                        <li>• Las mensualidades se pueden comprar en cualquier momento del año</li>
                        <li>• Los precios mostrados son aproximados y pueden variar</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default TipoTransaccionSelector;