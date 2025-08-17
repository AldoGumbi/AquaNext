// Overview.jsx (reemplaza todo este archivo)
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Card, Button } from "components/ui";
import { useEffect, useMemo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDashboardStatsThunk,
  getIngresosDashboardThunk,
  getInscripcionesStatusThunk,
  getMensualidadesStatusThunk,
  getAlumnosEnAlbercaThunk,
  getVentasTiendaDashboardThunk,
} from "slices/dashboard/thunk";

import { CardLine } from "./CardLine";
import { Range } from "./Range";
import GenerarTabla from "./GenerarTabla";

// --- Card KPI simple (ahora acepta onClick en los chips) ---------------------
function KPIStatCard({
  title,
  leftChip,
  rightChip,
  Icon,
  color = "info",
  onLeftClick,
  onRightClick,
}) {
  return (
    <Card className="flex flex-col justify-between p-5 gap-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-gray-800 dark:text-dark-100">
          {title}
        </div>
        <Avatar
          size={10}
          classNames={{ display: "mask is-squircle rounded-none" }}
          initialVariant="soft"
          initialColor={color}
        >
          <Icon className="size-5" />
        </Avatar>
      </div>

      <div className="flex gap-2 mt-2">
        <Button
          size="sm"
          variant="soft"
          color="success"
          className="rounded-full border border-this-darker/40 dark:border-this-lighter/30"
          onClick={onLeftClick}
        >
          {leftChip}
        </Button>
        <Button
          size="sm"
          variant="soft"
          color="error"
          className="rounded-full border border-this-darker/40 dark:border-this-lighter/30"
          onClick={onRightClick}
        >
          {rightChip}
        </Button>
      </div>
    </Card>
  );
}
const fmtInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function Overview() {
  const dispatch = useDispatch();

  const { stats, ingresos, inscripciones, mensualidades } = useSelector(
    (state) => state.dashboard
  );

  // ====== Estado: rango de fechas seleccionado ======
  const [dateRange, setDateRange] = useState([]); // [startDate, endDate]
  // ====== Estado: qué tabla mostrar abajo ======
  const [tipoTabla, setTipoTabla] = useState(null); // "inscripciones-vigentes" | "inscripciones-vencidas"
  // ====== Estado: contadores filtrados por fecha de corte (override local) ======
  const [inscFiltradas, setInscFiltradas] = useState(null);
  // { vigentes: number, vencidas: number, aplicado: boolean }

  // Helpers de fecha
  const normalizeDate = (d) => (d instanceof Date ? d : d ? new Date(d) : null);

  const isSameDay = (a, b) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const fmtES = (d) =>
    d
      ? d.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

  const today = new Date();

  const startDate = normalizeDate(dateRange?.[0]);
  const endDate = normalizeDate(dateRange?.[1]);

  // Si no hay fecha final, mostramos la misma que inicio
  const startLabel = startDate ? (isSameDay(startDate, today) ? "hoy" : fmtES(startDate)) : "";
  const endLabel = endDate
    ? isSameDay(endDate, today)
      ? "hoy"
      : fmtES(endDate)
    : startDate
    ? isSameDay(startDate, today)
      ? "hoy"
      : fmtES(startDate)
    : "";

  // ISO para pasar a GenerarTabla (usa endISO como cutoff)
  const startISO = startDate ? startDate.toISOString().slice(0, 10) : null;
  const endISO = endDate ? endDate.toISOString().slice(0, 10) : null;

  // ====== Efecto: data inicial ======
  useEffect(() => {
    dispatch(getDashboardStatsThunk());
    dispatch(getIngresosDashboardThunk());
    dispatch(getInscripcionesStatusThunk());
    dispatch(getMensualidadesStatusThunk());
    dispatch(getAlumnosEnAlbercaThunk());
    dispatch(getVentasTiendaDashboardThunk());
  }, [dispatch]);

  // ===== Helpers numéricos =====
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };


  const money = (v) =>
    toNumber(v).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ===== Datos base del store =====
  const statsData = stats || {};
  const ingresosData = ingresos || {};
  const inscripcionesData = inscripciones?.[0] || {};
  const mensualidadesData = mensualidades?.[0] || {};
  const totalAlumnos = toNumber(statsData.Total);

  // === Helpers de normalización para "Fecha Vencimiento" ===
  const toLocalYMD = (input) => {
    if (!input) return null;
    if (input instanceof Date) {
      return new Date(input.getFullYear(), input.getMonth(), input.getDate());
    }
    if (typeof input === "string") {
      const [ymd] = input.split("T"); // "YYYY-MM-DD"
      const [y, m, d] = (ymd || "").split("-").map(Number);
      return Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
        ? new Date(y, m - 1, d)
        : null;
    }
    return null;
  };

  const cutoffDate = useMemo(() => {
    // cutoff = endISO (o hoy si no hay)
    if (endISO) {
      const [y, m, d] = endISO.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, [endISO]);

  // === Recuento ORIGINAL del backend (sin filtro)
  const backendVigentes = toNumber(inscripcionesData.Activas ?? 0);
  const backendVencidas = toNumber(inscripcionesData.Inactivas ?? 0);

  // === Recuento FILTRADO (si existe override local), si no, usa backend ===
  const mostradasVigentes = inscFiltradas?.aplicado
    ? inscFiltradas.vigentes
    : backendVigentes;

  const mostradasVencidas = inscFiltradas?.aplicado
    ? inscFiltradas.vencidas
    : backendVencidas;

  // KPIs
  const kpiCards = useMemo(
    () => [
      {
        title: "Alumnos: " + fmtInt(totalAlumnos),
        left: `${fmtInt(statsData.Activos ?? 0)} Activos`,
        right: `${fmtInt(statsData.Inactivos ?? 0)} Inactivos`,
        Icon: UsersIcon,
      },
      {
        title: "Inscripciones",
        left: `${fmtInt(mostradasVigentes)} Vigentes${inscFiltradas?.aplicado ? " (filtrado)" : ""}`,
        right: `${fmtInt(mostradasVencidas)} Vencidas${inscFiltradas?.aplicado ? " (filtrado)" : ""}`,
        Icon: ClipboardDocumentCheckIcon,
        onLeftClick: () => setTipoTabla("inscripciones-vigentes"),
        onRightClick: () => setTipoTabla("inscripciones-vencidas"),
      },
      {
        title: "Mensualidades",
        left: `${fmtInt(mensualidadesData.Activas ?? 0)} Activas`,
        right: `${fmtInt(mensualidadesData.Inactivas ?? 0)} Inactivas`,
        Icon: CalendarDaysIcon,
      },
    ],
    [
      totalAlumnos,
      statsData.Activos,
      statsData.Inactivos,
      mostradasVigentes,
      mostradasVencidas,
      mensualidadesData.Activas,
      mensualidadesData.Inactivas,
      inscFiltradas?.aplicado,
    ]
  );

  const totalGlobal = "$" + money(ingresosData.Global ?? 0);
  const totalInscripciones =
    "$" + money(ingresosData.Inscriciones ?? ingresosData.Inscripciones ?? 0);
  const totalMensualidades = "$" + money(ingresosData["Mensualidades y Clases"] ?? 0);
  const totalTienda = "$" + money(ingresosData.Tienda ?? 0);



  // ====== Aplicar filtro: recalcula contadores locales según cutoff ======
  const applyFilter = useCallback(() => {
    // Dataset crudo de inscripciones (tabla)
    const tabla = Array.isArray(inscripcionesData.Tabla) ? inscripcionesData.Tabla : [];

    // Normalizamos 'Fecha Vencimiento' a Y-M-D local y contamos
    let vig = 0;
    let ven = 0;

    for (const r of tabla) {
      const fin = toLocalYMD(r["Fecha Vencimiento"] ?? r.fecha_vencimiento);
      if (!fin) continue;
      if (fin < cutoffDate) ven += 1;
      else vig += 1;
    }

    setInscFiltradas({ vigentes: vig, vencidas: ven, aplicado: true });

    console.log("[Aplicar filtro] cutoff =", cutoffDate, "-> vigentes:", vig, "vencidas:", ven);
  }, [inscripcionesData.Tabla, cutoffDate]);

  // ======================= LAYOUT con row-span =======================
  return (
    <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
      {/* IZQUIERDA - FILA 1: KPIs */}
      <div className="col-span-12 lg:col-span-9">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {kpiCards.map((k, i) => (
            <KPIStatCard
              key={i}
              title={k.title}
              leftChip={k.left}
              rightChip={k.right}
              Icon={k.Icon}
              onLeftClick={k.onLeftClick}
              onRightClick={k.onRightClick}
            />
          ))}
        </div>
      </div>

      {/* DERECHA: FORMULARIO (ocupa dos filas) */}
      <div className="col-span-12 lg:col-span-3 lg:row-span-2">
        <Card className="p-5 h-full flex flex-col">
          {/* Título */}
          <div className="text-base font-semibold text-gray-800 dark:text-dark-100">
            Filtrar por fecha
          </div>

          {/* Range */}
          <div className="mt-3">
            <Range
              onChange={(dates) => {
                const norm = (dates || []).map((d) => (d instanceof Date ? d : new Date(d)));
                setDateRange(norm);
                // Si cambias el rango, invalida el override hasta que den "Aplicar filtro"
                setInscFiltradas(null);
              }}
            />
          </div>

          {/* Fechas seleccionadas */}
          <div className="mt-3 grid grid-cols-1 gap-2">
            <div className="text-xs text-gray-400">Desde</div>
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm">
                {startLabel || "—"}
              </span>
            </div>

            <div className="mt-2 text-xs text-gray-400">Hasta</div>
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm">
                {endLabel || "—"}
              </span>
            </div>
          </div>

          {/* Botón aplicar (pega al fondo) */}
          <div className="mt-auto pt-4">
            <Button
              size="sm"
              color="primary"
              className="w-full py-2 text-sm"
              onClick={applyFilter}
            >
              Aplicar filtro
            </Button>
          </div>
        </Card>
      </div>

      {/* IZQUIERDA - FILA 2: Resumen global */}
      <div className="col-span-12 lg:col-span-9">
        <Card className="p-5">
          <div className="text-3xl sm:text-4xl font-semibold text-gray-200">
            {totalGlobal}
          </div>
          <div className="mt-1 text-base text-gray-300">Ingresos Totales</div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <CardLine
              title="Inscripciones"
              value={totalInscripciones}
              color="primary"
              size="sm"
              className="rounded-xl"
              onClick={() => console.log("Inscripciones")}
            />
            <CardLine
              title="Mensualidades"
              value={totalMensualidades}
              color="primary"
              size="sm"
              className="rounded-xl"
              onClick={() => console.log("Mensualidades")}
            />
            <CardLine
              title="Tienda"
              value={totalTienda}
              color="primary"
              size="sm"
              className="rounded-xl"
              onClick={() => console.log("Tienda")}
            />
          </div>
        </Card>
      </div>

      {/* FILA 3: Sección de tablas generadas */}
      <div className="col-span-12">
        <GenerarTabla
          tipo={tipoTabla}                                // "inscripciones-vigentes" | "inscripciones-vencidas"
          tablaCompleta={inscripciones?.[0]?.Tabla || []} // dataset crudo
          rango={{ startISO, endISO }}                    // endISO es la fecha de corte
        />
      </div>
    </div>
  );
}
