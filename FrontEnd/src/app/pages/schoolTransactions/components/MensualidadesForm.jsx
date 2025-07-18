// views/inscripciones/components/MensualidadesForm.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Configurar el plugin
dayjs.extend(isSameOrBefore);

import { 
    CalendarDaysIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    ArrowLeftIcon,
    CurrencyDollarIcon,
    InformationCircleIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BarsArrowUpIcon
} from "@heroicons/react/24/outline";

// Redux
import { getGruposConHorariosThunk } from "slices/thunk";

// Componentes
import { Input, Button, Card, Select, ScrollShadow } from "../../../../components/ui";
import { DatePicker } from "../../../../components/shared/form/Datepicker";

const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' }
];

const MensualidadesForm = ({ datosIniciales, onDatosCompletos, onVolver, loading }) => {
    // console.log("Datos iniciales recibidos:", datosIniciales);
    const dispatch = useDispatch();
    const { gruposConHorarios: grupos } = useSelector((state) => state.groups);
    const { tarifas } = useSelector((state) => state.inscripciones);

    // Estados locales
    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [mensualidadActiva, setMensualidadActiva] = useState(0);
    const [sidebarMobile, setSidebarMobile] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Cargar profesores al montar el componente
    useEffect(() => {
        dispatch(getGruposConHorariosThunk());
    }, [dispatch]);

    // Actualizar estado local cuando cambien los profesores
    useEffect(() => {
        if (Array.isArray(grupos)) {
            const activeProfessors = grupos.filter(grupo => grupo.activo && !grupo.deleted);
            setGruposDisponibles(activeProfessors);
        } else {
            setGruposDisponibles([]);
        }
    }, [grupos]);

    // MOVER LAS FUNCIONES AQUÍ - ANTES DEL useForm
    
    // Función para validar horarios del mismo día
    const validarHorariosMismoDia = useCallback((grupoId, horariosSeleccionados) => {
        const grupo = gruposDisponibles.find(g => g.id === parseInt(grupoId));
        if (!grupo?.horarios) return true;
        
        const diasUsados = new Set();
        
        for (const horarioObj of horariosSeleccionados) {
            const horarioCompleto = grupo.horarios.find(h => h.id === parseInt(horarioObj.horario_id));
            if (horarioCompleto) {
                if (diasUsados.has(horarioCompleto.dia)) {
                    return false; // Ya hay un horario para este día
                }
                diasUsados.add(horarioCompleto.dia);
            }
        }
        
        return true;
    }, [gruposDisponibles]);

    // Schema de validación actualizado con dayjs - MOVER DESPUÉS DE LA FUNCIÓN
    const mensualidadSchema = useMemo(() => Yup.object().shape({
        mensualidades: Yup.array()
            .of(
                Yup.object().shape({
                    fecha_inicio: Yup.date()
                        .required('La fecha de inicio es requerida')
                        .min(dayjs().startOf('day').toDate(), 'La fecha de inicio no puede ser anterior a hoy'),
                    meses_duracion: Yup.number()
                        .min(1, 'Debe ser al menos 1 mes')
                        .max(12, 'Máximo 12 meses')
                        .required('Los meses de duración son requeridos'),
                    grupo_id: Yup.number().required('Debe seleccionar un grupo'),
                    horarios: Yup.array()
                        .of(
                            Yup.object().shape({
                                horario_id: Yup.number().required('Debe seleccionar un horario')
                            })
                        )
                        .min(1, 'Debe seleccionar al menos un horario')
                        .test('horarios-mismo-dia', 'No se pueden seleccionar múltiples horarios del mismo día', function(horarios) {
                            if (!horarios || horarios.length <= 1) return true;
                            
                            const horariosValidos = horarios.filter(h => h.horario_id && h.horario_id !== '');
                            if (horariosValidos.length <= 1) return true;
                            
                            const grupoId = this.parent.grupo_id;
                            if (!grupoId) return true;
                            
                            return validarHorariosMismoDia(grupoId, horariosValidos);
                        }),
                    descuento_aplicado: Yup.number()
                        .min(0, 'El descuento no puede ser negativo')
                        .test('descuento-valido', 'El descuento no puede ser mayor al monto total', function(value) {
                            const monto_total = this.parent.monto_total;
                            return !value || !monto_total || value <= monto_total;
                        }),
                    metodo_pago: Yup.string().required('Debe seleccionar un método de pago')
                })
            )
            .min(1, 'Debe agregar al menos una mensualidad')
    }), [validarHorariosMismoDia]);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(mensualidadSchema),
        defaultValues: {
            mensualidades: datosIniciales.length > 0 ? datosIniciales.map(mensualidad => ({
                fecha_inicio: mensualidad.fecha_inicio ? mensualidad.fecha_inicio : '',
                meses_duracion: mensualidad.meses_duracion || 1,
                grupo_id: mensualidad.grupos?.[0]?.grupo_id || '',
                horarios: mensualidad.grupos?.[0]?.horarios?.map(h => ({ 
                    horario_id: h.horario_id 
                })) || [{ horario_id: '' }],
                descuento_aplicado: mensualidad.descuento_aplicado || 0,
                metodo_pago: mensualidad.metodo_pago || 'efectivo',
                monto_total: mensualidad.monto_total || 0
            })) : [{
                fecha_inicio: '',
                meses_duracion: 1,
                grupo_id: '',
                horarios: [{ horario_id: '' }],
                descuento_aplicado: 0,
                metodo_pago: 'efectivo'
            }]
        }
    });

    const { fields: mensualidadFields, append: appendMensualidad, remove: removeMensualidad } = useFieldArray({
        control,
        name: "mensualidades"
    });

    // Efecto para establecer valores cuando se cargan los grupos y hay datos iniciales
    useEffect(() => {
        if (datosIniciales.length > 0 && gruposDisponibles.length > 0 && !isInitialized) {
            // console.log("Datos iniciales:", datosIniciales);
            // Esperar un tick para que el formulario esté completamente inicializado
            setTimeout(() => {
                datosIniciales.forEach((mensualidad, index) => {
                    if (mensualidad.grupos?.[0]) {
                        const grupo = mensualidad.grupos[0];

                        // Establecer la fecha de inicio TAMBIÉN
                        if (mensualidad.fecha_inicio) {
                            setValue(`mensualidades.${index}.fecha_inicio`, mensualidad.fecha_inicio);
                        }
                        
                        // Establecer el grupo
                        setValue(`mensualidades.${index}.grupo_id`, grupo.grupo_id.toString());
                        
                        // Establecer los horarios
                        if (grupo.horarios && grupo.horarios.length > 0) {
                            const horariosActuales = getValues(`mensualidades.${index}.horarios`) || [];
                            
                            // Si necesitamos más campos de horarios, establecer todo el array
                            if (grupo.horarios.length > horariosActuales.length) {
                                // Crear el array completo de horarios
                                const horariosCompletos = grupo.horarios.map(horario => ({
                                    horario_id: horario.horario_id.toString()
                                }));
                                
                                // Establecer todo el array de una vez
                                setValue(`mensualidades.${index}.horarios`, horariosCompletos);
                            } else {
                                // Si ya hay suficientes campos, solo establecer los valores
                                grupo.horarios.forEach((horario, hIndex) => {
                                    setValue(`mensualidades.${index}.horarios.${hIndex}.horario_id`, horario.horario_id.toString());
                                });
                            }
                        }
                    }
                });
                setIsInitialized(true);
            }, 100);
        }
    }, [datosIniciales, gruposDisponibles, setValue, getValues, isInitialized]);

    useEffect(() => {
        // Solo marcar como inicializado si no hay datos iniciales o si ya se procesaron
        if (mensualidadFields.length > 0 && !isInitialized && datosIniciales.length === 0) {
            setIsInitialized(true);
        }
    }, [mensualidadFields.length, isInitialized, datosIniciales.length]);

    const watchedMensualidades = watch("mensualidades");

    // Función para calcular fecha fin basada en meses usando dayjs
    const calcularFechaFin = useCallback((fechaInicio, meses) => {
        if (!fechaInicio || !meses) return null;

        if (Array.isArray(fechaInicio)) {
            fechaInicio = fechaInicio[0];
        }

        let fechaInicioDayjs;
        
        try {
            if (fechaInicio instanceof Date) {
                fechaInicioDayjs = dayjs(fechaInicio);
            } else {
                fechaInicioDayjs = dayjs(fechaInicio);
            }
            
            if (!fechaInicioDayjs.isValid()) {
                console.error("Fecha inválida");
                return null;
            }
            
            let fechaFin;
            if (parseInt(meses) === 1) {
                fechaFin = fechaInicioDayjs.endOf('month');
            } else {
                fechaFin = fechaInicioDayjs.add(parseInt(meses) - 1, 'month').endOf('month');
            }
            
            return fechaFin.toDate();
            
        } catch (error) {
            console.error("Error al procesar fecha:", error);
            return null;
        }
    }, []);

    // Función para formatear fecha con dayjs
    const formatearFecha = useCallback((fecha) => {
        if (!fecha) return '';
        
        try {
            const fechaDayjs = dayjs(fecha);
            
            if (!fechaDayjs.isValid()) {
                console.error("Fecha inválida para formatear");
                return '';
            }
            
            return fechaDayjs.format('DD/MM/YYYY');
        } catch (error) {
            console.error("Error al formatear fecha:", error);
            return '';
        }
    }, []);

    // Contar clases en un período específico considerando horarios
    const contarClasesEnPeriodo = useCallback((fechaInicio, fechaFin, horariosCompletos) => {
        let contador = 0;
        let fechaActual = dayjs(fechaInicio);
        const fechaFinDayjs = dayjs(fechaFin);
        const ahora = dayjs();
        
        if (!fechaActual.isValid() || !fechaFinDayjs.isValid()) {
            console.error("Fechas inválidas en contarClasesEnPeriodo");
            return 0;
        }
        
        const mapaDias = {
            'domingo': 0,
            'lunes': 1,
            'martes': 2,
            'miercoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sabado': 6
        };
        
        while (fechaActual.isSameOrBefore(fechaFinDayjs, 'day')) {
            const diaDeLaSemana = fechaActual.day();
            
            // Verificar si hay horarios para este día
            const horariosDelDia = horariosCompletos.filter(horario => {
                const diaNumero = mapaDias[horario.dia.toLowerCase()];
                return diaNumero === diaDeLaSemana;
            });
            
            // Para cada horario de este día, verificar si la clase es válida
            horariosDelDia.forEach(horario => {
                // Crear la fecha y hora exacta de la clase
                const fechaHoraClase = fechaActual
                    .hour(parseInt(horario.hora_inicio.split(':')[0]))
                    .minute(parseInt(horario.hora_inicio.split(':')[1]))
                    .second(0);
                
                // Si la clase es en el futuro, o si es hoy pero aún no ha pasado la hora
                if (fechaHoraClase.isAfter(ahora) || fechaHoraClase.isSame(fechaActual, 'day') && fechaHoraClase.isAfter(ahora)) {
                    contador++;
                } else if (!fechaHoraClase.isSame(ahora, 'day')) {
                    // Si no es hoy, contar la clase normalmente
                    contador++;
                }
                // Si es hoy pero ya pasó la hora, no contar
            });
            
            fechaActual = fechaActual.add(1, 'day');
        }
        
        return contador;
    }, []);

    // Función para obtener días ya seleccionados
    const getDiasSeleccionados = useCallback((mensualidadIndex) => {
        const mensualidad = watchedMensualidades[mensualidadIndex];
        if (!mensualidad?.grupo_id || !mensualidad?.horarios) return new Set();
        
        const grupo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
        if (!grupo?.horarios) return new Set();
        
        const diasSeleccionados = new Set();
        
        mensualidad.horarios.forEach(horarioObj => {
            if (horarioObj.horario_id && horarioObj.horario_id !== '') {
                const horarioCompleto = grupo.horarios.find(h => h.id === parseInt(horarioObj.horario_id));
                if (horarioCompleto) {
                    diasSeleccionados.add(horarioCompleto.dia);
                }
            }
        });
        
        return diasSeleccionados;
    }, [watchedMensualidades, gruposDisponibles]);

    // Función para verificar si un horario está deshabilitado
    const isHorarioDeshabilitado = useCallback((mensualidadIndex, horarioId, horarioActualIndex) => {
        const mensualidad = watchedMensualidades[mensualidadIndex];
        if (!mensualidad?.grupo_id || !horarioId) return false;
        
        const grupo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
        if (!grupo?.horarios) return false;
        
        const horarioCompleto = grupo.horarios.find(h => h.id === parseInt(horarioId));
        if (!horarioCompleto) return false;
        
        const horarioActual = mensualidad.horarios[horarioActualIndex];
        const horarioActualId = horarioActual?.horario_id;
        
        // Si es el horario actualmente seleccionado, no deshabilitar
        if (horarioActualId && parseInt(horarioActualId) === parseInt(horarioId)) {
            return false;
        }
        
        // Verificar si hay otros horarios del mismo día ya seleccionados
        const diasSeleccionados = getDiasSeleccionados(mensualidadIndex);
        return diasSeleccionados.has(horarioCompleto.dia);
    }, [watchedMensualidades, gruposDisponibles, getDiasSeleccionados]);

    // RESTO DE FUNCIONES PERMANECEN IGUAL...
    
    // Función para calcular monto de mensualidad con cálculo proporcional basado en clases reales
    const calcularMontoMensualidad = useCallback((mensualidad) => {
        if (!mensualidad.fecha_inicio || !mensualidad.meses_duracion || !mensualidad.grupo_id || !mensualidad.horarios?.length) {
            return 0;
        }

        const mesesDuracion = parseInt(mensualidad.meses_duracion);
        const cantidadHorarios = mensualidad.horarios.filter(h => h.horario_id && h.horario_id !== '').length;

        if (cantidadHorarios === 0) {
            return 0;
        }

        const grupoInfo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
        if (!grupoInfo) {
            return 0;
        }

        const horariosSeleccionados = mensualidad.horarios
            .filter(h => h.horario_id && h.horario_id !== '')
            .map(h => {
                const horario = grupoInfo.horarios?.find(gh => gh.id === parseInt(h.horario_id));
                return horario;
            })
            .filter(Boolean);

        // const diasSemana = horariosSeleccionados.map(h => h.dia);

        const tarifa = tarifas?.find(t => 
            t.tipo_clase === grupoInfo.tipo && 
            t.clases_por_semana === cantidadHorarios
        );

        let tarifaMensual = 0;
        if (tarifa) {
            tarifaMensual = parseFloat(tarifa.monto_mensual) || 0;
            if (isNaN(tarifaMensual) || tarifaMensual <= 0) {
                tarifaMensual = cantidadHorarios * 150;
            }
        } else {
            tarifaMensual = cantidadHorarios * 150;
        }

        let montoTotal = 0;
        
        for (let mesIndex = 0; mesIndex < mesesDuracion; mesIndex++) {
            let fechaInicioMes;

            if (Array.isArray(mensualidad.fecha_inicio)) {
                fechaInicioMes = dayjs(mensualidad.fecha_inicio[0]);
            } else {
                fechaInicioMes = dayjs(mensualidad.fecha_inicio);
            }
            
            if (mesIndex > 0) {
                fechaInicioMes = fechaInicioMes.add(mesIndex, 'month').startOf('month');
            }

            
            const esPrimerMes = mesIndex === 0;
            
            if (esPrimerMes) {
                const finDelMes = fechaInicioMes.endOf('month');
                
                const clasesRealesEnPeriodo = contarClasesEnPeriodo(fechaInicioMes, finDelMes, horariosSeleccionados);

                const inicioMesCompleto = fechaInicioMes.startOf('month');
                const finMesCompleto = fechaInicioMes.endOf('month');
                const clasesTotalesDelMes = contarClasesEnPeriodo(inicioMesCompleto, finMesCompleto, horariosSeleccionados);
                
                const semanasRestantes = (finDelMes.diff(fechaInicioMes, 'day') + 1) / 7;
                
                if (semanasRestantes < 4) {
                    const proporcionClases = clasesTotalesDelMes > 0 ? clasesRealesEnPeriodo / clasesTotalesDelMes : 0;
                    const montoProporcional = tarifaMensual * proporcionClases;
                    
                    const montoValidado = parseFloat(montoProporcional) || 0;
                    if (!isNaN(montoValidado) && montoValidado >= 0) {
                        montoTotal += montoValidado;
                    }
                    
                } else {
                    montoTotal += Number(tarifaMensual);
                }
            } else {
                montoTotal += Number(tarifaMensual);
            }
        }
        
        const montoFinal = parseFloat(montoTotal) || 0;
        if (isNaN(montoFinal) || montoFinal < 0) {
            return 0;
        }
        return Math.round(montoFinal * 100) / 100;
    }, [gruposDisponibles, tarifas, contarClasesEnPeriodo]);

    // Obtener información sobre cálculo proporcional basado en clases
    const obtenerInfoProporcional = useCallback((mensualidad) => {
        if (!mensualidad.fecha_inicio || !mensualidad.grupo_id || !mensualidad.horarios?.length) {
            return null;
        }

        const cantidadHorarios = mensualidad.horarios.filter(h => h.horario_id && h.horario_id !== '').length;
        if (cantidadHorarios === 0) return null;

        let fechaInicio;
        if (Array.isArray(mensualidad.fecha_inicio)) {
            fechaInicio = dayjs(mensualidad.fecha_inicio[0]);
        } else {
            fechaInicio = dayjs(mensualidad.fecha_inicio);
        }

        if (!fechaInicio.isValid()) {
            return null;
        }

        const finDelMes = fechaInicio.endOf('month');
        const diasRestantesEnMes = finDelMes.diff(fechaInicio, 'day') + 1;
        const semanasRestantes = diasRestantesEnMes / 7;

        const grupoInfo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
        if (!grupoInfo) return null;

        const horariosSeleccionados = mensualidad.horarios
            .filter(h => h.horario_id && h.horario_id !== '')
            .map(h => {
                const horario = grupoInfo.horarios?.find(gh => gh.id === parseInt(h.horario_id));
                return horario;
            })
            .filter(Boolean);

        const diasSemana = horariosSeleccionados.map(h => h.dia);

        const clasesRealesEnPeriodo = contarClasesEnPeriodo(fechaInicio, finDelMes, horariosSeleccionados);
        const inicioMesCompleto = fechaInicio.startOf('month');
        const finMesCompleto = fechaInicio.endOf('month');
        const clasesTotalesDelMes = contarClasesEnPeriodo(inicioMesCompleto, finMesCompleto, horariosSeleccionados);

        const tarifa = tarifas?.find(t => 
            t.tipo_clase === grupoInfo?.tipo && 
            t.clases_por_semana === cantidadHorarios
        );
        
        let tarifaMensual = 0;
        if (tarifa && tarifa.monto_mensual) {
            const montoFromDB = Number(tarifa.monto_mensual);
            if (!isNaN(montoFromDB) && montoFromDB > 0) {
                tarifaMensual = montoFromDB;
            } else {
                tarifaMensual = cantidadHorarios * 150;
            }
        } else {
            tarifaMensual = cantidadHorarios * 150;
        }

        const proporcionClases = clasesTotalesDelMes > 0 ? clasesRealesEnPeriodo / clasesTotalesDelMes : 0;
        const esProporcional = semanasRestantes < 4;

        let montoCalculado = 0;
        if (esProporcional) {
            montoCalculado = tarifaMensual * proporcionClases;
        } else {
            montoCalculado = tarifaMensual;
        }

        if (isNaN(montoCalculado) || montoCalculado < 0) {
            montoCalculado = 0;
        }

        montoCalculado = Math.round(montoCalculado * 100) / 100;
        tarifaMensual = Math.round(tarifaMensual * 100) / 100;

        return {
            fechaInicio: fechaInicio.format('DD/MM/YYYY'),
            finDelMes: finDelMes.format('DD/MM/YYYY'),
            diasRestantes: diasRestantesEnMes,
            semanasRestantes: semanasRestantes,
            diasSemana: diasSemana,
            horariosSeleccionados: horariosSeleccionados,
            clasesRealesEnPeriodo: clasesRealesEnPeriodo,
            clasesTotalesDelMes: clasesTotalesDelMes,
            esProporcional: esProporcional,
            proporcionClases: proporcionClases,
            tarifaMensual: tarifaMensual,
            montoCalculado: montoCalculado
        };
    }, [gruposDisponibles, tarifas, contarClasesEnPeriodo]);

    // Actualizar montos automáticamente
    useEffect(() => {
        watchedMensualidades.forEach((mensualidad, index) => {
            const montoCalculado = calcularMontoMensualidad(mensualidad);
            if (montoCalculado > 0 && parseFloat(mensualidad.monto_total || 0) !== montoCalculado) {
                setValue(`mensualidades.${index}.monto_total`, montoCalculado, { shouldValidate: false, shouldDirty: false });
            }
        });
    }, [watchedMensualidades, calcularMontoMensualidad, setValue]);

    // Agregar nueva mensualidad
    const agregarMensualidad = useCallback(() => {
        appendMensualidad({
            fecha_inicio: '',
            meses_duracion: 1,
            grupo_id: '',
            horarios: [{ horario_id: '' }],
            descuento_aplicado: 0,
            metodo_pago: 'efectivo'
        });
        // Cambiar a la nueva mensualidad
        setMensualidadActiva(mensualidadFields.length);
    }, [appendMensualidad, mensualidadFields.length]);

    const obtenerInfoTarifa = useCallback((mensualidad) => {
        if (!mensualidad.grupo_id || !mensualidad.horarios?.length) {
            return null;
        }
    
        const cantidadHorarios = mensualidad.horarios.filter(h => h.horario_id && h.horario_id !== '').length;
        const grupoInfo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
        
        if (!grupoInfo || cantidadHorarios === 0) {
            return null;
        }
    
        const tarifa = tarifas?.find(t => 
            t.tipo_clase === grupoInfo.tipo && 
            t.clases_por_semana === cantidadHorarios
        );
    
        let precioPorMes = 0;
        
        if (tarifa && tarifa.monto_mensual) {
            precioPorMes = parseFloat(tarifa.monto_mensual) || 0;
        } else {
            precioPorMes = cantidadHorarios * 150;
        }
    
        if (isNaN(precioPorMes) || precioPorMes < 0) {
            precioPorMes = cantidadHorarios * 150;
        }
    
        return {
            cantidadHorarios,
            grupoInfo,
            tarifa,
            usaTarifaDefault: !tarifa,
            precioPorMes: Number(precioPorMes)
        };
    }, [gruposDisponibles, tarifas]);

    const triggerResumenUpdate = useCallback(() => {
        if (isInitialized) {
            setUpdateTrigger(prev => prev + 1);
        }
    }, [isInitialized])

    // Eliminar mensualidad
    const eliminarMensualidad = useCallback((index) => {
        if (mensualidadFields.length > 1) {
            removeMensualidad(index);
            // Ajustar mensualidad activa si es necesario
            if (index === mensualidadActiva && index > 0) {
                setMensualidadActiva(index - 1);
            } else if (index < mensualidadActiva) {
                setMensualidadActiva(mensualidadActiva - 1);
            }
        }

        triggerResumenUpdate();

    }, [mensualidadFields.length, removeMensualidad, mensualidadActiva, triggerResumenUpdate]);

    // Obtener horarios disponibles para un grupo
    const getHorariosDisponibles = useCallback((grupoId) => {
        const grupo = gruposDisponibles.find(g => g.id === parseInt(grupoId));
        return grupo?.horarios || [];
    }, [gruposDisponibles]);

    // Enviar datos
    const onSubmit = useCallback((data) => {
        const mensualidadesProcesadas = data.mensualidades.map(mensualidad => {
            const fechaFin = calcularFechaFin(mensualidad.fecha_inicio, mensualidad.meses_duracion);
            const montoCalculado = calcularMontoMensualidad(mensualidad);
            
            const grupoInfo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
            
            const horariosEnriquecidos = mensualidad.horarios
                .filter(h => h.horario_id && h.horario_id !== '')
                .map(h => {
                    const horarioCompleto = grupoInfo?.horarios?.find(gh => gh.id === parseInt(h.horario_id));
                    return {
                        horario_id: parseInt(h.horario_id),
                        dia: horarioCompleto?.dia || '',
                        hora_inicio: horarioCompleto?.hora_inicio || '',
                        hora_fin: horarioCompleto?.hora_fin || '',
                        nombre_profesor: horarioCompleto?.nombre_profesor || null
                    };
                });
            return {
                fecha_inicio: mensualidad.fecha_inicio,
                fecha_fin: fechaFin.toISOString().split('T')[0],
                meses_duracion: parseInt(mensualidad.meses_duracion),
                monto_total: montoCalculado,
                descuento_aplicado: parseFloat(mensualidad.descuento_aplicado || 0),
                metodo_pago: mensualidad.metodo_pago,
                grupos: [{
                    grupo_id: parseInt(mensualidad.grupo_id),
                    grupo_codigo: grupoInfo?.codigo || '',
                    grupo_nombre: grupoInfo?.nombre || '',
                    grupo_tipo: grupoInfo?.tipo || '',
                    horarios: horariosEnriquecidos
                }]
            };
        });
    
        if (onDatosCompletos) {
            onDatosCompletos(mensualidadesProcesadas);
        }
    }, [onDatosCompletos, calcularFechaFin, calcularMontoMensualidad, gruposDisponibles]);

    // Calcular totales
    const totales = useMemo(() => {
        return watchedMensualidades.reduce((acc, mensualidad) => {
            const monto = calcularMontoMensualidad(mensualidad);
            const descuento = parseFloat(mensualidad.descuento_aplicado || 0);
    
            const montoValidado = parseFloat(monto) || 0;
            const descuentoValidado = parseFloat(descuento) || 0;
    
            if (!isNaN(montoValidado) && montoValidado >= 0) {
                acc.subtotal += montoValidado;
            }
            if (!isNaN(descuentoValidado) && descuentoValidado >= 0) {
                acc.descuentos += descuentoValidado;
            }
    
            const totalItem = montoValidado - descuentoValidado;
            if (!isNaN(totalItem)) {
                acc.total += Math.max(0, totalItem);
            }
            return acc;
        }, { subtotal: 0, descuentos: 0, total: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedMensualidades, calcularMontoMensualidad, updateTrigger]);

    // Generar resumen detallado de mensualidades
    const resumenDetallado = useMemo(() => {
        return watchedMensualidades.map((mensualidad, index) => {
            const fechaInicio = mensualidad.fecha_inicio;
            const fechaFin = calcularFechaFin(fechaInicio, mensualidad.meses_duracion);
            const grupo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
            const horariosSeleccionados = mensualidad.horarios?.filter(h => h.horario_id) || [];
            
            const monto = calcularMontoMensualidad(mensualidad);
            const descuento = parseFloat(mensualidad.descuento_aplicado || 0);
            const total = monto - descuento;

            const infoTarifa = obtenerInfoTarifa(mensualidad);

            return {
                index: index + 1,
                fechaInicio: formatearFecha(fechaInicio),
                fechaFin: formatearFecha(fechaFin),
                duracionMeses: parseInt(mensualidad.meses_duracion || 0),
                grupo: grupo ? `${grupo.codigo} - ${grupo.nombre}` : 'No seleccionado',
                cantidadHorarios: horariosSeleccionados.length,
                subtotal: monto,
                descuento: descuento,
                total: total,
                metodoPago: METODOS_PAGO.find(m => m.value === mensualidad.metodo_pago)?.label || mensualidad.metodo_pago,
                infoTarifa
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedMensualidades, calcularFechaFin, gruposDisponibles, formatearFecha, calcularMontoMensualidad, obtenerInfoTarifa, updateTrigger]);

    // Obtener título corto para la barra
    const getTituloMensualidad = useCallback((index) => {
        const mensualidad = watchedMensualidades[index];
        if (!mensualidad) return `Mensualidad ${index + 1}`;
        
        const grupo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
        const fechaInicio = mensualidad.fecha_inicio ? formatearFecha(mensualidad.fecha_inicio) : 'Sin fecha';
        
        if (grupo) {
            return `${grupo.codigo} - ${fechaInicio}`;
        }
        return `Mensualidad ${index + 1}`;
    }, [watchedMensualidades, gruposDisponibles, formatearFecha]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Configurar Mensualidades
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                                Define las mensualidades por duración en meses, grupos y horarios del alumno
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Botón para mostrar/ocultar sidebar en móvil */}
                        <Button
                            type="button"
                            onClick={() => setSidebarMobile(!sidebarMobile)}
                            variant="outline"
                            size="sm"
                            className="lg:hidden flex items-center space-x-2"
                        >
                            <BarsArrowUpIcon className="h-4 w-4" />
                            <span>Mensualidades ({mensualidadFields.length})</span>
                        </Button>
                        
                        <Button
                            type="button"
                            onClick={agregarMensualidad}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Agregar Mensualidad</span>
                            <span className="sm:hidden">Agregar</span>
                        </Button>
                        
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onVolver}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Volver</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Layout responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar de mensualidades (móvil: desplegable, desktop: lateral) */}
                <div className={`lg:col-span-3 ${sidebarMobile ? 'block' : 'hidden lg:block'}`}>
                    <Card className="p-4 sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                                Mensualidades
                            </h4>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 dark:text-dark-400">
                                    {mensualidadFields.length} total
                                </span>
                                {/* Botón cerrar en móvil */}
                                <Button
                                    type="button"
                                    onClick={() => setSidebarMobile(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="lg:hidden"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        <ScrollShadow className="space-y-2 max-h-96 overflow-y-auto">
                            {mensualidadFields.map((field, index) => {
                                const isActive = index === mensualidadActiva;
                                const mensualidad = watchedMensualidades[index];
                                // console.log("Mensualidad actual:", mensualidad);
                                const hasErrors = errors.mensualidades?.[index];
                                const monto = calcularMontoMensualidad(mensualidad);
                                
                                return (
                                    <motion.div
                                        key={field.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`
                                            relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                                            ${isActive 
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                                : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                                            }
                                            ${hasErrors ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
                                        `}
                                        onClick={() => {
                                            setMensualidadActiva(index);
                                            setSidebarMobile(false); // Cerrar sidebar en móvil al seleccionar
                                        }}
                                    >
                                        {/* Indicador de errores */}
                                        {hasErrors && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            </div>
                                        )}
                                        
                                        {/* Botón eliminar */}
                                        {mensualidadFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    eliminarMensualidad(index);
                                                }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-full flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        )}
                                        
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h5 className={`text-sm font-medium truncate ${
                                                    isActive 
                                                        ? 'text-primary-900 dark:text-primary-100' 
                                                        : 'text-gray-900 dark:text-white'
                                                }`}>
                                                    {getTituloMensualidad(index)}
                                                </h5>
                                                {isActive && (
                                                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                                )}
                                            </div>
                                            
                                            <div className="text-xs space-y-0.5">
                                                {mensualidad.fecha_inicio && (
                                                    <p className={`${
                                                        isActive 
                                                            ? 'text-primary-700 dark:text-primary-300' 
                                                            : 'text-gray-600 dark:text-dark-300'
                                                    }`}>
                                                        📅 {formatearFecha(mensualidad.fecha_inicio)}
                                                    </p>
                                                )}
                                                
                                                {mensualidad.meses_duracion && (
                                                    <p className={`${
                                                        isActive 
                                                            ? 'text-primary-700 dark:text-primary-300' 
                                                            : 'text-gray-600 dark:text-dark-300'
                                                    }`}>
                                                        ⏱️ {mensualidad.meses_duracion} mes{mensualidad.meses_duracion > 1 ? 'es' : ''}
                                                    </p>
                                                )}
                                                
                                                {monto > 0 && (
                                                    <p className={`font-medium ${
                                                        isActive 
                                                            ? 'text-primary-800 dark:text-primary-200' 
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        💰 ${monto.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </ScrollShadow>
                        
                        {/* Botón agregar desde sidebar */}
                        <Button
                            type="button"
                            onClick={agregarMensualidad}
                            variant="outline"
                            className="w-full mt-4 flex items-center justify-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Nueva Mensualidad</span>
                        </Button>
                    </Card>
                </div>

                {/* Formulario de mensualidad actual */}
                <div className="lg:col-span-6">
                    <AnimatePresence mode="wait">
                        {mensualidadFields.length > 0 && (
                            <motion.div
                                key={mensualidadActiva}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MensualidadCard
                                    mensualidadIndex={mensualidadActiva}
                                    register={register}
                                    control={control}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
                                    getValues={getValues}
                                    gruposDisponibles={gruposDisponibles}
                                    getHorariosDisponibles={getHorariosDisponibles}
                                    calcularFechaFin={calcularFechaFin}
                                    formatearFecha={formatearFecha}
                                    onEliminar={() => eliminarMensualidad(mensualidadActiva)}
                                    canDelete={mensualidadFields.length > 1}
                                    obtenerInfoTarifa={obtenerInfoTarifa}
                                    obtenerInfoProporcional={obtenerInfoProporcional}
                                    calcularMontoMensualidad={calcularMontoMensualidad}
                                    contarClasesEnPeriodo={contarClasesEnPeriodo}
                                    watchedMensualidades={watchedMensualidades}
                                    triggerResumenUpdate={triggerResumenUpdate}
                                    totalMensualidades={mensualidadFields.length}
                                    isInitialized={isInitialized}
                                    getDiasSeleccionados={getDiasSeleccionados}
                                    isHorarioDeshabilitado={isHorarioDeshabilitado}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Navegación entre mensualidades */}
                    {mensualidadFields.length > 1 && (
                        <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                            <Button
                                type="button"
                                onClick={() => setMensualidadActiva(Math.max(0, mensualidadActiva - 1))}
                                disabled={mensualidadActiva === 0}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                                <span>Anterior</span>
                            </Button>
                            
                            <span className="text-sm text-gray-600 dark:text-dark-300">
                                {mensualidadActiva + 1} de {mensualidadFields.length}
                            </span>
                            
                            <Button
                                type="button"
                                onClick={() => setMensualidadActiva(Math.min(mensualidadFields.length - 1, mensualidadActiva + 1))}
                                disabled={mensualidadActiva === mensualidadFields.length - 1}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <span>Siguiente</span>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Panel derecho: Resúmenes */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Resumen de totales */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-4 sticky top-4">
                            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                                💰 Resumen General
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-green-700 dark:text-green-300">Mensualidades:</span>
                                    <span className="font-medium text-green-900 dark:text-green-100">
                                        {mensualidadFields.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700 dark:text-green-300">Subtotal:</span>
                                    <span className="font-medium text-green-900 dark:text-green-100">
                                        ${totales.subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700 dark:text-green-300">Descuentos:</span>
                                    <span className="font-medium text-green-900 dark:text-green-100">
                                        -${totales.descuentos.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between">
                                    <span className="text-green-700 dark:text-green-300 font-medium">Total:</span>
                                    <span className="font-bold text-lg text-green-900 dark:text-green-100">
                                        ${(isNaN(totales.total) ? 0 : totales.total).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Resumen detallado de mensualidades */}
                    {resumenDetallado.length > 0 && resumenDetallado.some(r => r.fechaInicio) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                    Resumen Detallado
                                </h4>
                                
                                <ScrollShadow className="space-y-3 max-h-80 overflow-y-auto">
                                    {resumenDetallado.map((resumen, index) => (
                                        resumen.fechaInicio && (
                                            <div 
                                                key={index} 
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    index === mensualidadActiva 
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
                                                        : 'bg-white dark:bg-dark-800 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                                                }`}
                                                onClick={() => setMensualidadActiva(index)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-xs font-medium text-purple-900 dark:text-purple-100">
                                                        Mensualidad {resumen.index}
                                                    </h5>
                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                                        {resumen.duracionMeses} mes{resumen.duracionMeses > 1 ? 'es' : ''}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-600 dark:text-purple-400">Período:</span>
                                                        <span className="text-purple-800 dark:text-purple-200">
                                                            {resumen.fechaInicio}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-600 dark:text-purple-400">Grupo:</span>
                                                        <span className="text-purple-800 dark:text-purple-200 text-right truncate ml-2 max-w-24">
                                                            {resumen.grupo}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-600 dark:text-purple-400">Horarios:</span>
                                                        <span className="text-purple-800 dark:text-purple-200">
                                                            {resumen.cantidadHorarios}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between font-medium pt-1 border-t border-purple-200 dark:border-purple-700">
                                                        <span className="text-purple-600 dark:text-purple-400">Total:</span>
                                                        <span className="text-purple-800 dark:text-purple-200">
                                                            ${resumen.total.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </ScrollShadow>
                            </Card>
                        </motion.div>
                    )}

                    {/* Información importante */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Información Importante
                                </h4>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• Solo se puede seleccionar un grupo por mensualidad</li>
                                    <li>• Se pueden seleccionar múltiples horarios del mismo grupo</li>
                                    <li>• Solo un horario por día de la semana por mensualidad</li>
                                    <li>• El precio se calcula automáticamente según la duración y horarios</li>
                                    <li>• Para otro grupo, agregue una nueva mensualidad</li>
                                    <li>• Las fechas se muestran en formato día/mes/año</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <Card className="p-6">
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onVolver}
                        disabled={loading}
                    >
                        Volver
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            "Continuar"
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

// Componente para cada mensualidad (modificado para el nuevo diseño)
const MensualidadCard = ({ 
    mensualidadIndex, 
    register, 
    control, 
    errors, 
    watch, 
    setValue,
    // getValues,
    gruposDisponibles, 
    getHorariosDisponibles, 
    calcularFechaFin,
    formatearFecha,
    onEliminar, 
    canDelete,
    obtenerInfoTarifa,
    obtenerInfoProporcional,
    calcularMontoMensualidad,
    watchedMensualidades,
    triggerResumenUpdate,
    totalMensualidades,
    isInitialized,
    getDiasSeleccionados,
    isHorarioDeshabilitado
}) => {
    const { fields: horarioFields, append: appendHorario, remove: removeHorario } = useFieldArray({
        control,
        name: `mensualidades.${mensualidadIndex}.horarios`
    });

    const fechaInicio = watch(`mensualidades.${mensualidadIndex}.fecha_inicio`);
    const mesesDuracion = watch(`mensualidades.${mensualidadIndex}.meses_duracion`);
    const grupoSeleccionado = watch(`mensualidades.${mensualidadIndex}.grupo_id`);
    const descuentoWatch = watch(`mensualidades.${mensualidadIndex}.descuento_aplicado`);
    const metodoPagoWatch = watch(`mensualidades.${mensualidadIndex}.metodo_pago`);

    const [forceUpdate, setForceUpdate] = useState(0);
    const [isInternalInitialized, setIsInternalInitialized] = useState(false);

    const horariosDisponibles = getHorariosDisponibles(grupoSeleccionado);

    // Calcular fecha fin automáticamente
    const fechaFin = useMemo(() => {
        if (fechaInicio && mesesDuracion) {
            return calcularFechaFin(fechaInicio, mesesDuracion);
        }
        return null;
    }, [fechaInicio, mesesDuracion, calcularFechaFin]);

    const contadorHorarios = useMemo(() => {
        const mensualidadActual = watchedMensualidades[mensualidadIndex];
        
        if (!mensualidadActual?.horarios || !Array.isArray(mensualidadActual.horarios)) {
            return 0;
        }
        
        const count = mensualidadActual.horarios.filter(h => {
            const isValid = h && h.horario_id && h.horario_id !== '' && h.horario_id !== 'undefined' && h.horario_id !== null;
            return isValid;
        }).length;
        
        return count;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedMensualidades, mensualidadIndex, forceUpdate]);

    // Limpiar horarios cuando cambia el grupo
    useEffect(() => {
        if (!isInitialized) {
            setIsInternalInitialized(true);
            return;
        }
        
        if (grupoSeleccionado && isInternalInitialized) {
            setValue(`mensualidades.${mensualidadIndex}.horarios`, [{ horario_id: '' }]);
        }
    }, [grupoSeleccionado, setValue, mensualidadIndex, isInitialized, isInternalInitialized]);

    // Detectar cambios para actualizar resumen
    useEffect(() => {
        // Solo actualizar si hay cambios significativos
        const hasValidData = fechaInicio && mesesDuracion && grupoSeleccionado;
        if (hasValidData) {
            const timeoutId = setTimeout(() => {
                console.log("Actualizando resumen de mensualidades...");
                triggerResumenUpdate();
            }, 100); // Debounce para evitar múltiples actualizaciones
            
            return () => clearTimeout(timeoutId);
        }
    }, [fechaInicio, mesesDuracion, grupoSeleccionado, descuentoWatch, metodoPagoWatch, forceUpdate, triggerResumenUpdate]);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            Mensualidad {mensualidadIndex + 1}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-dark-300">
                            {totalMensualidades > 1 && `${mensualidadIndex + 1} de ${totalMensualidades} mensualidades`}
                        </p>
                    </div>
                </div>
                {canDelete && (
                    <Button
                        type="button"
                        onClick={onEliminar}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                {/* Fechas y duración */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                        name={`mensualidades.${mensualidadIndex}.fecha_inicio`}
                        control={control}
                        render={({ field: { onChange, value, ...rest } }) => (
                            <DatePicker
                                onChange={onChange}
                                value={value || ""}
                                label="Fecha de Inicio*"
                                error={errors.mensualidades?.[mensualidadIndex]?.fecha_inicio?.message}
                                options={{ 
                                    disableMobile: true,
                                    minDate: "today",
                                    dateFormat: "d-m-Y",
                                    locale: {
                                        firstDayOfWeek: 1,
                                        weekdays: {
                                            shorthand: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                                            longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
                                        },
                                        months: {
                                            shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                                            longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                                        }
                                    }
                                }}
                                placeholder="dd-mm-YYYY"
                                {...rest}
                            />
                        )}
                    />

                    <Input
                        {...register(`mensualidades.${mensualidadIndex}.meses_duracion`)}
                        type="number"
                        min="1"
                        max="12"
                        label="Meses de Duración*"
                        placeholder="1"
                        error={errors.mensualidades?.[mensualidadIndex]?.meses_duracion?.message}
                        prefix={<ClockIcon className="h-5 w-5" />}
                    />
                </div>

                {/* Indicador visual de duración */}
                {fechaInicio && mesesDuracion && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-700 dark:text-blue-300">
                                    Duración: <strong>{mesesDuracion} mes{mesesDuracion > 1 ? 'es' : ''}</strong>
                                </span>
                            </div>
                            {fechaFin && (
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    Termina: {formatearFecha(fechaFin)}
                                </span>
                            )}
                        </div>
                        
                        {mesesDuracion > 6 && (
                            <div className="mt-2 flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                                <span>⚠️</span>
                                <span>Período extendido - considere dividir en mensualidades más cortas</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Selección de grupo */}
                <div className="space-y-4">
                    <Select
                        {...register(`mensualidades.${mensualidadIndex}.grupo_id`)}
                        label="Grupo*"
                        error={errors.mensualidades?.[mensualidadIndex]?.grupo_id?.message}
                    >
                        <option value="">Selecciona un grupo</option>
                        {gruposDisponibles.map(grupo => (
                            <option key={grupo.id} value={grupo.id}>
                                {grupo.codigo} - {grupo.nombre}
                            </option>
                        ))}
                    </Select>
                    
                    {grupoSeleccionado && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                            💡 Solo puedes seleccionar un grupo por mensualidad. Para otro grupo, agrega una nueva mensualidad.
                        </div>
                    )}
                </div>

                {/* Horarios del grupo seleccionado */}
                {grupoSeleccionado && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-dark-200">
                                Horarios del Grupo* (Múltiples)
                            </label>
                            <Button
                                type="button"
                                onClick={() => {
                                    appendHorario({ horario_id: '' });
                                    setTimeout(() => setForceUpdate(prev => prev + 1), 50);
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                            >
                                <PlusIcon className="h-3 w-3 mr-1" />
                                Agregar Horario
                            </Button>
                        </div>

                        {horarioFields.map((horarioField, horarioIndex) => {
                            const diasSeleccionados = getDiasSeleccionados(mensualidadIndex);
                            
                            return (
                                <div key={horarioField.id} className="flex items-center space-x-2">
                                    <div className="flex-1">
                                        <Select
                                            {...register(`mensualidades.${mensualidadIndex}.horarios.${horarioIndex}.horario_id`, {
                                                onChange: (e) => {
                                                    console.log('🔄 Select de horario cambió:', e.target.value);
                                                    setTimeout(() => setForceUpdate(prev => prev + 1), 50);
                                                }
                                            })}
                                            error={errors.mensualidades?.[mensualidadIndex]?.horarios?.[horarioIndex]?.horario_id?.message}
                                        >
                                            <option value="">Selecciona horario</option>
                                            {horariosDisponibles.map(horario => {
                                                const estaDeshabilitado = isHorarioDeshabilitado(mensualidadIndex, horario.id, horarioIndex);
                                                const yaSeleccionado = diasSeleccionados.has(horario.dia);
                                                
                                                return (
                                                    <option 
                                                        key={horario.id} 
                                                        value={horario.id}
                                                        disabled={estaDeshabilitado}
                                                        style={estaDeshabilitado ? { color: '#9CA3AF', fontStyle: 'italic' } : {}}
                                                    >
                                                        {horario.dia} {horario.hora_inicio} - {horario.hora_fin}
                                                        {horario.nombre_profesor && ` (${horario.nombre_profesor})`}
                                                        {yaSeleccionado ? ' - Ya seleccionado' : ''}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                    </div>
                                    {horarioFields.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                removeHorario(horarioIndex)

                                                setTimeout(() => {
                                                    setForceUpdate(prev => prev + 1);
                                                    triggerResumenUpdate();
                                                }, 50);
                                            }
                                        }
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600"
                                        >
                                            <TrashIcon className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}

                        {/* mensaje sobre la restricción */}
                        {grupoSeleccionado && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2">
                                ⚠️ <strong>Restricción:</strong> Solo puedes seleccionar un horario por día de la semana. 
                                Los horarios del mismo día aparecerán deshabilitados una vez que selecciones uno.
                            </div>
                        )}
                        
                        <div className="text-xs text-gray-500 dark:text-dark-400 bg-gray-100 dark:bg-dark-600 p-2 rounded">
                            <UsersIcon className="h-3 w-3 inline mr-1" />
                            Horarios configurados: <strong>{contadorHorarios}</strong> de {horarioFields.length} disponibles
                            {contadorHorarios > 0 && (
                                <span className="text-green-600 dark:text-green-400 ml-2">
                                    ✓ {contadorHorarios === 1 ? 'Horario válido' : 'Horarios válidos'}
                                </span>
                            )}
                            <br />
                            <span className="text-xs">
                                El precio se calcula automáticamente según la cantidad de horarios por semana
                            </span>
                        </div>
                    </div>
                )}

                {/* Información financiera */}
                <div className="space-y-4">
                    {/* SECCIÓN MEJORADA: Mostrar cálculo automático basado en clases reales */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-3 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            Cálculo Automático de Precio
                        </h5>
                        
                        {(() => {
                            const infoTarifa = obtenerInfoTarifa(watchedMensualidades[mensualidadIndex]);
                            const infoProporcional = obtenerInfoProporcional(watchedMensualidades[mensualidadIndex]);
                            const montoCalculado = calcularMontoMensualidad(watchedMensualidades[mensualidadIndex]);
                            const mesesDuracion = parseInt(watchedMensualidades[mensualidadIndex]?.meses_duracion || 1);
                            
                            if (!infoTarifa || montoCalculado === 0) {
                                return (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                                        Selecciona grupo y horarios para ver el precio
                                    </div>
                                );
                            }
                            
                            return (
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-emerald-700 dark:text-emerald-300">Tipo de grupo:</span>
                                            <p className="font-medium text-emerald-900 dark:text-emerald-100">
                                                {infoTarifa.grupoInfo.nombre}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-emerald-700 dark:text-emerald-300">Horarios por semana:</span>
                                            <p className="font-medium text-emerald-900 dark:text-emerald-100">
                                                {infoTarifa.cantidadHorarios}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Información de clases reales para primer mes */}
                                    {infoProporcional && mesesDuracion >= 1 && (
                                        <div className={`border rounded-lg p-3 ${
                                            infoProporcional.esProporcional 
                                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' 
                                                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                        }`}>
                                            <h6 className={`text-xs font-medium mb-2 ${
                                                infoProporcional.esProporcional 
                                                    ? 'text-amber-800 dark:text-amber-200' 
                                                    : 'text-green-800 dark:text-green-200'
                                            }`}>
                                                📅 Primer Mes ({infoProporcional.fechaInicio})
                                            </h6>
                                            
                                            {/* Mostrar días de clase */}
                                            <div className="mb-2">
                                                <span className={`text-xs ${
                                                    infoProporcional.esProporcional 
                                                        ? 'text-amber-700 dark:text-amber-300' 
                                                        : 'text-green-700 dark:text-green-300'
                                                }`}>
                                                    Días de clase:
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {infoProporcional.diasSemana.map((dia, index) => (
                                                        <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${
                                                            infoProporcional.esProporcional 
                                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' 
                                                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                        }`}>
                                                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <span className={`${
                                                        infoProporcional.esProporcional 
                                                            ? 'text-amber-700 dark:text-amber-300' 
                                                            : 'text-green-700 dark:text-green-300'
                                                    }`}>
                                                        Clases en período:
                                                    </span>
                                                    <p className={`font-medium ${
                                                        infoProporcional.esProporcional 
                                                            ? 'text-amber-900 dark:text-amber-100' 
                                                            : 'text-green-900 dark:text-green-100'
                                                    }`}>
                                                        {infoProporcional.clasesRealesEnPeriodo} de {infoProporcional.clasesTotalesDelMes}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className={`${
                                                        infoProporcional.esProporcional 
                                                            ? 'text-amber-700 dark:text-amber-300' 
                                                            : 'text-green-700 dark:text-green-300'
                                                    }`}>
                                                        Semanas restantes:
                                                    </span>
                                                    <p className={`font-medium ${
                                                        infoProporcional.esProporcional 
                                                            ? 'text-amber-900 dark:text-amber-100' 
                                                            : 'text-green-900 dark:text-green-100'
                                                    }`}>
                                                        {infoProporcional.semanasRestantes.toFixed(1)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex justify-between items-center">
                                                <span className={`text-xs ${
                                                    infoProporcional.esProporcional 
                                                        ? 'text-amber-700 dark:text-amber-300' 
                                                        : 'text-green-700 dark:text-green-300'
                                                }`}>
                                                    {infoProporcional.esProporcional ? '⚡ Cobro proporcional:' : '✅ Cobro completo:'}
                                                </span>
                                                <span className={`font-bold ${
                                                    infoProporcional.esProporcional 
                                                        ? 'text-amber-900 dark:text-amber-100' 
                                                        : 'text-green-900 dark:text-green-100'
                                                }`}>
                                                    ${infoProporcional.montoCalculado.toFixed(2)}
                                                </span>
                                            </div>
                                            
                                            {infoProporcional.esProporcional && (
                                                <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                    ${infoTarifa.precioPorMes.toFixed(2)} × {infoProporcional.clasesRealesEnPeriodo}/{infoProporcional.clasesTotalesDelMes} clases = ${infoProporcional.montoCalculado.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* INFORMACIÓN DE MESES ADICIONALES */}
                                    {mesesDuracion > 1 && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-blue-700 dark:text-blue-300">
                                                    Meses adicionales ({mesesDuracion - 1}):
                                                </span>
                                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                                    ${((mesesDuracion - 1) * infoTarifa.precioPorMes).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                ${infoTarifa.precioPorMes.toFixed(2)} × {mesesDuracion - 1} mes{mesesDuracion > 2 ? 'es' : ''} completo{mesesDuracion > 2 ? 's' : ''}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="border-t border-emerald-200 dark:border-emerald-700 pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Total calculado:</span>
                                            <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                                ${(isNaN(montoCalculado) ? 0 : montoCalculado).toFixed(2)}
                                            </span>
                                        </div>
                                        {infoProporcional && infoProporcional.esProporcional && (
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                                ✨ Incluye cálculo proporcional basado en {infoProporcional.clasesRealesEnPeriodo} clases reales
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Campo de descuento e información final */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            {...register(`mensualidades.${mensualidadIndex}.descuento_aplicado`)}
                            type="number"
                            step="0.01"
                            label="Descuento Aplicado"
                            placeholder="0.00"
                            error={errors.mensualidades?.[mensualidadIndex]?.descuento_aplicado?.message}
                            prefix={<span>-$</span>}
                        />

                        <Select
                            {...register(`mensualidades.${mensualidadIndex}.metodo_pago`)}
                            label="Método de Pago*"
                            error={errors.mensualidades?.[mensualidadIndex]?.metodo_pago?.message}
                        >
                            {METODOS_PAGO.map(metodo => (
                                <option key={metodo.value} value={metodo.value}>
                                    {metodo.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    
                    {/* Mostrar total final después del descuento */}
                    {(() => {
                        const montoCalculado = calcularMontoMensualidad(watchedMensualidades[mensualidadIndex]);
                        const descuento = parseFloat(watchedMensualidades[mensualidadIndex]?.descuento_aplicado || 0);
                        const totalFinal = montoCalculado - descuento;
                        
                        if (montoCalculado > 0) {
                            return (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-blue-700 dark:text-blue-300">Monto final a pagar:</span>
                                        <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                            ${totalFinal.toFixed(2)}
                                        </span>
                                    </div>
                                    {descuento > 0 && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            ${montoCalculado.toFixed(2)} - ${descuento.toFixed(2)} descuento
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        </Card>
    );
};

export default MensualidadesForm;