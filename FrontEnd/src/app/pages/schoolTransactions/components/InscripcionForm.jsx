// views/inscripciones/components/InscripcionForm.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { DateTime } from "luxon";
import { 
    AcademicCapIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    ArrowLeftIcon,
    InformationCircleIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";

// Componentes
import { Button, Card, Textarea, Select } from "../../../../components/ui";

// Schema de validación simplificado
const inscripcionSchema = Yup.object().shape({
    anos_inscripcion: Yup.number()
        .min(1, 'Mínimo 1 año')
        .max(5, 'Máximo 5 años')
        .required('Los años de inscripción son requeridos'),
    monto: Yup.number()
        .min(1, 'El monto debe ser mayor a 0')
        .required('El monto es requerido'),
    observaciones: Yup.string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
});

// Tarifa fija: $300 por año
const TARIFA_POR_ANO = 300;

const InscripcionForm = ({ datosIniciales, onDatosCompletos, onVolver, loading }) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(inscripcionSchema),
        defaultValues: {
            anos_inscripcion: datosIniciales?.anos_inscripcion || 1,
            monto: datosIniciales?.monto || TARIFA_POR_ANO,
            observaciones: datosIniciales?.observaciones || ''
        }
    });

    const anosWatch = watch("anos_inscripcion");

    // Actualizar monto automáticamente cuando cambian los años
    useEffect(() => {
        if (anosWatch) {
            const montoCalculado = TARIFA_POR_ANO * parseInt(anosWatch);
            setValue("monto", montoCalculado);
        }
    }, [anosWatch, setValue]);

    // Enviar datos
    const onSubmit = (data) => {
        const datosFormateados = {
            ...data,
            anos_inscripcion: parseInt(data.anos_inscripcion),
            monto: parseFloat(data.monto)
        };

        if (onDatosCompletos) {
            onDatosCompletos(datosFormateados);
        }
    };

    // Calcular fechas de vigencia con Luxon
    const getFechasVigencia = () => {
        const fechaInicio = DateTime.now().setZone('America/Mexico_City');
        const fechaFin = fechaInicio.plus({ years: parseInt(anosWatch || 1) }).minus({ days: 1 });
        
        return {
            inicio: fechaInicio.toFormat('dd/MM/yyyy'),
            fin: fechaFin.toFormat('dd/MM/yyyy'),
            inicioISO: fechaInicio.toISODate(),
            finISO: fechaFin.toISODate()
        };
    };

    const fechasVigencia = getFechasVigencia();
    const montoTotal = TARIFA_POR_ANO * parseInt(anosWatch || 1);

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Datos de Inscripción Anual
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                                Configure la inscripción anual del alumno - Tarifa fija $300 por año
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onVolver}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>Volver</span>
                    </Button>
                </div>

                {/* Información de vigencia con fechas formateadas */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <CalendarDaysIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Período de Vigencia
                            </h4>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-blue-600 dark:text-blue-400">Fecha de inicio:</span>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        {fechasVigencia.inicio}
                                    </p>
                                    <span className="text-xs text-blue-500 dark:text-blue-400">(Hoy)</span>
                                </div>
                                <div>
                                    <span className="text-xs text-blue-600 dark:text-blue-400">Fecha de vencimiento:</span>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        {fechasVigencia.fin}
                                    </p>
                                    <span className="text-xs text-blue-500 dark:text-blue-400">
                                        ({anosWatch || 1} año{(anosWatch > 1) ? 's' : ''} de vigencia)
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300">
                                💡 <strong>Importante:</strong> La inscripción vence exactamente el día anterior al aniversario de compra
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Años de inscripción */}
                    <div className="space-y-2">
                        <Select
                            {...register("anos_inscripcion")}
                            label="Duración de la Inscripción*"
                            error={errors.anos_inscripcion?.message}
                        >
                            <option value="">Selecciona la duración</option>
                            <option value="1">1 año - $300</option>
                            <option value="2">2 años - $600</option>
                            <option value="3">3 años - $900</option>
                            <option value="4">4 años - $1,200</option>
                            <option value="5">5 años - $1,500</option>
                        </Select>
                        
                        {/* Confirmación visual de la tarifa */}
                        {anosWatch && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center space-x-2 text-sm"
                            >
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 dark:text-green-300">
                                    Tarifa aplicada: $300 × {anosWatch} año{anosWatch > 1 ? 's' : ''} = ${montoTotal.toLocaleString()}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Monto (solo lectura, calculado automáticamente) */}
                    <div className="space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                                Monto Total*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 dark:text-dark-300" />
                                </div>
                                <input
                                    {...register("monto")}
                                    type="text"
                                    readOnly
                                    className="
                                        block w-full rounded-lg border border-gray-300 dark:border-dark-500 
                                        bg-gray-100 dark:bg-dark-600 px-3 py-2.5 pl-10 text-sm
                                        text-gray-700 dark:text-dark-200 cursor-not-allowed
                                        focus:outline-none
                                    "
                                    value={`$${montoTotal.toLocaleString()}`}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                                💰 Monto calculado automáticamente - Tarifa fija $300 por año
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información sobre la tarifa fija */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <span className="text-lg">💰</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                Tarifa Única de Inscripción
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        <strong>Precio por año:</strong> $300 pesos mexicanos
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        <strong>Sin descuentos:</strong> Precio fijo para todos
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        <strong>Válida desde:</strong> {fechasVigencia.inicio}
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        <strong>Hasta:</strong> {fechasVigencia.fin}
                                    </p>
                                </div>
                            </div>
                            
                            {anosWatch > 1 && (
                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-green-700 dark:text-green-300">
                                            Total por {anosWatch} años:
                                        </span>
                                        <span className="text-lg font-bold text-green-800 dark:text-green-200">
                                            ${montoTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Observaciones */}
                <div>
                    <Textarea
                        {...register("observaciones")}
                        label="Observaciones (Opcional)"
                        placeholder="Notas adicionales sobre la inscripción del alumno..."
                        rows={3}
                        error={errors.observaciones?.message}
                    />
                    <div className="text-xs text-gray-500 dark:text-dark-400 mt-1 flex justify-between">
                        <span>{watch("observaciones")?.length || 0}/500 caracteres</span>
                        <span className="text-gray-400">Opcional - Para notas internas</span>
                    </div>
                </div>

                {/* Información importante */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <InformationCircleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                                ℹ️ Información Importante sobre la Inscripción
                            </h4>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                <li>• <strong>Vigencia:</strong> La inscripción es válida desde hoy por el período seleccionado</li>
                                <li>• <strong>Vencimiento:</strong> Expira el día anterior al aniversario de compra</li>
                                <li>• <strong>Requisito:</strong> Obligatorio para poder comprar mensualidades de clases</li>
                                <li>• <strong>Tarifa:</strong> Precio fijo de $300 pesos por cada año de vigencia</li>
                                <li>• <strong>Sin reembolsos:</strong> No se realizan devoluciones una vez procesada</li>
                                <li>• <strong>Renovación:</strong> Se puede renovar antes del vencimiento</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Resumen visual */}
                {anosWatch && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6"
                    >
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                            📋 Resumen de la Inscripción
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-white dark:bg-dark-800 rounded-lg border">
                                <p className="text-xs text-gray-600 dark:text-dark-300">Duración</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {anosWatch} año{anosWatch > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-dark-800 rounded-lg border">
                                <p className="text-xs text-gray-600 dark:text-dark-300">Monto Total</p>
                                <p className="text-lg font-bold text-green-600">
                                    ${montoTotal.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-dark-800 rounded-lg border">
                                <p className="text-xs text-gray-600 dark:text-dark-300">Válida Desde</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {fechasVigencia.inicio}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-dark-800 rounded-lg border">
                                <p className="text-xs text-gray-600 dark:text-dark-300">Vence el</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {fechasVigencia.fin}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                ✅ <strong>Lista para procesar:</strong> Inscripción de {anosWatch} año{anosWatch > 1 ? 's' : ''} por ${montoTotal.toLocaleString()}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-dark-600">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onVolver}
                        disabled={loading}
                    >
                        Volver
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !anosWatch}
                        className="min-w-[140px]"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            `Continuar - $${montoTotal.toLocaleString()}`
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default InscripcionForm;