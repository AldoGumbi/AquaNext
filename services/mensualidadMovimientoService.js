// services/mensualidadMovimientoService.js
import { DateTime } from 'luxon';
import MensualidadMovimientosModel from '../models/mensualidadMovimientos.js';
import CuposValidationService from './cuposValidationService.js';
import mensualidadesModel from '../models/mensualidades.js';
import gruposModel from '../models/groups.js';
import db from '../config/db.js';

class MensualidadMovimientoService {

    /**
     * Analiza una mensualidad para determinar qué meses se pueden mover
     * Basado en la misma lógica de MensualidadesForm.jsx
     */
    static async analizarMensualidadParaMovimiento(mensualidad_id) {
        try {
            // 1. Obtener información completa de la mensualidad
            const mensualidad = await mensualidadesModel.getById(mensualidad_id);
            
            if (!mensualidad) {
                throw new Error('Mensualidad no encontrada');
            }

            // 2. Verificar si se puede mover
            const verificacion = await MensualidadMovimientosModel.verificarSePuedeMovern(mensualidad_id);
            if (!verificacion.puede_mover) {
                return {
                    puede_mover: false,
                    motivo: verificacion.motivo
                };
            }

            // 3. Obtener horarios de la mensualidad
            const [horariosInfo] = await db.query(`
                SELECT 
                    mg.horario_id,
                    mg.grupo_id,
                    mg.mes,
                    mg.year,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    g.nivel as grupo_nivel
                FROM mensualidad_grupos mg
                INNER JOIN horarios h ON mg.horario_id = h.id
                INNER JOIN grupos g ON mg.grupo_id = g.id
                WHERE mg.mensualidad_id = ?
                ORDER BY mg.year, mg.mes, h.dia, h.hora_inicio
            `, [mensualidad_id]);

            // 4. Agrupar por mes y analizar si son proporcionales o completos
            const mesesInfo = {};
            const fechaInicio = DateTime.fromJSDate(mensualidad.fecha_inicio);
            const fechaFin = DateTime.fromJSDate(mensualidad.fecha_fin);

            horariosInfo.forEach(horario => {
                const keyMes = `${horario.year}-${horario.mes.toString().padStart(2, '0')}`;
                
                if (!mesesInfo[keyMes]) {
                    mesesInfo[keyMes] = {
                        year: horario.year,
                        mes: horario.mes,
                        horarios: [],
                        fecha_inicio_mes: null,
                        fecha_fin_mes: null,
                        es_mes_completo: false,
                        se_puede_mover: false,
                        motivo_no_movible: null
                    };
                }
                
                mesesInfo[keyMes].horarios.push(horario);
            });

            // 5. Calcular para cada mes si es completo o proporcional
            for (const [keyMes, mesInfo] of Object.entries(mesesInfo)) {
                const fechaMes = DateTime.fromObject({ 
                    year: mesInfo.year, 
                    month: mesInfo.mes 
                });

                // Determinar fecha de inicio y fin para este mes específico
                if (fechaMes.hasSame(fechaInicio, 'month')) {
                    mesInfo.fecha_inicio_mes = fechaInicio;
                    mesInfo.fecha_fin_mes = DateTime.min(fechaInicio.endOf('month'), fechaFin);
                } else if (fechaMes.hasSame(fechaFin, 'month')) {
                    mesInfo.fecha_inicio_mes = fechaMes.startOf('month');
                    mesInfo.fecha_fin_mes = fechaFin;
                } else {
                    mesInfo.fecha_inicio_mes = fechaMes.startOf('month');
                    mesInfo.fecha_fin_mes = fechaMes.endOf('month');
                }

                const diasRestantesEnMes = mesInfo.fecha_fin_mes.diff(mesInfo.fecha_inicio_mes, 'days').days + 1;
                const semanasRestantes = diasRestantesEnMes / 7;

                // Calcular cantidad de clases reales contando cada día específico de clase
                const clasesPorSemana = mesInfo.horarios.length;
                const clasesTotalesEnMes = this.contarClasesRealesEnMes(
                    mesInfo.fecha_inicio_mes, 
                    mesInfo.fecha_fin_mes, 
                    mesInfo.horarios
                );

                // console.log("Clases totales en mes calculadas:", clasesTotalesEnMes);
                const clasesCompletasRequeridas = clasesPorSemana * 4; // 4 semanas completas

                mesInfo.es_mes_completo = clasesTotalesEnMes >= clasesCompletasRequeridas;
                
                const ahora = DateTime.now();
                if (mesInfo.fecha_fin_mes < ahora) {
                    mesInfo.se_puede_mover = false;
                    mesInfo.motivo_no_movible = 'El mes ya transcurrió';
                } else if (!mesInfo.es_mes_completo) {
                    mesInfo.se_puede_mover = false;
                    mesInfo.motivo_no_movible = `Es un mes proporcional (tiene ${clasesTotalesEnMes} clases, pero requiere ${clasesCompletasRequeridas} clases para ser completo con ${clasesPorSemana} clase${clasesPorSemana > 1 ? 's' : ''} por semana)`;
                } else {
                    mesInfo.se_puede_mover = true;
                }

                mesInfo.dias_en_mes = diasRestantesEnMes;
                mesInfo.semanas_en_mes = semanasRestantes;
                mesInfo.clases_por_semana = clasesPorSemana;
                mesInfo.clases_totales_en_mes = clasesTotalesEnMes;
                mesInfo.clases_completas_requeridas = clasesCompletasRequeridas;
                mesInfo.fecha_inicio_iso = mesInfo.fecha_inicio_mes.toISODate();
                mesInfo.fecha_fin_iso = mesInfo.fecha_fin_mes.toISODate();
            }

            // 6. Determinar opciones de movimiento
            const mesesMovibles = Object.values(mesesInfo).filter(m => m.se_puede_mover);
            const opcionesMovimiento = [];

            if (mesesMovibles.length > 0) {
                // Opción 1: Mover mes por mes
                mesesMovibles.forEach(mes => {
                    opcionesMovimiento.push({
                        tipo: 'mes_completo',
                        titulo: `${this.getNombreMes(mes.mes)} ${mes.year}`,
                        descripcion: `Mover solo el mes de ${this.getNombreMes(mes.mes)} ${mes.year}`,
                        fecha_desde: mes.fecha_inicio_iso,
                        fecha_hasta: mes.fecha_fin_iso,
                        meses_incluidos: [mes],
                        cantidad_horarios: mes.horarios.length,
                        tipo_clase: mes.horarios[0]?.grupo_tipo || 'Sin especificar',
                        nivel_clase: mes.horarios[0]?.grupo_nivel || 'Sin especificar'
                    });
                });

                // Opción 2: Mover todos los meses restantes
                if (mesesMovibles.length > 1) {
                    opcionesMovimiento.push({
                        tipo: 'meses_restantes',
                        titulo: 'Todos los meses restantes',
                        descripcion: `Mover desde ${this.getNombreMes(mesesMovibles[0].mes)} ${mesesMovibles[0].year} hasta ${this.getNombreMes(mesesMovibles[mesesMovibles.length-1].mes)} ${mesesMovibles[mesesMovibles.length-1].year}`,
                        fecha_desde: mesesMovibles[0].fecha_inicio_iso,
                        fecha_hasta: mesesMovibles[mesesMovibles.length-1].fecha_fin_iso,
                        meses_incluidos: mesesMovibles,
                        cantidad_horarios: mesesMovibles[0].horarios.length,
                        tipo_clase: mesesMovibles[0].horarios[0]?.grupo_tipo || 'Sin especificar',
                        nivel_clase: mesesMovibles[0].horarios[0]?.grupo_nivel || 'Sin especificar'
                    });
                }
            }

            return {
                puede_mover: true,
                mensualidad: verificacion.mensualidad,
                meses_info: mesesInfo,
                opciones_movimiento: opcionesMovimiento,
                total_meses_movibles: mesesMovibles.length,
                mensaje: `Se pueden mover ${mesesMovibles.length} mes${mesesMovibles.length !== 1 ? 'es' : ''} de esta mensualidad`
            };

        } catch (error) {
            console.error('Error al analizar mensualidad para movimiento:', error);
            return {
                puede_mover: false,
                motivo: `Error al analizar la mensualidad: ${error.message}`
            };
        }
    }

