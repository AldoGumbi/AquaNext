// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Card } from "components/ui";

// Icons
import { 
  UsersIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function StatsCards({ stats }) {
  const statsConfig = [
    {
      label: "Total de Grupos",
      value: stats.totalGrupos,
      icon: UsersIcon,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-900 dark:text-blue-100"
    },
    {
      label: "Grupos Disponibles",
      value: stats.gruposDisponibles,
      icon: CheckCircleIcon,
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-900 dark:text-green-100"
    },
    {
      label: "Grupos Llenos",
      value: stats.gruposLlenos,
      icon: XCircleIcon,
      color: "red",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-900 dark:text-red-100"
    },
    {
      label: "Parcialmente Ocupados",
      value: stats.gruposParciales,
      icon: ClockIcon,
      color: "yellow",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-900 dark:text-yellow-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => (
        <Card key={index} className={`p-6 ${stat.bgColor} border-0`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stat.textColor} opacity-75`}>
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full bg-white/50 dark:bg-black/20`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
      
      {/* Card adicional para porcentaje promedio */}
      <Card className="p-6 bg-purple-50 dark:bg-purple-900/20 border-0 sm:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100 opacity-75">
              Porcentaje de Ocupación Promedio
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3 max-w-xs">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(
                      isNaN(stats.porcentajeOcupacionPromedio) ? 0 : stats.porcentajeOcupacionPromedio, 
                      100
                    )}%` 
                  }}
                />
              </div>
              <span className="text-2xl font-bold text-purple-900 dark:text-purple-100 min-w-fit">
                {isNaN(stats.porcentajeOcupacionPromedio) ? '0' : stats.porcentajeOcupacionPromedio}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

StatsCards.propTypes = {
  stats: PropTypes.shape({
    totalGrupos: PropTypes.number.isRequired,
    gruposDisponibles: PropTypes.number.isRequired,
    gruposLlenos: PropTypes.number.isRequired,
    gruposParciales: PropTypes.number.isRequired,
    porcentajeOcupacionPromedio: PropTypes.number.isRequired
  }).isRequired
};