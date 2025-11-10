// services/cuposValidationService.js
import disponibilidadCuposModel from '../models/disponibilidadCupos.js';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import { DecisionTreeClassifier } from 'ml-cart'; // npm install ml-cart

const modeloPath = path.resolve('./modeloCupos.json');

class CuposValidationService {

    // ============================================
    //  SECCIÓN DE IA - ÁRBOL DE DECISIÓN
    // ============================================

    static modeloIA = null;

    /**
     * Entrena el modelo de árbol de decisión con datos históricos de cupos.
     * El modelo se guarda en /data/modeloCupos.json para persistencia local.
     */
    static async entrenarModeloIA() {
        try {
            const historial = await disponibilidadCuposModel.getHistorialCupos(); 
            if (!historial || historial.length === 0) {
                console.warn('No hay datos históricos suficientes para entrenar el modelo IA.');
                return;
            }

            // Variables de entrada (features) y salida (label)
            const X = historial.map(r => [
                Number(r.cupos_ocupados || 0),
                Number(r.cupo_maximo || 0),
                Number(r.mes || 0),
                Number(r.nivel || 0),
            ]);

            const y = historial.map(r => {
                if (r.cupos_ocupados >= r.cupo_maximo) return 'LLENO';
                if (r.cupos_ocupados >= r.cupo_maximo * 0.7) return 'PARCIAL';
                return 'DISPONIBLE';
            });

            const modelo = new DecisionTreeClassifier({ gainFunction: 'gini', maxDepth: 5 });
            modelo.train(X, y);

            fs.mkdirSync(path.dirname(modeloPath), { recursive: true });
            fs.writeFileSync(modeloPath, JSON.stringify(modelo.toJSON(), null, 2));

            this.modeloIA = modelo;
            console.log('Modelo IA de cupos entrenado y guardado correctamente.');
        } catch (error) {
            console.error('Error al entrenar el modelo IA:', error);
        }
    }

    /**
     * Carga el modelo IA desde archivo local, si existe.
     */
    static cargarModeloIA() {
        try {
            if (fs.existsSync(modeloPath)) {
                const data = fs.readFileSync(modeloPath, 'utf8');
                this.modeloIA = DecisionTreeClassifier.load(JSON.parse(data));
            } else {
                console.warn('Archivo del modelo IA no encontrado. Se requiere entrenamiento inicial.');
            }
        } catch (error) {
            console.error('Error al cargar modelo IA:', error);
        }
    }

    /**
     * Predice el estado de disponibilidad con base en las características del horario.
     */
    static predecirEstadoIA(cupos_ocupados, cupo_maximo, mes, nivel = 0) {
        if (!this.modeloIA) {
            console.warn('Modelo IA no cargado, predicción omitida.');
            return 'DESCONOCIDO';
        }

        const entrada = [[
            Number(cupos_ocupados || 0),
            Number(cupo_maximo || 0),
            Number(mes || 0),
            Number(nivel || 0)
        ]];

        try {
            const pred = this.modeloIA.predict(entrada);
            return pred[0];
        } catch {
            return 'DESCONOCIDO';
        }
    }

    // ============================================
    //  LÓGICA ORIGINAL DEL SERVICIO
    // ============================================