    /**
     * Valida que los nuevos horarios cumplan con las restricciones
     * MODIFICADO: Ahora detecta cuáles horarios se mantienen vs cuáles cambian
     */
    static async validarNuevosHorarios(mensualidad_id, horarios_anteriores, horarios_nuevos, cantidad_horarios_requeridos, fecha_desde, fecha_hasta, alumno_id) {
        console.log("Validando nuevos horarios para mensualidad:", mensualidad_id);
        try {
            // 1. Verificar que la cantidad de horarios sea la misma
            // const cantidadAnterior = horarios_anteriores.length;
            const cantidadNueva = horarios_nuevos.length;

            if (cantidad_horarios_requeridos !== cantidadNueva) {
                return {
                    valido: false,
                    mensaje: `La cantidad de horarios debe mantenerse (${cantidad_horarios_requeridos}). Se proporcionaron ${cantidadNueva}.`
                };
            }

            // 2. Verificar que todos los nuevos horarios sean del mismo tipo de clase
            const tipoClaseOriginal = horarios_anteriores[0]?.tipo_clase;
            const tiposNuevos = [...new Set(horarios_nuevos.map(h => h.tipo_clase))];

            if (tiposNuevos.length > 1 || tiposNuevos[0] !== tipoClaseOriginal) {
                return {
                    valido: false,
                    mensaje: `Todos los horarios deben ser del mismo tipo de clase: ${tipoClaseOriginal}`
                };
            }

            // 3. Clasificar horarios como mantenidos vs cambiados
            const clasificacion = this.clasificarHorarios(horarios_anteriores, horarios_nuevos);

            // 4. Solo validar cupos para horarios que realmente cambian
            const erroresCupos = [];
            const periodosAValidar = this.generarPeriodosValidacion(fecha_desde, fecha_hasta);

            // Usar horarios_nuevos_exclusivos si existe, si no usar horarios_cambiados
            const horariosAValidar = clasificacion.horarios_nuevos_exclusivos || clasificacion.horarios_cambiados;

            for (const horario of horariosAValidar) {
                for (const periodo of periodosAValidar) {
                    const validacionCupo = await CuposValidationService.validarCupoDisponible(
                        horario.horario_id,
                        periodo.year,
                        periodo.mes,
                        alumno_id
                    );

                    if (!validacionCupo.disponible) {
                        erroresCupos.push(
                            `${this.getNombreMes(periodo.mes)} ${periodo.year} - Horario ${horario.horario_id}: ${validacionCupo.mensaje}`
                        );
                    }
                }
            }

            if (erroresCupos.length > 0) {
                return {
                    valido: false,
                    mensaje: erroresCupos, //'Algunos horarios no tienen cupos',
                    errores_cupos: erroresCupos
                };
            }

            // 5. Verificar que no haya solapamientos de horarios
            const solapamientos = this.detectarSolapamientosHorarios(horarios_nuevos);
            if (solapamientos.length > 0) {
                return {
                    valido: false,
                    mensaje: 'Hay horarios que se solapan',
                    solapamientos: solapamientos
                };
            }

            return {
                valido: true,
                mensaje: 'Los nuevos horarios son válidos',
                clasificacion: clasificacion,
                resumen: {
                    total: horarios_nuevos.length,
                    mantenidos: clasificacion.horarios_mantenidos.length,
                    cambiados: clasificacion.horarios_cambiados.length
                }
            };

        } catch (error) {
            console.error('Error al validar nuevos horarios:', error);
            return {
                valido: false,
                mensaje: `Error en validación: ${error.message}`
            };
        }
    }

