// Import Dependencies
import PropTypes from "prop-types";
import { Disclosure } from "@headlessui/react";

// Local Imports
import { Input, Switch, Card } from "components/ui";

// Icons
import { 
  FunnelIcon, 
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function FilterPanel({ filters, onFiltersChange, data }) {
  // Obtener tipos únicos de grupos
  const uniqueTypes = [...new Set(data.map(item => item.tipo))].filter(Boolean);
  
  // Obtener estados únicos de disponibilidad
  const uniqueStates = [...new Set(data.map(item => item.estado_disponibilidad))].filter(Boolean);

  // Mapear tipos a etiquetas más amigables
  const typeLabels = {
    'nado_libre': 'Nado Libre',
    'grupo_adultos': 'Grupo Adultos',
    'activacion_fisica_adulto_mayor': 'Activación Física Adulto Mayor',
    'aquafitness': 'Aquafitness',
    'grupo_preescolar': 'Grupo Preescolar',
    'grupo_escolar': 'Grupo Escolar',
    
    // Tipos adicionales por compatibilidad
    'matronatacion': 'Matronatación',
    'natacion_infantil': 'Natación Infantil',
    'natacion_adultos': 'Natación Adultos'
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      tipoGrupo: "",
      estadoDisponibilidad: "",
      showOnlyAvailable: false
    });
  };

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.tipoGrupo || 
    filters.estadoDisponibilidad || 
    filters.showOnlyAvailable;

  return (
    <Card className="overflow-hidden">
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left bg-gray-50 dark:bg-dark-800 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <div className="flex items-center space-x-3">
                <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-dark-300" />
                <span className="font-medium text-gray-800 dark:text-dark-100">
                  Filtros
                </span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Activos
                  </span>
                )}
              </div>
              <ChevronDownIcon 
                className={`w-5 h-5 text-gray-600 dark:text-dark-300 transition-transform ${
                  open ? 'rotate-180' : ''
                }`} 
              />
            </Disclosure.Button>
            
            <Disclosure.Panel className="p-4 border-t border-gray-200 dark:border-dark-600">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Búsqueda por texto */}
                  <div className="md:col-span-2">
                    <Input
                      label="Buscar"
                      placeholder="Buscar por código, nombre o profesor..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                  </div>

                  {/* Filtro por tipo de grupo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Tipo de Grupo
                    </label>
                    <select
                      value={filters.tipoGrupo}
                      onChange={(e) => handleFilterChange('tipoGrupo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
                    >
                      <option value="">Todos los tipos</option>
                      {uniqueTypes.map(type => (
                        <option key={type} value={type}>
                          {typeLabels[type] || type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Estado
                    </label>
                    <select
                      value={filters.estadoDisponibilidad}
                      onChange={(e) => handleFilterChange('estadoDisponibilidad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
                    >
                      <option value="">Todos los estados</option>
                      {uniqueStates.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={filters.showOnlyAvailable}
                      onChange={(e) => handleFilterChange('showOnlyAvailable', e.target.checked)}
                      label="Solo mostrar grupos disponibles"
                    />
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </Card>
  );
}

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    searchTerm: PropTypes.string.isRequired,
    tipoGrupo: PropTypes.string.isRequired,
    estadoDisponibilidad: PropTypes.string.isRequired,
    showOnlyAvailable: PropTypes.bool.isRequired
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired
};