// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

import {
  ExpirationDateCell,
  DateCell,
  OrderIdCell,
  DiscountCell,
  UsageCell,
} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [

  columnHelper.accessor((row) => `${row.nombre}, ${row.codigo}`, {
    id: "codeName",
    label: "Nombre / Código", // Es para el table view
    header: "Nombre / Código",
    cell: OrderIdCell,
    enableGlobalFilter: true,
    enableSorting: true,
  }),
  columnHelper.accessor((row) => `${row.created_at}`, {
    id: "created_at",
    label: "Fecha de Creación",
    header: "Fecha de Creación",
    cell: DateCell,
    enableGlobalFilter: true,
    enableSorting: true
  }),
  columnHelper.accessor(
    (row) => (`${row.fecha_inicio}, ${row.fecha_fin}`),
    {
      id: "validity",
      label: "Validez",
      header: "Validez",
      cell: ExpirationDateCell,
      enableGlobalFilter: true,
      enableSorting: true
    },
  ),
  columnHelper.accessor((row) => (`${ row.valor_formateado }` ), {
    id: "descuento",
    label: "Descuentos",
    header: "Descuentos",
    cell: DiscountCell,
    enableGlobalFilter: true,
    enableSorting: true
  }),
  columnHelper.accessor(
    (row) => ({
      usos_actuales: row.usos_actuales,
      usos_maximos: row.usos_maximos,
    }),
    {
      id: "usos",
      label: "Usos",
      header: "Usos",
      cell: UsageCell,
    },
  ),
  columnHelper.display({
    id: "actions",
    label: "Acciones", // Es para el table view
    header: "Actions",
    cell: RowActions,
  }),
];