    /**
     * Clasifica horarios en mantenidos vs cambiados
     */
    static clasificarHorarios(horarios_anteriores, horarios_nuevos) {
        const horariosMantenidos = [];
        const horariosEliminados = [];
        const horariosAgregados = [];

        // Verificar si hay múltiples períodos
        const tieneMultiplesPeriodos = horarios_anteriores.length > 0 && 
                                    horarios_anteriores[0].periodos && 
                                    horarios_anteriores[0].periodos.length > 1;

        // Si hay múltiples períodos, todos se eliminan y agregan
        if (tieneMultiplesPeriodos) {
            horariosEliminados.push(...horarios_anteriores);
            horariosAgregados.push(...horarios_nuevos);

            // Crear un Set con los horario_id anteriores para búsqueda rápida
            const idsAnteriores = new Set(horarios_anteriores.map(h => h.horario_id));

            // Solo los horarios nuevos que no estén en anteriores
            const horariosNuevosExclusivos = horarios_nuevos.filter(h => !idsAnteriores.has(h.horario_id));

            return {
                horarios_mantenidos: horariosMantenidos,
                horarios_eliminados: horariosEliminados,
                horarios_agregados: horariosAgregados,
                horarios_cambiados: horariosAgregados,
                horarios_nuevos_exclusivos: horariosNuevosExclusivos // Solo para múltiples períodos
            };
        }
        
        // Lógica para un solo período
        const mapaAnteriores = new Map(
            horarios_anteriores.map(h => [h.horario_id, h])
        );
        const mapaNuevos = new Map(
            horarios_nuevos.map(h => [h.horario_id, h])
        );
        
        // Identificar horarios mantenidos y eliminados
        horarios_anteriores.forEach(horario => {
            if (mapaNuevos.has(horario.horario_id)) {
                horariosMantenidos.push(horario);
            } else {
                horariosEliminados.push(horario);
            }
        });
        
        // Identificar horarios agregados
        horarios_nuevos.forEach(horario => {
            if (!mapaAnteriores.has(horario.horario_id)) {
                horariosAgregados.push(horario);
            }
        });
        
        return {
            horarios_mantenidos: horariosMantenidos,
            horarios_eliminados: horariosEliminados,
            horarios_agregados: horariosAgregados,
            horarios_cambiados: horariosAgregados
            // No se incluye horarios_nuevos_exclusivos aquí (solo para múltiples períodos)
        };
    }

