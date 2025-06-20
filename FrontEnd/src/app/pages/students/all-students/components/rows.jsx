// Import Dependencies
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { Badge } from "components/ui";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  User
} from 'lucide-react';

// ----------------------------------------------------------------------

const StatusOptions = [
  {
    value: 'activo',
    label: 'Activo',
    color: 'success',
    icon: UserCheck
  },
  {
    value: 'inactivo',
    label: 'Inactivo',
    color: 'error',
    icon: UserX
  },
  {
    value: 'pendiente',
    label: 'Pendiente',
    color: 'warning',
    icon: Clock
  }
];

const SignatureOptions = [
  {
    value: 1,
    label: 'Con Firma',
    color: 'success',
    icon: CheckCircle
  },
  {
    value: 0,
    label: 'Sin Firma',
    color: 'error',
    icon: XCircle
  }
];

export function NameCell({ row }) {
  const fullName = `${row.original.nombre} ${row.original.apellido_paterno} ${row.original.apellido_materno || ''}`.trim();
  
  return (
    <div className="flex items-center space-x-3">
      <div className="size-9 flex items-center justify-center bg-gray-100 dark:bg-dark-600 rounded-full">
        <User className="size-5 text-gray-600 dark:text-dark-300" />
      </div>
      <div>
        <p className="font-bold text-gray-800 dark:text-dark-100">
          {fullName}
        </p>
        <span className="text-sm text-gray-500 dark:text-dark-400">
          ID: {row.original.id}
        </span>
      </div>
    </div>
  );
}

export function ContactCell({ row }) {
  const email = row.original.email;
  const telefono = row.original.telefono;

  return (
    <div className="space-y-1">
      {email && (
        <div className="flex items-center space-x-2">
          <Mail className="size-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-dark-200">
            {email}
          </span>
        </div>
      )}
      {telefono && (
        <div className="flex items-center space-x-2">
          <Phone className="size-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-dark-200">
            {telefono}
          </span>
        </div>
      )}
      {!email && !telefono && (
        <span className="text-sm text-gray-500 dark:text-dark-400">
          Sin contacto
        </span>
      )}
    </div>
  );
}

export function StatusCell({ getValue }) {
  const val = getValue();
  const option = StatusOptions.find((item) => item.value === val);
  
  if (!option) {
    return <Badge color="primary">Estado desconocido</Badge>;
  }
  
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Badge color={option.color} className="space-x-1.5">
        {option.icon && <option.icon className="h-4 w-4" />}
        <span>{option.label}</span>
      </Badge>
    </div>
  );
}

export function SignatureCell({ getValue }) {
  const val = Number(getValue());
  const option = SignatureOptions.find((item) => item.value === val);
  
  if (!option) {
    return <Badge color="primary">N/A</Badge>;
  }
  
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Badge 
        color={option.color} 
        variant="soft"
        className="space-x-1.5 border border-gray-200 dark:border-dark-500"
      >
        {option.icon && <option.icon className="h-4 w-4" />}
        <span>{option.label}</span>
      </Badge>
    </div>
  );
}

export function DateCell({ getValue, type = 'default' }) {
  const dateValue = getValue();
  
  if (!dateValue) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <span className="text-center text-gray-500">No registrada</span>
      </div>
    );
  }

  // Usar Luxon para parsear y formatear la fecha
  const date = DateTime.fromISO(dateValue, { zone: 'America/Mexico_City' });
  
  if (!date.isValid) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <span className="text-center text-red-500">Fecha inválida</span>
      </div>
    );
  }

  let formattedDate;

  // Formatear la fecha en español usando Luxon
  if (type === 'default') {
    formattedDate = date.setLocale('es').toFormat('dd LLLL yyyy'); 
  } else {
    formattedDate = date.setLocale('es').toFormat('dd LLLL yyyy HH:mm');
  }

  return (
    <div className="flex justify-center items-center h-full w-full">
      <span className="text-center text-sm">
        {formattedDate}
      </span>
    </div>
  );
}

// PropTypes
NameCell.propTypes = {
  row: PropTypes.object,
};

ContactCell.propTypes = {
  row: PropTypes.object,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
};

SignatureCell.propTypes = {
  getValue: PropTypes.func,
};

DateCell.propTypes = {
  getValue: PropTypes.func,
  type: PropTypes.oneOf(['default', 'datetime'])
}