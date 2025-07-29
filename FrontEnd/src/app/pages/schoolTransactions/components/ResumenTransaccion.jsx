// views/inscripciones/components/ResumenTransaccion.jsx
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { 
    UserIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    ArrowLeftIcon,
    CreditCardIcon,
    BanknotesIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Componentes
import { Button, Card, /**Select**/ } from "../../../../components/ui";

const TIPOS_TRANSACCION_LABELS = {
    'solo_inscripcion': 'Solo Inscripción',
    'solo_mensualidades': 'Solo Mensualidades',
    'inscripcion_con_mensualidades': 'Inscripción + Mensualidades'
};

const METODOS_PAGO = [
    { 
        value: 'efectivo', 
        label: 'Efectivo', 
        icon: <BanknotesIcon className="h-5 w-5" />,
        descripcion: 'Pago en efectivo al momento'
    },
    { 
        value: 'tarjeta', 
        label: 'Tarjeta', 
        icon: <CreditCardIcon className="h-5 w-5" />,
        descripcion: 'Pago con tarjeta de débito o crédito'
    },
    { 
        value: 'transferencia', 
        label: 'Transferencia', 
        icon: <DevicePhoneMobileIcon className="h-5 w-5" />,
        descripcion: 'Transferencia bancaria o digital'
    }
];

const DIAS_SEMANA = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
};

