// Statistics/OrdersTable/index.jsx
// Tabla genérica que recibe (tabla, opcion, data, rango) y renderiza con tanstack-table.
// Clasifica inscripciones por la fecha de VENCIMIENTO usando solo el "hasta" del rango.

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Fragment, useMemo, useRef, useState } from "react";

import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { useBoxSize, useLockScrollbar, useDidUpdate, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { SelectedRowsActions } from "./SelectedRowsActions";
import { SubRowComponent } from "./SubRowComponent";
import { Toolbar } from "./Toolbar";
import { useThemeContext } from "app/contexts/theme/context";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";

import { columns as inscripcionesColumns } from "../TablaInscripciones/columns";

const isSafari = getUserAgentBrowser() === "Safari";

/**
 * Props:
 * - tabla: "inscripciones"
 * - opcion: "vigentes" | "vencidas"
 * - data: any[]
 * - rango?: { startISO?: string, endISO?: string }  // solo usamos endISO como fecha de corte
 */
export default function OrdersTable({ tabla, opcion, data = [], rango }) {
  const { cardSkin } = useThemeContext();
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [tableSettings, setTableSettings] = useState({
    enableSorting: true,
    enableColumnFilters: true,
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    `visibilidad-columnas-${tabla || "generica"}`,
    {}
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    `columnas-fijadas-${tabla || "generica"}`,
    {}
  );

  const cardRef = useRef();
  const { width: cardWidth } = useBoxSize({ ref: cardRef });

  // 1) Columnas por tipo de tabla
  const baseColumns = useMemo(() => {
    if (tabla === "inscripciones") return inscripcionesColumns;
    return [];
  }, [tabla]);

  // 2) Blindaje de columnas: prefijo de id para unicidad (evita keys duplicadas)
  const columns = useMemo(() => {
    const prefix = tabla ? `${tabla}_` : "tbl_";
    return baseColumns.map((col, idx) => {
      const safeId = col.id ? `${prefix}${col.id}` : `${prefix}col_${idx}`;
      return { ...col, id: safeId };
    });
  }, [baseColumns, tabla]);

  // === Utils de fechas: comparar por día (Y-M-D) sin drift de zona horaria ===
  const toLocalDateOnly = (input) => {
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

  const parseISODateOnly = (isoYmd) => {
    if (!isoYmd) return null;
    const [y, m, d] = isoYmd.split("-").map(Number);
    return Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
      ? new Date(y, m - 1, d)
      : null;
  };

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Fecha de corte: usamos SOLO endISO (o hoy si no viene)
  const cutoffDate = useMemo(() => {
    const endISO = rango?.endISO || today.toISOString().slice(0, 10);
    return parseISODateOnly(endISO) || today;
  }, [rango, today]);

  // Transformación por opción usando SOLO la fecha de vencimiento vs cutoffDate
  const rowsData = useMemo(() => {
    const source = Array.isArray(data) ? data : [];

    if (tabla === "inscripciones") {
      // Normalizamos "Fecha Vencimiento" a fecha local Y-M-D
      const normalized = source.map((r) => {
        const fin = toLocalDateOnly(r["Fecha Vencimiento"] ?? r.fecha_vencimiento);
        return { ...r, __fecha_fin__: fin };
      });

      if (opcion === "vigentes") {
        // Vigentes: vencen en o después de cutoffDate
        return normalized.filter((r) => r.__fecha_fin__ && r.__fecha_fin__ >= cutoffDate);
      }

      if (opcion === "vencidas") {
        // Vencidas: vencen antes de cutoffDate
        return normalized.filter((r) => r.__fecha_fin__ && r.__fecha_fin__ < cutoffDate);
      }

      return normalized;
    }

    return source;
  }, [data, tabla, opcion, cutoffDate]);

  // React Table
  const table = useReactTable({
    data: rowsData,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      setTableSettings,
      deleteRow: (row) => {
        skipAutoResetPageIndex();
        console.log("Delete single row (UI only):", row.original);
      },
      deleteRows: (rows) => {
        skipAutoResetPageIndex();
        console.log(
          "Delete multiple rows (UI only):",
          rows.map((r) => r.original)
        );
      },
    },
    filterFns: { fuzzy: fuzzyFilter },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [rowsData]);
  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <div className="col-span-12">
      <div
        className={clsx(
          "flex flex-col",
          tableSettings.enableFullScreen &&
            "fixed inset-0 z-61 h-full w-full bg-white pt-3 dark:bg-dark-900"
        )}
      >
        <Toolbar table={table} />

        <Card
          className={clsx(
            "relative mt-3 flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden"
          )}
          ref={cardRef}
        >
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table
              hoverable
              dense={tableSettings.enableRowDense}
              sticky={tableSettings.enableFullScreen}
              className="w-full text-left rtl:text-right"
            >
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={`${headerGroup.id}-${header.id}`}
                        className={clsx(
                          "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100",
                          header.column.getCanPin() && [
                            header.column.getIsPinned() === "left" &&
                              "sticky z-10 ltr:left-0 rtl:right-0",
                            header.column.getIsPinned() === "right" &&
                              "sticky z-10 ltr:right-0 rtl:left-0",
                          ]
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer select-none items-center space-x-3"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </span>
                            <TableSortIcon sorted={header.column.getIsSorted()} />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>

              <TBody>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <Tr
                      className={clsx(
                        "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
                        row.getIsExpanded() && "border-dashed",
                        row.getIsSelected() &&
                          !isSafari &&
                          "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td
                          key={`${row.id}-${cell.id}`}
                          className={clsx(
                            "relative overflow-visible",
                            cardSkin === "shadow-sm"
                              ? "dark:bg-dark-700"
                              : "dark:bg-dark-900",
                            cell.column.getCanPin() && [
                              cell.column.getIsPinned() === "left" &&
                                "sticky z-1 ltr:left-0 rtl:right-0",
                              cell.column.getIsPinned() === "right" &&
                                "sticky z-1 ltr:right-0 rtl:left-0",
                            ]
                          )}
                        >
                          {cell.column.getIsPinned() && (
                            <div
                              className={clsx(
                                "pointer-events-none absolute inset-0 borders-gray-200 dark:border-dark-500",
                                cell.column.getIsPinned() === "left"
                                  ? "ltr:border-r rtl:border-l"
                                  : "ltr:border-l rtl:border-r"
                              )}
                            ></div>
                          )}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      ))}
                    </Tr>

                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length} className="p-0">
                          <SubRowComponent row={row} cardWidth={cardWidth} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </TBody>
            </Table>
          </div>

          <SelectedRowsActions table={table} />

          {table.getCoreRowModel().rows.length > 0 && (
            <div
              className={clsx(
                "px-4 pb-4 sm:px-5 sm:pt-4",
                tableSettings.enableFullScreen && "bg-gray-50 dark:bg-dark-800",
                !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) &&
                  "pt-4"
              )}
            >
              <PaginationSection table={table} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
