// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import {
    ExpirationDateCell,
    DateCell,
    OrderIdCell,
    DiscountCell,
    UsageCell

} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.display({
        id: "select",
        label: "Row Selection",
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor(
        (row) => ({ nombre: row.nombre, codigo: row.codigo }),
        {
            id: "codeName",
            header: "Nombre / Código",
            cell: OrderIdCell,
        }
    ),
    columnHelper.accessor((row) => row.created_at, {
        id: "created_at",
        label: "Fecha de Creación",
        header: "Fecha de Creación",
        cell: DateCell,
        filterFn: "inNumberRange",
    }),
    columnHelper.accessor(
        (row) => ({
            fecha_inicio: row.fecha_inicio,
            fecha_fin: row.fecha_fin,
        }),
        {
            id: "validity",
            header: "Validez",
            cell: ExpirationDateCell,
        }
    ),
    columnHelper.accessor(
        (row) => ({ tipo: row.tipo, valor: row.valor }),
        {
            id: "descuento",
            header: "Descuento",
            cell: DiscountCell,
        }
    ),
    columnHelper.accessor(
        (row) => ({
            usos_actuales: row.usos_actuales,
            usos_maximos: row.usos_maximos,
        }),
        {
            id: "usos",
            header: "Usos",
            cell: UsageCell,
        }
    ),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions
    }),
]