    /**
     * Procesa el movimiento completo de una mensualidad
     * MODIFICADO: Ahora utiliza la clasificación de horarios
     */
    static async procesarMovimientoMensualidad({
        mensualidad_id,
        alumno_id,
        usuario_id,
        opcion_seleccionada,
        cantidad_horarios_requeridos,
        horarios_nuevos,
        motivo = 'Movimiento solicitado por el usuario'
    }) {
        try {
            // 1. Validar datos iniciales
            if (!mensualidad_id || !usuario_id || !opcion_seleccionada || !horarios_nuevos || !cantidad_horarios_requeridos) {
                throw new Error('Faltan datos requeridos para el movimiento');
            }

            // 2. Obtener análisis de la mensualidad
            const analisis = await this.analizarMensualidadParaMovimiento(mensualidad_id);
            if (!analisis.puede_mover) {
                return {
                    success: false,
                    mensaje: analisis.motivo
                };
            }

            // 3. Encontrar la opción de movimiento seleccionada
            const opcion = analisis.opciones_movimiento.find(o => 
                o.tipo === opcion_seleccionada.tipo && 
                o.fecha_desde === opcion_seleccionada.fecha_desde
            );

            if (!opcion) {
                return {
                    success: false,
                    mensaje: 'Opción de movimiento no válida'
                };
            }

            // 4. Generar períodos uniformes para TODOS los horarios
            const periodosUniformes = this.generarPeriodosValidacion(
                opcion.fecha_desde, 
                opcion.fecha_hasta
            );

            // 5. Preparar horarios anteriores CON períodos uniformes
            const horariosAnterioresBase = this.prepararHorariosAnteriores(opcion.meses_incluidos);
            const horariosAnteriores = horariosAnterioresBase.map(h => ({
                ...h,
                periodos: periodosUniformes // Asegurar que todos tengan los mismos períodos
            }));

            // 6. Preparar horarios nuevos CON períodos uniformes
            const horariosNuevosConPeriodos = horarios_nuevos.map(h => ({
                ...h,
                periodos: periodosUniformes // Usar los mismos períodos para todos
            }));

            // 7. Validar nuevos horarios y obtener clasificación
            const validacion = await this.validarNuevosHorarios(
                mensualidad_id,
                horariosAnteriores,
                horariosNuevosConPeriodos,
                cantidad_horarios_requeridos,
                opcion.fecha_desde,
                opcion.fecha_hasta,
                alumno_id
            );

            if (!validacion.valido) {
                return {
                    success: false,
                    mensaje: validacion.mensaje,
                    errores_validacion: validacion.errores_cupos || validacion.solapamientos || []
                };
            }

            const dataMovimiento = {
                mensualidad_id,
                usuario_id,
                motivo,
                periodo_desde: opcion.fecha_desde,
                periodo_hasta: opcion.fecha_hasta,
                tipo_periodo: opcion.tipo,
                horarios_anteriores: horariosAnteriores,
                horarios_nuevos: horariosNuevosConPeriodos,
                clasificacion_horarios: validacion.clasificacion
            };

            // 8. Iniciar el movimiento
            const inicioMovimiento = await MensualidadMovimientosModel.iniciarMovimiento(dataMovimiento);

            if (!inicioMovimiento.success) {
                return {
                    success: false,
                    mensaje: 'Error al iniciar el movimiento'
                };
            }

            // 9. Ejecutar el movimiento
            const resultadoMovimiento = await MensualidadMovimientosModel.ejecutarMovimiento(
                inicioMovimiento.movimiento_id
            );

            return {
                success: true,
                movimiento_id: inicioMovimiento.movimiento_id,
                mensaje: 'Movimiento ejecutado correctamente',
                detalles: {
                    asistencias_eliminadas: resultadoMovimiento.asistencias_eliminadas,
                    clases_nuevas_generadas: resultadoMovimiento.clases_nuevas_generadas,
                    periodo_movido: `${opcion.fecha_desde} a ${opcion.fecha_hasta}`,
                    horarios_cambiados: validacion.clasificacion.horarios_agregados.length,
                    horarios_mantenidos: validacion.clasificacion.horarios_mantenidos.length,
                    horarios_total: horarios_nuevos.length
                }
            };

        } catch (error) {
            console.error('Error al procesar movimiento de mensualidad:', error);
            return {
                success: false,
                mensaje: `Error al procesar el movimiento: ${error.message}`
            };
        }
    }

