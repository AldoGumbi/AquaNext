// views/inscripciones/components/ConfirmacionPago.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    CheckCircleIcon,
    PrinterIcon,
    DocumentDuplicateIcon,
    UserIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    // CurrencyDollarIcon,
    ClockIcon,
    BanknotesIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    PlusIcon,
    // ArrowPathIcon,
    DocumentTextIcon,
    ShareIcon
} from "@heroicons/react/24/outline";

// Componentes
import { Button, Card } from "../../../../components/ui";
import { toast } from "sonner";

const TIPOS_TRANSACCION_LABELS = {
    'solo_inscripcion': 'Solo Inscripción',
    'solo_mensualidades': 'Solo Mensualidades',
    'inscripcion_con_mensualidades': 'Inscripción + Mensualidades'
};

const METODOS_PAGO_LABELS = {
    'efectivo': { label: 'Efectivo', icon: <BanknotesIcon className="h-5 w-5" /> },
    'tarjeta': { label: 'Tarjeta', icon: <CreditCardIcon className="h-5 w-5" /> },
    'transferencia': { label: 'Transferencia', icon: <DevicePhoneMobileIcon className="h-5 w-5" /> }
};

// const DIAS_SEMANA = {
//     'lunes': 'Lunes',
//     'martes': 'Martes',
//     'miercoles': 'Miércoles',
//     'jueves': 'Jueves',
//     'viernes': 'Viernes',
//     'sabado': 'Sábado',
//     'domingo': 'Domingo'
// };

