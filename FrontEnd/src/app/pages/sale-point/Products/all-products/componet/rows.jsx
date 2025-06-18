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
    // label: 'Disponible',
    color: 'success',
    icon: BadgeCheck
  },
  {
    value: 0,
    // label: 'No disponible',
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
      <div className="flex items-center space-x-4">
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
          {row.original.sku && (
            <span className="text-sm text-gray-500 dark:text-dark-400">
        {row.original.sku}
      </span>
          )}
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
    const val = Number(getValue());
    const amount = val || 0;

    return (
      <div className="flex justify-center items-center h-full w-full">
        <Badge
          variant="soft"
          color="primary"
          className="font-semibold border border-gray-200 dark:border-dark-500 px-2 py-1"
        >
          {`$ ${formatNumber(amount, 2)}`}
        </Badge>
      </div>
    );
}

export function CostoCell({ getValue }) {
  const val = Number(getValue());
  const amount = val || 0;

  return (
    <div className="flex justify-center items-center h-full w-full">
      <Badge
        variant="soft"
        color="success"
        className="font-semibold border border-gray-200 dark:border-dark-500 px-2 py-1"
      >
        {`$ ${formatNumber(amount, 2)}`}
      </Badge>
    </div>
  );
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

export function DateCell({ getValue }) {
  const date = new Date(getValue());

  // Si la fecha no es válida
  if (isNaN(date.getTime())) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <span className="text-center">Fecha inválida</span>
      </div>
    );
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('es-ES', { month: 'long' });
  const year = date.getFullYear();

  return (
    <div className="flex justify-center items-center h-full w-full">
      <span className="text-center">
        {`${day} ${month} ${year}`}
      </span>
    </div>
  );
}

export function StockCell({ getValue }) {
  const stock = Number(getValue());

  // Definir clases condicionales
  const stockClasses = () => {
    if (stock <= 0) return 'text-red-600 font-bold'; // Stock agotado
    if (stock <= 5) return 'text-yellow-600 font-medium'; // Stock bajo
    return 'text-green-600'; // Stock normal
  };

  const colorClasses = () => {
    if (stock <= 0) return 'error'; // Stock agotado
    if (stock <= 5) return 'success'; // Stock bajo
    return 'primary'; // Stock normal
  }

  return (

    <div className="flex justify-center items-center h-full w-full">
      <Badge
        variant="soft"
        color={colorClasses()}
        className={`text-center ${stockClasses()}   border border-this-darker/20 dark:border-this-lighter/20`}
      >
        {isNaN(stock) ? 'N/A' : stock.toLocaleString('es-ES')}
      </Badge>
    </div>
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

CostoCell.prototype = {
  getValue: PropTypes.func,
};

CategoryCell.propTypes = {
  getValue: PropTypes.func,
};

DateCell.propTypes = {
  getValue: PropTypes.func,
}

StockCell.propTypes = {
  getValue: PropTypes.func,
}