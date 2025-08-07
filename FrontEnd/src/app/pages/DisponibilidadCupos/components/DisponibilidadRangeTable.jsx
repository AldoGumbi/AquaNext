// Import Dependencies
import PropTypes from "prop-types";
import {
  flexRender,
  getCoreRowModel,
  // getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

// Local Imports
import { Card, Table, THead, TBody, Th, Tr, Td, Badge } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";

// Icons
import { CalendarIcon, UserGroupIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

// Mapear tipos a etiquetas y colores
const typeConfig = {
  'nado_libre': { label: 'Nado Libre', color: 'secondary', icon: '🏊‍♂️' },
  'grupo_adultos': { label: 'Grupo Adultos', color: 'primary', icon: '🏊‍♀️' },
  'activacion_fisica_adulto_mayor': { label: 'Activación Física Adulto Mayor', color: 'info', icon: '🧘‍♀️' },
  'aquafitness': { label: 'Aquafitness', color: 'success', icon: '💪' },
  'grupo_preescolar': { label: 'Grupo Preescolar', color: 'warning', icon: '👶' },
  'grupo_escolar': { label: 'Grupo Escolar', color: 'cyan', icon: '🧒' },
  
  // Tipos adicionales por compatibilidad
  'matronatacion': { label: 'Matronatación', color: 'pink', icon: '👶' },
  'natacion_infantil': { label: 'Natación Infantil', color: 'indigo', icon: '🏊‍♀️' },
  'natacion_adultos': { label: 'Natación Adultos', color: 'purple', icon: '🏊‍♂️' }
};

// Mapear números de mes a nombres
const monthNames = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
  5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
  9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

export function DisponibilidadRangeTable({ data, loading }) {
  const [sorting, setSorting] = useState([
    { id: 'periodo', desc: false },
    { id: 'codigo', desc: false }
  ]);

  // Definir columnas
  const columns = useMemo(() => [
    {
      accessorKey: 'codigo',
      header: 'Grupo',
      cell: ({ getValue, row }) => (
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {typeConfig[row.original.tipo]?.icon || '🏊'}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-dark-100">
              {getValue()}
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              {row.original.nombre}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ getValue }) => {
        const config = typeConfig[getValue()] || { label: getValue(), color: 'primary' };
        return (
          <Badge color={config.color}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'periodo',
      header: 'Período',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-dark-100">
              {monthNames[row.original.mes]} {row.original.year}
            </div>
            <div className="text-xs text-gray-500 dark:text-dark-400">
              {row.original.mes_nombre}
            </div>
          </div>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.year, rowA.original.mes - 1);
        const dateB = new Date(rowB.original.year, rowB.original.mes - 1);
        return dateA - dateB;
      }
    },
    {
      accessorKey: 'dia',
      header: 'Horario',
      cell: ({ row }) => (
        <div className="text-center">
          <div className="capitalize font-medium text-gray-700 dark:text-dark-200">
            {row.original.dia}
          </div>
          <div className="text-sm font-mono text-gray-500 dark:text-dark-400">
            {row.original.hora_inicio} - {row.original.hora_fin}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'cupo_maximo',
      header: 'Cupo Máximo',
      cell: ({ getValue }) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <UserGroupIcon className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900 dark:text-dark-100">
              {getValue()}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'cupos_ocupados',
      header: 'Ocupados',
      cell: ({ getValue, row }) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {getValue()}
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((getValue() / row.original.cupo_maximo) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'cupos_disponibles',
      header: 'Disponibles',
      cell: ({ getValue }) => (
        <div className="text-center">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {getValue()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'porcentaje_ocupacion',
      header: 'Ocupación',
      cell: ({ getValue }) => {
        const percentage = getValue();
        let colorClass = 'text-green-600 dark:text-green-400';
        let bgColorClass = 'bg-green-600';
        
        if (percentage >= 80) {
          colorClass = 'text-red-600 dark:text-red-400';
          bgColorClass = 'bg-red-600';
        } else if (percentage >= 60) {
          colorClass = 'text-yellow-600 dark:text-yellow-400';
          bgColorClass = 'bg-yellow-600';
        }

        return (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-gray-500" />
              <span className={`font-semibold ${colorClass}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
              <div 
                className={`${bgColorClass} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const visibleRows = table.getRowModel().rows;
  const hasData = data.length > 0;

  // Agrupar datos por grupo para mostrar estadísticas
  const groupStats = useMemo(() => {
    if (!hasData) return {};
    
    const grouped = data.reduce((acc, item) => {
      const key = `${item.codigo}_${item.horario_id}`;
      if (!acc[key]) {
        acc[key] = {
          codigo: item.codigo,
          nombre: item.nombre,
          tipo: item.tipo,
          periods: []
        };
      }
      acc[key].periods.push({
        year: item.year,
        mes: item.mes,
        mes_nombre: item.mes_nombre,
        ocupacion: item.porcentaje_ocupacion,
        disponibles: item.cupos_disponibles
      });
      return acc;
    }, {});

    return grouped;
  }, [data, hasData]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 dark:text-dark-300">Cargando datos del rango...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de grupos únicos */}
      {hasData && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                Resumen del Rango
              </h4>
              <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
                {Object.keys(groupStats).length} grupos únicos en {data.length} períodos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {[...new Set(data.map(item => `${item.year}-${item.mes}`))].length}
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-400">Meses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(data.reduce((sum, item) => sum + parseFloat(item.porcentaje_ocupacion), 0) / data.length)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-400">Ocupación Promedio</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabla principal */}
      <Card className="overflow-hidden">
        {/* Header de la tabla */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">
                Disponibilidad por Rango de Fechas
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                {hasData ? `${data.length} registros encontrados` : 'No hay datos para mostrar'}
              </p>
            </div>
            {hasData && (
              <div className="text-sm text-gray-500 dark:text-dark-400">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <THead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="bg-gray-50 dark:bg-dark-800 font-semibold text-gray-700 dark:text-dark-200"
                    >
                      {header.column.getCanSort() ? (
                        <div
                          className="flex cursor-pointer select-none items-center space-x-2 hover:text-gray-900 dark:hover:text-dark-100"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </span>
                          <TableSortIcon sorted={header.column.getIsSorted()} />
                        </div>
                      ) : header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>
            <TBody>
              {hasData ? (
                visibleRows.map((row, index) => {
                  // Alternar colores por grupo
                  const prevRow = index > 0 ? visibleRows[index - 1] : null;
                  const isDifferentGroup = !prevRow || 
                    prevRow.original.codigo !== row.original.codigo ||
                    prevRow.original.horario_id !== row.original.horario_id;
                  
                  const isEvenGroup = Math.floor(index / 3) % 2 === 0;
                  const bgClass = isEvenGroup 
                    ? 'bg-white dark:bg-dark-900' 
                    : 'bg-gray-25 dark:bg-dark-800/30';
                  
                  return (
                    <Tr
                      key={row.id}
                      className={`border-b border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-800/50 ${bgClass} ${
                        isDifferentGroup ? 'border-t-2 border-t-gray-300 dark:border-t-dark-500' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      ))}
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan={columns.length} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <CalendarIcon className="w-12 h-12 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">
                          No hay datos disponibles
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-400">
                          No se encontraron registros en el rango de fechas seleccionado
                        </p>
                      </div>
                    </div>
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Paginación */}
        {hasData && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-600">
            <PaginationSection table={table} />
          </div>
        )}
      </Card>
    </div>
  );
}

DisponibilidadRangeTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool
};