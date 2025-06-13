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
import { getProductsThunk, editAllProductsThunk, deleteProductThunk } from "slices/thunk.js";

// ----------------------------------------------------------------------

const isSafari = getUserAgentBrowser() === "Safari";

export function ProductsTable() {
  const dispatch = useDispatch();
  const productsList = useSelector((state) => state.products.products);



  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const theadRef = useRef();
  const { height: theadHeight } = useBoxSize({ ref: theadRef });

  // const [products, setProducts] = useState([...productsList]);
  const [products, setProducts] = useState([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);


  useEffect(() => {
    dispatch(getProductsThunk());
  }, [dispatch]);

  useEffect(() => {
    setProducts(productsList);
  }, [productsList]);

  console.log(productsList)


  // Agrega estos estados al componente ProductsTable
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

// Función para manejar la edición
  const handleEdit = (row) => {
    setEditingProduct(row.original);
    setIsEditModalOpen(true);
  };

// Función para guardar los cambios
  const handleSave = (editedProduct) => {
    setProducts(prev =>
      prev.map(item =>
        item.id === editedProduct.id ? editedProduct : item
      )
    );
    // Aquí podrías hacer una llamada a la API para guardar los cambios
    console.log("Product edited:", editedProduct);
    dispatch(editAllProductsThunk({id: editedProduct.id, data: editedProduct}));
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

  return (
    <div>
      <div className="table-toolbar flex items-center justify-between">
        <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Products Table
        </h2>
        <div className="flex">
          <CollapsibleSearch
            placeholder="Search here..."
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
              {products.length === 0 ? (
                // Mensaje cuando no hay productos
                <Tr>
                  <Td colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-dark-200">
                        No hay productos disponibles
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
                        {products.length === 0
                          ? "No se encontraron productos en la base de datos"
                          : "No hay coincidencias con tu búsqueda"}
                      </p>
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
