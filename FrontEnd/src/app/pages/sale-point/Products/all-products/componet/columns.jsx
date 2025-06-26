// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

import { RowActions } from "./RowActions";
import { Description, NameCell, PriceCell, CategoryCell, DateCell, StockCell, CostoCell } from "./rows";

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
  columnHelper.accessor((row) => row.descripcion, {
    id: "brand",
    header: "Descripción",
    cell: Description,
    maxSize: 200,
  }),

  columnHelper.accessor((row) => row.stock, {
    id: "stock",
    header: "Existencia",
    // cell: ({ getValue }) => getValue() || " ",
    cell: StockCell,
  }),
  // columnHelper.accessor((row) => row.stock_maximo, {
  //   id: "stock_maximo",
  //   header: "Minima existencia",
  //   cell: ({ getValue }) => getValue() ,
  // }),
  // columnHelper.accessor((row) => row.stock_minimo, {
  //   id: "stock_minimo",
  //   header: "Maxima existencia",
  //   cell: ({ getValue }) => getValue() ,
  // }),
  columnHelper.accessor((row) => row.precio_venta, {
    id: "price",
    header: "Precio de venta",
    cell: PriceCell,
  }),
  columnHelper.accessor((row) => row.costo, {
    id: "cost",
    header: "Costo",
    cell: CostoCell,
  }),


  // columnHelper.accessor((row) => row.activo, {
  //   id: "stock_count",
  //   header: "Disponible",
  //   cell: CategoryCell,
  // }),


  // columnHelper.accessor((row) => row.created_at, {
  //   id: "create_date",
  //   header: "Fecha de creación",
  //   cell: DateCell
  // }),

  columnHelper.accessor((row) => row.updated_at, {
    id: "update_date",
    header: "Ultima actualización",
    // cell: ({ getValue }) => getValue(),
    cell : DateCell
  }),
  columnHelper.accessor((row) => row.categoria, {
    id: "category",
    header: "Categoría",
    cell: CategoryCell,
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    cell: RowActions,
  }),
];
