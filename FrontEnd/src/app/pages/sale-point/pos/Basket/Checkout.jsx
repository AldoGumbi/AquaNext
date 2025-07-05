import {
  CreditCardIcon,
  QrCodeIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { Button } from "components/ui";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { GetCouponByIdThunk } from "slices/thunk";

export function Checkout() {
  const dispatch = useDispatch();
  const { basket_items } = useSelector((state) => state.basket);
  const { activeCoupon } = useSelector((state) => state.coupons);
  
  const [subtotal, setSubTotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);
  
  const idCupones = (basket_items && basket_items.length > 0) ? basket_items[0].id_cupones : null;
  
  // Calcula subtotal, IVA y total considerando descuentos
  useEffect(() => {
    const t = basket_items?.reduce((total, item) => total + (item.precio_venta * item.cantidad), 0) || 0;
    const ivaValue = t * 0.16;
    
    let discount = 0;
    if (activeCoupon) {
      if (activeCoupon.tipo === 'porcentaje') {
        // Descuento porcentual
        discount = (t * (parseFloat(activeCoupon.valor) / 100));
      } else if (activeCoupon.tipo === 'cantidad') {
        // Descuento de valor fijo
        discount = parseFloat(activeCoupon.valor);
      }
    }
    
    setSubTotal(Number(t));
    setIva(Number(ivaValue));
    setTotal(Number(t + ivaValue - discount));
  }, [basket_items, activeCoupon]);
  
  // Obtiene el cupón si existe
  useEffect(() => {
    if(idCupones){
      dispatch(GetCouponByIdThunk(idCupones));
    }
  }, [idCupones, dispatch]);
  
  // Componente de visualización del descuento (solo UI)
  // Modifica el discountComponent para mostrar correctamente ambos tipos
  const discountComponent = (coupon) => {
    if (!coupon) return null;
    
    let discountValue;
    let displayText;
    
    if (coupon.tipo === 'porcentaje') {
      discountValue = ((parseFloat(coupon.valor) / 100) * subtotal);
      displayText = `${coupon.valor}%`;
    } else if (coupon.tipo === 'cantidad') {
      discountValue = parseFloat(coupon.valor);
      displayText = `$${coupon.valor}`;
    } else {
      return null;
    }
    
    return (
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
        <p className="flex items-center">
          <span className="mr-1">Descuento</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
          ({displayText})
        </span>
        </p>
        <p className="font-medium tracking-wide text-green-600 dark:text-green-400">
          - $ {discountValue.toFixed(2)}
        </p>
      </div>
    );
  }
  
  // Formateador de precios seguro
  const formatPrice = (value) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };
  
  return (
    <div>
      <div className="my-4 h-px bg-gray-200 dark:bg-dark-500"></div>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-800 dark:text-dark-100">
          <p>Subtotal</p>
          <p className="font-medium tracking-wide">$ {formatPrice(subtotal)}</p>
        </div>
        
        {/* Componente de descuento (solo visualización) */}
        {activeCoupon && discountComponent(activeCoupon)}
        
        <div className="flex justify-between text-xs-plus">
          <p>I.V.A</p>
          <p className="font-medium tracking-wide">$ {formatPrice(iva)}</p>
        </div>
        
        <div className="flex justify-between text-base font-medium text-primary-600 dark:text-primary-400">
          <p>Total</p>
          <p>$ {formatPrice(total)}</p>
        </div>
      </div>
      
      <div className="mt-5 grid grid-cols-3 gap-4 text-center">
        <Button variant="outlined" className="flex-col py-3">
          <WalletIcon className="size-10 stroke-1 opacity-80" />
          <span className="mt-1 text-primary-600 dark:text-primary-400">Efectivo</span>
        </Button>
        <Button variant="outlined" className="flex-col py-3">
          <CreditCardIcon className="size-10 stroke-1 opacity-80" />
          <span className="mt-1 text-primary-600 dark:text-primary-400">Tarjeta</span>
        </Button>
        <Button variant="outlined" className="flex-col py-3">
          <QrCodeIcon className="size-10 stroke-1 opacity-80" />
          <span className="mt-1 text-primary-600 dark:text-primary-400">Scanear</span>
        </Button>
      </div>
      
      <Button color="primary" className="mt-5 h-11 w-full justify-between">
        <span>Pagar</span>
        <span>$ {formatPrice(total)}</span>
      </Button>
    </div>
  );
}