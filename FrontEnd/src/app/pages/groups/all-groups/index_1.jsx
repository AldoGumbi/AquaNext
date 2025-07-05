// Import Dependencies
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Link } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  UserGroupIcon,
  XMarkIcon,
  // CheckIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  // StarIcon,
  Bars3Icon,
  TableCellsIcon
} from "@heroicons/react/24/outline";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import { 
  getProfesoresThunk,
  getGruposConHorariosThunk,
  updateGrupoThunk,
  deleteGrupoThunk
} from "slices/thunk";

// Toast import
import { toast } from "sonner";

// Datos de tipos de clase
const tiposClase = [
  { 
    value: 'grupo_adultos', 
    label: 'Grupo Adultos', 
    icon: '🏊‍♀️', 
    description: 'Clases de natación para adultos y adolescentes',
    cupoSugerido: 16,
    color: 'blue'
  },
  { 
    value: 'grupo_preescolar', 
    label: 'Grupo Preescolar', 
    icon: '👶', 
    description: 'Clases de natación para niños en edad preescolar (3-5 años)',
    cupoSugerido: 6,
    color: 'pink'
  },
  { 
    value: 'grupo_escolar', 
    label: 'Grupo Escolar', 
    icon: '🧒', 
    description: 'Clases de natación para niños en edad escolar (6-12 años)',
    cupoSugerido: 16,
    color: 'green'
  },
  { 
    value: 'aquafitness', 
    label: 'Aquafitness', 
    icon: '💪', 
    description: 'Ejercicios acuáticos y acondicionamiento físico en el agua',
    cupoSugerido: 16,
    color: 'purple'
  },
  { 
    value: 'nado_libre', 
    label: 'Nado Libre', 
    icon: '🏊‍♂️', 
    description: 'Acceso libre a la piscina sin instructor para práctica personal',
    cupoSugerido: 8,
    color: 'cyan'
  },
  { 
    value: 'activacion_fisica_adulto_mayor', 
    label: 'Activación Física Adulto Mayor', 
    icon: '🧓', 
    description: 'Actividades acuáticas terapéuticas para adultos mayores',
    cupoSugerido: 15,
    color: 'orange'
  },
  { 
    value: 'matronatacion', 
    label: 'Matronatación', 
    icon: '👨‍👩‍👶', 
    description: 'Clases para bebés de 6 meses a 3 años acompañados de sus padres',
    cupoSugerido: 10,
    color: 'yellow'
  }
];

const diasSemana = [
  { value: 'lunes', label: 'Lunes', short: 'L' },
  { value: 'martes', label: 'Martes', short: 'M' },
  { value: 'miercoles', label: 'Miércoles', short: 'X' },
  { value: 'jueves', label: 'Jueves', short: 'J' },
  { value: 'viernes', label: 'Viernes', short: 'V' },
  { value: 'sabado', label: 'Sábado', short: 'S' },
  { value: 'domingo', label: 'Domingo', short: 'D' }
];

// Schema de validación para edición
const editGroupSchema = Yup.object().shape({
  codigo: Yup.string()
    .trim()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres')
    .required('El código es requerido'),
  nombre: Yup.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  tipo: Yup.string()
    .required('El tipo de clase es requerido'),
  nivel: Yup.string()
    .trim()
    .max(50, 'El nivel no puede exceder 50 caracteres'),
  descripcion: Yup.string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  horarios: Yup.array()
    .of(
      Yup.object().shape({
        dia: Yup.string().required('El día es requerido'),
        hora_inicio: Yup.string().required('La hora de inicio es requerida'),
        hora_fin: Yup.string().required('La hora de fin es requerida'),
        profesor_id: Yup.mixed().nullable(),
        cupo_maximo: Yup.number()
          .min(1, 'El cupo mínimo es 1')
          .max(50, 'El cupo máximo es 50')
          .required('El cupo es requerido')
      })
    )
    .min(1, 'Debe tener al menos un horario')
});

