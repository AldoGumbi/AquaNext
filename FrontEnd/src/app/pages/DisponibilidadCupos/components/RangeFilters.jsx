// Import Dependencies
import PropTypes from "prop-types";
import { Disclosure } from "@headlessui/react";

// Local Imports
import { Input, Card } from "components/ui";

// Icons
import { 
  FunnelIcon, 
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function RangeFilters({ filters, onFiltersChange, data }) {
  // Obtener tipos únicos de grupos
  const uniqueTypes = [...new Set(data.map(item => item.tipo))].filter(Boolean);
  
  // Obtener meses únicos del rango
  const uniqueMonths = [...new Set(data.map(item => item.mes))].filter(Boolean).sort((a, b) => a - b);

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

  // Mapear números de mes a nombres
  const monthNames = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMonthToggle = (monthNum) => {
    const currentMonths = filters.selectedMonths || [];
    const isSelected = currentMonths.includes(monthNum);
    
    const newSelectedMonths = isSelected
      ? currentMonths.filter(m => m !== monthNum)
      : [...currentMonths, monthNum];
    
    handleFilterChange('selectedMonths', newSelectedMonths);
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      tipoGrupo: "",
      selectedMonths: []
    });
  };

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.tipoGrupo || 
    (filters.selectedMonths && filters.selectedMonths.length > 0);

  return (
    <Card className="overflow-hidden">
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left bg-gray-50 dark:bg-dark-800 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <div className="flex items-center space-x-3">
                <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-dark-300" />
                <span className="font-medium text-gray-800 dark:text-dark-100">
                  Filtros de Rango
                </span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Búsqueda por texto */}
                  <div>
                    <Input
                      label="Buscar"
                      placeholder="Buscar por código o nombre..."
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
                    >
                      <option value="">Todos los tipos</option>
                      {uniqueTypes.map(type => (
                        <option key={type} value={type}>
                          {typeLabels[type] || type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selector de meses */}
                {uniqueMonths.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                      Filtrar por Meses
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {uniqueMonths.map(monthNum => {
                        const isSelected = filters.selectedMonths?.includes(monthNum);
                        return (
                          <button
                            key={monthNum}
                            onClick={() => handleMonthToggle(monthNum)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-dark-200 border-gray-300 dark:border-dark-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            }`}
                          >
                            {monthNames[monthNum]}
                          </button>
                        );
                      })}
                    </div>
                    {filters.selectedMonths && filters.selectedMonths.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-dark-400 mt-2">
                        {filters.selectedMonths.length} mes(es) seleccionado(s)
                      </p>
                    )}
                  </div>
                )}

                {/* Botón para limpiar filtros */}
                {hasActiveFilters && (
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-600">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </Card>
  );
}

RangeFilters.propTypes = {
  filters: PropTypes.shape({
    searchTerm: PropTypes.string.isRequired,
    tipoGrupo: PropTypes.string.isRequired,
    selectedMonths: PropTypes.array
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired
};