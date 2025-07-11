// Import Dependencies
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef, useEffect } from "react";

// Local Imports
import { Button, Select } from "components/ui";

import { useDispatch, useSelector } from "react-redux";
import { avaliableCouponsThunk } from "slices/thunk.js";

import {useState} from "react";

import {toast} from "sonner"

import {applyCouponToBasketThunk} from "slices/thunk.js";

// ----------------------------------------------------------------------

export function DiscountModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  
  const [selectedCoupon, setSelectedCoupon] = useState('');
  
  
  useEffect(() => {
    dispatch(avaliableCouponsThunk());
  }, [dispatch]);
  
  // Selector for the coupons global state
  const {
    avaliableCoupons,
  } = useSelector((state) => state.coupons);
  
  // Selector for the basket global State
  const {
    activeBasket,
    basket_total
  } = useSelector((state) => state.basket);
  
  const saveRef = useRef(null);
  
  const formatCouponLabel = (cupon) => {
    const valorFormateado =
      cupon.tipo === "porcentaje"
        ? `${cupon.valor}%`
        : `$${parseFloat(cupon.valor).toFixed(2)}`;
    
    const usosDisponibles = cupon.usos_maximos - cupon.usos_actuales;
    const isAgotado = usosDisponibles <= 0;
    
    return {
      label: `${cupon.nombre} - ${valorFormateado} (${usosDisponibles} usos disponibles)`,
      isAgotado,
    };
  };
  
  const handleSelectChange = (e) => {
    setSelectedCoupon(e.target.value);
  };
  
  const handleDiscount = () => {
    if(!selectedCoupon){
      toast.error("Selecciona un cupon valido!");
    }
    const data = {
      coupon_id: Number(selectedCoupon),
      basket_id: Number(activeBasket),
    }
    
    if(Number(basket_total) <= 0){
      toast.error("No puedes aplicar un descuento si no existen productos en el carrito!");
      return;
    }
    dispatch(applyCouponToBasketThunk(data));
    onClose();
  };
  
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
            <DialogPanel className="dark:bg-dark-700 relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300">
              <div className="dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-100 text-base font-medium text-gray-800"
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
                  Puedes seleccionar un cupon de descuento para aplicar al total
                  de la cuenta.
                </p>
                
                <div className="mt-4 space-y-5">
                  <Select
                    label="Cupones disponibles*"
                    name="SelectCupon"
                    onChange={handleSelectChange}
                    value={selectedCoupon}
                  >
                    <option value="" disabled>
                      Selecciona un Código descuento
                    </option>
                    {avaliableCoupons?.length > 0 ? (
                      avaliableCoupons.map((cupon) => {
                        const { label, isAgotado } = formatCouponLabel(cupon);
                        return (
                          <option
                            key={cupon.codigo}
                            value={cupon.id}
                            disabled={isAgotado}
                            className={isAgotado ? "text-gray-400" : ""}
                          >
                            {isAgotado ? `${label} (AGOTADO)` : label}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" selected disabled>
                        No hay cupones disponibles
                      </option>
                    )}
                  </Select>
                </div>
                <div className="mt-4 flex items-center justify-end space-x-3">
                  <Button
                    onClick={onClose}
                    variant="outlined"
                    className="min-w-[7rem] rounded-full"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDiscount}
                    color="primary"
                    disabled={avaliableCoupons?.length > 0 ? false : true}
                    className="min-w-[7rem] rounded-full"
                  >
                    Aplicar codigo
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