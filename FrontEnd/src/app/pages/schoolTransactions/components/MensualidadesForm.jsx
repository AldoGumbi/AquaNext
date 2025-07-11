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
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Toast
// import { toast } from "sonner";

// Redux
import { getGruposConHorariosThunk } from "slices/thunk";

// Componentes
import { Input, Button, Card, Select } from "../../../../components/ui";
import { DatePicker } from "../../../../components/shared/form/Datepicker";

// Schema de validación actualizado con dayjs
const mensualidadSchema = Yup.object().shape({
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
                    .min(1, 'Debe seleccionar al menos un horario'),
                // ✅ ELIMINAR VALIDACIÓN DE monto_total (se calcula automáticamente)
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
});

const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' }
];

const MensualidadesForm = ({ datosIniciales, onDatosCompletos, onVolver, loading }) => {
    const dispatch = useDispatch();
    const { gruposConHorarios: grupos } = useSelector((state) => state.groups);
    const { tarifas } = useSelector((state) => state.inscripciones);

    // Estados locales
    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);

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
            mensualidades: datosIniciales.length > 0 ? datosIniciales : [{
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

    const watchedMensualidades = watch("mensualidades");

    // Cargar grupos al montar
    useEffect(() => {
        dispatch(getGruposConHorariosThunk());
    }, [dispatch]);

    // Procesar grupos disponibles con horarios
    useEffect(() => {
        if (grupos && Array.isArray(grupos)) {
            const gruposActivos = grupos.filter(grupo => grupo.activo && !grupo.deleted);
            setGruposDisponibles(gruposActivos);
        }
    }, [grupos]);

    // Función para calcular fecha fin basada en meses usando dayjs
    const calcularFechaFin = useCallback((fechaInicio, meses) => {
        if (!fechaInicio || !meses) return null;

        if (Array.isArray(fechaInicio)) {
            fechaInicio = fechaInicio[0]; // Si es un array, tomar el primer elemento
        }

        let fechaInicioDayjs;
        
        try {
            // Crear objeto dayjs
            if (fechaInicio instanceof Date) {
                fechaInicioDayjs = dayjs(fechaInicio);
            } else {
                fechaInicioDayjs = dayjs(fechaInicio);
            }
            
            if (!fechaInicioDayjs.isValid()) {
                console.error("Fecha inválida");
                return null;
            }
            
            // Si es 1 mes: último día del mismo mes
            // Si son 2 meses: último día del mes siguiente
            // Si son N meses: último día del mes N-1 siguiente
            
            let fechaFin;
            if (parseInt(meses) === 1) {
                // Para 1 mes: último día del mismo mes de inicio
                fechaFin = fechaInicioDayjs.endOf('month');
            } else {
                // Para N meses: sumar N-1 meses y ir al último día de ese mes
                fechaFin = fechaInicioDayjs.add(parseInt(meses) - 1, 'month').endOf('month');
            }
            
            return fechaFin.toDate(); // Convertir a Date de JavaScript
            
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
            
            // Verificar que la fecha sea válida
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

    // Contar clases en un período específico
    const contarClasesEnPeriodo = useCallback((fechaInicio, fechaFin, diasSemana) => {
        let contador = 0;
        
        // ✅ ASEGURAR QUE AMBAS FECHAS SEAN OBJETOS DAYJS
        let fechaActual = dayjs(fechaInicio);
        const fechaFinDayjs = dayjs(fechaFin);
        
        // Verificar que las fechas sean válidas
        if (!fechaActual.isValid() || !fechaFinDayjs.isValid()) {
            console.error("Fechas inválidas en contarClasesEnPeriodo");
            return 0;
        }
        
        // Mapeo de días en español a números (0 = domingo, 1 = lunes, etc.)
        const mapaDias = {
            'domingo': 0,
            'lunes': 1,
            'martes': 2,
            'miercoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sabado': 6
        };
        
        // Convertir días de texto a números
        const diasNumeros = diasSemana.map(dia => mapaDias[dia.toLowerCase()]).filter(num => num !== undefined);
        
        while (fechaActual.isSameOrBefore(fechaFinDayjs, 'day')) {
            const diaDeLaSemana = fechaActual.day(); // 0 = domingo, 1 = lunes, etc.
            
            if (diasNumeros.includes(diaDeLaSemana)) {
                contador++;
            }
            
            fechaActual = fechaActual.add(1, 'day');
        }
        
        return contador;
    }, []);

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

        // Obtener los días de la semana de los horarios seleccionados
        const horariosSeleccionados = mensualidad.horarios
            .filter(h => h.horario_id && h.horario_id !== '')
            .map(h => {
                const horario = grupoInfo.horarios?.find(gh => gh.id === parseInt(h.horario_id));
                return horario;
            })
            .filter(Boolean);

        const diasSemana = horariosSeleccionados.map(h => h.dia);

        // Buscar tarifa correspondiente
        const tarifa = tarifas?.find(t => 
            t.tipo_clase === grupoInfo.tipo && 
            t.clases_por_semana === cantidadHorarios
        );

        let tarifaMensual = 0;
        if (tarifa) {
            tarifaMensual = parseFloat(tarifa.monto_mensual) || 0;
            // ✅ Validar que sea un número válido
            if (isNaN(tarifaMensual) || tarifaMensual <= 0) {
                tarifaMensual = cantidadHorarios * 150; // Fallback
            }
        } else {
            tarifaMensual = cantidadHorarios * 150;
        }

        // ✅ NUEVO: Cálculo proporcional basado en clases reales
        let montoTotal = 0;
        
        for (let mesIndex = 0; mesIndex < mesesDuracion; mesIndex++) {
            let fechaInicioMes;
            
            // Procesar la fecha de inicio de manera segura
            if (Array.isArray(mensualidad.fecha_inicio)) {
                fechaInicioMes = dayjs(mensualidad.fecha_inicio[0]);
            } else {
                fechaInicioMes = dayjs(mensualidad.fecha_inicio);
            }
            
            // Para el primer mes, usar la fecha real de inicio
            // Para meses siguientes, usar el primer día del mes correspondiente
            if (mesIndex > 0) {
                fechaInicioMes = fechaInicioMes.add(mesIndex, 'month').startOf('month');
            }
            
            const esPrimerMes = mesIndex === 0;
            
            if (esPrimerMes) {
                // ✅ CÁLCULO BASADO EN CLASES REALES PARA EL PRIMER MES
                const finDelMes = fechaInicioMes.endOf('month');
                
                // Contar clases reales en el período
                const clasesRealesEnPeriodo = contarClasesEnPeriodo(fechaInicioMes, finDelMes, diasSemana);
                
                // Contar clases que habría en un mes completo (para proporcionar)
                const inicioMesCompleto = fechaInicioMes.startOf('month');
                const finMesCompleto = fechaInicioMes.endOf('month');
                const clasesTotalesDelMes = contarClasesEnPeriodo(inicioMesCompleto, finMesCompleto, diasSemana);
                
                const semanasRestantes = (finDelMes.diff(fechaInicioMes, 'day') + 1) / 7;
                
                // console.log(`📊 Análisis de clases reales para el primer mes:`);
                // console.log(`   Fecha inicio: ${fechaInicioMes.format('DD/MM/YYYY')}`);
                // console.log(`   Fin del mes: ${finDelMes.format('DD/MM/YYYY')}`);
                // console.log(`   Días de clase: [${diasSemana.join(', ')}]`);
                // console.log(`   Clases reales en período: ${clasesRealesEnPeriodo}`);
                // console.log(`   Clases totales del mes: ${clasesTotalesDelMes}`);
                // console.log(`   Semanas restantes: ${semanasRestantes.toFixed(2)}`);
                
                if (semanasRestantes < 4) {
                    // COBRO PROPORCIONAL: basado en clases reales
                    const proporcionClases = clasesTotalesDelMes > 0 ? clasesRealesEnPeriodo / clasesTotalesDelMes : 0;
                    const montoProporcional = tarifaMensual * proporcionClases;
                    
                    // console.log(`   💰 Cobro proporcional: ${clasesRealesEnPeriodo}/${clasesTotalesDelMes} clases = ${(proporcionClases * 100).toFixed(1)}% x $${tarifaMensual} = $${montoProporcional.toFixed(2)}`);
                    const montoValidado = parseFloat(montoProporcional) || 0;
                    if (!isNaN(montoValidado) && montoValidado >= 0) {
                        montoTotal += montoValidado;
                    }
                    
                } else {
                    // COBRO COMPLETO: 4 semanas o más
                    // console.log(`   💰 Cobro completo: $${tarifaMensual} (4+ semanas restantes)`);
                    montoTotal += Number(tarifaMensual);
                }
            } else {
                // MESES SUBSECUENTES: siempre cobro completo
                // console.log(`Mes ${mesIndex + 1}: Cobro completo $${tarifaMensual}`);
                montoTotal += Number(tarifaMensual);
            }
        }

        // console.log(`📋 Resumen: ${cantidadHorarios} horarios x ${mesesDuracion} meses = $${montoTotal.toFixed(2)}`);
        
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

        // Procesar fecha de inicio con dayjs
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

        // Obtener información del grupo y horarios
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

        // Contar clases reales
        const clasesRealesEnPeriodo = contarClasesEnPeriodo(fechaInicio, finDelMes, diasSemana);
        const inicioMesCompleto = fechaInicio.startOf('month');
        const finMesCompleto = fechaInicio.endOf('month');
        const clasesTotalesDelMes = contarClasesEnPeriodo(inicioMesCompleto, finMesCompleto, diasSemana);

        // ✅ OBTENER TARIFA CON VALIDACIÓN NUMÉRICA
        const tarifa = tarifas?.find(t => 
            t.tipo_clase === grupoInfo?.tipo && 
            t.clases_por_semana === cantidadHorarios
        );
        
        // ✅ ASEGURAR QUE tarifaMensual SEA SIEMPRE UN NÚMERO
        let tarifaMensual = 0;
        if (tarifa && tarifa.monto_mensual) {
            // Convertir a número y validar
            const montoFromDB = Number(tarifa.monto_mensual);
            if (!isNaN(montoFromDB) && montoFromDB > 0) {
                tarifaMensual = montoFromDB;
            } else {
                // Fallback si el valor de la BD no es válido
                tarifaMensual = cantidadHorarios * 150;
            }
        } else {
            // Usar tarifa por defecto si no existe en BD
            tarifaMensual = cantidadHorarios * 150;
        }

        // ✅ VALIDAR QUE proporcionClases SEA UN NÚMERO VÁLIDO
        const proporcionClases = clasesTotalesDelMes > 0 ? clasesRealesEnPeriodo / clasesTotalesDelMes : 0;
        const esProporcional = semanasRestantes < 4;

        // ✅ CALCULAR montoCalculado ASEGURANDO QUE SEA NÚMERO
        let montoCalculado = 0;
        if (esProporcional) {
            montoCalculado = tarifaMensual * proporcionClases;
        } else {
            montoCalculado = tarifaMensual;
        }

        // ✅ VALIDACIÓN FINAL - ASEGURAR QUE montoCalculado SEA UN NÚMERO VÁLIDO
        if (isNaN(montoCalculado) || montoCalculado < 0) {
            montoCalculado = 0;
        }

        // ✅ REDONDEAR A 2 DECIMALES PARA CONSISTENCIA
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
            tarifaMensual: tarifaMensual, // ✅ GARANTIZADO COMO NÚMERO
            montoCalculado: montoCalculado // ✅ GARANTIZADO COMO NÚMERO
        };
    }, [gruposDisponibles, tarifas, contarClasesEnPeriodo]);

    // Actualizar montos automáticamente
    useEffect(() => {
        watchedMensualidades.forEach((mensualidad, index) => {
            const montoCalculado = calcularMontoMensualidad(mensualidad);
            if (montoCalculado > 0 && parseFloat(mensualidad.monto_total || 0) !== montoCalculado) {
                setValue(`mensualidades.${index}.monto_total`, montoCalculado);
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
            // ✅ ELIMINAR monto_total
            descuento_aplicado: 0,
            metodo_pago: 'efectivo'
        });
    }, [appendMensualidad]);

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
    
        // Asegurar que precioPorMes siempre sea un número válido
        let precioPorMes = 0;
        
        if (tarifa && tarifa.monto_mensual) {
            // Si hay tarifa en la BD, usar ese monto
            precioPorMes = parseFloat(tarifa.monto_mensual) || 0;
        } else {
            // Si no hay tarifa, usar tarifa por defecto
            precioPorMes = cantidadHorarios * 150;
        }
    
        if (isNaN(precioPorMes) || precioPorMes < 0) {
            precioPorMes = cantidadHorarios * 150; // Fallback a tarifa por defecto
        }
    
        return {
            cantidadHorarios,
            grupoInfo,
            tarifa,
            usaTarifaDefault: !tarifa,
            precioPorMes: Number(precioPorMes) // ✅ ASEGURAR QUE SEA NÚMERO
        };
    }, [gruposDisponibles, tarifas]);

    // Eliminar mensualidad
    const eliminarMensualidad = useCallback((index) => {
        if (mensualidadFields.length > 1) {
            removeMensualidad(index);
        }
    }, [mensualidadFields.length, removeMensualidad]);

    // Obtener horarios disponibles para un grupo
    const getHorariosDisponibles = useCallback((grupoId) => {
        const grupo = gruposDisponibles.find(g => g.id === parseInt(grupoId));
        return grupo?.horarios || [];
    }, [gruposDisponibles]);

    const triggerResumenUpdate = useCallback(() => {
        setUpdateTrigger(prev => prev + 1);
    }, []);

    // Validar fechas de mensualidades sin solapamiento
    // const validarFechasSinSolapamiento = useCallback(() => {
    //     const periodos = watchedMensualidades.map((m, index) => {
    //         const fechaInicio = new Date(m.fecha_inicio);
    //         const fechaFin = calcularFechaFin(m.fecha_inicio, m.meses_duracion);
    //         return { index, inicio: fechaInicio, fin: fechaFin };
    //     }).filter(p => p.inicio && p.fin);

    //     for (let i = 0; i < periodos.length; i++) {
    //         for (let j = i + 1; j < periodos.length; j++) {
    //             const p1 = periodos[i];
    //             const p2 = periodos[j];
                
    //             // Verificar solapamiento
    //             if ((p1.inicio <= p2.fin && p1.fin >= p2.inicio)) {
    //                 return false;
    //             }
    //         }
    //     }
    //     return true;
    // }, [watchedMensualidades, calcularFechaFin]);

    // Enviar datos
    const onSubmit = useCallback((data) => {
        // Procesar datos
        const mensualidadesProcesadas = data.mensualidades.map(mensualidad => {
            const fechaFin = calcularFechaFin(mensualidad.fecha_inicio, mensualidad.meses_duracion);
            const montoCalculado = calcularMontoMensualidad(mensualidad);
            
            // OBTENER INFORMACIÓN COMPLETA DEL GRUPO
            const grupoInfo = gruposDisponibles.find(g => g.id === parseInt(mensualidad.grupo_id));
            
            // ENRIQUECER HORARIOS CON INFORMACIÓN COMPLETA
            const horariosEnriquecidos = mensualidad.horarios
                .filter(h => h.horario_id && h.horario_id !== '')
                .map(h => {
                    const horarioCompleto = grupoInfo?.horarios?.find(gh => gh.id === parseInt(h.horario_id));
                    return {
                        horario_id: parseInt(h.horario_id),
                        // ✅ AGREGAR INFORMACIÓN COMPLETA DEL HORARIO
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
                    // AGREGAR INFORMACIÓN COMPLETA DEL GRUPO
                    grupo_codigo: grupoInfo?.codigo || '',
                    grupo_nombre: grupoInfo?.nombre || '',
                    grupo_tipo: grupoInfo?.tipo || '',
                    // HORARIOS CON INFORMACIÓN COMPLETA
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
            // ✅ CALCULAR MONTO AUTOMÁTICAMENTE
            // ✅ CÓDIGO CORREGIDO:
            const monto = calcularMontoMensualidad(mensualidad);
            const descuento = parseFloat(mensualidad.descuento_aplicado || 0);
    
            // ✅ Validar que los valores sean números
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
                acc.total += Math.max(0, totalItem); // ✅ Evitar totales negativos
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
            
            // CALCULAR MONTO AUTOMÁTICAMENTE
            const monto = calcularMontoMensualidad(mensualidad);
            const descuento = parseFloat(mensualidad.descuento_aplicado || 0);
            const total = monto - descuento;

            // OBTENER INFO DE TARIFA PARA MOSTRAR MÁS DETALLES
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
                // AGREGAR INFO ADICIONAL
                infoTarifa
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedMensualidades, calcularFechaFin, gruposDisponibles, formatearFecha, calcularMontoMensualidad, obtenerInfoTarifa, updateTrigger]);

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header */}
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
                        <Button
                            type="button"
                            onClick={agregarMensualidad}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Agregar Mensualidad</span>
                        </Button>
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
                </div>

                {/* Lista de mensualidades */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {mensualidadFields.map((field, mensualidadIndex) => (
                            <MensualidadCard
                                key={field.id}
                                mensualidadIndex={mensualidadIndex}
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
                                onEliminar={() => eliminarMensualidad(mensualidadIndex)}
                                canDelete={mensualidadFields.length > 1}
                                obtenerInfoTarifa={obtenerInfoTarifa}
                                obtenerInfoProporcional={obtenerInfoProporcional}
                                calcularMontoMensualidad={calcularMontoMensualidad}
                                contarClasesEnPeriodo={contarClasesEnPeriodo}
                                watchedMensualidades={watchedMensualidades}
                                triggerResumenUpdate={triggerResumenUpdate}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Resumen detallado de mensualidades */}
                {resumenDetallado.length > 0 && resumenDetallado.some(r => r.fechaInicio) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4"
                    >
                        <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" />
                            📊 Resumen Detallado de Mensualidades
                        </h4>
                        
                        <div className="space-y-4">
                            {resumenDetallado.map((resumen, index) => (
                                resumen.fechaInicio && (
                                    <div key={index} className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-purple-900 dark:text-purple-100">
                                                Mensualidad {resumen.index}
                                            </h5>
                                            <span className="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                                {resumen.duracionMeses} mes{resumen.duracionMeses > 1 ? 'es' : ''}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-purple-600 dark:text-purple-400 font-medium">Período:</span>
                                                <p className="text-purple-800 dark:text-purple-200">
                                                    {resumen.fechaInicio}
                                                </p>
                                                <p className="text-purple-800 dark:text-purple-200">
                                                    al {resumen.fechaFin}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-purple-600 dark:text-purple-400 font-medium">Grupo:</span>
                                                <p className="text-purple-800 dark:text-purple-200 text-xs">
                                                    {resumen.grupo}
                                                </p>
                                                <p className="text-purple-600 dark:text-purple-400 text-xs">
                                                    {resumen.cantidadHorarios} horario{resumen.cantidadHorarios !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-purple-600 dark:text-purple-400 font-medium">Financiero:</span>
                                                <p className="text-purple-800 dark:text-purple-200">
                                                    Subtotal: ${resumen.subtotal.toFixed(2)}
                                                </p>
                                                {resumen.descuento > 0 && (
                                                    <p className="text-red-600 text-xs">
                                                        Descuento: -${resumen.descuento.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-purple-600 dark:text-purple-400 font-medium">Total:</span>
                                                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                                                    ${resumen.total.toFixed(2)}
                                                </p>
                                                <p className="text-purple-600 dark:text-purple-400 text-xs">
                                                    {resumen.metodoPago}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Resumen de totales */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                        💰 Resumen General de Totales
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-green-700 dark:text-green-300">Mensualidades:</span>
                            <span className="ml-2 font-medium text-green-900 dark:text-green-100">
                                {mensualidadFields.length}
                            </span>
                        </div>
                        <div>
                            <span className="text-green-700 dark:text-green-300">Subtotal:</span>
                            <span className="ml-2 font-medium text-green-900 dark:text-green-100">
                                ${totales.subtotal.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-green-700 dark:text-green-300">Descuentos:</span>
                            <span className="ml-2 font-medium text-green-900 dark:text-green-100">
                                -${totales.descuentos.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-green-700 dark:text-green-300">Total Final:</span>
                            <span className="ml-2 font-bold text-lg text-green-900 dark:text-green-100">
                                ${(isNaN(totales.total) ? 0 : totales.total).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Información importante */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                📋 Información Importante
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                {/* <li>• Las fechas de mensualidades no pueden solaparse</li> */}
                                <li>• Solo se puede seleccionar un grupo por mensualidad</li>
                                <li>• Se pueden seleccionar múltiples horarios del mismo grupo</li>
                                <li>• El precio se calcula automáticamente según la duración y horarios seleccionados</li>
                                <li>• Para otro grupo, agregue una nueva mensualidad</li>
                                <li>• Se asignarán automáticamente las clases para cada período</li>
                                <li>• Las fechas se muestran en formato día/mes/año</li>
                            </ul>
                        </div>
                    </div>
                </div>

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
            </form>
        </Card>
    );
};

// Componente para cada mensualidad (modificado)
const MensualidadCard = ({ 
    mensualidadIndex, 
    register, 
    control, 
    errors, 
    watch, 
    setValue,
    getValues,
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
    triggerResumenUpdate
}) => {
    const { fields: horarioFields, append: appendHorario, remove: removeHorario } = useFieldArray({
        control,
        name: `mensualidades.${mensualidadIndex}.horarios`
    });

    const fechaInicio = watch(`mensualidades.${mensualidadIndex}.fecha_inicio`);
    const mesesDuracion = watch(`mensualidades.${mensualidadIndex}.meses_duracion`);
    const grupoSeleccionado = watch(`mensualidades.${mensualidadIndex}.grupo_id`);
    // const horariosWatch = watch(`mensualidades.${mensualidadIndex}.horarios`);

    const [forceUpdate, setForceUpdate] = useState(0);

    const horariosDisponibles = getHorariosDisponibles(grupoSeleccionado);

    // Calcular fecha fin automáticamente
    const fechaFin = useMemo(() => {
        if (fechaInicio && mesesDuracion) {
            return calcularFechaFin(fechaInicio, mesesDuracion);
        }
        return null;
    }, [fechaInicio, mesesDuracion, calcularFechaFin]);

    const contadorHorarios = useMemo(() => {
        const currentValues = getValues(`mensualidades.${mensualidadIndex}.horarios`);
        
        if (!currentValues || !Array.isArray(currentValues)) {
            return 0;
        }
        
        const count = currentValues.filter(h => {
            const isValid = h && h.horario_id && h.horario_id !== '' && h.horario_id !== 'undefined' && h.horario_id !== null;
            return isValid;
        }).length;
        
        // console.log('Contador:', count);
        return count;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getValues, mensualidadIndex, forceUpdate]);

    // ✅ AGREGAR ESTAS VARIABLES ANTES DE LOS useEffect PROBLEMÁTICOS
    const descuentoWatch = watch(`mensualidades.${mensualidadIndex}.descuento_aplicado`);
    const metodoPagoWatch = watch(`mensualidades.${mensualidadIndex}.metodo_pago`);

    // Limpiar horarios cuando cambia el grupo
    useEffect(() => {
        if (grupoSeleccionado) {
            // Resetear horarios cuando cambia el grupo
            setValue(`mensualidades.${mensualidadIndex}.horarios`, [{ horario_id: '' }]);
        }
    }, [grupoSeleccionado, setValue, mensualidadIndex]);

    // Detectar cambios en fecha de inicio
    useEffect(() => {
        if (fechaInicio) {
            triggerResumenUpdate();
        }
    }, [fechaInicio, triggerResumenUpdate]);

    // Detectar cambios en meses de duración
    useEffect(() => {
        if (mesesDuracion) {
            triggerResumenUpdate();
        }
    }, [mesesDuracion, triggerResumenUpdate]);

    // Detectar cambios en grupo seleccionado
    useEffect(() => {
        if (grupoSeleccionado) {
            triggerResumenUpdate();
        }
    }, [grupoSeleccionado, triggerResumenUpdate]);

    // Detectar cambios en horarios
    useEffect(() => {
        const currentValues = getValues(`mensualidades.${mensualidadIndex}.horarios`);
        if (currentValues && Array.isArray(currentValues)) {
            const validHorarios = currentValues.filter(h => h && h.horario_id && h.horario_id !== '');
            if (validHorarios.length > 0) {
                triggerResumenUpdate();
            }
        }
    }, [forceUpdate, triggerResumenUpdate, getValues, mensualidadIndex]);

    // Detectar cambios en descuento - ✅ VERSIÓN CORREGIDA
    useEffect(() => {
        if (descuentoWatch !== undefined) {
            triggerResumenUpdate();
        }
    }, [descuentoWatch, triggerResumenUpdate]);

    // Detectar cambios en método de pago - ✅ VERSIÓN CORREGIDA
    useEffect(() => {
        if (metodoPagoWatch) {
            triggerResumenUpdate();
        }
    }, [metodoPagoWatch, triggerResumenUpdate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="border border-gray-200 dark:border-dark-600 rounded-lg p-6 bg-gray-50 dark:bg-dark-700/50"
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 mr-2" />
                    Mensualidad {mensualidadIndex + 1}
                </h4>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Fecha de inicio con DatePicker */}
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
                                minDate: "today", // CAMBIO: usar "today" en lugar de new Date()
                                dateFormat: "d-m-Y",
                                // Opcional: agregar configuración en español
                                locale: {
                                    firstDayOfWeek: 1, // Lunes como primer día
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

                {/* Meses de duración */}
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
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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
            <div className="space-y-4 mb-6">
                <div>
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
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
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

                        {horarioFields.map((horarioField, horarioIndex) => (
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
                                        {horariosDisponibles.map(horario => (
                                            <option key={horario.id} value={horario.id}>
                                                {horario.dia} {horario.hora_inicio} - {horario.hora_fin}
                                                {horario.nombre_profesor && ` (${horario.nombre_profesor})`}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                {horarioFields.length > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => removeHorario(horarioIndex)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600"
                                    >
                                        <TrashIcon className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        
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
            </div>

            {/* Información financiera */}
            <div className="space-y-4">
                {/* ✅ SECCIÓN MEJORADA: Mostrar cálculo automático basado en clases reales */}
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

                                {/* ✅ INFORMACIÓN DE MESES ADICIONALES */}
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
        </motion.div>
    );
};

export default MensualidadesForm;