// Componentes de UI reutilizables
const Badge = ({ children, variant = "default", size = "md", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ variant = "primary", size = "md", className = "", children, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg",
    outline: "border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-700 focus:ring-primary-500 shadow-sm hover:shadow-md",
    ghost: "text-gray-700 dark:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700 focus:ring-primary-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg"
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

const Select = ({ label, error, children, className = "", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-100">
        {label}
      </label>
    )}
    <select
      className={`
        block w-full rounded-lg border border-gray-300 dark:border-dark-500 
        bg-white dark:bg-dark-800 px-3 py-2.5 text-sm
        shadow-sm transition-colors text-gray-900 dark:text-white
        focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
        disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-dark-300
        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const Textarea = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-100">
        {label}
      </label>
    )}
    <textarea
      className={`
        block w-full rounded-lg border border-gray-300 dark:border-dark-500 
        bg-white dark:bg-dark-800 px-3 py-2.5 text-sm
        placeholder-gray-400 dark:placeholder-dark-300 shadow-sm transition-colors resize-none
        focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
        disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-dark-300
        text-gray-900 dark:text-white
        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        ${className}
      `}
      {...props}
    />
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const Card = ({ className = "", children, ...props }) => (
  <div
    className={`bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = "md", footer }) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll en el body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaurar scroll al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative flex w-full ${sizes[size]} origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700 max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                {title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="size-7 rounded-full text-gray-400 hover:text-gray-600 dark:text-dark-300 dark:hover:text-dark-100 ltr:-mr-1.5 rtl:-ml-1.5"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-dark-600 px-4 py-3 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Componente principal
export default function GroupsManagementView() {
  const dispatch = useDispatch();
  
  // Estados de Redux
  const gruposConHorarios = useSelector((state) => state.groups.gruposConHorarios);
  const profesoresList = useSelector((state) => state.profesores.profesores);
  const { loading: gruposLoading, error: gruposError, error_message } = useSelector((state) => state.groups);
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // cards, table
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form para edición
  const {
    register,
    control,
    handleSubmit,
    reset,
    // setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(editGroupSchema),
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "horarios"
  });

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(getGruposConHorariosThunk());
    dispatch(getProfesoresThunk());
  }, [dispatch]);

  // Manejar errores del estado de Redux
  useEffect(() => {
    if (gruposError && error_message && !gruposLoading) {
      console.error("Error desde Redux:", error_message);
      
      // Mostrar toast con el mensaje de error específico
      if (typeof error_message === 'string') {
        toast.error(`${error_message}`);
      } else if (error_message?.message) {
        toast.error(`${error_message.message}`);
      } else {
        toast.error("Error al procesar la solicitud");
      }
    }
  }, [gruposError, error_message, gruposLoading]);

  // Filtrar y buscar grupos
  const filteredGroups = useMemo(() => {
    if (!Array.isArray(gruposConHorarios)) return [];
    
    return gruposConHorarios.filter(group => {
      const matchesSearch = !searchTerm || 
        group.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.nivel && group.nivel.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === "all" || group.tipo === filterType;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && group.activo) ||
        (filterStatus === "inactive" && !group.activo);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [gruposConHorarios, searchTerm, filterType, filterStatus]);

  // Obtener información del tipo
  const getTipoInfo = useCallback((tipo) => {
    return tiposClase.find(t => t.value === tipo) || { 
      label: tipo, 
      icon: '📚', 
      color: 'gray',
      description: 'Tipo de clase'
    };
  }, []);

  // Formatear día
  const formatDia = useCallback((dia) => {
    const diaInfo = diasSemana.find(d => d.value === dia);
    return diaInfo ? diaInfo.label : dia;
  }, []);

  // Formatear hora
  const formatHora = useCallback((hora) => {
    if (!hora) return '';
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Funciones de modalidad
  const handleViewGroup = useCallback((group) => {
    setSelectedGroup(group);
    setShowViewModal(true);
  }, []);

  const handleEditGroup = useCallback((group) => {
    setSelectedGroup(group);

    console.log("Grupo seleccionado para editar:", group);
    
    // Preparar datos para el formulario
    const formData = {
      codigo: group.codigo,
      nombre: group.nombre,
      tipo: group.tipo,
      nivel: group.nivel || "",
      descripcion: group.descripcion || "",
      activo: group.activo,
      horarios: group.horarios?.map(h => ({
        id: h.id,
        dia: h.dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        profesor_id: h.profesor_id || "",
        cupo_maximo: h.cupo_maximo || getTipoInfo(group.tipo).cupoSugerido
      })) || []
    };
    
    reset(formData);
    setShowEditModal(true);
  }, [reset, getTipoInfo]);

  const handleDeleteGroup = useCallback((group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  }, []);

  // Manejar envío de edición
  const onSubmitEdit = async (data) => {
    try {
      setEditLoading(true);
      
      const updateData = {
        id: selectedGroup.id,
        data: {
          codigo: data.codigo.trim(),
          nombre: data.nombre.trim(),
          tipo: data.tipo,
          nivel: data.nivel?.trim() || null,
          descripcion: data.descripcion?.trim() || null,
          activo: data.activo,
          horarios: data.horarios.map(h => ({
            id: h.id, // Mantener ID para actualización
            dia: h.dia,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            profesor_id: h.profesor_id && h.profesor_id !== "" ? parseInt(h.profesor_id) : null,
            cupo_maximo: parseInt(h.cupo_maximo)
          }))
        }
      };

      const resultAction = await dispatch(updateGrupoThunk(updateData));
      
      console.log("Resultado de la acción de actualización:", resultAction);

      if (updateGrupoThunk.fulfilled.match(resultAction)) {
        toast.success("Grupo actualizado correctamente");
        setShowEditModal(false);
        setSelectedGroup(null);
        dispatch(getGruposConHorariosThunk()); // Recargar datos
      } 
    } catch (error) {
      console.error("Error al actualizar grupo:", error);
      toast.error("Error al actualizar el grupo");
    } finally {
      setEditLoading(false);
    }
  };

  // Manejar eliminación
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);

      console.log("Id a eliminar: ", selectedGroup.id)
      
      const resultAction = await dispatch(deleteGrupoThunk(selectedGroup.id));
      
      if (deleteGrupoThunk.fulfilled.match(resultAction)) {
        toast.success("Grupo eliminado correctamente");
        setShowDeleteModal(false);
        setSelectedGroup(null);
        dispatch(getGruposConHorariosThunk()); // Recargar datos
      }
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      toast.error("Error al eliminar el grupo");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Agregar horario en edición
  const addHorario = () => {
    const tipoInfo = getTipoInfo(selectedGroup?.tipo);
    append({
      dia: "",
      hora_inicio: "",
      hora_fin: "",
      profesor_id: "",
      cupo_maximo: tipoInfo.cupoSugerido
    });
  };

  // Animaciones
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Renderizar card de grupo
  const renderGroupCard = (group) => {
    const tipoInfo = getTipoInfo(group.tipo);
    const totalHorarios = group.horarios?.length || 0;
    const horariosConProfesor = group.horarios?.filter(h => h.profesor_id)?.length || 0;
    
    return (
      <motion.div
        key={group.id}
        variants={fadeInUp}
        layout
        className="group"
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
          {/* Badge de estado */}
          <div className="absolute top-4 right-4">
            <Badge 
              variant={group.activo ? "success" : "warning"}
              size="sm"
            >
              {group.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          {/* Header del grupo */}
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-2xl">{tipoInfo.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {group.codigo}
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-300">
                  {group.nombre}
                </p>
              </div>
            </div>
            
            <Badge variant={tipoInfo.color} className="mb-2">
              {tipoInfo.label}
            </Badge>
            
            {group.nivel && (
              <Badge variant="outline" size="sm" className="ml-2">
                <AcademicCapIcon className="w-3 h-3 mr-1" />
                {group.nivel}
              </Badge>
            )}
          </div>

          {/* Descripción */}
          {group.descripcion && (
            <p className="text-sm text-gray-600 dark:text-dark-300 mb-4 line-clamp-2">
              {group.descripcion}
            </p>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalHorarios}
              </div>
              <div className="text-xs text-gray-600 dark:text-dark-300">
                Horarios
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {horariosConProfesor}
              </div>
              <div className="text-xs text-gray-600 dark:text-dark-300">
                Con Profesor
              </div>
            </div>
          </div>

          {/* Horarios preview */}
          {group.horarios && group.horarios.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-2 flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                Horarios
              </h4>
              <div className="space-y-1">
                {group.horarios.slice(0, 3).map((horario, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-dark-300">
                      {formatDia(horario.dia)}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                    </span>
                  </div>
                ))}
                {group.horarios.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-dark-400 text-center">
                    +{group.horarios.length - 3} más...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-dark-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewGroup(group)}
              className="flex items-center space-x-1"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Ver</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditGroup(group)}
                className="flex items-center space-x-1"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
              </Button>
              
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteGroup(group)}
                className="flex items-center space-x-1"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Eliminar</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Renderizar tabla de grupos
  const renderGroupTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                Horarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
            <AnimatePresence>
              {filteredGroups.map((group) => {
                const tipoInfo = getTipoInfo(group.tipo);
                return (
                  <motion.tr
                    key={group.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{tipoInfo.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {group.codigo}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-dark-300">
                            {group.nombre}
                          </div>
                          {group.nivel && (
                            <Badge variant="outline" size="sm" className="mt-1">
                              {group.nivel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={tipoInfo.color}>
                        {tipoInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {group.horarios?.slice(0, 2).map((horario, index) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-dark-300">
                            <span className="font-medium">{formatDia(horario.dia)}</span>
                            <span className="mx-2">•</span>
                            <span>{formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}</span>
                          </div>
                        ))}
                        {group.horarios && group.horarios.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-dark-400">
                            +{group.horarios.length - 2} más...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={group.activo ? "success" : "warning"}>
                        {group.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewGroup(group)}
                          className="text-gray-600 hover:text-gray-900 dark:text-dark-300 dark:hover:text-white"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Grupos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-dark-300">
                Administra los grupos de clases, horarios y profesores asignados
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => dispatch(getGruposConHorariosThunk())}
                disabled={gruposLoading}
                className="flex items-center space-x-2"
              >
                {gruposLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>Actualizar</span>
              </Button>
              <Link
                to="/groups/register"
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg px-4 py-2 text-sm space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nuevo Grupo</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="lg:col-span-2">
                <Input
                  placeholder="Buscar por código, nombre, tipo o nivel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="h-5 w-5" />}
                  className="w-full"
                />
              </div>

              {/* Filtro por tipo */}
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {tiposClase.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </Select>

              {/* Filtro por estado */}
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Select>
            </div>

            {/* Controles de vista */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-dark-300" />
                <span className="text-sm text-gray-600 dark:text-dark-300">
                  {filteredGroups.length} grupos encontrados
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-dark-300">Vista:</span>
                <div className="flex border border-gray-300 dark:border-dark-500 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "cards" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="rounded-r-none border-0 focus:outline-none focus:ring-0"
                  >
                    <Bars3Icon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-l-none border-0 focus:outline-none focus:ring-0"
                  >
                    <TableCellsIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lista de grupos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {gruposLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-dark-300">Cargando grupos...</p>
              </div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card className="p-12 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 dark:text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron grupos
              </h3>
              <p className="text-gray-600 dark:text-dark-300 mb-6">
                {searchTerm || filterType !== "all" || filterStatus !== "all" 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer grupo de clases"
                }
              </p>
              <Link
                to="/groups/register"
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg px-4 py-2 text-sm space-x-2 mx-auto"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Crear Primer Grupo</span>
              </Link>
            </Card>
          ) : (
            <>
              {viewMode === "cards" ? (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredGroups.map(group => renderGroupCard(group))}
                </motion.div>
              ) : (
                <Card className="overflow-hidden">
                  {renderGroupTable()}
                </Card>
              )}
            </>
          )}
        </motion.div>

        {/* Modal de visualización */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Detalles del Grupo"
          size="lg"
          footer={
            <Button
              variant="outline"
              onClick={() => setShowViewModal(false)}
            >
              Cerrar
            </Button>
          }
        >
          {selectedGroup && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                    Información General
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getTipoInfo(selectedGroup.tipo).icon}</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedGroup.codigo}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-dark-300">
                          {selectedGroup.nombre}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Badge variant={getTipoInfo(selectedGroup.tipo).color}>
                        {getTipoInfo(selectedGroup.tipo).label}
                      </Badge>
                      <Badge variant={selectedGroup.activo ? "success" : "warning"}>
                        {selectedGroup.activo ? "Activo" : "Inactivo"}
                      </Badge>
                      {selectedGroup.nivel && (
                        <Badge variant="outline">
                          <AcademicCapIcon className="w-3 h-3 mr-1" />
                          {selectedGroup.nivel}
                        </Badge>
                      )}
                    </div>

                    {selectedGroup.descripcion && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                          Descripción
                        </div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">
                          {selectedGroup.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                    Estadísticas
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedGroup.horarios?.length || 0}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        Horarios Total
                      </div>
                    </Card>
                    <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedGroup.horarios?.filter(h => h.profesor_id)?.length || 0}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        Con Profesor
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Horarios detallados */}
              {selectedGroup.horarios && selectedGroup.horarios.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3 flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                    Horarios Configurados
                  </h4>
                  <div className="space-y-3">
                    {selectedGroup.horarios.map((horario, index) => (
                      <Card key={index} className="p-4 bg-gray-50 dark:bg-dark-700/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <Badge variant="outline">
                                {formatDia(horario.dia)}
                              </Badge>
                              <div className="flex items-center space-x-2 text-sm">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-dark-300">
                              {horario.nombre_profesor ? (
                                <div className="flex items-center space-x-1">
                                  <UserGroupIcon className="w-4 h-4" />
                                  <span>Profesor: {horario.nombre_profesor}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                                  <ExclamationTriangleIcon className="w-4 h-4" />
                                  <span>Sin profesor asignado</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <UsersIcon className="w-4 h-4" />
                                <span>Cupo: {horario.cupo_maximo || getTipoInfo(selectedGroup.tipo).cupoSugerido}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal de edición */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Editar Grupo"
          size="xl"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="edit-group-form"
                disabled={editLoading}
                className="min-w-[120px]"
              >
                {editLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </>
          }
        >
          {selectedGroup && (
            <form id="edit-group-form" onSubmit={handleSubmit(onSubmitEdit)}>
              <div className="space-y-6">
                {/* Información básica */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-4">
                    Información General
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register("codigo")}
                      label="Código del Grupo*"
                      error={errors.codigo?.message}
                      prefix={<UserGroupIcon className="h-5 w-5" />}
                    />
                    
                    <Input
                      {...register("nombre")}
                      label="Nombre del Grupo*"
                      error={errors.nombre?.message}
                    />
                    
                    <Select
                      {...register("tipo")}
                      label="Tipo de Clase*"
                      error={errors.tipo?.message}
                    >
                      {tiposClase.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.icon} {tipo.label}
                        </option>
                      ))}
                    </Select>
                    
                    <Select
                      {...register("nivel")}
                      label="Nivel"
                      error={errors.nivel?.message}
                    >
                      <option value="">Sin nivel específico</option>
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                      <option value="Mixto">Mixto</option>
                    </Select>
                    
                    <div className="md:col-span-2">
                      <Textarea
                        {...register("descripcion")}
                        label="Descripción"
                        rows={3}
                        error={errors.descripcion?.message}
                        placeholder="Describe los objetivos y características del grupo..."
                      />
                    </div>
                  </div>
                </div>

                {/* Horarios */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-2" />
                      Horarios del Grupo
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHorario}
                      className="flex items-center space-x-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Agregar Horario</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4 bg-gray-50 dark:bg-dark-700/50">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-dark-200">
                            Horario {index + 1}
                          </h5>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          <Controller
                            name={`horarios.${index}.dia`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                label="Día*"
                                error={errors.horarios?.[index]?.dia?.message}
                              >
                                <option value="">Selecciona un día</option>
                                {diasSemana.map(dia => (
                                  <option key={dia.value} value={dia.value}>
                                    {dia.label}
                                  </option>
                                ))}
                              </Select>
                            )}
                          />

                          <Controller
                            name={`horarios.${index}.hora_inicio`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="time"
                                label="Hora Inicio*"
                                error={errors.horarios?.[index]?.hora_inicio?.message}
                              />
                            )}
                          />

                          <Controller
                            name={`horarios.${index}.hora_fin`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="time"
                                label="Hora Fin*"
                                error={errors.horarios?.[index]?.hora_fin?.message}
                              />
                            )}
                          />

                          <Controller
                            name={`horarios.${index}.profesor_id`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                value={field.value || ""}
                                label="Profesor"
                                error={errors.horarios?.[index]?.profesor_id?.message}
                              >
                                <option value="">Sin profesor</option>
                                {profesoresList?.filter(p => p.activo).map(profesor => (
                                  <option key={profesor.id} value={profesor.id}>
                                    {profesor.nombre} {profesor.apellido}
                                  </option>
                                ))}
                              </Select>
                            )}
                          />

                          <Controller
                            name={`horarios.${index}.cupo_maximo`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                label="Cupo*"
                                min="1"
                                max="50"
                                error={errors.horarios?.[index]?.cupo_maximo?.message}
                                prefix={<UsersIcon className="h-4 w-4" />}
                              />
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="min-w-[120px]"
              >
                {deleteLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </div>
                ) : (
                  "Sí, Eliminar"
                )}
              </Button>
            </>
          }
        >
          {selectedGroup && (
            <div className="space-y-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  ¿Estás seguro que deseas eliminar este grupo?
                </h3>
                <div className="text-sm text-gray-600 dark:text-dark-300 space-y-2">
                  <p>
                    <strong>Grupo:</strong> {selectedGroup.codigo} - {selectedGroup.nombre}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {getTipoInfo(selectedGroup.tipo).label}
                  </p>
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Esta acción no se puede deshacer y eliminará todos los horarios asociados.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}