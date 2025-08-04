// views/inscripciones/components/AlumnoSelector.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
    MagnifyingGlassIcon, 
    UserIcon, 
    PlusIcon,
    CheckCircleIcon 
} from "@heroicons/react/24/outline";

// Redux
import { getAlumnosThunk } from "slices/thunk";

// Componentes
const Input = ({ label, error, prefix, suffix, className = "", type = "text", ...props }) => (
    <div className="space-y-1">
        {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-100">
                {label}
            </label>
        )}
        <div className="relative">
            {prefix && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 dark:text-dark-300">{prefix}</span>
                </div>
            )}
            <input
                type={type}
                className={`
                    block w-full rounded-lg border border-gray-300 dark:border-dark-500 
                    bg-white dark:bg-dark-800 px-3 py-2.5 text-sm
                    placeholder-gray-400 dark:placeholder-dark-300 shadow-sm transition-colors
                    focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                    disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-dark-300
                    text-gray-900 dark:text-white
                    ${prefix ? 'pl-10' : ''}
                    ${suffix ? 'pr-10' : ''}
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {suffix && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400 dark:text-dark-300">{suffix}</span>
                </div>
            )}
        </div>
        {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
    </div>
);

const Button = ({ variant = "primary", size = "md", className = "", children, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
    
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg",
        outline: "border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-700 focus:ring-primary-500 shadow-sm hover:shadow-md",
        ghost: "text-gray-700 dark:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700 focus:ring-primary-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg"
    };
    
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };
    
    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const Card = ({ className = "", children, ...props }) => (
    <div
        className={`bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 shadow-sm ${className}`}
        {...props}
    >
        {children}
    </div>
);

const AlumnoSelector = ({ onAlumnoSeleccionado, alumnoActual }) => {
    const dispatch = useDispatch();
    const { alumnos, loading } = useSelector((state) => state.alumnos);

    // Estados locales
    const [searchTerm, setSearchTerm] = useState('');
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(alumnoActual);

    // Cargar alumnos al montar el componente
    useEffect(() => {
        dispatch(getAlumnosThunk());
    }, [dispatch]);

    // Filtrar alumnos basado en la búsqueda
    const alumnosFiltrados = useMemo(() => {
        if (!searchTerm.trim()) {
            // return alumnos.filter(alumno => alumno.estatus === 'activo').slice(0, 20);
            return alumnos.slice(0.50);
        }

        const term = searchTerm.toLowerCase().trim();
        return alumnos.filter(alumno => {
            // if (alumno.estatus !== 'activo') return false;
            
            const nombreCompleto = `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno || ''}`.toLowerCase();
            const telefono = alumno.telefono?.toLowerCase() || '';
            const email = alumno.email?.toLowerCase() || '';
            
            return nombreCompleto.includes(term) || 
                    telefono.includes(term) || 
                    email.includes(term);
        }).slice(0, 50);
    }, [alumnos, searchTerm]);

    // Manejar selección de alumno
    const handleSeleccionarAlumno = (alumno) => {
        setAlumnoSeleccionado(alumno);
    };

    // Confirmar selección
    const handleConfirmarSeleccion = () => {
        if (alumnoSeleccionado && onAlumnoSeleccionado) {
            onAlumnoSeleccionado(alumnoSeleccionado);
        }
    };

    // Crear nuevo alumno
    const handleCrearNuevoAlumno = () => {
        // TODO: Implementar modal para crear nuevo alumno
        console.log('Crear nuevo alumno');
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Seleccionar Alumno
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
                            Busca y selecciona el alumno para crear la inscripción o mensualidad
                        </p>
                    </div>
                    <Link
                        to="/students/register"
                        className={`
                            inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white 
                            dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed 
                            transform hover:scale-[1.02] active:scale-[0.98]
                            border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-800 
                            text-gray-700 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-700 
                            focus:ring-primary-500 shadow-sm hover:shadow-md
                            px-3 py-1.5 text-sm
                            space-x-2
                        `}
                        >
                        <PlusIcon className="h-4 w-4" />
                        <span>Nuevo Alumno</span>
                    </Link>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        prefix={<MagnifyingGlassIcon className="h-5 w-5" />}
                    />
                </div>

                {/* Lista de alumnos */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse bg-gray-200 dark:bg-dark-600 rounded-lg h-16"
                                />
                            ))}
                        </div>
                    ) : alumnosFiltrados.length > 0 ? (
                        alumnosFiltrados.map((alumno) => (
                            <motion.div
                                key={alumno.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`
                                    relative border rounded-lg p-4 cursor-pointer transition-all duration-200
                                    ${alumnoSeleccionado?.id === alumno.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 bg-white dark:bg-dark-700'
                                    }
                                `}
                                onClick={() => handleSeleccionarAlumno(alumno)}
                            >
                                <div className="flex items-center space-x-4">
                                    {/* Avatar o inicial */}
                                    <div className="flex-shrink-0">
                                        {alumno.foto ? (
                                            <img
                                                src={alumno.foto}
                                                alt={`${alumno.nombre} ${alumno.apellido_paterno}`}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-dark-600 flex items-center justify-center">
                                                <UserIcon className="h-6 w-6 text-gray-600 dark:text-dark-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Información del alumno */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno || ''}
                                            </h4>
                                            {alumno.tipo_alumno === 'prueba' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                                    Prueba
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-dark-400">
                                            {alumno.telefono && (
                                                <span>📞 {alumno.telefono}</span>
                                            )}
                                            {alumno.email && (
                                                <span className="truncate">✉️ {alumno.email}</span>
                                            )}
                                            {alumno.fecha_nacimiento && (
                                                <span>
                                                    🎂 {new Date().getFullYear() - new Date(alumno.fecha_nacimiento).getFullYear()} años
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Indicador de selección */}
                                    {alumnoSeleccionado?.id === alumno.id && (
                                        <div className="flex-shrink-0">
                                            <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {searchTerm ? 'No se encontraron alumnos' : 'No hay alumnos disponibles'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
                                {searchTerm 
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Registra el primer alumno para comenzar'
                                }
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <Button
                                        onClick={handleCrearNuevoAlumno}
                                        className="flex items-center space-x-2"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        <span>Registrar Primer Alumno</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Alumno seleccionado y botón de confirmación */}
                {alumnoSeleccionado && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 dark:border-dark-600 pt-4"
                    >
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                    <div>
                                        <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                                            Alumno seleccionado
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido_paterno} {alumnoSeleccionado.apellido_materno || ''}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleConfirmarSeleccion}
                                    className="ml-4"
                                >
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Información adicional */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        💡 Información importante
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Solo se muestran alumnos con estatus activo</li>
                        <li>• Puedes buscar por nombre, teléfono o email</li>
                        <li>• Los alumnos de prueba tienen un indicador especial</li>
                        <li>• La búsqueda se limita a 50 resultados máximo</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default AlumnoSelector;