    /**
     * Obtiene los horarios disponibles para un tipo de clase específico
     * INCLUYE los horarios actuales para que puedan mantenerse
     */
    static async getHorariosDisponiblesParaMovimiento(tipo_clase, nivel_clase, fecha_desde, fecha_hasta, horarios_actuales = [], alumno_id = null) {
        try {
            // 1. Obtener todos los horarios del tipo de clase especificado
            const [horarios] = await db.query(`
                SELECT 
                    h.id as horario_id,
                    h.grupo_id,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin,
                    CONCAT(p.nombre, ' ', p.apellido) as profesor_nombre,
                    g.codigo as grupo_codigo,
                    g.nombre as grupo_nombre,
                    g.tipo as grupo_tipo,
                    h.cupo_maximo
                FROM horarios h
                INNER JOIN grupos g ON h.grupo_id = g.id
                LEFT JOIN profesores p ON h.profesor_id = p.id
                WHERE g.tipo = ? 
                AND g.nivel = ?
                AND h.activo = 1 
                AND h.deleted = 0
                AND g.activo = 1 
                AND g.deleted = 0
                ORDER BY h.dia, h.hora_inicio
            `, [tipo_clase, nivel_clase]);

            // 2. Crear un conjunto de IDs de horarios actuales para identificación rápida
            const horariosActualesIds = new Set(horarios_actuales.map(h => h.horario_id));

            // 3. Verificar disponibilidad de cupos para cada horario
            const periodosValidacion = this.generarPeriodosValidacion(fecha_desde, fecha_hasta);
            const horariosDisponibles = [];

            for (const horario of horarios) {

                const esHorarioActual = horariosActualesIds.has(horario.horario_id);
                let disponibleEnTodosPeriodos = true;
                const disponibilidadPorMes = [];

                // Si es horario actual, marcarlo como disponible automáticamente
                if (esHorarioActual) {
                    for (const periodo of periodosValidacion) {
                        disponibilidadPorMes.push({
                            mes: periodo.mes,
                            year: periodo.year,
                            disponible: true,
                            cupos_disponibles: null,
                            motivo: 'Horario actual del alumno'
                        });
                    }

                    horariosDisponibles.push({
                        ...horario,
                        es_horario_actual: true,
                        disponible_completo: true,
                        disponibilidad_por_mes: disponibilidadPorMes,
                        mensaje_especial: 'Horario actual - puede mantenerlo'
                    });
                    continue;
                }

                // Para horarios nuevos, validar cupos normalmente
                for (const periodo of periodosValidacion) {
                    const validacionCupo = await CuposValidationService.validarCupoDisponible(
                        horario.horario_id,
                        periodo.year,
                        periodo.mes,
                        alumno_id
                    );

                    disponibilidadPorMes.push({
                        mes: periodo.mes,
                        year: periodo.year,
                        disponible: validacionCupo.disponible,
                        cupos_disponibles: validacionCupo.cupos_disponibles,
                        motivo: validacionCupo.mensaje
                    });

                    if (!validacionCupo.disponible) {
                        disponibleEnTodosPeriodos = false;
                    }
                }

                horariosDisponibles.push({
                    ...horario,
                    es_horario_actual: false,
                    disponible_completo: disponibleEnTodosPeriodos,
                    disponibilidad_por_mes: disponibilidadPorMes
                });
            }

            return horariosDisponibles;

        } catch (error) {
            console.error('Error al obtener horarios disponibles para movimiento:', error);
            throw error;
        }
    }

