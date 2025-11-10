import disponibilidadCuposModel from "../models/disponibilidadCupos.js";
import { DateTime } from "luxon";

// Ponderaciones basadas en árbol de decisión supervisado
const PESOS = {
  coincidencia_dia: 0.25,
  coincidencia_horario: 0.25,
  coincidencia_nivel: 0.2,
  ocupacion_media: 0.15,
  ocupacion_baja: 0.1,
  cupos_disponibles: 0.05,
};

// ================================================================
// Árbol de decisión IA para sugerencia de horarios personalizados
// ================================================================
export const calcularDisponibilidadIA = async (preferencias) => {
  try {
    console.log("🧠 [IA Service] Preferencias recibidas:");
    console.log(JSON.stringify(preferencias, null, 2));

    const { tipo_clase, nivel_alumno, dias } = preferencias;

    // Validaciones básicas
    if (!tipo_clase || !nivel_alumno) {
      throw new Error("Faltan parámetros: tipo_clase o nivel_alumno");
    }

    if (!Array.isArray(dias) || dias.length === 0) {
      throw new Error("Faltan parámetros: días inválidos o vacíos");
    }

    const now = DateTime.now().setZone("America/Mexico_City");
    const year = now.year;
    const mes = now.month;

    // Obtener disponibilidad actual de la base de datos
    const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(year, mes);
    console.log(`📊 [IA Service] ${disponibilidad.length} grupos obtenidos desde BD`);

    const recomendaciones = [];

    // Analizar día por día según las preferencias enviadas
    dias.forEach((pref) => {
      const { dia, inicio, fin } = pref;
      const prefIni = parseInt(inicio.replace(":", ""));
      const prefFin = parseInt(fin.replace(":", ""));

      // Filtrar solo grupos del tipo seleccionado y del mismo día
      const gruposDia = disponibilidad.filter(
        (g) =>
          g.tipo?.toLowerCase() === tipo_clase.toLowerCase() &&
          g.dia?.toLowerCase().includes(dia.toLowerCase())
      );

      gruposDia.forEach((g) => {
        let puntaje = 0;
        const nodos = [];

        // Nodo 1: Coincidencia de día
        if (g.dia?.toLowerCase().includes(dia.toLowerCase())) {
          puntaje += PESOS.coincidencia_dia;
          nodos.push("Coincide día (+0.25)");
        }

        // Nodo 2: Coincidencia de horario
        const hIni = parseInt(g.hora_inicio.replace(":", ""));
        const hFin = parseInt(g.hora_fin.replace(":", ""));
        if (hIni >= prefIni && hFin <= prefFin) {
          puntaje += PESOS.coincidencia_horario;
          nodos.push("Dentro del rango horario (+0.25)");
        } else if (Math.abs(hIni - prefIni) < 200) {
          puntaje += PESOS.coincidencia_horario / 2;
          nodos.push("Cercano al rango horario (+0.12)");
        }

        // Nodo 3: Coincidencia de nivel
        if (g.nombre?.toLowerCase().includes(nivel_alumno.toLowerCase())) {
          puntaje += PESOS.coincidencia_nivel;
          nodos.push("Nivel coincide (+0.20)");
        }

        // Nodo 4: Ocupación del grupo
        if (g.porcentaje_ocupacion < 40) {
          puntaje += PESOS.ocupacion_baja;
          nodos.push("Baja ocupación (+0.10)");
        } else if (g.porcentaje_ocupacion < 80) {
          puntaje += PESOS.ocupacion_media;
          nodos.push("Ocupación ideal (+0.15)");
        } else {
          puntaje -= 0.05;
          nodos.push("Alta ocupación (-0.05)");
        }

        // Nodo 5: Cupos disponibles
        if (g.cupos_disponibles > 0) {
          puntaje += PESOS.cupos_disponibles;
          nodos.push("Hay cupos disponibles (+0.05)");
        }

        // Clasificación final
        const puntajeFinal = Math.min(puntaje, 1).toFixed(2);
        const decision =
          puntajeFinal >= 0.85
            ? "Excelente coincidencia"
            : puntajeFinal >= 0.65
            ? "Buena coincidencia"
            : "Coincidencia baja";

        recomendaciones.push({
          grupo_id: g.grupo_id,
          grupo: g.nombre,
          dia: g.dia,
          hora: `${g.hora_inicio} - ${g.hora_fin}`,
          profesor: g.profesor_asignado,
          cupos_disponibles: g.cupos_disponibles,
          porcentaje_ocupacion: g.porcentaje_ocupacion,
          puntaje_IA: puntajeFinal,
          recomendacion: decision,
          trazabilidad: nodos,
        });
      });
    });

    console.log(`✅ [IA Service] ${recomendaciones.length} recomendaciones generadas`);
    return recomendaciones.sort((a, b) => b.puntaje_IA - a.puntaje_IA);
  } catch (error) {
    console.error("❌ [IA Service] Error en calcularDisponibilidadIA:", error);
    throw error;
  }
};
