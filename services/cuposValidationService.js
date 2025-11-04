// services/cuposValidationService.js
import disponibilidadCuposModel from '../models/disponibilidadCupos.js';
import { DateTime } from 'luxon';

class CuposValidationService {
    
    /**
     * Valida si hay cupos disponibles para un horario en un período específico
     * @param {number} horarioId - ID del horario
     * @param {number} year - Año
     * @param {number} mes - Mes
     * @param {number} alumnoId - ID del alumno (opcional, para excluir si ya está inscrito)
     * @returns {Object} Resultado de la validación
     */
    static async validarCupoDisponible(horarioId, year, mes, alumnoId = null) {
        try {
            const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(year, mes);
            
            // Buscar el horario específico en la disponibilidad
            const horarioDisponibilidad = disponibilidad.find(
                item => item.horario_id === horarioId
            );

            if (!horarioDisponibilidad) {
                return {
                    disponible: false,
                    motivo: 'HORARIO_NO_ENCONTRADO',
                    mensaje: 'El horario especificado no existe o no está activo',
                    cupos_disponibles: 0,
                    cupo_maximo: 0
                };
            }

            // Aplicar lógica de cupos ajustados (igual que en el controlador)
            const cuposAjustados = this.calcularCuposAjustados([horarioDisponibilidad], year, mes, alumnoId);
            const disponibilidadAjustada = cuposAjustados[0];

            // Si el alumno ya está inscrito en este horario/mes, no contar como ocupado
            let cuposDisponiblesFinales = disponibilidadAjustada.cupos_disponibles_ajustados;
            let yaInscrito = false;


            // ESTE CODIGO ESTA COMENTADO POR QUE ES LOGICA ANTERIOR QUE YA NO SE ADAPTA A LA NUEVA LOGICA DE REGISTRO DE MENSUALIDADES
            // PERO LO DEJO AQUI POR SI ALGO, ALEXIS VTALV.

            if (alumnoId) {
                // Verificar si el alumno ya está inscrito en este horario/mes
                const alumnosActuales = disponibilidadAjustada.alumnos_actuales || [];
                // const alumnosMesAnterior = disponibilidadAjustada.alumnos_mes_anterior || [];
                
                yaInscrito = alumnosActuales.some(alumno => 
                    alumno && alumno.alumno_id === alumnoId
                );

                if (yaInscrito) {
                    return {
                        disponible: false,
                        motivo: 'YA_INSCRITO',
                        mensaje: 'El alumno ya está inscrito en este horario para el mes seleccionado',
                        cupos_disponibles: cuposDisponiblesFinales,
                        cupo_maximo: disponibilidadAjustada.cupo_maximo,
                        cupos_ocupados: disponibilidadAjustada.cupos_ocupados_ajustados,
                        estado_disponibilidad: disponibilidadAjustada.estado_disponibilidad_ajustado,
                        porcentaje_ocupacion: disponibilidadAjustada.porcentaje_ocupacion_ajustado,
                        reserva_activa: disponibilidadAjustada.reserva_activa,
                        ya_inscrito: true,
                        grupo_info: {
                            grupo_id: disponibilidadAjustada.grupo_id,
                            codigo: disponibilidadAjustada.codigo,
                            nombre: disponibilidadAjustada.nombre,
                            tipo: disponibilidadAjustada.tipo
                        }
                    };
                }
            }
            
            // if (alumnoId) { 
            //     // Verificar si el alumno ya está inscrito en este horario/mes
            //     const alumnosActuales = disponibilidadAjustada.alumnos_actuales || [];
            //     const alumnosMesAnterior = disponibilidadAjustada.alumnos_mes_anterior || [];
                
            //     yaInscrito = alumnosActuales.some(alumno => 
            //         alumno && alumno.alumno_id === alumnoId
            //     ) || alumnosMesAnterior.some(alumno => 
            //         alumno && alumno.alumno_id === alumnoId
            //     );

            //     if (yaInscrito) {
            //         cuposDisponiblesFinales += 1; // Liberar el cupo del alumno actual
            //     }
            // }

            const tieneDisponibilidad = cuposDisponiblesFinales > 0;

            return {
                disponible: tieneDisponibilidad,
                motivo: tieneDisponibilidad ? 'DISPONIBLE' : 'SIN_CUPOS',
                mensaje: tieneDisponibilidad 
                    ? 'Cupo disponible' 
                    : `No hay cupos disponibles. Cupo máximo: ${disponibilidadAjustada.cupo_maximo}, ocupados: ${disponibilidadAjustada.cupos_ocupados_ajustados}`,
                cupos_disponibles: cuposDisponiblesFinales,
                cupo_maximo: disponibilidadAjustada.cupo_maximo,
                cupos_ocupados: disponibilidadAjustada.cupos_ocupados_ajustados,
                estado_disponibilidad: disponibilidadAjustada.estado_disponibilidad_ajustado,
                porcentaje_ocupacion: disponibilidadAjustada.porcentaje_ocupacion_ajustado,
                reserva_activa: disponibilidadAjustada.reserva_activa,
                ya_inscrito: yaInscrito,
                grupo_info: {
                    grupo_id: disponibilidadAjustada.grupo_id,
                    codigo: disponibilidadAjustada.codigo,
                    nombre: disponibilidadAjustada.nombre,
                    tipo: disponibilidadAjustada.tipo
                }
            };

        } catch (error) {
            console.error('Error al validar cupo disponible:', error);
            return {
                disponible: false,
                motivo: 'ERROR_VALIDACION',
                mensaje: 'Error interno al validar disponibilidad de cupos',
                cupos_disponibles: 0,
                cupo_maximo: 0,
                error: error.message
            };
        }
    }

