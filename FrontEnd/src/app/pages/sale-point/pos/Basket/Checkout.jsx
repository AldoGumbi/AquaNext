// Import Dependencies
import {
  CreditCardIcon,
  QrCodeIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Button } from "components/ui";

import {  useSelector } from "react-redux";

import { useEffect, useState } from "react";

// ----------------------------------------------------------------------

export function Checkout() {
  const { basket_items } = useSelector((state) => state.basket);

  const [subtotal, setSubTotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);
  console.log(basket_items);

  useEffect(() => {
    const t = basket_items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    setSubTotal(Number(t));

    const ivaValue = t * 0.16;
    setIva(Number(ivaValue));

    setTotal(Number(t + ivaValue));
  }, [basket_items, setSubTotal, setIva]);


  return (
    <div>
      <div className="my-4 h-px bg-gray-200 dark:bg-dark-500"></div>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-800 dark:text-dark-100">
          <p>Subtotal</p>
          <p className="font-medium tracking-wide">{subtotal.toFixed(2)}$</p>
        </div>
        <div className="flex justify-between text-xs-plus">
          <p>I.V.A</p>
          <p className="font-medium tracking-wide">{iva.toFixed(2)}$</p>
        </div>
        <div className="flex justify-between text-base font-medium text-primary-600 dark:text-primary-400">
          <p>Total</p>
          <p>{total.toFixed(2)}$</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4 text-center">
        <Button variant="outlined" className="flex-col py-3">
          <WalletIcon className="size-10 stroke-1 opacity-80" />
          <span className="mt-1 text-primary-600 dark:text-primary-400">
            Efectivo
          </span>
        </Button>
        <Button variant="outlined" className="flex-col py-3">
          <CreditCardIcon className="size-10 stroke-1 opacity-80" />
          <span className="mt-1 text-primary-600 dark:text-primary-400">
            Tarjeta
          </span>
        </Button>
        <Button variant="outlined" className="flex-col py-3">
          <QrCodeIcon className="size-10 stroke-1 opacity-80" />
          <span className="mt-1 text-primary-600 dark:text-primary-400">
            Scanear
          </span>
        </Button>
      </div>
      <Button color="primary" className="mt-5 h-11 w-full justify-between">
        <span>Pagar</span>
        <span>${total.toFixed(2)}</span>
      </Button>
    </div>
  );
}
