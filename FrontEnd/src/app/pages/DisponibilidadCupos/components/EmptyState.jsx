// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Card } from "components/ui";

// Icons
import { 
  CalendarDaysIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon,
  UserGroupIcon 
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

const iconMap = {
  calendar: CalendarDaysIcon,
  chart: ChartBarIcon,
  search: MagnifyingGlassIcon,
  users: UserGroupIcon
};

export function EmptyState({ 
  title, 
  description, 
  icon = "chart", 
  className = "",
  children 
}) {
  const IconComponent = iconMap[icon] || ChartBarIcon;

  return (
    <Card className={`p-12 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Icono */}
        <div className="p-4 bg-gray-100 dark:bg-dark-800 rounded-full">
          <IconComponent className="w-12 h-12 text-gray-400 dark:text-dark-500" />
        </div>

        {/* Título */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-500 dark:text-dark-400 max-w-md mx-auto leading-relaxed">
          {description}
        </p>

        {/* Contenido adicional */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(['calendar', 'chart', 'search', 'users']),
  className: PropTypes.string,
  children: PropTypes.node
};