    /**
     * Valida cupos para múltiples horarios en un período
     * @param {Array} horarios - Array de objetos {horario_id, year, mes}
     * @param {number} alumnoId - ID del alumno
     * @returns {Object} Resultado de validación múltiple
     */
    static async validarCuposMultiples(horarios, alumnoId = null) {
        const resultados = [];
        let todosDisponibles = true;
        const errores = [];

        for (const horario of horarios) {
            // console.log("validando cupo para:", horario);
            // console.log("Validando cupo para:", horario.grupo_info.horarios);
            
            const validacion = await this.validarCupoDisponible(
                horario.horario_id, 
                horario.year, 
                horario.mes, 
                alumnoId
            );

            resultados.push({
                ...horario,
                validacion
            });

            if (!validacion.disponible) {
                todosDisponibles = false;
                
                // Buscar el horario específico en el array de horarios del grupo
                const horarioDetalle = horario.grupo_info.horarios.find(
                    h => h.horario_id === horario.horario_id
                );
                
                // Construir el mensaje con el detalle del horario
                const detalleHorario = horarioDetalle 
                    ? `${horarioDetalle.dia} ${horarioDetalle.hora_inicio} - ${horarioDetalle.hora_fin}`
                    : `horario ${horario.horario_id}`;
                
                errores.push(
                    `${horario.year}/${horario.mes} en ${detalleHorario}: ${validacion.mensaje}`
                );
            }
        }

        return {
            todos_disponibles: todosDisponibles,
            resultados,
            errores,
            mensaje: todosDisponibles 
                ? 'Todos los cupos están disponibles' 
                : `Algunos horarios no están disponibles: ${errores.join(' || ')}`
        };
    }

