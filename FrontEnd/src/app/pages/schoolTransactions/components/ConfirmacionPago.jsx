// views/inscripciones/components/ConfirmacionPago.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { 
    CheckCircleIcon,
    PrinterIcon,
    DocumentDuplicateIcon,
    UserIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    ClockIcon,
    BanknotesIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    PlusIcon,
    DocumentTextIcon,
    ShareIcon
} from "@heroicons/react/24/outline";

// Componentes
import { Button, Card } from "../../../../components/ui";
import { toast } from "sonner";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.locale('es-mx');

// Constantes
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

const TIMEZONE_MEXICO = 'America/Mexico_City';

const ConfirmacionPago = ({ 
    transaccion, 
    alumno, 
    tipoTransaccion, 
    metodoPago, 
    onNuevaTransaccion 
}) => {
    // Estados locales
    const [mostrarDetalles, setMostrarDetalles] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [animacionExito, setAnimacionExito] = useState(false);
    
    // Inicializar animación
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimacionExito(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    // Función para formatear fechas en formato mexicano
    const formatearFechaMexicana = useCallback((fecha) => {
        if (!fecha) return 'Fecha no disponible';
        
        try {
            return dayjs(fecha)
                .tz(TIMEZONE_MEXICO)
                .format('D [de] MMMM [de] YYYY');
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    }, []);

    // Función para formatear fecha y hora actual
    const formatearFechaHoraActual = useCallback(() => {
        try {
            const ahora = dayjs().tz(TIMEZONE_MEXICO);
            return {
                fecha: ahora.format('D [de] MMMM [de] YYYY'),
                hora: ahora.format('HH:mm:ss')
            };
        } catch (error) {
            console.error('Error al obtener fecha/hora actual:', error);
            return {
                fecha: 'Fecha no disponible',
                hora: 'Hora no disponible'
            };
        }
    }, []);

    // 🔥 NUEVA FUNCIÓN: Formatear período completo de mensualidad
    const formatearPeriodoCompletoMensualidad = useCallback((mensualidad) => {
        if (!mensualidad) return 'Período no disponible';
        
        try {
            // Intentar obtener fechas desde diferentes fuentes posibles
            let fechaInicio = null;
            let fechaFin = null;
            
            // Opción 1: Si tiene fecha_inicio y fecha_fin directamente
            if (mensualidad.fecha_inicio && mensualidad.fecha_fin) {
                fechaInicio = dayjs(mensualidad.fecha_inicio);
                fechaFin = dayjs(mensualidad.fecha_fin);
            }
            // Opción 2: Si tiene mes, año y duración en meses
            else if (mensualidad.mes && mensualidad.year && mensualidad.meses_duracion) {
                fechaInicio = dayjs().year(mensualidad.year).month(mensualidad.mes - 1).startOf('month');
                fechaFin = fechaInicio.add(mensualidad.meses_duracion - 1, 'month').endOf('month');
            }
            // Opción 3: Solo mes y año (mensualidad de 1 mes)
            else if (mensualidad.mes && mensualidad.year) {
                fechaInicio = dayjs().year(mensualidad.year).month(mensualidad.mes - 1).startOf('month');
                fechaFin = fechaInicio.endOf('month');
            }
            
            // Si no pudimos determinar las fechas, mostrar información básica
            if (!fechaInicio || !fechaFin || !fechaInicio.isValid() || !fechaFin.isValid()) {
                if (mensualidad.mes && mensualidad.year) {
                    return dayjs().year(mensualidad.year).month(mensualidad.mes - 1).format('MMMM [de] YYYY');
                }
                return 'Período no disponible';
            }
            
            // Verificar si es el mismo mes y año
            const mismoMesYear = fechaInicio.isSame(fechaFin, 'month') && fechaInicio.isSame(fechaFin, 'year');
            
            if (mismoMesYear) {
                // Mismo mes: "Enero de 2024"
                return fechaInicio.format('MMMM [de] YYYY');
            } else if (fechaInicio.isSame(fechaFin, 'year')) {
                // Mismo año: "Enero - Marzo de 2024"
                return `${fechaInicio.format('MMMM')} - ${fechaFin.format('MMMM [de] YYYY')}`;
            } else {
                // Diferentes años: "Diciembre de 2023 - Febrero de 2024"
                return `${fechaInicio.format('MMMM [de] YYYY')} - ${fechaFin.format('MMMM [de] YYYY')}`;
            }
            
        } catch (error) {
            console.error('Error al formatear período completo:', error);
            // Fallback al método original
            if (mensualidad.mes && mensualidad.year) {
                const fechaPeriodo = dayjs().year(mensualidad.year).month(mensualidad.mes - 1);
                return fechaPeriodo.format('MMMM [de] YYYY');
            }
            return 'Período no disponible';
        }
    }, []);

    // 🔥 NUEVA FUNCIÓN: Obtener información detallada del período
    const obtenerInfoPeriodo = useCallback((mensualidad) => {
        if (!mensualidad) return null;
        
        try {
            let fechaInicio = null;
            let fechaFin = null;
            let duracionMeses = 1;
            
            // Determinar fechas y duración
            if (mensualidad.fecha_inicio && mensualidad.fecha_fin) {
                fechaInicio = dayjs(mensualidad.fecha_inicio);
                fechaFin = dayjs(mensualidad.fecha_fin);
                duracionMeses = fechaFin.diff(fechaInicio, 'month') + 1;
            } else if (mensualidad.mes && mensualidad.year && mensualidad.meses_duracion) {
                fechaInicio = dayjs().year(mensualidad.year).month(mensualidad.mes - 1).startOf('month');
                fechaFin = fechaInicio.add(mensualidad.meses_duracion - 1, 'month').endOf('month');
                duracionMeses = mensualidad.meses_duracion;
            } else if (mensualidad.mes && mensualidad.year) {
                fechaInicio = dayjs().year(mensualidad.year).month(mensualidad.mes - 1).startOf('month');
                fechaFin = fechaInicio.endOf('month');
                duracionMeses = 1;
            }
            
            if (!fechaInicio || !fechaFin || !fechaInicio.isValid() || !fechaFin.isValid()) {
                return null;
            }
            
            return {
                fechaInicio,
                fechaFin,
                duracionMeses,
                periodoFormateado: formatearPeriodoCompletoMensualidad(mensualidad),
                fechasDetalladas: {
                    inicio: fechaInicio.format('D [de] MMMM [de] YYYY'),
                    fin: fechaFin.format('D [de] MMMM [de] YYYY')
                }
            };
            
        } catch (error) {
            console.error('Error al obtener info del período:', error);
            return null;
        }
    }, [formatearPeriodoCompletoMensualidad]);

    // Función para formatear período de mensualidad (MANTENIDA PARA COMPATIBILIDAD)
    const formatearPeriodoMensualidad = useCallback((mes, year) => {
        if (!mes || !year) return 'Período no disponible';
        
        try {
            // Crear fecha con el mes y año proporcionados
            const fechaPeriodo = dayjs().year(year).month(mes - 1); // mes - 1 porque dayjs usa 0-11
            return fechaPeriodo.format('MMMM [de] YYYY');
        } catch (error) {
            console.error('Error al formatear período:', error);
            return `${mes}/${year}`;
        }
    }, []);

    // Memoizar el folio formateado
    const folioFormateado = useMemo(() => {
        return transaccion?.folio 
            ? `#${String(transaccion.folio).padStart(8, '0')}`
            : '#00000000';
    }, [transaccion?.folio]);

    // Memoizar la fecha y hora actual
    const fechaHoraActual = useMemo(() => {
        return formatearFechaHoraActual();
    }, [formatearFechaHoraActual]);

    // Memoizar el monto total formateado
    const montoTotalFormateado = useMemo(() => {
        const monto = transaccion?.monto_total;
        if (typeof monto !== 'number' || isNaN(monto)) {
            return '0.00';
        }
        return monto.toFixed(2);
    }, [transaccion?.monto_total]);

    // Copiar folio al portapapeles
    const copiarFolio = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(folioFormateado);
            setCopiado(true);
            toast.success("Folio copiado al portapapeles");
            
            // Reset estado después de 2 segundos
            setTimeout(() => {
                setCopiado(false);
            }, 2000);
        } catch (error) {
            console.error('Error al copiar folio:', error);
            toast.error("No se pudo copiar el folio");
        }
    }, [folioFormateado]);

    // Imprimir comprobante
    const imprimirComprobante = useCallback(() => {
        try {
            window.print();
        } catch (error) {
            console.error('Error al imprimir:', error);
            toast.error("No se pudo imprimir el comprobante");
        }
    }, []);

    // Compartir información
    const compartirInfo = useCallback(async () => {
        const nombreCompleto = `${alumno?.nombre || ''} ${alumno?.apellido_paterno || ''}`.trim();
        const texto = `Transacción exitosa
        Folio: ${folioFormateado}
        Alumno: ${nombreCompleto}
        Monto: $${montoTotalFormateado}
        Fecha: ${fechaHoraActual.fecha}
        Hora: ${fechaHoraActual.hora}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Comprobante de Pago - Escuela de Natación',
                    text: texto
                });
            } else {
                await navigator.clipboard.writeText(texto);
                toast.success("Información copiada al portapapeles");
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            toast.error("No se pudo compartir la información");
        }
    }, [alumno, folioFormateado, montoTotalFormateado, fechaHoraActual]);

    // Toggle detalles
    const toggleMostrarDetalles = useCallback(() => {
        setMostrarDetalles(prev => !prev);
    }, []);

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
                                    aria-label={copiado ? "Folio copiado" : "Copiar folio"}
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
                                    ${montoTotalFormateado}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                <p className="text-gray-600 dark:text-dark-300">Método de Pago</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    {METODOS_PAGO_LABELS[metodoPago]?.icon}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {METODOS_PAGO_LABELS[metodoPago]?.label || 'No especificado'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                <p className="text-gray-600 dark:text-dark-300">Fecha y Hora</p>
                                <p className="font-medium text-gray-900 dark:text-white text-xs">
                                    {fechaHoraActual.fecha}
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white text-xs">
                                    {fechaHoraActual.hora}
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
                                            alt={`Foto de ${alumno.nombre} ${alumno.apellido_paterno}`}
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
                                        {alumno?.nombre || 'Nombre no disponible'} {alumno?.apellido_paterno || ''} {alumno?.apellido_materno || ''}
                                    </h3>
                                    <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-dark-300">
                                        {alumno?.telefono && <p>📞 {alumno.telefono}</p>}
                                        {alumno?.email && <p>✉️ {alumno.email}</p>}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                            {TIPOS_TRANSACCION_LABELS[tipoTransaccion] || 'Tipo no especificado'}
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
                                    onClick={toggleMostrarDetalles}
                                    variant="ghost"
                                    size="sm"
                                    aria-label={mostrarDetalles ? "Ocultar detalles" : "Ver detalles"}
                                >
                                    {mostrarDetalles ? 'Ocultar' : 'Ver Detalles'}
                                </Button>
                            </div>

                            {/* Resumen básico */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-dark-300">Tipo de Transacción:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {TIPOS_TRANSACCION_LABELS[tipoTransaccion] || 'Tipo no especificado'}
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

                            {/* 🔥 DETALLES EXPANDIBLES ACTUALIZADOS */}
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
                                                        {transaccion.inscripcion.anos_vigencia || 0} año(s)
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700 dark:text-blue-300">Válida hasta:</span>
                                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                                        {formatearFechaMexicana(transaccion.inscripcion.fecha_fin)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🔥 MENSUALIDADES ACTUALIZADAS */}
                                    {transaccion?.mensualidades_creadas && Array.isArray(transaccion.mensualidades_creadas) && transaccion.mensualidades_creadas.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    Mensualidades ({transaccion.mensualidades_creadas.length})
                                                </h5>
                                            </div>
                                            {transaccion.mensualidades_creadas.map((mensualidad, index) => {
                                                // 🔥 OBTENER INFORMACIÓN COMPLETA DEL PERÍODO
                                                const infoPeriodo = obtenerInfoPeriodo(mensualidad);
                                                
                                                return (
                                                    <div key={`mensualidad-${index}`} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <div className="space-y-3">
                                                            {/* 🔥 INFORMACIÓN DEL PERÍODO MEJORADA */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-green-700 dark:text-green-300">Período:</span>
                                                                    <p className="font-medium text-green-900 dark:text-green-100">
                                                                        {infoPeriodo ? infoPeriodo.periodoFormateado : formatearPeriodoMensualidad(mensualidad.mes, mensualidad.year)}
                                                                    </p>
                                                                    {/* 🔥 MOSTRAR DURACIÓN SI ES MÁS DE 1 MES */}
                                                                    {infoPeriodo && infoPeriodo.duracionMeses > 1 && (
                                                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                            📅 {infoPeriodo.duracionMeses} meses de duración
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="text-green-700 dark:text-green-300">Monto:</span>
                                                                    <p className="font-medium text-green-900 dark:text-green-100">
                                                                        ${(mensualidad.monto || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* 🔥 FECHAS DETALLADAS PARA PERÍODOS LARGOS */}
                                                            {infoPeriodo && infoPeriodo.duracionMeses > 1 && (
                                                                <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-xs">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        <div>
                                                                            <span className="text-green-700 dark:text-green-400">📅 Inicio:</span>
                                                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                                                {infoPeriodo.fechasDetalladas.inicio}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-green-700 dark:text-green-400">🏁 Fin:</span>
                                                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                                                {infoPeriodo.fechasDetalladas.fin}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Grupos (sin cambios) */}
                                                                                                                        {/* Grupos (sin cambios) */}
                                                            {mensualidad.grupos && Array.isArray(mensualidad.grupos) && mensualidad.grupos.length > 0 && (
                                                                <div className="mt-2">
                                                                    <span className="text-xs text-green-700 dark:text-green-300">Grupos:</span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {mensualidad.grupos.map((grupo, gIndex) => (
                                                                            <span 
                                                                                key={`grupo-${index}-${gIndex}`} 
                                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                            >
                                                                                {grupo.grupo_codigo || `Grupo ${grupo.grupo_id || 'N/A'}`}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
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

                                {transaccion?.mensualidades_creadas && Array.isArray(transaccion.mensualidades_creadas) && transaccion.mensualidades_creadas.length > 0 && (
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