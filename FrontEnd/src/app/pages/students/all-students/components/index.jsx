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
import {
	getAlumnosThunk,
	updateAlumnoThunk, 
	deleteAlumnoThunk 
} from "slices/thunk";

// ----------------------------------------------------------------------

const isSafari = getUserAgentBrowser() === "Safari";

export function StudentsTable() {
	const dispatch = useDispatch();
	const studentsList = useSelector((state) => state.alumnos.alumnos);

	// Estados correctamente inicializados
	const [students, setStudents] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState([]);
	const [editingStudent, setEditingStudent] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
	const theadRef = useRef();
	const { height: theadHeight } = useBoxSize({ ref: theadRef });

	// Efecto para cargar los alumnos
	useEffect(() => {
		dispatch(getAlumnosThunk());
	}, [dispatch]);

	useEffect(() => {
		if (Array.isArray(studentsList)) {
			setStudents(studentsList);
		} else {
			setStudents([]);
		}
	}, [studentsList]);


	// Función para manejar la edición
	const handleEdit = (row) => {
		const data = {
			id: row.original.id,
			nombre: row.original.nombre,
			apellido_paterno: row.original.apellido_paterno,
			apellido_materno: row.original.apellido_materno || "",
			fecha_nacimiento: row.original.fecha_nacimiento,
			domicilio: row.original.domicilio || "",
			email: row.original.email || "",
			telefono: row.original.telefono || "",
			telefono_emergencia: row.original.telefono_emergencia || "",
			estatus: row.original.estatus,
			firma: row.original.firma || 0,
			fecha_creacion: row.original.fecha_creacion,
			fecha_modificacion: row.original.fecha_modificacion
		};
		setEditingStudent(data);
		setIsEditModalOpen(true);
	};

	// Función para guardar los cambios
	const handleSave = (editedStudent) => {
		// console.log("handleSave called with:", editedStudent);
		dispatch(updateAlumnoThunk({id: editedStudent.id, data: editedStudent}));
		setIsEditModalOpen(false);
	};

	const table = useReactTable({
		data: students,
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
				skipAutoResetPageIndex();
				dispatch(deleteAlumnoThunk(row.original.id));
				setStudents((old) =>
					old.filter((oldRow) => oldRow.id !== row.original.id),
				);
			},
			deleteRows: (rows) => {
				skipAutoResetPageIndex();
				const rowIds = rows.map((row) => row.original.id);
				rowIds.forEach((id) => {
					dispatch(deleteAlumnoThunk(id));
				});
				setStudents((old) =>
					old.filter((row) => !rowIds.includes(row.id)),
				);
			},
			editRow: (row) => handleEdit(row)
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

	useDidUpdate(() => table.resetRowSelection(), [students]);

	// VARIABLES HELPER más específicas
	const hasStudents = students.length > 0;
	const visibleRows = table.getRowModel().rows;
	const hasVisibleRows = visibleRows.length > 0;
	const isFiltering = globalFilter && globalFilter.trim() !== "";

	// // DEBUG: Más logs para TanStack Table
	// console.log("table.getCoreRowModel().rows.length:", table.getCoreRowModel().rows.length);
	// console.log("table.getRowModel().rows.length:", table.getRowModel().rows.length);
	// console.log("hasStudents:", hasStudents);
	// console.log("hasVisibleRows:", hasVisibleRows);

	return (
		<div>
			<div className="table-toolbar flex items-center justify-between">
				<h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
					Tabla de Alumnos
				</h2>
				<div className="flex">
					<CollapsibleSearch
						placeholder="Buscar alumno..."
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
													className="flex cursor-pointer select-none items-center space-x-3"
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
							{!hasStudents ? (
								// Cuando no hay estudiantes en absoluto
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
													d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
												/>
											</svg>
											<h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-dark-200">
												No hay alumnos disponibles
											</h3>
											<p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
												No se encontraron alumnos en la base de datos
											</p>
										</div>
									</Td>
								</Tr>
							) : !hasVisibleRows && isFiltering ? (
								// Cuando hay estudiantes pero el filtro no encuentra coincidencias
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
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
												/>
											</svg>
											<h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-dark-200">
												No se encontraron coincidencias
											</h3>
											<p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
												No hay alumnos que coincidan con &quot;{globalFilter}&quot;
											</p>
										</div>
									</Td>
								</Tr>
							) : (
								// Renderizar las filas de estudiantes
								<>
									{visibleRows.map((row) => {
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
				
				{hasStudents && hasVisibleRows && (
					<div className="p-4 sm:px-5">
						<PaginationSection table={table} />
					</div>
				)}
				
				{hasStudents && (
					<SelectedRowsActions table={table} height={theadHeight} />
				)}
			</Card>
			
			<EditModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				rowData={editingStudent}
				onSave={handleSave}
			/>
		</div>
	);
}