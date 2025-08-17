// Statistics/TablaInscripciones/columns.js
// Versión SIN JSX para que funcione con extensión .js

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";
import { RowActions } from "../OrdersTable/RowActions";
import { DateCell } from "../OrdersTable/rows"; // ajusta ruta si aplica

const columnHelper = createColumnHelper();

// ======= Helpers sin JSX =======
const MoneyCell = ({ getValue }) => {
  const n = Number(getValue() ?? 0);
  const txt = n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return React.createElement("span", { className: "font-medium" }, txt);
};

const BoolActivaCell = ({ getValue }) => {
  const v = getValue();
  const isTrue = v === true || v === 1 || v === "1";
  const cls = "inline-flex items-center rounded-full px-2 py-0.5 text-xs border";
  return isTrue
    ? React.createElement(
        "span",
        { className: `${cls} border-emerald-500/30 text-emerald-400 bg-emerald-500/10` },
        "Activa"
      )
    : React.createElement(
        "span",
        { className: `${cls} border-rose-500/30 text-rose-400 bg-rose-500/10` },
        "Inactiva"
      );
};

const TextCell = ({ getValue }) => {
  const v = getValue();
  return React.createElement("span", null, v ?? "—");
};

// ======= Columnas =======
// OJO: Accedemos a los alias EXACTOS del SQL:
// "Alumno", "ID Alumno", "Fecha Inscripción", "Fecha Vencimiento", "Fecha Creacion", "Monto", "Método Pago", "Folio(s)", "Activa"
export const columns = [
  // Checkbox de selección
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    meta: { size: 34 },
    enableColumnFilter: false,
  }),

  // Alumno (texto, sin filtro)
  columnHelper.accessor((row) => row["Alumno"], {
    id: "alumno",
    header: "Alumno",
    cell: TextCell,
    enableHiding: false,
    enableColumnFilter: false,          // 👈 sin filtro
    placeholder: "Buscar por nombre",
  }),

  // Teléfono (texto, sin filtro)
  columnHelper.accessor((row) => row.telefono, {
    id: "telefono",
    header: "Teléfono",
    cell: TextCell,
    enableHiding: true,
    enableColumnFilter: false,          // 👈 sin filtro
    placeholder: "Buscar teléfono",
  }),

  // Fecha Inscripción (filtro de rango)
  columnHelper.accessor((row) => row["Fecha Inscripción"], {
    id: "fecha_inscripcion",
    header: "Fecha Inscripción",
    cell: DateCell,
    filter: "dateRange",                // 👈 tiene filtro
    placeholder: "YYYY-MM-DD",
  }),

  // Año Inscripción (texto, sin filtro)
  columnHelper.accessor((row) => row["Año Inscripción"], {
    id: "anio_inscripcion",
    header: "Año",
    cell: TextCell,
    enableHiding: true,
    enableColumnFilter: false,          // 👈 sin filtro
    placeholder: "Buscar año",
  }),

  // Años (texto, sin filtro)
  columnHelper.accessor((row) => row["Años"], {
    id: "anos",
    header: "Años",
    cell: TextCell,
    enableHiding: true,
    enableColumnFilter: false,          // 👈 sin filtro
    placeholder: "Buscar años",
  }),

  // Fecha Vencimiento (filtro de rango)
  columnHelper.accessor((row) => row["Fecha Vencimiento"], {
    id: "fecha_vencimiento",
    header: "Fecha Vencimiento",
    cell: (props) => DateCell(props),
    enableHiding: true,
    filter: "dateRange",                // 👈 tiene filtro
    placeholder: "YYYY-MM-DD",
  }),

  // Fecha Creación (filtro de rango)
  columnHelper.accessor((row) => row["Fecha Creacion"], {
    id: "fecha_creacion",
    header: "Fecha Creación",
    cell: (props) => DateCell({ ...props, type: "datetime" }),
    enableHiding: true,
    filter: "dateRange",                // 👈 tiene filtro
    placeholder: "YYYY-MM-DD",
  }),

  // Monto (dinero, sin filtro)
  columnHelper.accessor((row) => row["Monto"], {
    id: "monto",
    header: "Monto",
    cell: MoneyCell,
    enableColumnFilter: false,          // 👈 sin filtro
  }),

  // Método Pago (select)
  columnHelper.accessor((row) => row["Método Pago"], {
    id: "metodo_pago",
    header: "Método Pago",
    cell: TextCell,
    enableHiding: true,
    filter: "select",                   // 👈 tiene filtro
    placeholder: "Seleccionar método",
  }),

  // Folio(s) (texto, sin filtro)
  columnHelper.accessor((row) => row["Folio(s)"], {
    id: "folios",
    header: "Folio(s)",
    cell: ({ getValue }) => {
      const v = getValue();
      return React.createElement("span", null, v || "—");
    },
    enableHiding: true,
    enableColumnFilter: false,          // 👈 sin filtro
    placeholder: "Buscar folio",
  }),

  // Activa (select)
  columnHelper.accessor((row) => row["Activa"], {
    id: "activa",
    header: "Activa",
    cell: BoolActivaCell,
    enableHiding: true,
    filter: "select",                   // 👈 tiene filtro
    options: [
      { label: "Activa", value: "1" },
      { label: "Inactiva", value: "0" },
    ],
    placeholder: "Seleccionar estado",
  }),

  // Acciones
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (props) => React.createElement(RowActions, props),
    meta: { size: 60 },
    enableColumnFilter: false,
  }),
];
