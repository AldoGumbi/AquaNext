// Import Dependencies
import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, TrashIcon, UserGroupIcon, ClockIcon, CalendarDaysIcon, UsersIcon } from "@heroicons/react/24/outline";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import { 
  getProfesoresThunk,
  addGrupoThunk
} from "slices/thunk";

// Toast import
import { toast } from "sonner";

// Schema de validación actualizado
const groupSchema = Yup.object().shape({
  codigo: Yup.string()
    .trim()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres')
    .required('El código es requerido'),
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
        profesor_id: Yup.mixed()
          .nullable()
          .test('profesor-id-valid', 'El ID del profesor debe ser válido', function(value) {
            // Si no hay valor o es string vacío, es válido (null)
            if (!value || value === "" || value === null) {
              return true;
            }
            // Si hay valor, debe ser un número válido
            const num = Number(value);
            return !isNaN(num) && num > 0;
          }),
        cupo_maximo: Yup.mixed()
          .required('El cupo es requerido para cada horario')
          .test('cupo-valid', 'El cupo debe ser un número válido entre 1 y 50', function(value) {
            // Si no hay valor o es string vacío, no es válido
            if (!value || value === "" || value === null) {
              return false;
            }
            // Convertir a número y validar rango
            const num = Number(value);
            return !isNaN(num) && num >= 1 && num <= 50;
          })
      })
    )
    .min(1, 'Debe agregar al menos un horario')
    .test('horarios-valid', 'Verificar horarios válidos', function(horarios) {
      for (let i = 0; i < horarios.length; i++) {
        const horario = horarios[i];
        if (horario.hora_inicio && horario.hora_fin) {
          if (horario.hora_inicio >= horario.hora_fin) {
            return this.createError({
              path: `horarios.${i}`,
              message: `La hora de inicio debe ser menor que la hora de fin`
            });
          }
        }
      }
      return true;
    })
});

const tiposClase = [
  { 
    value: 'grupo_adultos', 
    label: 'Grupo Adultos', 
    icon: '🏊‍♀️', 
    description: 'Clases de natación para adultos y adolescentes',
    cupoSugerido: 16
  },
  { 
    value: 'grupo_preescolar', 
    label: 'Grupo Preescolar', 
    icon: '👶', 
    description: 'Clases de natación para niños en edad preescolar (3-5 años)',
    cupoSugerido: 6
  },
  { 
    value: 'grupo_escolar', 
    label: 'Grupo Escolar', 
    icon: '🧒', 
    description: 'Clases de natación para niños en edad escolar (6-12 años)',
    cupoSugerido: 16
  },
  { 
    value: 'aquafitness', 
    label: 'Aquafitness', 
    icon: '💪', 
    description: 'Ejercicios acuáticos y acondicionamiento físico en el agua',
    cupoSugerido: 16
  },
  { 
    value: 'nado_libre', 
    label: 'Nado Libre', 
    icon: '🏊‍♂️', 
    description: 'Acceso libre a la piscina sin instructor para práctica personal',
    cupoSugerido: 8
  },
  { 
    value: 'activacion_fisica_adulto_mayor', 
    label: 'Activación Física Adulto Mayor', 
    icon: '🧓', 
    description: 'Actividades acuáticas terapéuticas para adultos mayores',
    cupoSugerido: 15
  },
  { 
    value: 'matronatacion', 
    label: 'Matronatación', 
    icon: '👨‍👩‍👶', 
    description: 'Clases para bebés de 6 meses a 3 años acompañados de sus padres',
    cupoSugerido: 10
  }
];

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

// Componente Input personalizado
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

// Componente Select personalizado
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

// Componente Textarea personalizado
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

// Componente Button personalizado
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

