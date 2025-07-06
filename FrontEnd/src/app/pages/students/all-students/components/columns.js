// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

import { RowActions } from "./RowActions";
import { 
  RegisterCell,
  NameCell, 
  ContactCell, 
  StatusCell, 
  DateCell, 
  SignatureCell 
} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),
  columnHelper.display({
    id: "inscripcion_mensualidad",
    header: () => "Inscripción/\nMensualidad",
    cell: RegisterCell,
  }),
  columnHelper.accessor((row) => `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno}`, {
    id: "nombre_completo",
    header: "Alumno",
    cell: NameCell,
  }),
  columnHelper.accessor((row) => row.fecha_nacimiento, {
    id: "fecha_nacimiento",
    header: "Fecha de Nacimiento",
    cell: DateCell,
  }),
columnHelper.accessor((row) => row.domicilio, {
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

  columnHelper.accessor((row) => `${row.email} ${row.telefono}`, {
    id: "contacto",
    header: "Contacto",
    cell: ContactCell,
  }),
  columnHelper.accessor((row) => row.telefono_emergencia, {
    id: "telefono_emergencia",
    header: "Tel. Emergencia",
    cell: ({ getValue }) => getValue() || "No registrado",
  }),
  columnHelper.accessor((row) => row.estatus, {
    id: "estado",
    header: "Estado",
    cell: StatusCell,
  }),
  columnHelper.accessor((row) => row.firma, {
    id: "firma",
    header: "Firma",
    cell: SignatureCell,
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