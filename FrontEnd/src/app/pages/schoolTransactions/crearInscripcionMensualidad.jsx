// views/inscripciones/CrearInscripcionMensualidad.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Componentes
import AlumnoSelector from "./components/AlumnoSelector";
import TipoTransaccionSelector from "./components/TipoTransaccionSelector";
import InscripcionForm from "./components/InscripcionForm";
import MensualidadesForm from "./components/MensualidadesForm";
import ResumenTransaccion from "./components/ResumenTransaccion";
import ConfirmacionPago from "./components/ConfirmacionPago";
import { useAuthContext } from "app/contexts/auth/context";

// Redux
import {
    validateInscripcionVigenteThunk,
    createInscripcionSolaThunk,
    createMensualidadSolaThunk,
    createInscripcionConMensualidadesThunk,
    getTarifasMensualidadThunk,
} from "slices/thunk";

// Acciones
import { 
    clearError,
    clearOperationSuccess
} from "slices/schoolTransactions/reducer";

// Iconos
import { 
    UserIcon, 
    AcademicCapIcon, 
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const TIPOS_TRANSACCION = {
    SOLO_INSCRIPCION: 'solo_inscripcion',
    SOLO_MENSUALIDADES: 'solo_mensualidades',
    INSCRIPCION_CON_MENSUALIDADES: 'inscripcion_con_mensualidades'
};

const PASOS = {
    SELECCION_ALUMNO: 1,
    TIPO_TRANSACCION: 2,
    DATOS_INSCRIPCION: 3,
    DATOS_MENSUALIDADES: 4,
    RESUMEN: 5,
    CONFIRMACION: 6
};

// Animaciones
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const slideIn = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function CrearInscripcionMensualidad() {
    const { user } = useAuthContext();
    const dispatch = useDispatch();
    const {
        loading,
        inscripcionLoading,
        mensualidadLoading,
        error,
        error_message,
        operationSuccess,
        operationMessage,
        tieneInscripcionVigente,
        inscripcionVigente,
        ultimaTransaccion
    } = useSelector((state) => state.inscripciones);

    // Estados locales
    const [pasoActual, setPasoActual] = useState(PASOS.SELECCION_ALUMNO);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [tipoTransaccion, setTipoTransaccion] = useState('');
    const [datosInscripcion, setDatosInscripcion] = useState({
        anos_inscripcion: 1,
        monto: '',
        observaciones: ''
    });
    const [datosMensualidades, setDatosMensualidades] = useState([]);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [transaccionCompletada, setTransaccionCompletada] = useState(false);



    // Cargar tarifas al montar el componente
    useEffect(() => {
        dispatch(getTarifasMensualidadThunk());
    }, [dispatch]);

    // Manejar errores
    useEffect(() => {
        if (error && error_message) {
            toast.error(error_message);
            dispatch(clearError());
        }
    }, [error, error_message, dispatch]);

    // Manejar éxito
    useEffect(() => {
        if (operationSuccess && operationMessage) {
            toast.success(operationMessage);
            console.log("Last operation success: ", ultimaTransaccion);
            if (ultimaTransaccion) {
                setTransaccionCompletada(true);
                setPasoActual(PASOS.CONFIRMACION);
            }
            console.log(transaccionCompletada);
            dispatch(clearOperationSuccess());
        }
    }, [operationSuccess, operationMessage, ultimaTransaccion, transaccionCompletada, dispatch]);

    // Manejar selección de alumno
    const handleAlumnoSeleccionado = async (alumno) => {
        setAlumnoSeleccionado(alumno);
        
        // Validar si tiene inscripción vigente
        try {
            await dispatch(validateInscripcionVigenteThunk(alumno.id)).unwrap();
            setPasoActual(PASOS.TIPO_TRANSACCION);
        } catch (error) {
            console.error('Error al validar inscripción:', error);
        }
    };

    // Manejar selección de tipo de transacción
    const handleTipoTransaccionSeleccionado = (tipo) => {
        setTipoTransaccion(tipo);
        
        switch (tipo) {
            case TIPOS_TRANSACCION.SOLO_INSCRIPCION:
                setPasoActual(PASOS.DATOS_INSCRIPCION);
                break;
            case TIPOS_TRANSACCION.SOLO_MENSUALIDADES:
                setPasoActual(PASOS.DATOS_MENSUALIDADES);
                break;
            case TIPOS_TRANSACCION.INSCRIPCION_CON_MENSUALIDADES:
                setPasoActual(PASOS.DATOS_INSCRIPCION);
                break;
            default:
                break;
        }
    };

    // Manejar datos de inscripción
    const handleDatosInscripcion = (datos) => {
        setDatosInscripcion(datos);
        
        if (tipoTransaccion === TIPOS_TRANSACCION.INSCRIPCION_CON_MENSUALIDADES) {
            setPasoActual(PASOS.DATOS_MENSUALIDADES);
        } else {
            setPasoActual(PASOS.RESUMEN);
        }
    };

    // Manejar datos de mensualidades
    const handleDatosMensualidades = (datos) => {
        setDatosMensualidades(datos);
        setPasoActual(PASOS.RESUMEN);
    };

    // Procesar transacción
    const procesarTransaccion = async (metodoPagoSeleccionado) => {
        setMetodoPago(metodoPagoSeleccionado);

        const datosBase = {
            alumno_id: alumnoSeleccionado.id,
            metodo_pago: metodoPagoSeleccionado,
            usuario_id: user.id 
        };

        try {
            switch (tipoTransaccion) {
                case TIPOS_TRANSACCION.SOLO_INSCRIPCION:
                    await dispatch(createInscripcionSolaThunk({
                        ...datosBase,
                        ...datosInscripcion
                    })).unwrap();
                    break;

                case TIPOS_TRANSACCION.SOLO_MENSUALIDADES:
                    await dispatch(createMensualidadSolaThunk({
                        ...datosBase,
                        mensualidades: datosMensualidades
                    })).unwrap();
                    break;

                case TIPOS_TRANSACCION.INSCRIPCION_CON_MENSUALIDADES:
                    await dispatch(createInscripcionConMensualidadesThunk({
                        ...datosBase,
                        inscripcion: datosInscripcion,
                        mensualidades: datosMensualidades
                    })).unwrap();
                    break;

                default:
                    throw new Error('Tipo de transacción no válido');
            }
        } catch (error) {
            console.error('Error al procesar transacción:', error);
        }
    };

    // Reiniciar formulario
    const reiniciarFormulario = () => {
        setPasoActual(PASOS.SELECCION_ALUMNO);
        setAlumnoSeleccionado(null);
        setTipoTransaccion('');
        setDatosInscripcion({
            anos_inscripcion: 1,
            monto: '',
            observaciones: ''
        });
        setDatosMensualidades([]);
        setMetodoPago('efectivo');
        setTransaccionCompletada(false);
    };

    // Volver al paso anterior
    const volverPasoAnterior = () => {
        switch (pasoActual) {
            case PASOS.TIPO_TRANSACCION:
                setPasoActual(PASOS.SELECCION_ALUMNO);
                break;
            case PASOS.DATOS_INSCRIPCION:
                setPasoActual(PASOS.TIPO_TRANSACCION);
                break;
            case PASOS.DATOS_MENSUALIDADES:
                if (tipoTransaccion === TIPOS_TRANSACCION.INSCRIPCION_CON_MENSUALIDADES) {
                    setPasoActual(PASOS.DATOS_INSCRIPCION);
                } else {
                    setPasoActual(PASOS.TIPO_TRANSACCION);
                }
                break;
            case PASOS.RESUMEN:
                if (tipoTransaccion === TIPOS_TRANSACCION.SOLO_INSCRIPCION) {
                    setPasoActual(PASOS.DATOS_INSCRIPCION);
                } else if (tipoTransaccion === TIPOS_TRANSACCION.SOLO_MENSUALIDADES) {
                    setPasoActual(PASOS.DATOS_MENSUALIDADES);
                } else {
                    setPasoActual(PASOS.DATOS_MENSUALIDADES);
                }
                break;
            default:
                break;
        }
    };

    // Obtener título del paso actual
    const getTituloPaso = () => {
        switch (pasoActual) {
            case PASOS.SELECCION_ALUMNO:
                return "Seleccionar Alumno";
            case PASOS.TIPO_TRANSACCION:
                return "Tipo de Transacción";
            case PASOS.DATOS_INSCRIPCION:
                return "Datos de Inscripción";
            case PASOS.DATOS_MENSUALIDADES:
                return "Mensualidades";
            case PASOS.RESUMEN:
                return "Resumen de la Transacción";
            case PASOS.CONFIRMACION:
                return "Transacción Completada";
            default:
                return "";
        }
    };

    // Obtener icono del paso actual
    const getIconoPaso = () => {
        switch (pasoActual) {
            case PASOS.SELECCION_ALUMNO:
                return <UserIcon className="h-6 w-6" />;
            case PASOS.TIPO_TRANSACCION:
                return <AcademicCapIcon className="h-6 w-6" />;
            case PASOS.DATOS_INSCRIPCION:
                return <AcademicCapIcon className="h-6 w-6" />;
            case PASOS.DATOS_MENSUALIDADES:
                return <ClockIcon className="h-6 w-6" />;
            case PASOS.RESUMEN:
                return <CurrencyDollarIcon className="h-6 w-6" />;
            case PASOS.CONFIRMACION:
                return <CheckCircleIcon className="h-6 w-6" />;
            default:
                return <UserIcon className="h-6 w-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 text-primary-600">
                                {getIconoPaso()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {getTituloPaso()}
                                </h1>
                                <p className="text-gray-600 dark:text-dark-300 mt-1">
                                    Paso {pasoActual} de {Object.keys(PASOS).length}
                                </p>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="mt-6">
                            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                                <motion.div 
                                    className="bg-primary-600 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(pasoActual / Object.keys(PASOS).length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contenido principal */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                >
                    <AnimatePresence mode="wait">
                        {/* Paso 1: Selección de Alumno */}
                        {pasoActual === PASOS.SELECCION_ALUMNO && (
                            <motion.div
                                key="seleccion-alumno"
                                variants={fadeInUp}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <AlumnoSelector
                                    onAlumnoSeleccionado={handleAlumnoSeleccionado}
                                    alumnoActual={alumnoSeleccionado}
                                />
                            </motion.div>
                        )}

                        {/* Paso 2: Tipo de Transacción */}
                        {pasoActual === PASOS.TIPO_TRANSACCION && (
                            <motion.div
                                key="tipo-transaccion"
                                variants={slideIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <TipoTransaccionSelector
                                    tieneInscripcionVigente={tieneInscripcionVigente}
                                    inscripcionVigente={inscripcionVigente}
                                    onTipoSeleccionado={handleTipoTransaccionSeleccionado}
                                    onVolver={volverPasoAnterior}
                                    tipoActual={tipoTransaccion}
                                />
                            </motion.div>
                        )}

                        {/* Paso 3: Datos de Inscripción */}
                        {pasoActual === PASOS.DATOS_INSCRIPCION && (
                            <motion.div
                                key="datos-inscripcion"
                                variants={slideIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <InscripcionForm
                                    datosIniciales={datosInscripcion}
                                    onDatosCompletos={handleDatosInscripcion}
                                    onVolver={volverPasoAnterior}
                                    loading={loading || inscripcionLoading}
                                />
                            </motion.div>
                        )}

                        {/* Paso 4: Datos de Mensualidades */}
                        {pasoActual === PASOS.DATOS_MENSUALIDADES && (
                            <motion.div
                                key="datos-mensualidades"
                                variants={slideIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <MensualidadesForm
                                    datosIniciales={datosMensualidades}
                                    onDatosCompletos={handleDatosMensualidades}
                                    onVolver={volverPasoAnterior}
                                    loading={loading || mensualidadLoading}
                                    alumnoId={alumnoSeleccionado?.id}
                                />
                            </motion.div>
                        )}

                        {/* Paso 5: Resumen */}
                        {pasoActual === PASOS.RESUMEN && (
                            <motion.div
                                key="resumen"
                                variants={slideIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <ResumenTransaccion
                                    alumno={alumnoSeleccionado}
                                    tipoTransaccion={tipoTransaccion}
                                    datosInscripcion={datosInscripcion}
                                    datosMensualidades={datosMensualidades}
                                    onConfirmar={procesarTransaccion}
                                    onVolver={volverPasoAnterior}
                                    loading={loading || inscripcionLoading || mensualidadLoading}
                                />
                            </motion.div>
                        )}

                        {/* Paso 6: Confirmación */}
                        {pasoActual === PASOS.CONFIRMACION && (
                            <motion.div
                                key="confirmacion"
                                variants={fadeInUp}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <ConfirmacionPago
                                    transaccion={ultimaTransaccion}
                                    alumno={alumnoSeleccionado}
                                    tipoTransaccion={tipoTransaccion}
                                    metodoPago={metodoPago}
                                    onNuevaTransaccion={reiniciarFormulario}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Información de contexto */}
                {alumnoSeleccionado && pasoActual > PASOS.SELECCION_ALUMNO && pasoActual < PASOS.CONFIRMACION && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6"
                    >
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Alumno seleccionado
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido_paterno} {alumnoSeleccionado.apellido_materno}
                                    </p>
                                    {tieneInscripcionVigente && (
                                        <div className="flex items-center mt-2 space-x-2">
                                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                            <span className="text-xs text-green-700 dark:text-green-300">
                                                Tiene inscripción vigente
                                            </span>
                                        </div>
                                    )}
                                    {!tieneInscripcionVigente && (
                                        <div className="flex items-center mt-2 space-x-2">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
                                            <span className="text-xs text-amber-700 dark:text-amber-300">
                                                No tiene inscripción vigente
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}