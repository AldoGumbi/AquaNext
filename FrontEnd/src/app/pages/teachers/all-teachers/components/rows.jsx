// Import Dependencies
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { Badge } from "components/ui";
import {
  UserCheck,
  UserX,
  Phone,
  GraduationCap,
  // User
} from 'lucide-react';

// ----------------------------------------------------------------------

const StatusOptions = [
  {
    value: 1,
    label: 'Activo',
    color: 'success',
    icon: UserCheck
  },
  {
    value: 0,
    label: 'Inactivo',
    color: 'error',
    icon: UserX
  }
];

export function NameCell({ row }) {
  const fullName = `${row.original.nombre} ${row.original.apellido}`.trim();
  
  return (
    <div className="flex items-center space-x-3">
      <div className="size-9 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
        <GraduationCap className="size-5 text-blue-600 dark:text-blue-400" />
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

export function ContactCell({ getValue }) {
  const telefono = getValue();

  return (
    <div className="space-y-1">
      {telefono ? (
        <div className="flex items-center space-x-2">
          <Phone className="size-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-dark-200">
            {telefono}
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-500 dark:text-dark-400">
          Sin teléfono
        </span>
      )}
    </div>
  );
}

export function SpecialtyCell({ getValue }) {
  const especialidad = getValue();

  return (
    <div className="flex items-center space-x-2">
      {especialidad ? (
        <>
          <GraduationCap className="size-4 text-blue-500" />
          <span className="text-sm text-gray-700 dark:text-dark-200">
            {especialidad}
          </span>
        </>
      ) : (
        <span className="text-sm text-gray-500 dark:text-dark-400">
          Sin especialidad
        </span>
      )}
    </div>
  );
}

export function StatusCell({ getValue }) {
  const val = Number(getValue());
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
  getValue: PropTypes.func,
};

SpecialtyCell.propTypes = {
  getValue: PropTypes.func,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
};

DateCell.propTypes = {
  getValue: PropTypes.func,
  type: PropTypes.oneOf(['default', 'datetime'])
}