// Import Dependencies
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
// Local Imports
import {
	Textarea,
	Button,
	Input,
	Select,
	Switch
} from "components/ui";
// import { useDisclosure } from "hooks";

// ----------------------------------------------------------------------

export function EditModal({ isOpen, onClose, rowData, onSave }) {
	const [formData, setFormData] = useState(rowData);

	useEffect(() => {
		setFormData(rowData);
	}, [rowData]);

	// Esta función maneja cambios en los inputs
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	// Esta función maneja el envío del formulario
	const handleSubmit = (e) => {
		e.preventDefault(); // Previene el comportamiento por defecto
		onSave(formData);
		onClose();
	};
	const saveRef = useRef(null);

	return (
		<>
			{/*<Button onClick={open}>Scale Up</Button>*/}

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog
					as="div"
					className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
					onClose={close}
					initialFocus={saveRef}
				>
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
					</TransitionChild>

					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel className="relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
							<div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
								<DialogTitle
									as="h3"
									className="text-base font-medium text-gray-800 dark:text-dark-100"
								>
									Edición de Producto
								</DialogTitle>
								<Button
									onClick={onClose}
									variant="flat"
									isIcon
									className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
								>
									<XMarkIcon className="size-4.5" />
								</Button>
							</div>

							<form onSubmit={handleSubmit}> {/* Envuelve los inputs en un form */}
								<div className="p-4 space-y-4">
									<Input
										name="name"
										value={formData?.name || ''}
										onChange={handleChange}
										label="Nombre del Producto"
									/>
									<Textarea
										name="description"
										value={formData?.description || ''}
										onChange={handleChange}
										label="Descripción"
									/>

									<Select
										name="category"
										value={formData?.category || ''}
										onChange={handleChange}
										label="Categoría"
										className="w-full p-2 border border-gray-300 rounded dark:bg-dark-800 dark:border-dark-500">

										<option disabled value="">Selecciona una categoría</option>
										<option value="food">Comida</option>
										<option value="drinks">Bebidas</option>
										<option value="dessert">Postres</option>
										<option value="others">Otros</option>
									</Select>

									<div className="flex gap-4">
										<Input
											name="price"
											type="number"
											value={formData?.price || ''}
											onChange={handleChange}
											label="Precio"
										/>
										<Input
											name="cost"
											type="number"
											value={formData?.cost || ''}
											onChange={handleChange}
											label="Costo"
										/>
										<div className="flex justify-center">
											<Switch
												name="is_available"
												checked={formData?.is_available || false}
												label="Disponible"
												onChange={(e) => handleChange({
													target: {
														name: 'is_available',
														value: e.target.checked
													}
												})}
											/>
										</div>

									</div>



									{/* Agrega más campos según necesites */}
								</div>
								<div className="flex justify-end gap-3 p-4">
									<Button type="button" onClick={onClose}>Cancel</Button>
									<Button type="submit" color="primary"> {/* Cambiado a type="submit" */}
										Save
									</Button>
								</div>
							</form>
						</DialogPanel>
					</TransitionChild>
				</Dialog>
			</Transition>
		</>
	);
}