    /**
     * Funciones auxiliares
     */
    static getNombreMes(numeroMes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[numeroMes - 1] || 'Mes desconocido';
    }

    static getDiasUnicos(horarios) {
        return [...new Set(horarios.map(h => h.dia))];
    }

    static generarPeriodosValidacion(fecha_desde, fecha_hasta) {
        const periodos = [];
        let fechaActual = DateTime.fromISO(fecha_desde).startOf('month');
        const fechaFin = DateTime.fromISO(fecha_hasta).startOf('month');

        while (fechaActual <= fechaFin) {
            periodos.push({
                mes: fechaActual.month,
                year: fechaActual.year
            });
            fechaActual = fechaActual.plus({ months: 1 });
        }

        return periodos;
    }

    static detectarSolapamientosHorarios(horarios) {
        const solapamientos = [];
        
        for (let i = 0; i < horarios.length; i++) {
            for (let j = i + 1; j < horarios.length; j++) {
                const horario1 = horarios[i];
                const horario2 = horarios[j];
                
                if (horario1.dia === horario2.dia) {
                    const inicio1 = this.horaAMinutos(horario1.hora_inicio);
                    const fin1 = this.horaAMinutos(horario1.hora_fin);
                    const inicio2 = this.horaAMinutos(horario2.hora_inicio);
                    const fin2 = this.horaAMinutos(horario2.hora_fin);
                    
                    if (inicio1 < fin2 && inicio2 < fin1) {
                        solapamientos.push({
                            horario1: `${horario1.dia} ${horario1.hora_inicio}-${horario1.hora_fin}`,
                            horario2: `${horario2.dia} ${horario2.hora_inicio}-${horario2.hora_fin}`
                        });
                    }
                }
            }
        }
        
        return solapamientos;
    }

