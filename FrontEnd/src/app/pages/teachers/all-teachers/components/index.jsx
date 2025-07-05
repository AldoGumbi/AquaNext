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
	getProfesoresThunk,
	updateProfesorThunk, 
	deleteProfesorThunk 
} from "slices/thunk";

// Toast import
import { toast } from "sonner";

// ----------------------------------------------------------------------

const isSafari = getUserAgentBrowser() === "Safari";

export function TeachersTable() {
	const dispatch = useDispatch();
	const teachersList = useSelector((state) => state.profesores.profesores);

	// Estados correctamente inicializados
	const [teachers, setTeachers] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState([]);
	const [editingTeacher, setEditingTeacher] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
	const theadRef = useRef();
	const { height: theadHeight } = useBoxSize({ ref: theadRef });

	// Efecto para cargar los profesores
	useEffect(() => {
		dispatch(getProfesoresThunk());
	}, [dispatch]);

	useEffect(() => {
		if (Array.isArray(teachersList)) {
			setTeachers(teachersList);
		} else {
			setTeachers([]);
		}
	}, [teachersList]);

	// Función para manejar la edición
	const handleEdit = (row) => {
		const data = {
			id: row.original.id,
			nombre: row.original.nombre,
			apellido: row.original.apellido,
			fecha_nacimiento: row.original.fecha_nacimiento,
			direccion: row.original.direccion || "",
			telefono: row.original.telefono || "",
			especialidad: row.original.especialidad || "",
			fecha_contratacion: row.original.fecha_contratacion,
			activo: Boolean(row.original.activo),
			fecha_creacion: row.original.fecha_creacion,
			fecha_modificacion: row.original.fecha_modificacion
		};
		setEditingTeacher(data);
		setIsEditModalOpen(true);
	};

	// Función para guardar los cambios
	const handleSave = async (editedTeacher) => {

        console.log('Guardando cambios para el profesor:', editedTeacher);
		try {
			await dispatch(updateProfesorThunk({id: editedTeacher.id, data: editedTeacher})).unwrap();
			setIsEditModalOpen(false);
			toast.success('Profesor actualizado exitosamente');
		} catch (error) {
			console.error('Error al actualizar profesor:', error);
			toast.error(error.error?.API_message || 'Error al actualizar el profesor');
		}
	};

	// Función para eliminar un solo profesor
	const handleDeleteRow = async (row) => {
		try {
			skipAutoResetPageIndex();
			await dispatch(deleteProfesorThunk(row.original.id)).unwrap();
			
			// Solo actualizar el estado local si la eliminación fue exitosa
			setTeachers((old) =>
				old.filter((oldRow) => oldRow.id !== row.original.id),
			);

            return { success: true }; // Retornar éxito para manejarlo en RowActions.jsx

		} catch (error) {
			console.error('Error al eliminar profesor:', error);
			// toast.error(error.error?.API_message || 'Error al eliminar el profesor');
            throw error; // Propagar el error para que lo maneje RowActions.jsx
		}
	};

	// Función para eliminar múltiples profesores
	const handleDeleteRows = async (rows) => {
		try {
			skipAutoResetPageIndex();
			const rowIds = rows.map((row) => row.original.id);
			
			// Eliminar uno por uno y capturar errores individuales
			const deletePromises = rowIds.map(async (id) => {
				try {
					await dispatch(deleteProfesorThunk(id)).unwrap();
					return { id, success: true };
				} catch (error) {
					return { id, success: false, error };
				}
			});

			const results = await Promise.all(deletePromises);
			
			// Separar éxitos y errores
			const successful = results.filter(r => r.success).map(r => r.id);
			const failed = results.filter(r => !r.success);

			// Actualizar estado local solo con los eliminados exitosamente
			if (successful.length > 0) {
				setTeachers((old) =>
					old.filter((row) => !successful.includes(row.id)),
				);
			}

			// Mostrar mensajes apropiados
			if (successful.length === rowIds.length) {
				toast.success(`${successful.length} profesores eliminados exitosamente`);
			} else if (successful.length > 0) {
				toast.success(`${successful.length} profesores eliminados`);
				toast.error(`${failed.length} profesores no pudieron ser eliminados`);
			} else {
				toast.error('No se pudo eliminar ningún profesor');
			}

		} catch (error) {
			console.error('Error general al eliminar profesores:', error);
			toast.error('Error al eliminar los profesores seleccionados');
		}
	};

	const table = useReactTable({
		data: teachers,
		columns,
		state: {
			globalFilter,
			sorting,
		},
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		meta: {
			deleteRow: handleDeleteRow,
			deleteRows: handleDeleteRows,
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

	useDidUpdate(() => table.resetRowSelection(), [teachers]);

	// VARIABLES HELPER más específicas
	const hasTeachers = teachers.length > 0;
	const visibleRows = table.getRowModel().rows;
	const hasVisibleRows = visibleRows.length > 0;
	const isFiltering = globalFilter && globalFilter.trim() !== "";

	return (
		<div>
			<div className="table-toolbar flex items-center justify-between">
				<h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
					Tabla de Profesores
				</h2>
				<div className="flex">
					<CollapsibleSearch
						placeholder="Buscar profesor..."
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
							{!hasTeachers ? (
								// Cuando no hay profesores en absoluto
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
													d="M12 14l9-5-9-5-9 5 9 5z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1}
													d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
												/>
											</svg>
											<h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-dark-200">
												No hay profesores disponibles
											</h3>
											<p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
												No se encontraron profesores en la base de datos
											</p>
										</div>
									</Td>
								</Tr>
							) : !hasVisibleRows && isFiltering ? (
								// Cuando hay profesores pero el filtro no encuentra coincidencias
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
												No hay profesores que coincidan con &quot;{globalFilter}&quot;
											</p>
										</div>
									</Td>
								</Tr>
							) : (
								// Renderizar las filas de profesores
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
				
				{hasTeachers && hasVisibleRows && (
					<div className="p-4 sm:px-5">
						<PaginationSection table={table} />
					</div>
				)}
				
				{hasTeachers && (
					<SelectedRowsActions table={table} height={theadHeight} />
				)}
			</Card>
			
			<EditModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				rowData={editingTeacher}
				onSave={handleSave}
			/>
		</div>
	);
}