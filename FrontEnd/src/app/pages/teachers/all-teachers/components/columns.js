// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

import { RowActions } from "./RowActions";
import { 
  NameCell, 
  ContactCell, 
  StatusCell, 
  DateCell, 
  SpecialtyCell 
} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),
  columnHelper.accessor((row) => `${row.nombre} ${row.apellido}`, {
    id: "nombre_completo",
    header: "Profesor",
    cell: NameCell,
  }),
  columnHelper.accessor((row) => row.fecha_nacimiento, {
    id: "fecha_nacimiento",
    header: "Fecha de Nacimiento",
    cell: DateCell,
  }),
  columnHelper.accessor((row) => row.direccion, {
    id: "direccion",
    header: "Dirección",
    cell: ({ getValue }) => {
      const raw = getValue();
      // Si es string y tiene al menos una parte válida distinta de coma
      if (typeof raw === "string") {
        const parts = raw.split(",").map(p => p.trim()).filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "No registrada";
      }
      return "No registrada";
    },
  }),
  columnHelper.accessor((row) => row.telefono, {
    id: "telefono",
    header: "Teléfono",
    cell: ContactCell,
  }),
  columnHelper.accessor((row) => row.especialidad, {
    id: "especialidad",
    header: "Especialidad",
    cell: SpecialtyCell,
  }),
  columnHelper.accessor((row) => row.fecha_contratacion, {
    id: "fecha_contratacion",
    header: "Fecha de Contratación",
    cell: DateCell,
  }),
  columnHelper.accessor((row) => row.activo, {
    id: "estado",
    header: "Estado",
    cell: StatusCell,
  }),
  columnHelper.accessor((row) => row.fecha_modificacion, {
    id: "update_date",
    header: "Última actualización",
    cell: (props) => DateCell({ ...props, type: "datetime" })
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: RowActions,
  }),
];