    static horaAMinutos(hora) {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos;
    }

    static prepararHorariosAnteriores(mesesIncluidos) {
        const horariosMap = new Map();
        
        mesesIncluidos.forEach(mes => {
            mes.horarios.forEach(horario => {
                const key = horario.horario_id;
                
                if (!horariosMap.has(key)) {
                    horariosMap.set(key, {
                        horario_id: horario.horario_id,
                        grupo_id: horario.grupo_id,
                        dia: horario.dia,
                        hora_inicio: horario.hora_inicio,
                        hora_fin: horario.hora_fin,
                        tipo_clase: horario.grupo_tipo,
                        periodos: []
                    });
                }
                
                horariosMap.get(key).periodos.push({
                    mes: horario.mes,
                    year: horario.year
                });
            });
        });
        
        return Array.from(horariosMap.values());
    }

    static prepararHorariosNuevos(horariosNuevos, fecha_desde, fecha_hasta) {
        const periodosMovimiento = this.generarPeriodosValidacion(fecha_desde, fecha_hasta);
        
        return horariosNuevos.map(horario => ({
            ...horario,
            periodos: periodosMovimiento
        }));
    }

    /**
     * Cuenta las clases reales en un mes basándose en las fechas exactas y los días de clase
     * @param {DateTime} fechaInicio - Fecha de inicio del periodo en el mes
     * @param {DateTime} fechaFin - Fecha de fin del periodo en el mes
     * @param {Array} horarios - Array de horarios con sus días de la semana
     * @returns {number} - Cantidad real de clases en el periodo
     */
    static contarClasesRealesEnMes(fechaInicio, fechaFin, horarios) {
        if (!horarios || horarios.length === 0) {
            return 0;
        }

        // Mapeo de nombres de días en español a números de Luxon
        const mapaDias = {
            'lunes': 1,
            'martes': 2,
            'miercoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sabado': 6,
            'domingo': 7
        };

        // Obtener los días de la semana únicos donde hay clases y convertirlos a números
        const diasDeClase = [...new Set(horarios.map(h => mapaDias[h.dia.toLowerCase()]))].filter(Boolean);
        
        let totalClases = 0;
        let fechaActual = fechaInicio.startOf('day');
        const fechaFinPeriodo = fechaFin.endOf('day');

        // console.log("Días de clase (números):", diasDeClase);

        // Iterar día por día desde el inicio hasta el fin del periodo
        while (fechaActual <= fechaFinPeriodo) {
            // Luxon: 1=Lunes, 2=Martes, ..., 7=Domingo
            const diaSemanaLuxon = fechaActual.weekday;
            
            // Verificar si este día hay clases
            if (diasDeClase.includes(diaSemanaLuxon)) {
                // Contar cuántas clases hay en este día específico
                const nombreDia = Object.keys(mapaDias).find(key => mapaDias[key] === diaSemanaLuxon);
                const clasesEsteDia = horarios.filter(h => h.dia.toLowerCase() === nombreDia).length;
                totalClases += clasesEsteDia;
                
                // console.log(`Día ${fechaActual.toISODate()} (${nombreDia}): ${clasesEsteDia} clases`);
            }
            
            // Avanzar al siguiente día
            fechaActual = fechaActual.plus({ days: 1 });
        }

        // console.log("Total de clases calculadas:", totalClases);
        return totalClases;
    }
}

export default MensualidadMovimientoService;