// Local Imports
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EditModal } from "./editModal.jsx";
import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router";
// Import Dependencies
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { SelectedRowsActions } from "components/shared/table/SelectedRowsActions";
import { useBoxSize, useDidUpdate } from "hooks";
import { useSkipper } from "utils/react-table/useSkipper";

import { MenuAction } from "./MenuActions";
import { columns } from "./columns";

import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";

// import of redux
import { useSelector, useDispatch } from "react-redux";
import { getProductsThunk, editProductsThunk, deleteProductThunk } from "slices/thunk.js";


// ----------------------------------------------------------------------

const isSafari = getUserAgentBrowser() === "Safari";

export function ProductsTable() {
  const dispatch = useDispatch();
  const productsList = useSelector((state) => state.products.products);
  
  // Estados correctamente inicializados
  const [products, setProducts] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const theadRef = useRef();
  const { height: theadHeight } = useBoxSize({ ref: theadRef });
  
  // Efecto para cargar los productos
  useEffect(() => {
    dispatch(getProductsThunk());
  }, [dispatch]);
  
  // Efecto para sincronizar el estado local con el estado de Redux
  useEffect(() => {
    if (productsList) {
      setProducts(productsList);
    }
  }, [productsList]);
  
  // Resto de tu lógica de renderizado...
  const handleEdit = (row) => {
    const data = {
      id: row.original.id,
      sku: row.original.sku || "", // Valor por defecto si sku es null/undefined
      name: row.original.nombre,
      description: row.original.descripcion || "", // Valor por defecto
      category: row.original.categoria,
      price: Number(row.original.precio_venta) || 0, // Convertido a número
      cost: Number(row.original.costo) || 0, // Convertido a número
      is_available: row.original.is_available || 0 ,
      stock: Number(row.original.stock) || 0, // Convertido a número
      min_stock: Number(row.original.stock_minimo) || 0, // Convertido a número
      max_stock: Number(row.original.stock_maximo) || 0, // Convertido a número
      image: row.original.imagen || null, // Mantiene null si no hay imagen
      created_at: row.original.created_at, // Fecha original
      updated_at: row.original.updated_at  // Fecha original
    };
    setEditingProduct(data);
    setIsEditModalOpen(true);
  };

// Función para guardar los cambios
  const handleSave = (editedProduct) => {
    // Aquí podrías hacer una llamada a la API para guardar los cambios
    dispatch(editProductsThunk({id: editedProduct.id, data: editedProduct}));
    setIsEditModalOpen(false);
  };
  
  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    meta: {
      deleteRow: (row) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        dispatch(deleteProductThunk(row.original.id));
        setProducts((old) =>
          old.filter((oldRow) => oldRow.id !== row.original.id),
        );
      },
      deleteRows: (rows) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.id);
        rowIds.forEach((id) => {
          dispatch(deleteProductThunk(id));
        })
        setProducts((old) =>
          old.filter((row) => !rowIds.includes(row.id)),
        );
      },
      editRow: (row) => handleEdit(row) // Pasamos la función al meta
    },
    getCoreRowModel: getCoreRowModel(),
    
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    
    getPaginationRowModel: getPaginationRowModel(),
    
    autoResetPageIndex,
  });
  
  useDidUpdate(() => table.resetRowSelection(), [products]);
  
  const isFiltered = globalFilter && globalFilter.length > 0;
  const hasFilteredResults = table.getFilteredRowModel().rows.length > 0;
  
  return (
    <div>
      <div className="table-toolbar flex items-center justify-between">
        <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Tabla de Productos
        </h2>
        <div className="flex">
          <CollapsibleSearch
            placeholder="Buscar..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <MenuAction />
        </div>
      </div>
      <Card className="relative mt-3">
        <div className="table-wrapper min-w-full overflow-x-auto">
          <Table hoverable className="w-full text-left rtl:text-right">
            <THead ref={theadRef}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg"
                    >
                      {header.column.getCanSort() ? (
                        <div
                          className="flex cursor-pointer select-none items-center space-x-3 "
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="flex-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          </span>
                          <TableSortIcon sorted={header.column.getIsSorted()} />
                        </div>
                      ) : header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>
            <TBody>
              {products.length === 0 || !hasFilteredResults ? (
                // Mensaje mejorado cuando no hay productos
                <Tr>
                  <Td colSpan={columns.length} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {/* Icono animado */}
                      <div className="relative">
                        <div className="animate-pulse">
                          {products.length === 0 ? (
                            // Icono para cuando no hay productos en la base de datos
                            <svg
                              className="h-16 w-16 text-gray-300 dark:text-dark-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm10 0c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1z"
                              />
                            </svg>
                          ) : (
                            // Icono para cuando no hay resultados de búsqueda
                            <svg
                              className="h-16 w-16 text-gray-300 dark:text-dark-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          )}
                        </div>
                        {/* Círculo decorativo */}
                        <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-dark-600 animate-ping opacity-20"></div>
                      </div>
                      
                      {/* Contenido del mensaje */}
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-200">
                          {products.length === 0
                            ? "¡Comienza agregando tu primer producto!"
                            : "Sin resultados"
                          }
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-400 max-w-md mx-auto leading-relaxed">
                          {products.length === 0
                            ? "Tu catálogo está vacío. Agrega productos para comenzar a gestionar tu inventario de manera eficiente."
                            : `No encontramos productos que coincidan con "${globalFilter}". Intenta con otros términos de búsqueda.`
                          }
                        </p>
                      </div>
                      
                      {/* Botón de para agregar producto */}
                      {products.length === 0 && (
                        <div className="pt-4">
                          <Link
                            to="/sale-point/products/add-new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                          >
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Agregar Producto
                          </Link>
                        </div>
                      )}
                      
                      {/* Botón para limpiar filtros */}
                      {isFiltered && !hasFilteredResults && (
                        <div className="pt-2">
                          <button
                            onClick={() => setGlobalFilter("")}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-dark-600 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                          >
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Limpiar filtros
                          </button>
                        </div>
                      )}
                    </div>
                  </Td>
                </Tr>
              ) : (
                <>
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <Tr
                        key={row.id}
                        className={clsx(
                          "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
                          row.getIsSelected() &&
                          !isSafari &&
                          "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500",
                        )}
                      >
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <Td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Td>
                          );
                        })}
                      </Tr>
                    );
                  })}
                </>
              )}
            </TBody>
          </Table>
        </div>
        {table.getCoreRowModel().rows.length && (
          <div className="p-4 sm:px-5">
            <PaginationSection table={table} />
          </div>
        )}{" "}
        <SelectedRowsActions table={table} height={theadHeight} />
      </Card>
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        rowData={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
}