    static async validarCupoDisponible(horarioId, year, mes, alumnoId = null) {
        try {
            const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(year, mes);
            const horarioDisponibilidad = disponibilidad.find(item => item.horario_id === horarioId);

            if (!horarioDisponibilidad) {
                return {
                    disponible: false,
                    motivo: 'HORARIO_NO_ENCONTRADO',
                    mensaje: 'El horario especificado no existe o no está activo',
                    cupos_disponibles: 0,
                    cupo_maximo: 0
                };
            }

            const cuposAjustados = this.calcularCuposAjustados([horarioDisponibilidad], year, mes, alumnoId);
            const disponibilidadAjustada = cuposAjustados[0];

            let cuposDisponiblesFinales = disponibilidadAjustada.cupos_disponibles_ajustados;
            let yaInscrito = false;

            if (alumnoId) {
                const alumnosActuales = disponibilidadAjustada.alumnos_actuales || [];
                yaInscrito = alumnosActuales.some(alumno => alumno && alumno.alumno_id === alumnoId);

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

    static async validarCuposMultiples(horarios, alumnoId = null) {
        const resultados = [];
        let todosDisponibles = true;
        const errores = [];

        for (const horario of horarios) {
            const validacion = await this.validarCupoDisponible(
                horario.horario_id, 
                horario.year, 
                horario.mes, 
                alumnoId
            );

            resultados.push({ ...horario, validacion });

            if (!validacion.disponible) {
                todosDisponibles = false;
                const horarioDetalle = horario.grupo_info.horarios.find(h => h.horario_id === horario.horario_id);
                const detalleHorario = horarioDetalle 
                    ? `${horarioDetalle.dia} ${horarioDetalle.hora_inicio} - ${horarioDetalle.hora_fin}`
                    : `horario ${horario.horario_id}`;
                errores.push(`${horario.year}/${horario.mes} en ${detalleHorario}: ${validacion.mensaje}`);
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

    static async validarCuposMensualidad(mensualidad, alumnoId = null) {
        try {
            const fechaInicio = DateTime.fromISO(mensualidad.fecha_inicio);
            const fechaFin = DateTime.fromISO(mensualidad.fecha_fin);
            const mesesAbarcados = this.generarMesesEnPeriodo(fechaInicio, fechaFin);

            const horariosAValidar = [];

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

    static calcularCuposAjustados(disponibilidad, year, mes, alumnoId = null) {
        const now = DateTime.now().setZone('America/Mexico_City');
        const mesConsulta = DateTime.fromObject({ year, month: mes });
        const esMesActual = mesConsulta.hasSame(now, 'month') && mesConsulta.hasSame(now, 'year');
        const esMesPasado = mesConsulta < now.startOf('month');
        const diaMes = now.day;
        const debeAplicarAjustes = !esMesPasado && (!esMesActual || diaMes <= 8);

        return disponibilidad.map(item => {
            let cuposAjustados = Number(item.cupos_ocupados);
            let cuposDisponiblesAjustados = Number(item.cupos_disponibles);
            let estadoAjustado = item.estado_disponibilidad;

            if (debeAplicarAjustes) {
                cuposDisponiblesAjustados = item.cupo_maximo - cuposAjustados;
                if (cuposAjustados === 0) estadoAjustado = 'Disponible';
                else if (cuposAjustados >= item.cupo_maximo) estadoAjustado = 'Lleno';
                else estadoAjustado = 'Parcialmente ocupado';
            }

            return {
                ...item,
                cupos_ocupados_ajustados: cuposAjustados,
                cupos_disponibles_ajustados: cuposDisponiblesAjustados,
                estado_disponibilidad_ajustado: estadoAjustado,
                porcentaje_ocupacion_ajustado: item.cupo_maximo > 0 
                    ? Math.round((cuposAjustados / item.cupo_maximo) * 100 * 100) / 100 
                    : 0,
                reserva_activa: debeAplicarAjustes
            };
        });
    }

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
     * Obtiene información de disponibilidad para UI
     * Ahora incluye una predicción IA del estado de cupos.
     */
    static async getDisponibilidadParaUI(horariosIds, year, mes, alumnoId = null) {
        try {
            if (!this.modeloIA) this.cargarModeloIA();
            const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(year, mes);
            const cuposAjustados = this.calcularCuposAjustados(disponibilidad, year, mes, alumnoId);

            return cuposAjustados.filter(item =>
                horariosIds.includes(item.horario_id)
            ).map(item => {
                const estadoIA = this.predecirEstadoIA(
                    item.cupos_ocupados_ajustados,
                    item.cupo_maximo,
                    mes,
                    item.nivel || 0
                );

                return {
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
                    estado: estadoIA || item.estado_disponibilidad_ajustado,
                    porcentaje_ocupacion: item.porcentaje_ocupacion_ajustado,
                    reserva_activa: item.reserva_activa,
                    disponible: item.cupos_disponibles_ajustados > 0,
                    ya_inscrito: item.ya_inscrito || false,
                    datos_inscripcion_existente: item.datos_inscripcion_existente || null,
                    prediccion_ia: estadoIA
                };
            });
        } catch (error) {
            console.error('Error al obtener disponibilidad para UI:', error);
            return [];
        }
    }
}

export default CuposValidationService;