    /**
     * Valida cupos para una mensualidad completa (múltiples meses)
     * @param {Object} mensualidad - Datos de la mensualidad
     * @param {number} alumnoId - ID del alumno
     * @returns {Object} Resultado de validación de mensualidad
     */
    static async validarCuposMensualidad(mensualidad, alumnoId = null) {
        try {
            // Generar todos los meses que abarca la mensualidad
            const fechaInicio = DateTime.fromISO(mensualidad.fecha_inicio);
            const fechaFin = DateTime.fromISO(mensualidad.fecha_fin);
            const mesesAbarcados = this.generarMesesEnPeriodo(fechaInicio, fechaFin);

            const horariosAValidar = [];

            // Para cada grupo y horario, crear validaciones para todos los meses
            for (const grupo of mensualidad.grupos) {
                for (const horario of grupo.horarios) {
                    for (const mesInfo of mesesAbarcados) {
                        horariosAValidar.push({
                            horario_id: horario.horario_id,
                            year: mesInfo.year,
                            mes: mesInfo.mes,
                            grupo_id: grupo.grupo_id,
                            grupo_info: grupo
                        });
                    }
                }
            }

            const validacionMultiple = await this.validarCuposMultiples(horariosAValidar, alumnoId);

            return {
                ...validacionMultiple,
                meses_abarcados: mesesAbarcados,
                total_validaciones: horariosAValidar.length
            };

        } catch (error) {
            console.error('Error al validar cupos de mensualidad:', error);
            return {
                todos_disponibles: false,
                resultados: [],
                errores: [`Error interno: ${error.message}`],
                mensaje: 'Error al validar cupos de la mensualidad'
            };
        }
    }

    /**
     * Aplica la misma lógica de cupos ajustados que en el controlador
     */
    static calcularCuposAjustados(disponibilidad, year, mes, alumnoId = null) {
        const now = DateTime.now().setZone('America/Mexico_City');
        const mesConsulta = DateTime.fromObject({ year, month: mes });
        const esMesActual = mesConsulta.hasSame(now, 'month') && mesConsulta.hasSame(now, 'year');
        const esMesPasado = mesConsulta < now.startOf('month');
        const diaMes = now.day;
        
        // Determinar si debemos aplicar ajustes
        const debeAplicarAjustes = !esMesPasado && (!esMesActual || diaMes <= 8);

        console.log("debeaplicar ajustes: ", debeAplicarAjustes);

        return disponibilidad.map(item => {
            let cuposAjustados = Number(item.cupos_ocupados);
            let cuposDisponiblesAjustados = Number(item.cupos_disponibles);
            let estadoAjustado = item.estado_disponibilidad;
            
            // Parsear alumnos del mes anterior
            let alumnosMesAnterior = [];
            let alumnosActuales = [];
            let yaInscrito = false;
            try {
                alumnosMesAnterior = item.alumnos_mes_anterior ? item.alumnos_mes_anterior : [];
                if (!Array.isArray(alumnosMesAnterior)) {
                    alumnosMesAnterior = [];
                }
            } catch (e) {
                alumnosMesAnterior = [];
            }

            try {
                alumnosActuales = item.alumnos_actuales ? item.alumnos_actuales : [];
                if (!Array.isArray(alumnosActuales)) {
                    alumnosActuales = [];
                }
            } catch (e) {
                alumnosActuales = [];
            }

            let datosInscripcionExistente = null;

            if (alumnoId) {
                const alumnoInscrito = alumnosActuales.find(alumno => 
                    alumno && alumno.alumno_id === alumnoId
                );
                
                yaInscrito = !!alumnoInscrito;
                
                // Si está inscrito, guardar los datos de su inscripción
                if (yaInscrito && alumnoInscrito) {
                    datosInscripcionExistente = {
                        mensualidad_id: alumnoInscrito.mensualidad_id,
                        fecha_inicio: alumnoInscrito.fecha_inicio,
                        fecha_fin: alumnoInscrito.fecha_fin,
                        pagada: alumnoInscrito.pagada,
                        nombre_completo: alumnoInscrito.nombre_completo
                    };
                }
            }

            // console.log("ya inscrito:", yaInscrito);

            let cantidadAlumnosMesAnterior = alumnosMesAnterior.length;

            let alumnoEnMesAnterior = false;

            if (cantidadAlumnosMesAnterior > 0 && alumnoId) {
                alumnoEnMesAnterior = alumnosMesAnterior.some(alumno => 
                    alumno && alumno.alumno_id === alumnoId
                );
            }

            if (alumnoEnMesAnterior && cantidadAlumnosMesAnterior > 0) {
                // Si el alumno ya está en el mes anterior, no contar su cupo como ocupado
                cantidadAlumnosMesAnterior -= 1;
            }

            // Solo aplicar ajustes si corresponde
            if (debeAplicarAjustes) {
                // Si no han pasado los 5 días del mes actual o es un mes futuro, contar cupos del mes anterior como ocupados
                cuposAjustados += cantidadAlumnosMesAnterior;
                cuposDisponiblesAjustados = item.cupo_maximo - cuposAjustados;
                
                // Recalcular estado
                if (cuposAjustados === 0) {
                    estadoAjustado = 'Disponible';
                } else if (cuposAjustados >= item.cupo_maximo) {
                    estadoAjustado = 'Lleno';
                } else {
                    estadoAjustado = 'Parcialmente ocupado';
                }
            }
            // Si no debe aplicar ajustes (mes pasado o ya pasó periodo de gracia), 
            // los valores quedan como están (cupos_ocupados y cupos_disponibles originales)

            return {
                ...item,
                cupos_ocupados_ajustados: cuposAjustados,
                cupos_disponibles_ajustados: cuposDisponiblesAjustados,
                estado_disponibilidad_ajustado: estadoAjustado,
                porcentaje_ocupacion_ajustado: item.cupo_maximo > 0 ? 
                    Math.round((cuposAjustados / item.cupo_maximo) * 100 * 100) / 100 : 0,
                alumnos_mes_anterior_count: cantidadAlumnosMesAnterior,
                reserva_activa: debeAplicarAjustes,
                ya_inscrito: yaInscrito,
                datos_inscripcion_existente: datosInscripcionExistente
            };
        });
    }

