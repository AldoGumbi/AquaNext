// Import Dependencies
import PropTypes from "prop-types";
import { XCircleIcon} from "@heroicons/react/24/outline/index.js";
import {  Badge } from "components/ui";
import {
  UtensilsCrossed,
  Volleyball ,
  Binoculars,
  Backpack,
  BadgeCheck,
  CircleX
} from 'lucide-react'

import { formatNumber } from "utils/formatNumber.js";

// Local Imports

// ----------------------------------------------------------------------
const CategoryOptions = [
  {
    value: 'cafeteria',
    label: 'Cafeteria',
    color: 'success',
    icon: UtensilsCrossed
  },
  {
    value: 'articulo_deportivo',
    label: 'Articulo deportivo',
    color: 'info',
    icon: Volleyball
  },
  {
    value: 'accesorios',
    label: 'Accesorios',
    color: 'error',
    icon: Backpack
  },
  {
    value: 'otros',
    label: 'Otros',
    color: 'warning',
    icon: Binoculars
  },
  {
    value: 1,
    label: 'Disponible',
    color: 'success',
    icon: BadgeCheck
  },
  {
    value: 0,
    label: 'No disponible',
    color: 'error',
    icon: CircleX
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'primary',
    icon: XCircleIcon
  }
]



export function NameCell({ row }) {

  const img = row.original.imagen || '/public/images/no-image.png';
  return (
    <>
    <div className="flex items-center space-x-4 ">
      <div className="size-9">
        <img
          className="h-full w-full rounded-lg object-cover object-center"
          src={img}
          alt={row.original.nombre}
        />
      </div>
      <div>
        <p className="font-bold text-gray-800 dark:text-dark-100">
          {row.original.nombre}
        </p>
      </div>
    </div>
    </>
  );

}

export function Description({ getValue }) {
  const text = getValue() ?? "No se registró descripción";
  return (
    <div className="max-w-xs break-words">
      <p className="whitespace-normal">
        {text}
      </p>
    </div>
  );
}

export function PriceCell({ getValue }) {
  const val =  Number(getValue());
  if(!val){
    return <span className="font-semibold"> $ 0.00</span>;
  }
  return <span className="font-semibold"> $ { formatNumber(val,2)}</span>;
}


export function CategoryCell({ getValue }) {
  const val = getValue();
  const option = CategoryOptions.find((item) => item.value === val);
  if (!option) {
    return <Badge color="primary">Sin categoria</Badge>;
  }
  return (
    <Badge color={option.color} className="space-x-1.5 ">
      {option.icon && <option.icon className="h-4 w-4" />}

      <span>{option.label}</span>
    </Badge>
  );
}


NameCell.propTypes = {
  row: PropTypes.object,
};

Description.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
};

PriceCell.propTypes = {
  getValue: PropTypes.func,
};


CategoryCell.propTypes = {
  getValue: PropTypes.func,
};
