// Import Dependencies
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { toast } from "sonner";

// Local Imports
import { Button, /**Input,**/ Card } from "components/ui";
import { StatsCards } from "./StatsCards";
import { DisponibilidadTable } from "./DisponibilidadTable";
import { FilterPanel } from "./FilterPanel";
import { EmptyState } from "./EmptyState";

// Redux
import { 
  getDisponibilidadPorMesThunk
} from "slices/thunk";

import { clearDisponibilidadMes } from "slices/availabilityOfCupos/reducer";

// Icons
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function DisponibilidadMensual() {
  const dispatch = useDispatch();
  const { 
    disponibilidadMes, 
    loading, 
    error, 
    error_message, 
    currentMonth, 
    currentYear,
    stats 
  } = useSelector((state) => state.disponibilidad);

  // Estados locales para el formulario
  const [selectedYear, setSelectedYear] = useState(DateTime.now().year);
  const [selectedMonth, setSelectedMonth] = useState(DateTime.now().month);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    tipoGrupo: "",
    estadoDisponibilidad: "",
    showOnlyAvailable: false
  });

  // Limpiar datos al desmontar el componente
  useEffect(() => {
    return () => {
      dispatch(clearDisponibilidadMes());
    };
  }, [dispatch]);

  // Manejar búsqueda
  const handleSearch = async () => {
    if (!selectedYear || !selectedMonth) {
      toast.error("Por favor selecciona año y mes");
      return;
    }

    try {
      await dispatch(getDisponibilidadPorMesThunk({ 
        year: selectedYear, 
        mes: selectedMonth 
      })).unwrap();
      setHasSearched(true);
      toast.success(`Datos cargados para ${getMonthName(selectedMonth)} ${selectedYear}`);
    } catch (error) {
      toast.error(error.error || "Error al cargar los datos");
    }
  };

  // Función para obtener el nombre del mes
  const getMonthName = (monthNumber) => {
    const date = DateTime.fromObject({ month: monthNumber });
    return date.toFormat('LLLL', { locale: 'es' });
  };

  // Generar años disponibles (desde 2020 hasta 2 años en el futuro)
  const generateYears = () => {
    const currentYear = DateTime.now().year;
    const years = [];
    for (let year = 2020; year <= currentYear + 4; year++) {
      years.push(year);
    }
    return years;
  };

  // Generar meses
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // Filtrar datos según los filtros aplicados
  const filteredData = disponibilidadMes.filter(item => {
    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matches = 
        item.codigo?.toLowerCase().includes(searchTerm) ||
        item.nombre?.toLowerCase().includes(searchTerm) ||
        item.profesor_asignado?.toLowerCase().includes(searchTerm);
      if (!matches) return false;
    }

    // Filtro por tipo de grupo
    if (filters.tipoGrupo && item.tipo !== filters.tipoGrupo) {
      return false;
    }

    // Filtro por estado de disponibilidad
    if (filters.estadoDisponibilidad && item.estado_disponibilidad !== filters.estadoDisponibilidad) {
      return false;
    }

    // Filtro para mostrar solo disponibles
    if (filters.showOnlyAvailable && item.estado_disponibilidad !== 'Disponible') {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">
              Consultar Disponibilidad Mensual
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Año
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
              >
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Selector de mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Mes
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de búsqueda */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={loading}
                color="primary"
                className="w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-4 h-4" />
                )}
                <span>{loading ? 'Consultando...' : 'Consultar'}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Estados condicionales */}
      {error && (
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Error al cargar los datos</p>
            <p className="text-sm mt-1">{error_message}</p>
            <Button
              onClick={handleSearch}
              color="primary"
              variant="outline"
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        </Card>
      )}

      {!error && hasSearched && disponibilidadMes.length === 0 && !loading && (
        <EmptyState 
          title="No hay datos disponibles"
          description={`No se encontraron grupos con horarios para ${getMonthName(selectedMonth)} ${selectedYear}`}
          icon="chart"
        />
      )}

      {!error && !loading && hasSearched && disponibilidadMes.length > 0 && (
        <>
          {/* Información actual */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Mostrando datos de {getMonthName(currentMonth)} {currentYear}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {filteredData.length} de {disponibilidadMes.length} grupos mostrados
                </p>
              </div>
              <Button
                onClick={() => dispatch(clearDisponibilidadMes())}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <StatsCards stats={stats} />

          {/* Panel de filtros */}
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            data={disponibilidadMes}
          />

          {/* Tabla de disponibilidad */}
          <DisponibilidadTable 
            data={filteredData}
            loading={loading}
            viewType="mensual"
          />
        </>
      )}

      {/* Estado inicial */}
      {!hasSearched && !loading && (
        <EmptyState 
          title="Selecciona un mes para consultar"
          description="Elige el año y mes para ver la disponibilidad de cupos en todos los grupos"
          icon="calendar"
        />
      )}
    </div>
  );
}