    /**
     * Genera todos los meses en un período específico
     */
    static generarMesesEnPeriodo(fechaInicio, fechaFin) {
        const meses = [];
        let fechaActual = fechaInicio.startOf('month');
        const fechaFinMes = fechaFin.startOf('month');

        while (fechaActual <= fechaFinMes) {
            meses.push({
                mes: fechaActual.month,
                year: fechaActual.year,
                nombre_mes: fechaActual.toFormat('MMMM', { locale: 'es' }),
                fecha_str: fechaActual.toFormat('yyyy-MM')
            });
            fechaActual = fechaActual.plus({ months: 1 });
        }

        return meses;
    }

    /**
     * Obtiene información de disponibilidad para mostrar en interfaz
     * @param {Array} horariosIds - Array de IDs de horarios
     * @param {number} year - Año
     * @param {number} mes - Mes
     * @returns {Array} Información de disponibilidad para UI
     */
    static async getDisponibilidadParaUI(horariosIds, year, mes, alumnoId = null) {
        try {
            const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(year, mes);
            const cuposAjustados = this.calcularCuposAjustados(disponibilidad, year, mes, alumnoId);

            return cuposAjustados.filter(item => 
                horariosIds.includes(item.horario_id)
            ).map(item => ({
                horario_id: item.horario_id,
                grupo_id: item.grupo_id,
                codigo: item.codigo,
                nombre: item.nombre,
                tipo: item.tipo,
                dia: item.dia,
                hora_inicio: item.hora_inicio,
                hora_fin: item.hora_fin,
                cupo_maximo: item.cupo_maximo,
                cupos_disponibles: item.cupos_disponibles_ajustados,
                cupos_ocupados: item.cupos_ocupados_ajustados,
                estado: item.estado_disponibilidad_ajustado,
                porcentaje_ocupacion: item.porcentaje_ocupacion_ajustado,
                reserva_activa: item.reserva_activa,
                disponible: item.cupos_disponibles_ajustados > 0,
                ya_inscrito: item.ya_inscrito || false,
                datos_inscripcion_existente: item.datos_inscripcion_existente || null
            }));

        } catch (error) {
            console.error('Error al obtener disponibilidad para UI:', error);
            return [];
        }
    }
}

export default CuposValidationService;