// Componente Card personalizado
const Card = ({ className = "", children, ...props }) => (
  <div
    className={`bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

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

export default function GroupCreationForm() {
  // Redux
  const dispatch = useDispatch();
  const profesoresList = useSelector((state) => state.profesores.profesores);
  const gruposState = useSelector((state) => state.groups);
  const { loading: gruposLoading, error: gruposError, error_message } = gruposState;
  
  // Estados locales
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    hora_inicio: "",
    hora_fin: "",
    cupo_maximo: ""
  });

  // Cargar profesores al montar el componente
  useEffect(() => {
    dispatch(getProfesoresThunk());
  }, [dispatch]);

  // Actualizar estado local cuando cambien los profesores
  useEffect(() => {
    if (Array.isArray(profesoresList)) {
      // Filtrar solo profesores activos
      const activeProfessors = profesoresList.filter(profesor => profesor.activo);
      setProfessors(activeProfessors);
    } else {
      setProfessors([]);
    }
  }, [profesoresList]);

  // Manejar errores del estado de Redux
  useEffect(() => {
    if (gruposError && error_message && !loading && !gruposLoading) {
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
  }, [gruposError, error_message, loading, gruposLoading]);


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(groupSchema),
    defaultValues: {
      codigo: "",
      tipo: "",
      nivel: "",
      descripcion: "",
      horarios: [{ 
        dia: "", 
        hora_inicio: "", 
        hora_fin: "", 
        profesor_id: "",
        cupo_maximo: ""
      }]
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "horarios"
  });

  const tipoSeleccionado = watch("tipo");
  const tipoInfo = tiposClase.find(t => t.value === tipoSeleccionado);

  // Función para aplicar configuración global a todos los horarios
  const applyGlobalSettings = async () => {
    fields.forEach((_, index) => {
      if (globalSettings.hora_inicio) {
        setValue(`horarios.${index}.hora_inicio`, globalSettings.hora_inicio, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
      if (globalSettings.hora_fin) {
        setValue(`horarios.${index}.hora_fin`, globalSettings.hora_fin, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
      if (globalSettings.cupo_maximo) {
        setValue(`horarios.${index}.cupo_maximo`, globalSettings.cupo_maximo, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
    });
    
    // Forzar revalidación completa como respaldo
    await trigger('horarios');
    
    // Feedback al usuario
    toast.success("Configuración aplicada a todos los horarios");
  };

  const onInvalidSubmit = (errors) => {
    console.log("🚫 Errores de validación:", errors);
    
    // Buscar el primer error y mostrarlo
    if (errors.codigo) {
      toast.error(`Error en código: ${errors.codigo.message}`);
    } else if (errors.tipo) {
      toast.error(`Error en tipo: ${errors.tipo.message}`);
    } else if (errors.nivel) {
      toast.error(`Error en nivel: ${errors.nivel.message}`);
    } else if (errors.descripcion) {
      toast.error(`Error en descripción: ${errors.descripcion.message}`);
    } else if (errors.horarios) {
      // Si hay errores en horarios, ser más específico
      if (errors.horarios[0].message) {
        // Error general del array de horarios
        toast.error(`Error en horarios: ${errors.horarios[0].message}`);
      } else if (Array.isArray(errors.horarios)) {
        // Buscar el primer horario con error
        const firstErrorIndex = errors.horarios.findIndex(horario => horario);
        if (firstErrorIndex !== -1) {
          const horarioError = errors.horarios[firstErrorIndex];
          let errorMessage = `Horario ${firstErrorIndex + 1}: `;
          
          if (horarioError.dia) {
            errorMessage += horarioError.dia.message;
          } else if (horarioError.hora_inicio) {
            errorMessage += horarioError.hora_inicio.message;
          } else if (horarioError.hora_fin) {
            errorMessage += horarioError.hora_fin.message;
          } else if (horarioError.cupo_maximo) {
            errorMessage += horarioError.cupo_maximo.message;
          } else if (horarioError.profesor_id) {
            errorMessage += horarioError.profesor_id.message;
          }
          
          toast.error(`${errorMessage}`);
        }
      }
    } else {
      // Error genérico si no se puede identificar el campo específico
      toast.error("Por favor revisa los campos marcados en rojo");
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Procesar datos antes de enviar según la estructura esperada por tu API
      const processedData = {
        codigo: data.codigo.trim(),
        nombre: `${tipoInfo?.label} - ${data.codigo.trim()}`,
        tipo: data.tipo,
        nivel: data.nivel?.trim() || null,
        descripcion: data.descripcion?.trim() || null,
        activo: true, // Por defecto los grupos nuevos están activos
        horarios: data.horarios.map(horario => ({
          dia: horario.dia,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          profesor_id: horario.profesor_id && horario.profesor_id !== "" ? parseInt(horario.profesor_id) : null,
          cupo_maximo: horario.cupo_maximo && horario.cupo_maximo !== "" ? parseInt(horario.cupo_maximo) : (tipoInfo?.cupoSugerido || 16),
          activo: true
        }))
      };
      
      console.log("📋 Datos del grupo a enviar:", processedData);
      
      // Llamar al thunk de Redux
      const resultAction = await dispatch(addGrupoThunk(processedData));
      console.log("📦 Acción de Redux enviada:", resultAction);
      // Verificar si la acción fue exitosa
      if (addGrupoThunk.fulfilled.match(resultAction)) {
        // Éxito
        toast.success("Grupo creado exitosamente");
        console.log("✅ Grupo creado:", resultAction.payload);
        
        // Limpiar formulario
        reset();
        setGlobalSettings({ hora_inicio: "", hora_fin: "", cupo_maximo: "" });
        
      }
      
    } catch (error) {
      // Error no manejado por el thunk
      console.error("❌ Error inesperado:", error);
      toast.error("Error inesperado al crear el grupo");
    } finally {
      setLoading(false);
    }
  };

  const agregarHorario = () => {
    append({ 
      dia: "", 
      hora_inicio: globalSettings.hora_inicio || "", 
      hora_fin: globalSettings.hora_fin || "", 
      profesor_id: "",
      cupo_maximo: globalSettings.cupo_maximo || ""
    });
  };

  const eliminarHorario = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Grupo
          </h1>
          <p className="mt-2 text-gray-600 dark:text-dark-300">
            Configure un nuevo grupo de clases con sus horarios, cupos y días disponibles
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Información Básica del Grupo */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <UserGroupIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Información Básica del Grupo
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    {...register("codigo")}
                    label="Código del Grupo*"
                    placeholder="Ej: GAD-001, GPS-002"
                    error={errors.codigo?.message}
                    prefix={<UserGroupIcon className="h-5 w-5" />}
                  />

                  <div className="md:col-span-2">
                    <Select
                      {...register("tipo")}
                      label="Tipo de Clase*"
                      error={errors.tipo?.message}
                    >
                      <option value="">Selecciona un tipo de clase</option>
                      {tiposClase.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.icon} {tipo.label}
                        </option>
                      ))}
                    </Select>
                    
                    <AnimatePresence>
                      {tipoInfo && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{tipoInfo.icon}</div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                                {tipoInfo.label}
                              </h4>
                              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                                {tipoInfo.description}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200">
                                  <UsersIcon className="w-3 h-3 mr-1" />
                                  Cupo sugerido: {tipoInfo.cupoSugerido} personas
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Select
                    {...register("nivel")}
                    label="Nivel"
                    error={errors.nivel?.message}
                  >
                    <option value="">Selecciona un nivel</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                    <option value="Mixto">Mixto</option>
                  </Select>

                  <div className="md:col-span-2">
                    <Textarea
                      {...register("descripcion")}
                      label="Descripción"
                      placeholder="Describe los objetivos y características específicas del grupo..."
                      rows={3}
                      error={errors.descripcion?.message}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Horarios y Días */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Horarios y Días
                    </h2>
                  </div>
                  <Button
                    type="button"
                    onClick={agregarHorario}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Agregar Horario</span>
                  </Button>
                </div>

                {/* Configuración Global */}
                <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-3">
                    <div className="h-5 w-5 text-blue-600 mr-2">⚙️</div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Configuración Global de Horarios
                    </h3>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Define valores que se aplicarán a todos los horarios de una vez
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      type="time"
                      label="Hora de Inicio Global"
                      value={globalSettings.hora_inicio}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, hora_inicio: e.target.value }))}
                      placeholder="Ej: 08:00"
                    />
                    <Input
                      type="time"
                      label="Hora de Fin Global"
                      value={globalSettings.hora_fin}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, hora_fin: e.target.value }))}
                      placeholder="Ej: 09:00"
                    />
                    <Input
                      type="number"
                      label="Cupo Global"
                      value={globalSettings.cupo_maximo}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, cupo_maximo: e.target.value }))}
                      placeholder={tipoInfo?.cupoSugerido?.toString() || "16"}
                      min="1"
                      max="50"
                      prefix={<UsersIcon className="h-4 w-4" />}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={applyGlobalSettings}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/20"
                      disabled={!globalSettings.hora_inicio && !globalSettings.hora_fin && !globalSettings.cupo_maximo}
                    >
                      📝 Aplicar a Todos los Horarios
                    </Button>
                  </div>
                </Card>

                <div className="space-y-4">
                  <AnimatePresence>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="p-4 bg-gray-50 dark:bg-dark-700/50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2" />
                              Horario {index + 1}
                            </h3>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => eliminarHorario(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <TrashIcon className="h-4 w-4" />
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
                                  label="Hora de Inicio*"
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
                                  label="Hora de Fin*"
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
                                  {professors.length > 0 ? (
                                    professors.map(profesor => (
                                      <option key={profesor.id} value={profesor.id}>
                                        {profesor.nombre} {profesor.apellido}
                                      </option>
                                    ))
                                  ) : (
                                    <option value="" disabled>
                                      Cargando profesores...
                                    </option>
                                  )}
                                </Select>
                              )}
                            />

                            <Controller
                              name={`horarios.${index}.cupo_maximo`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  type="number"
                                  label="Cupo*"
                                  placeholder={tipoInfo?.cupoSugerido?.toString() || "16"}
                                  min="1"
                                  max="50"
                                  error={errors.horarios?.[index]?.cupo_maximo?.message}
                                  prefix={<UsersIcon className="h-4 w-4" />}
                                />
                              )}
                            />
                          </div>

                          {tipoInfo && (
                            <div className="mt-3 text-xs text-gray-500 dark:text-dark-300">
                              💡 Cupo sugerido para {tipoInfo.label}: {tipoInfo.cupoSugerido} personas
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {errors.horarios?.message && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.horarios.message}
                  </p>
                )}

                {/* Nota sobre nado libre y activación física */}
                <AnimatePresence>
                  {(tipoSeleccionado === 'nado_libre' || tipoSeleccionado === 'activacion_fisica_adulto_mayor') && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                    >
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>💡 Nota:</strong> 
                        {tipoSeleccionado === 'nado_libre' && 
                          ' Para clases de nado libre no es necesario asignar un profesor, ya que los usuarios tendrán acceso libre a la piscina durante estos horarios.'
                        }
                        {tipoSeleccionado === 'activacion_fisica_adulto_mayor' && 
                          ' Las clases de activación física para adulto mayor requieren instructor especializado en actividades terapéuticas acuáticas.'
                        }
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Resumen de información */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 text-primary-600 mr-3">📋</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Resumen del Grupo
                  </h2>
                </div>

                <div className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-dark-200">Código:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {watch("codigo") || "Sin código"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-dark-200">Tipo:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {tipoInfo ? `${tipoInfo.icon} ${tipoInfo.label}` : "Sin tipo"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-dark-200">Nombre generado:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {tipoInfo && watch("codigo") ? `${tipoInfo.label} - ${watch("codigo")}` : "Se generará automáticamente"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-dark-200">Cupo sugerido:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {tipoInfo?.cupoSugerido || 16} personas
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-dark-200">Horarios:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {fields.length} configurado{fields.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-dark-200">Nivel:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {watch("nivel") || "Sin nivel"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Botones de acción */}
            <motion.div 
              variants={fadeInUp}
              className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-dark-600"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setGlobalSettings({ hora_inicio: "", hora_fin: "", cupo_maximo: "" });
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit, onInvalidSubmit)}
                disabled={loading || gruposLoading}
                className="min-w-[120px]"
              >
                {(loading || gruposLoading) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creando...</span>
                  </div>
                ) : (
                  "Crear Grupo"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}