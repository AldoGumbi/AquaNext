
// Import Dependencies
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Fragment,
  useRef,
} from "react";

// Local Imports
import {
	Button,
	Select,
} from "components/ui";



import {
  // useDispatch,
  useSelector
} from "react-redux";
// import {
//   insertBasketItemsThunk,
//   createBasketThunk,
//   updateBasketItemThunk,
// } from "slices/thunk.js"

// ----------------------------------------------------------------------

export function DiscountModal({isOpen, onClose }) {
	// const dispatch = useDispatch();
	// const [errors, setErrors] = useState({});
	const { activeBasket  } = useSelector((state) => state.basket);


  console.log("active :", activeBasket)

	const saveRef = useRef(null);


	return (
		<>

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog
					as="div"
					className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
					onClose={onClose}
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
						<div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
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
                 Aplicar codigo de descuento
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

							<div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                <p>
                  Puedes seleccionar un cupon de descuento para aplicar al total de la cuenta.
                </p>

								<div className="mt-4 space-y-5">
									<Select
										label="Cupones disponibles*"
										name="SelectCupon"
									>
                    <option value="" disabled>Selecciona un Código descuento</option>
                    <option value="cupon1">Cupon 1 - 10% de descuento</option>
                    <option value="cupon2">Cupon 2 - 20% de descuento</option>
                    <option value="cupon3">Cupon 3 - 30% de descuento</option>

									</Select>

								</div>
                <div className="flex items-center justify-end mt-4 space-x-3">

                  <Button
                    onClick={onClose}
                    variant="outlined"
                    className="min-w-[7rem] rounded-full"
                  >
                    Cancelar
                  </Button>
                  <Button
                    // onClick={handlesave}
                    color="primary"
                    className="min-w-[7rem] rounded-full"
                  >
                    Guardar Cambios
                  </Button>
                </div>
							</div>
						</DialogPanel>
					</TransitionChild>
				</Dialog>
			</Transition>
		</>
	);
}
