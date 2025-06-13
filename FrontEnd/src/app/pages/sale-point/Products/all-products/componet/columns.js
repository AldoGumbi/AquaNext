// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";

import { RowActions } from "./RowActions";
import {
    Description,
    NameCell,
    PriceCell,
    CategoryCell
} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.display({
        id: "select",
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor((row) => `${row.nombre} ${row.img}`, {
        id: "nombre",
        header: "Producto",
        cell: NameCell,
    }),
    columnHelper.accessor((row) => row.categoria, {
        id: "category",
        header: "Categoría",
        cell: CategoryCell,
    }),
    columnHelper.accessor((row) => row.descripcion, {
        id: "brand",
        header: "Descripción",
        cell: Description,
        maxSize : 200
    }),
    columnHelper.accessor((row) => row.precio_venta, {
        id: "price",
        header: "Precio",
        cell: PriceCell,
    }),
    columnHelper.accessor((row) => row.costo, {
        id: "cost",
        header: "Costo",
        cell: PriceCell,
    }),
    columnHelper.accessor((row) => row.is_available, {
        id: "stock_count",
        header: "Disponible",
        cell : CategoryCell
    }),

    columnHelper.display({
        id: "actions",
        header: "",
        cell: RowActions,
    })]
