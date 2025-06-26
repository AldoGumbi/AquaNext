// Import Dependencies
import {
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from "@headlessui/react";
import {
	EllipsisHorizontalIcon,
	PencilIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";

// Toast import
import { toast } from "sonner";

// ----------------------------------------------------------------------

const confirmMessages = {
	pending: {
		title: "¿Eliminar alumno?",
		description:
			"¿Estás seguro de que quieres eliminar este alumno? Esta acción no se puede deshacer.",
		actionText: "Eliminar alumno",
	},
	success: {
		title: "Alumno eliminado",
		description: "El alumno se eliminó correctamente de la base de datos.",
		actionText: "Entendido",
	},
	error: {
		title: "Error al eliminar alumno",
		description: "No se pudo eliminar el alumno. Verifica tu conexión a internet e intenta nuevamente.",
		actionText: "Reintentar",
	}
};

export function RowActions({ row, table }) {
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
	const [deleteSuccess, setDeleteSuccess] = useState(false);
	const [deleteError, setDeleteError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const closeModal = () => {
		setDeleteModalOpen(false);
		// Resetear estados después de un breve delay para evitar flickering
		setTimeout(() => {
			setDeleteSuccess(false);
			setDeleteError(false);
			setConfirmDeleteLoading(false);
			setErrorMessage("");
		}, 300);
	};

	const openModal = () => {
		setDeleteModalOpen(true);
		setDeleteError(false);
		setDeleteSuccess(false);
		setConfirmDeleteLoading(false);
		setErrorMessage("");
	};

	const handleDeleteRows = useCallback(async () => {
		// Si está en estado de error resetear para reintentar
		if (deleteError) {
			setDeleteError(false);
			setConfirmDeleteLoading(false);
		}

		setConfirmDeleteLoading(true);

		try {
			// Llamar a la función meta que maneja la eliminación
			await table.options.meta?.deleteRow(row);

			// Si llegamos hasta aquí, fue exitoso
			setDeleteSuccess(true);
			setConfirmDeleteLoading(false);

			// Cerrar el modal automaticamente depués de mostrar éxito
			setTimeout(() => {
				closeModal();
			}, 2000);

		} catch (error) {
			console.error("Error al eliminar alumno: ", error);

			// Extraer el mensaje de error de la API
			const apiMessage = error?.error?.API_message ||
							error?.message ||
							'Error desconocido al eliminar el alumno.';
			
			setErrorMessage(apiMessage);
			setDeleteError(true);
			setConfirmDeleteLoading(false);

			// Mostrar toast con el error
			toast.error(apiMessage);
		}
	}, [row, table, deleteError]);

	// Determinar el estado del modal
	const getModalState = () => {
		if (deleteError) return "error";
		if (deleteSuccess) return "success";
		return "pending";
	};

	// Crear mensajes dinámicos con el error de la API
	const getDynamicMessages = () => {
		if (deleteError && errorMessage) {
			return {
				...confirmMessages,
				error: {
					...confirmMessages.error,
					description: errorMessage
				}
			};
		}
		return confirmMessages;
	};

	const handleEdit = () => {
		table.options.meta?.editRow(row);
	};

	// Obtener información del alumno para mostrar en el modal
	// const studentInfo = row.original;

	return (
		<>
			<div className="flex justify-center">
				<Menu as="div" className="relative inline-block text-left">
					<MenuButton
						as={Button}
						variant="flat"
						isIcon
						className="size-7 rounded-full"
					>
						<EllipsisHorizontalIcon className="size-4.5" />
					</MenuButton>
					<Transition
						as={Fragment}
						enter="transition ease-out"
						enterFrom="opacity-0 translate-y-2"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in"
						leaveFrom="opacity-100 translate-y-0"
						leaveTo="opacity-0 translate-y-2"
					>
						<MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none ltr:right-0 rtl:left-0">
							<MenuItem>
								{({ focus }) => (
									<button
										onClick={handleEdit}
										className={clsx(
											"flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
											focus &&
												"bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
										)}
									>
										<PencilIcon className="size-4.5 stroke-1" />
										<span>Editar</span>
									</button>
								)}
							</MenuItem>
							<MenuItem>
								{({ focus }) => (
									<button
										onClick={openModal}
										className={clsx(
											"this:error flex h-9 w-full items-center space-x-3 px-3 tracking-wide text-this outline-hidden transition-colors dark:text-this-light",
											focus && "bg-this/10 dark:bg-this-light/10",
										)}
									>
										<TrashIcon className="size-4.5 stroke-1" />
										<span>Eliminar</span>
									</button>
								)}
							</MenuItem>
						</MenuItems>
					</Transition>
				</Menu>
			</div>

			<ConfirmModal
				show={deleteModalOpen}
				onClose={closeModal}
				messages={getDynamicMessages()}
				onOk={handleDeleteRows}
				confirmLoading={confirmDeleteLoading}
				state={getModalState()}
			/>
		</>
	);
}

RowActions.propTypes = {
	table: PropTypes.object,
	row: PropTypes.object,
};