const ResumenTransaccion = ({ 
    alumno, 
    tipoTransaccion, 
    datosInscripcion, 
    datosMensualidades, 
    onConfirmar, 
    onVolver, 
    loading 
}) => {
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');
    const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);

    // Calcular totales
    const totales = useMemo(() => {
        let subtotal = 0;
        let descuentos = 0;

        // Sumar inscripción si existe
        if (datosInscripcion && (tipoTransaccion === 'solo_inscripcion' || tipoTransaccion === 'inscripcion_con_mensualidades')) {
            subtotal += parseFloat(datosInscripcion.monto || 0);
        }

        // Sumar mensualidades si existen
        if (datosMensualidades && Array.isArray(datosMensualidades)) {
            datosMensualidades.forEach(mensualidad => {
                subtotal += parseFloat(mensualidad.monto_total || 0);
                descuentos += parseFloat(mensualidad.descuento_aplicado || 0);
            });
        }

        const total = subtotal - descuentos;

        return { subtotal, descuentos, total };
    }, [datosInscripcion, datosMensualidades, tipoTransaccion]);

    // Contar elementos
    const conteos = useMemo(() => {
        let totalGrupos = 0;
        let totalHorarios = 0;
        let totalMensualidades = datosMensualidades?.length || 0;

        if (datosMensualidades && Array.isArray(datosMensualidades)) {
            datosMensualidades.forEach(mensualidad => {
                if (mensualidad.grupos && Array.isArray(mensualidad.grupos)) {
                    totalGrupos += mensualidad.grupos.length;
                    mensualidad.grupos.forEach(grupo => {
                        if (grupo.horarios && Array.isArray(grupo.horarios)) {
                            totalHorarios += grupo.horarios.length;
                        }
                    });
                }
            });
        }

        return { totalMensualidades, totalGrupos, totalHorarios };
    }, [datosMensualidades]);

    // Manejar confirmación
    const handleConfirmar = () => {
        if (totales.total <= 0) {
            return;
        }
        setConfirmacionAbierta(true);
    };

    // Procesar pago
    const procesarPago = () => {
        if (onConfirmar) {
            onConfirmar(metodoPagoSeleccionado);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Resumen de la Transacción
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                                Revisa todos los detalles antes de procesar el pago
                            </p>
                        </div>
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
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal - Detalles */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Información del alumno */}
                    <Card className="p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                {alumno.foto ? (
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
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno}
                                </h4>
                                <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-dark-300">
                                    {alumno.telefono && (
                                        <p>📞 {alumno.telefono}</p>
                                    )}
                                    {alumno.email && (
                                        <p>✉️ {alumno.email}</p>
                                    )}
                                    {alumno.fecha_nacimiento && (
                                        <p>🎂 {new Date().getFullYear() - new Date(alumno.fecha_nacimiento).getFullYear()} años</p>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                        {TIPOS_TRANSACCION_LABELS[tipoTransaccion]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Detalles de inscripción */}
                    {datosInscripcion && (tipoTransaccion === 'solo_inscripcion' || tipoTransaccion === 'inscripcion_con_mensualidades') && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Inscripción Anual
                                    </h4>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <span className="text-sm text-gray-600 dark:text-dark-300">Duración:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {datosInscripcion.anos_inscripcion} año{datosInscripcion.anos_inscripcion > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 dark:text-dark-300">Válida desde:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {dayjs().format('DD-MM-YYYY')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 dark:text-dark-300">Válida hasta:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {dayjs().add(datosInscripcion.anos_inscripcion, 'year').subtract(1, 'day').format('DD-MM-YYYY')}
                                        </p>
                                    </div>
                                </div>

                                {datosInscripcion.observaciones && (
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-dark-300">Observaciones:</span>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {datosInscripcion.observaciones}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-dark-600">
                                    <span className="text-sm text-gray-600 dark:text-dark-300">Monto de Inscripción:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ${parseFloat(datosInscripcion.monto).toFixed(2)}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Detalles de mensualidades */}
                    {datosMensualidades && Array.isArray(datosMensualidades) && datosMensualidades.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <Card className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Mensualidades ({datosMensualidades.length})
                                    </h4>
                                </div>

                                <div className="space-y-6">
                                    {datosMensualidades.map((mensualidad, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    Mensualidad {index + 1}
                                                </h5>
                                                <span className="text-sm text-gray-600 dark:text-dark-300">
                                                    {dayjs(mensualidad.fecha_inicio).format('DD-MM-YYYY')} - {dayjs(mensualidad.fecha_fin).format('DD-MM-YYYY')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <span className="text-sm text-gray-600 dark:text-dark-300">Duración:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {Math.ceil((new Date(mensualidad.fecha_fin) - new Date(mensualidad.fecha_inicio)) / (1000 * 60 * 60 * 24)) + 1} días
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600 dark:text-dark-300">Método de pago:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {METODOS_PAGO.find(m => m.value === mensualidad.metodo_pago)?.label || mensualidad.metodo_pago}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Grupos y horarios */}
                                            <div className="space-y-3">
                                                <h6 className="text-sm font-medium text-gray-700 dark:text-dark-200">
                                                    Grupos y Horarios:
                                                </h6>
                                                {mensualidad.grupos?.map((grupo, grupoIndex) => (
                                                    <div key={grupoIndex} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <UserGroupIcon className="h-4 w-4 text-gray-600" />
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {grupo.grupo_codigo || `Grupo ${grupo.grupo_id}`}
                                                            </span>
                                                            {grupo.grupo_nombre && (
                                                                <span className="text-sm text-gray-600 dark:text-dark-300">
                                                                    - {grupo.grupo_nombre}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* VERIFICAR SI HAY HORARIOS VÁLIDOS */}
                                                        {grupo.horarios && grupo.horarios.length > 0 ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {grupo.horarios.map((horario, horarioIndex) => (
                                                                    <div key={horarioIndex} className="flex items-center space-x-2 text-sm">
                                                                        <ClockIcon className="h-3 w-3 text-gray-500" />
                                                                        <span className="text-gray-700 dark:text-dark-300">
                                                                            {/* MANEJO SEGURO DE DATOS DE HORARIO */}
                                                                            {horario.dia ? 
                                                                                `${DIAS_SEMANA[horario.dia] || horario.dia} ${horario.hora_inicio} - ${horario.hora_fin}` :
                                                                                `Horario ID: ${horario.horario_id}`
                                                                            }
                                                                            {horario.nombre_profesor && (
                                                                                <span className="text-xs text-gray-500 ml-1">
                                                                                    ({horario.nombre_profesor})
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                                                                <ExclamationTriangleIcon className="h-4 w-4" />
                                                                <span>No se encontraron horarios para este grupo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Información financiera */}
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-dark-300">Subtotal:</span>
                                                    <span className="font-medium">${parseFloat(mensualidad.monto_total).toFixed(2)}</span>
                                                </div>
                                                {mensualidad.descuento_aplicado > 0 && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600 dark:text-dark-300">Descuento:</span>
                                                        <span className="font-medium text-red-600">-${parseFloat(mensualidad.descuento_aplicado).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-base font-bold">
                                                    <span>Total mensualidad:</span>
                                                    <span className="text-green-600">
                                                        ${(parseFloat(mensualidad.monto_total) - parseFloat(mensualidad.descuento_aplicado || 0)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Columna lateral - Resumen y pago */}
                <div className="space-y-6">
                    {/* Resumen financiero */}
                    <Card className="p-6">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            💰 Resumen Financiero
                        </h4>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-dark-300">Subtotal:</span>
                                <span className="font-medium">${totales.subtotal.toFixed(2)}</span>
                            </div>
                            
                            {totales.descuentos > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-dark-300">Descuentos:</span>
                                    <span className="font-medium text-red-600">-${totales.descuentos.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="border-t border-gray-200 dark:border-dark-600 pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total a Pagar:</span>
                                    <span className="text-2xl text-green-600">${totales.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Estadísticas */}
                    <Card className="p-6">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            📊 Resumen de Servicios
                        </h4>

                        <div className="space-y-3">
                            {(tipoTransaccion === 'solo_inscripcion' || tipoTransaccion === 'inscripcion_con_mensualidades') && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <AcademicCapIcon className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-gray-600 dark:text-dark-300">Inscripciones:</span>
                                    </div>
                                    <span className="font-medium">1</span>
                                </div>
                            )}

                            {conteos.totalMensualidades > 0 && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <CalendarDaysIcon className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600 dark:text-dark-300">Mensualidades:</span>
                                        </div>
                                        <span className="font-medium">{conteos.totalMensualidades}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <UserGroupIcon className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm text-gray-600 dark:text-dark-300">Grupos:</span>
                                        </div>
                                        <span className="font-medium">{conteos.totalGrupos}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ClockIcon className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm text-gray-600 dark:text-dark-300">Horarios:</span>
                                        </div>
                                        <span className="font-medium">{conteos.totalHorarios}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Método de pago */}
                    {!confirmacionAbierta && (
                        <Card className="p-6">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                💳 Método de Pago
                            </h4>

                            <div className="space-y-3">
                                {METODOS_PAGO.map((metodo) => (
                                    <div
                                        key={metodo.value}
                                        className={`
                                            border rounded-lg p-3 cursor-pointer transition-all duration-200
                                            ${metodoPagoSeleccionado === metodo.value
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                                            }
                                        `}
                                        onClick={() => setMetodoPagoSeleccionado(metodo.value)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`${metodoPagoSeleccionado === metodo.value ? 'text-primary-600' : 'text-gray-400'}`}>
                                                {metodo.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className={`font-medium ${metodoPagoSeleccionado === metodo.value ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'}`}>
                                                    {metodo.label}
                                                </h5>
                                                <p className={`text-xs ${metodoPagoSeleccionado === metodo.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-dark-300'}`}>
                                                    {metodo.descripcion}
                                                </p>
                                            </div>
                                            {metodoPagoSeleccionado === metodo.value && (
                                                <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Botón de confirmación */}
                    {!confirmacionAbierta ? (
                        <Button
                            onClick={handleConfirmar}
                            disabled={totales.total <= 0}
                            className="w-full h-12 text-lg"
                        >
                            Procesar Pago - ${totales.total.toFixed(2)}
                        </Button>
                    ) : (
                        <Card className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                            <div className="flex items-start space-x-3 mb-4">
                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                        Confirmar Transacción
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                        ¿Está seguro de procesar esta transacción por <strong>${totales.total.toFixed(2)}</strong> mediante {METODOS_PAGO.find(m => m.value === metodoPagoSeleccionado)?.label}?
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3">
                                <Button
                                    onClick={() => setConfirmacionAbierta(false)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={procesarPago}
                                    disabled={loading}
                                    size="sm"
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Procesando...</span>
                                        </div>
                                    ) : (
                                        "Confirmar Pago"
                                    )}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Información adicional */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            ℹ️ Información importante
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Una vez procesado el pago no se pueden realizar cambios</li>
                            <li>• Se generarán automáticamente las clases y asistencias</li>
                            <li>• El alumno podrá acceder a las clases desde las fechas programadas</li>
                            <li>• Se enviará un comprobante de la transacción</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumenTransaccion;