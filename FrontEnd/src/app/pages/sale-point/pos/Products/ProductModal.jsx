
// Import Dependencies
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef, useEffect, useState } from "react";
import * as yup from 'yup';
import { toast } from 'sonner';

// Local Imports
import {
  Textarea,
	Button,
	Input,
} from "components/ui";



import {  useDispatch, useSelector } from "react-redux";
import {
  insertBasketItemsThunk,
  createBasketThunk,
  updateBasketItemThunk,
  deleteBasketItemThunk
} from "slices/thunk.js"

// ----------------------------------------------------------------------

const productSchema = yup.object().shape({
	quantity: yup
		.number()
		.required('La cantidad es requerida')
		.min(1, 'La cantidad debe ser mayor a 0')
		.max(100, 'La cantidad no puede ser mayor a 100')
		.typeError('Debe ser un número válido'),
	comment: yup
		.string()
		.max(500, 'El comentario no puede exceder los 500 caracteres')
});

export function ProductModal({isOpen, onClose, rowData, isEdit }) {
	const [formData, setFormData] = useState(rowData);
	const [errors, setErrors] = useState({});
	const dispatch = useDispatch();
  
  // global states
	const { activeBasket,basket_items  } = useSelector((state) => state.basket);
	const { activeCoupon  } = useSelector((state) => state.coupons);
	
  useEffect(() => {
		setFormData(rowData);
	}, [rowData]);


	const saveRef = useRef(null);

	const validateForm = async () => {
		try {
			const formValues = {
				quantity: Number(document.querySelector('input[name="quantity"]').value) || 0,
				comment: document.querySelector('textarea')?.value || ''
			};

			await productSchema.validate(formValues, { abortEarly: false });
			setErrors({});
			return true;
		} catch (err) {
			const newErrors = {};
			err.inner.forEach(error => {
				newErrors[error.path] = error.message;
			});
			setErrors(newErrors);
			return false;
		}
	};

	const handlesave = async () => {

    // - This will create a new basket if there is no active basket
    // - No sale will be made if there is no active basket
		if(!activeBasket) {
			dispatch(createBasketThunk({ user_id: 1 }));
			toast.info('No existe ninguna canasta activa, se creará una nueva y' +
				' se agregaran los producto ahi para evitar problemas. Ya puedes agregar el producto',{autoClose: 4000});
			return;
		}

    const isValid = await validateForm();
    if (!isValid) return;

    // get the form data
    const quantityInput = Number(document.querySelector('input[name="quantity"]').value) || 0 ;
    const commentInput = document.querySelector('textarea')?.value || '';

    // variable to hold the data to be sent
    let data = {}

    if(isEdit) {
      data = {
        // ID of the item to be updated carrito_items.id
        id : formData.id,
        // QUANTITY
        quantity: quantityInput,
        // COMMENT
        comment: commentInput,
      }
      dispatch(updateBasketItemThunk(data))
        .unwrap() // <- Esto es clave para manejar el estado de la promesa
        .then(() => {
          onClose();
        })
        .catch((error) => {
          console.log("Error during the dispatch update!",error);
          toast.error('Error al actualizar el producto en la canasta, por favor intente de nuevo.');
        });
    }else{
      if(!formData.product_id) {
        toast.error('No se ha seleccionado ningún producto, por favor selecciona uno.');
        return;
      }
      // Prepare the data to be sent
      data = {
        // BASKET ID
        basketId: activeBasket,
        // PRODUCT ID
        product_id: Number(formData.product_id),
        // QUANTITY
        quantity: quantityInput,
        // COMMENT
        comment: commentInput,
        // IMAGE
        img : formData.imagen,
        // NAME
        name: formData.nombre,
        // PRICE
        price: formData.precio_venta,
      }
      dispatch(insertBasketItemsThunk(data))
        .unwrap() // <- Esto es clave para manejar el estado de la promesa
        .then(() => {
          onClose();
        })
        .catch((error) => {
          console.log("ERROR ADDING ITEM TO BASKET: ",error);
          toast.error('Error al agregar el producto a la canasta, por favor intente de nuevo.');
        });
    }
  }

  const handleDeleteItem = () => {
    const id = formData.id || null;
    //the id from the product
    if(!id) {
      toast.error('No se ha seleccionado ningún producto para eliminar.');
      return;
    }
    
    // cant delete the last product from the cart if a discount is active
    if(basket_items.length <= 1 && activeCoupon != null ) {
      toast.error("No puedes vaciar el carrito si tienes un cupon activo.")
      return;
    }
    
    
    dispatch(deleteBasketItemThunk(id))
      .unwrap() // <- Esto es clave para manejar el estado de la promesa
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.log("Error during the dispatch delete!",error);
        toast.error('Error al eliminar el producto de la canasta, por favor intente de nuevo.');
      });
  }

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
                  {isEdit ? "Editar Producto" : " Venta de Producto "} ({formData.nombre || " "})
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
                {!isEdit ? (
                  <p>
                    Para agregar un producto a la canasta, por favor ingresa la cantidad deseada y cualquier comentario
                    adicional que desees incluir. Asegúrate de que la cantidad sea un número válido entre 1 y 100.
                  </p>
                ) : (
                  <p>
                    Edita los detalles del producto antes de agregarlo a la canasta.
                    Asegúrate de que la cantidad sea un número válido entre 1 y 100.
                  </p>
                )}

								<div className="mt-4 space-y-5">
									<Input
										label="Cantidad de Producto*"
										type="number"
										min="0"
										max="100"
										name="quantity"
										placeholder="Total de googles : 4"
										defaultValue={formData.cantidad || 1}
										error={errors.quantity}
									>

									</Input>
									<Textarea
										placeholder="Ejemplo: Venta de goggles para el agua, color amarillo"
										label="Comentarios"
										rows="4"
										defaultValue={formData.comentario || ''}
										error={errors.comment}

									/>
								</div>
                <div className="flex items-center justify-end mt-4 space-x-3">

                  <Button
                    onClick={onClose}
                    variant="outlined"
                    className="min-w-[7rem] rounded-full"
                  >
                    Cancelar
                  </Button>
                  {isEdit && (
                    <Button
                      onClick={handleDeleteItem}
                      color="error"
                      className="min-w-[7rem] rounded-full"
                    >
                      Borrar Producto
                    </Button>
                  )}
                  <Button
                    onClick={handlesave}
                    color="primary"
                    className="min-w-[7rem] rounded-full"
                  >
                    {isEdit ? "Guardar Cambios" : "Agregar Producto"}
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
