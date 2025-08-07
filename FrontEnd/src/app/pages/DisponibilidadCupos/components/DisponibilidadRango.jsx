// Import Dependencies
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { toast } from "sonner";

// Local Imports
import { Button, Card } from "components/ui";
import { DisponibilidadRangeTable } from "./DisponibilidadRangeTable";
import { RangeFilters } from "./RangeFilters";
import { EmptyState } from "./EmptyState";

// Redux
import { 
  getDisponibilidadPorRangoThunk
} from "slices/thunk";

import { clearDisponibilidadRango } from "slices/availabilityOfCupos/reducer";

// Icons
import { CalendarDaysIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function DisponibilidadRango() {
  const dispatch = useDispatch();
  const { 
    disponibilidadRango, 
    loadingRange, 
    errorRange, 
    error_message_range, 
    currentRange 
  } = useSelector((state) => state.disponibilidad);

  // Estados locales para el formulario de rango
  const [rangeForm, setRangeForm] = useState({
    yearInicio: DateTime.now().year,
    mesInicio: DateTime.now().month,
    yearFin: DateTime.now().year,
    mesFin: DateTime.now().month + 2 > 12 ? 12 : DateTime.now().month + 2
  });
  
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    tipoGrupo: "",
    selectedMonths: []
  });

  // Limpiar datos al desmontar el componente
  useEffect(() => {
    return () => {
      dispatch(clearDisponibilidadRango());
    };
  }, [dispatch]);

  // Función para obtener el nombre del mes
  const getMonthName = (monthNumber) => {
    const date = DateTime.fromObject({ month: monthNumber });
    return date.toFormat('LLLL', { locale: 'es' });
  };

  // Generar años disponibles
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

  // Validar que el rango sea válido
  const isValidRange = () => {
    const startDate = DateTime.fromObject({ 
      year: rangeForm.yearInicio, 
      month: rangeForm.mesInicio 
    });
    const endDate = DateTime.fromObject({ 
      year: rangeForm.yearFin, 
      month: rangeForm.mesFin 
    });
    
    return startDate <= endDate;
  };

  // Manejar búsqueda por rango
  const handleRangeSearch = async () => {
    if (!isValidRange()) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    try {
      await dispatch(getDisponibilidadPorRangoThunk(rangeForm)).unwrap();
      setHasSearched(true);
      toast.success(`Datos cargados desde ${getMonthName(rangeForm.mesInicio)} ${rangeForm.yearInicio} hasta ${getMonthName(rangeForm.mesFin)} ${rangeForm.yearFin}`);
    } catch (error) {
      toast.error(error.error || "Error al cargar los datos del rango");
    }
  };

  console.log("Disponibilidad por rango: ", disponibilidadRango);

  // Filtrar datos según los filtros aplicados
  const filteredData = disponibilidadRango.filter(item => {
    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matches = 
        item.codigo?.toLowerCase().includes(searchTerm) ||
        item.nombre?.toLowerCase().includes(searchTerm);
      if (!matches) return false;
    }

    // Filtro por tipo de grupo
    if (filters.tipoGrupo && item.tipo !== filters.tipoGrupo) {
      return false;
    }

    // Filtro por meses seleccionados
    if (filters.selectedMonths.length > 0 && !filters.selectedMonths.includes(item.mes)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda por rango */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">
              Consultar Disponibilidad por Rango
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Fecha de inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Año Inicio
              </label>
              <select
                value={rangeForm.yearInicio}
                onChange={(e) => setRangeForm(prev => ({ ...prev, yearInicio: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
              >
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Mes Inicio
              </label>
              <select
                value={rangeForm.mesInicio}
                onChange={(e) => setRangeForm(prev => ({ ...prev, mesInicio: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Año Fin
              </label>
              <select
                value={rangeForm.yearFin}
                onChange={(e) => setRangeForm(prev => ({ ...prev, yearFin: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
              >
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Mes Fin
              </label>
              <select
                value={rangeForm.mesFin}
                onChange={(e) => setRangeForm(prev => ({ ...prev, mesFin: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-700 dark:border-dark-500 dark:text-dark-100"
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
                onClick={handleRangeSearch}
                disabled={loadingRange || !isValidRange()}
                color="primary"
                className="w-full flex items-center justify-center space-x-2"
              >
                {loadingRange ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarDaysIcon className="w-4 h-4" />
                )}
                <span>{loadingRange ? 'Consultando...' : 'Consultar'}</span>
              </Button>
            </div>
          </div>

          {/* Validación visual del rango */}
          {!isValidRange() && (
            <div className="text-red-600 text-sm">
              ⚠️ La fecha de inicio debe ser anterior a la fecha de fin
            </div>
          )}
        </div>
      </Card>

      {/* Estados condicionales */}
      {errorRange && (
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Error al cargar los datos</p>
            <p className="text-sm mt-1">{error_message_range}</p>
            <Button
              onClick={handleRangeSearch}
              color="primary"
              variant="outline"
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        </Card>
      )}

      {!errorRange && hasSearched && disponibilidadRango.length === 0 && !loadingRange && (
        <EmptyState 
          title="No hay datos disponibles"
          description={`No se encontraron grupos con horarios en el rango seleccionado`}
          icon="chart"
        />
      )}

      {!errorRange && !loadingRange && hasSearched && disponibilidadRango.length > 0 && (
        <>
          {/* Información del rango actual */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-100">
                  Mostrando datos desde {getMonthName(currentRange?.mesInicio)} {currentRange?.yearInicio} hasta {getMonthName(currentRange?.mesFin)} {currentRange?.yearFin}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {filteredData.length} de {disponibilidadRango.length} registros mostrados
                </p>
              </div>
              <Button
                onClick={() => dispatch(clearDisponibilidadRango())}
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-300 hover:bg-purple-100"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Panel de filtros para rango */}
          <RangeFilters
            filters={filters}
            onFiltersChange={setFilters}
            data={disponibilidadRango}
          />

          {/* Tabla de disponibilidad por rango */}
          <DisponibilidadRangeTable 
            data={filteredData}
            loading={loadingRange}
          />
        </>
      )}

      {/* Estado inicial */}
      {!hasSearched && !loadingRange && (
        <EmptyState 
          title="Selecciona un rango de fechas"
          description="Elige las fechas de inicio y fin para ver la evolución de la disponibilidad de cupos"
          icon="calendar"
        />
      )}
    </div>
  );
}