const ConfirmacionPago = ({ 
    transaccion, 
    alumno, 
    tipoTransaccion, 
    metodoPago, 
    onNuevaTransaccion 
}) => {
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [copiado, setCopiado] = useState(false);

    // Animación de entrada exitosa
    const [animacionExito, setAnimacionExito] = useState(false);
    
    useEffect(() => {
        setAnimacionExito(true);
    }, []);

    // Generar número de folio formateado
    const folioFormateado = transaccion?.folio 
        ? `#${String(transaccion.folio).padStart(8, '0')}`
        : '#00000000';

    // Copiar folio al portapapeles
    const copiarFolio = async () => {
        try {
            await navigator.clipboard.writeText(folioFormateado);
            setCopiado(true);
            toast.success("Folio copiado al portapapeles");
            setTimeout(() => setCopiado(false), 2000);
        } catch (error) {
            console.error('Error al copiar:', error);
            toast.error("No se pudo copiar el folio");
        }
    };

    // Imprimir comprobante
    const imprimirComprobante = () => {
        // Implementar lógica de impresión
        window.print();
    };

    // Compartir información
    const compartirInfo = async () => {
        const texto = `Transacción exitosa
Folio: ${folioFormateado}
Alumno: ${alumno?.nombre} ${alumno?.apellido_paterno}
Monto: ${transaccion?.monto_total?.toFixed(2)}
Fecha: ${new Date().toLocaleDateString()}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Comprobante de Pago',
                    text: texto
                });
            } else {
                await navigator.clipboard.writeText(texto);
                toast.success("Información copiada al portapapeles");
            }
        } catch (error) {
            console.error('Error al compartir:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header de éxito */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                }}
            >
                <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: animacionExito ? 1 : 0 }}
                        transition={{ 
                            delay: 0.2,
                            duration: 0.6,
                            type: "spring",
                            stiffness: 150
                        }}
                        className="mb-4"
                    >
                        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="h-12 w-12 text-green-600" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                            ¡Transacción Exitosa!
                        </h1>
                        <p className="text-green-700 dark:text-green-300 mb-6">
                            El pago se ha procesado correctamente
                        </p>

                        {/* Folio */}
                        <div className="bg-white dark:bg-dark-800 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-center space-x-3">
                                <DocumentTextIcon className="h-6 w-6 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-dark-300">Folio de Transacción</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{folioFormateado}</p>
                                </div>
                                <Button
                                    onClick={copiarFolio}
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                >
                                    {copiado ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <DocumentDuplicateIcon className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Información rápida */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                <p className="text-gray-600 dark:text-dark-300">Monto Total</p>
                                <p className="text-xl font-bold text-green-600">
                                    ${transaccion?.monto_total?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                <p className="text-gray-600 dark:text-dark-300">Método de Pago</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    {METODOS_PAGO_LABELS[metodoPago]?.icon}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {METODOS_PAGO_LABELS[metodoPago]?.label}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                <p className="text-gray-600 dark:text-dark-300">Fecha y Hora</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información del alumno */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    {alumno?.foto ? (
                                        <img
                                            src={alumno.foto}
                                            alt={`${alumno.nombre} ${alumno.apellido_paterno}`}
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-dark-600 flex items-center justify-center">
                                            <UserIcon className="h-8 w-8 text-gray-600 dark:text-dark-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {alumno?.nombre} {alumno?.apellido_paterno} {alumno?.apellido_materno}
                                    </h3>
                                    <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-dark-300">
                                        {alumno?.telefono && <p>📞 {alumno.telefono}</p>}
                                        {alumno?.email && <p>✉️ {alumno.email}</p>}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                            {TIPOS_TRANSACCION_LABELS[tipoTransaccion]}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                            Pago Procesado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Detalles de la transacción */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Detalles de la Transacción
                                </h4>
                                <Button
                                    onClick={() => setMostrarDetalles(!mostrarDetalles)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {mostrarDetalles ? 'Ocultar' : 'Ver Detalles'}
                                </Button>
                            </div>

                            {/* Resumen básico */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-dark-300">Tipo de Transacción:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {TIPOS_TRANSACCION_LABELS[tipoTransaccion]}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-dark-300">Estado:</span>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-green-600">Completado</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles expandibles */}
                            {mostrarDetalles && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-200 dark:border-dark-600 pt-4"
                                >
                                    {/* Inscripción */}
                                    {transaccion?.inscripcion && (
                                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                                <h5 className="font-medium text-blue-900 dark:text-blue-100">
                                                    Inscripción Anual
                                                </h5>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-700 dark:text-blue-300">Duración:</span>
                                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                                        {transaccion.inscripcion.anos_vigencia} año(s)
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700 dark:text-blue-300">Válida hasta:</span>
                                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                                        {new Date(transaccion.inscripcion.fecha_fin).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mensualidades */}
                                    {transaccion?.mensualidades_creadas && transaccion.mensualidades_creadas.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    Mensualidades ({transaccion.mensualidades_creadas.length})
                                                </h5>
                                            </div>
                                            {transaccion.mensualidades_creadas.map((mensualidad, index) => (
                                                <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Período:</span>
                                                            <p className="font-medium text-green-900 dark:text-green-100">
                                                                {mensualidad.mes}/{mensualidad.year}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700 dark:text-green-300">Monto:</span>
                                                            <p className="font-medium text-green-900 dark:text-green-100">
                                                                ${mensualidad.monto?.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {mensualidad.grupos && mensualidad.grupos.length > 0 && (
                                                        <div className="mt-2">
                                                            <span className="text-xs text-green-700 dark:text-green-300">Grupos:</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {mensualidad.grupos.map((grupo, gIndex) => (
                                                                    <span key={gIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                        {grupo.grupo_codigo || `Grupo ${grupo.grupo_id}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Panel de acciones */}
                <div className="space-y-6">
                    {/* Acciones principales */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                    >
                        <Card className="p-6">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                📋 Acciones
                            </h4>
                            <div className="space-y-3">
                                <Button
                                    onClick={imprimirComprobante}
                                    variant="outline"
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    <PrinterIcon className="h-4 w-4" />
                                    <span>Imprimir Comprobante</span>
                                </Button>

                                <Button
                                    onClick={compartirInfo}
                                    variant="outline"
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    <ShareIcon className="h-4 w-4" />
                                    <span>Compartir Información</span>
                                </Button>

                                <Button
                                    onClick={copiarFolio}
                                    variant="outline"
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    {copiado ? (
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <DocumentDuplicateIcon className="h-4 w-4" />
                                    )}
                                    <span>{copiado ? 'Folio Copiado' : 'Copiar Folio'}</span>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Próximos pasos */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    >
                        <Card className="p-6">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                🎯 Próximos Pasos
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start space-x-3">
                                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Transacción Completada</p>
                                        <p className="text-gray-600 dark:text-dark-300">El pago ha sido procesado exitosamente</p>
                                    </div>
                                </div>

                                {transaccion?.inscripcion && (
                                    <div className="flex items-start space-x-3">
                                        <AcademicCapIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Inscripción Activa</p>
                                            <p className="text-gray-600 dark:text-dark-300">
                                                El alumno ya puede comprar mensualidades
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {transaccion?.mensualidades_creadas && transaccion.mensualidades_creadas.length > 0 && (
                                    <div className="flex items-start space-x-3">
                                        <CalendarDaysIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Clases Programadas</p>
                                            <p className="text-gray-600 dark:text-dark-300">
                                                Se han generado automáticamente las clases y asistencias
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3">
                                    <ClockIcon className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Acceso a Clases</p>
                                        <p className="text-gray-600 dark:text-dark-300">
                                            El alumno puede asistir según los horarios programados
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Botón para nueva transacción */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                    >
                        <Button
                            onClick={onNuevaTransaccion}
                            className="w-full h-12 text-lg flex items-center justify-center space-x-2"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Nueva Transacción</span>
                        </Button>
                    </motion.div>

                    {/* Información adicional */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6, duration: 0.5 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                    >
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            ℹ️ Información importante
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Guarda el folio de transacción para futuras referencias</li>
                            <li>• Las clases se activan automáticamente en las fechas programadas</li>
                            <li>• Puedes consultar el historial de pagos en cualquier momento</li>
                            <li>• Para dudas o cambios contacta al administrador</li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmacionPago;