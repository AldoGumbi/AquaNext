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
import { AlumnosModal } from "./AlumnosModal";

// Local Imports
import { Card, Table, THead, TBody, Th, Tr, Td, Badge } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";

// Icons
import { ClockIcon, UserGroupIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

// Mapear tipos a etiquetas y colores
const typeConfig = {
  'nado_libre': { label: 'Nado Libre', color: 'secondary', icon: '🏊‍♂️' },
  'grupo_adultos': { label: 'Grupo Adultos', color: 'primary', icon: '🏊‍♀️' },
  'activacion_fisica_adulto_mayor': { label: 'Activación Física Adulto Mayor', color: 'info', icon: '🧘‍♀️' },
  'aquafitness': { label: 'Aquafitness', color: 'success', icon: '💪' },
  'grupo_preescolar': { label: 'Grupo Preescolar', color: 'warning', icon: '👶' },
  'grupo_escolar': { label: 'Grupo Escolar', color: 'cyan', icon: '🧒' },
  
  // Tipos adicionales por si aparecen en el futuro
  'matronatacion': { label: 'Matronatación', color: 'pink', icon: '👶' },
  'natacion_infantil': { label: 'Natación Infantil', color: 'indigo', icon: '🏊‍♀️' },
  'natacion_adultos': { label: 'Natación Adultos', color: 'purple', icon: '🏊‍♂️' }
};

// Mapear estados a colores
const statusConfig = {
  'Disponible': { color: 'success', bgClass: 'bg-green-100 dark:bg-green-900/30' },
  'Parcialmente ocupado': { color: 'warning', bgClass: 'bg-yellow-100 dark:bg-yellow-900/30' },
  'Lleno': { color: 'error', bgClass: 'bg-red-100 dark:bg-red-900/30' }
};

// Mapear días a orden
const dayOrder = {
  'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 
  'viernes': 5, 'sabado': 6, 'domingo': 7
};

export function DisponibilidadTable({ data, loading /**,viewType = "mensual"**/ }) {
  const [sorting, setSorting] = useState([
    { id: 'tipo', desc: false },
    { id: 'codigo', desc: false }
  ]);

  // Estado para el modal de alumnos
  const [modalState, setModalState] = useState({
    isOpen: false,
    grupoCodigo: '',
    horario: '',
    alumnos: [],
    alumnosMesAnterior: []
  });

  const openAlumnosModal = (row) => {
    // Parsear alumnos actuales
    let alumnosActuales = [];
    try {
      alumnosActuales = row.original.alumnos_actuales ? row.original.alumnos_actuales : [];
      if (!Array.isArray(alumnosActuales)) {
        alumnosActuales = [];
      }
    } catch (e) {
      console.error("Error parsing alumnos actuales:", e);
      alumnosActuales = [];
    }

    // Parsear alumnos del mes anterior
    let alumnosMesAnterior = [];
    try {
      alumnosMesAnterior = row.original.alumnos_mes_anterior ? row.original.alumnos_mes_anterior : [];
      if (!Array.isArray(alumnosMesAnterior)) {
        alumnosMesAnterior = [];
      }
    } catch (e) {
      console.error("Error parsing alumnos mes anterior:", e);
      alumnosMesAnterior = [];
    }

    setModalState({
      isOpen: true,
      grupoCodigo: row.original.codigo,
      horario: `${row.original.dia} ${row.original.hora_inicio} - ${row.original.hora_fin}`,
      alumnos: alumnosActuales.filter(a => a !== null),
      alumnosMesAnterior: alumnosMesAnterior.filter(a => a !== null)
    });
  };

  const closeAlumnosModal = () => {
    setModalState({
      isOpen: false,
      grupoCodigo: '',
      horario: '',
      alumnos: [],
      alumnosMesAnterior: []
    });
  };

  // Definir columnas
  const columns = useMemo(() => [
    {
      accessorKey: 'codigo',
      header: 'Código',
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
      accessorKey: 'dia',
      header: 'Día',
      cell: ({ getValue }) => (
        <div className="text-center">
          <span className="capitalize font-medium">
            {getValue()}
          </span>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const dayA = dayOrder[rowA.original.dia] || 8;
        const dayB = dayOrder[rowB.original.dia] || 8;
        return dayA - dayB;
      }
    },
    {
      accessorKey: 'horario',
      header: 'Horario',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <span className="font-mono text-sm">
            {row.original.hora_inicio} - {row.original.hora_fin}
          </span>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const timeA = rowA.original.hora_inicio;
        const timeB = rowB.original.hora_inicio;
        return timeA.localeCompare(timeB);
      }
    },
    {
      accessorKey: 'profesor_asignado',
      header: 'Profesor',
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <AcademicCapIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {getValue() || 'Sin asignar'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'cupos',
      header: 'Cupos',
      cell: ({ row }) => {
        const usarAjustados = row.original.cupos_ocupados_ajustados !== undefined;
        const ocupados = usarAjustados ? row.original.cupos_ocupados_ajustados : row.original.cupos_ocupados;
        // const disponibles = usarAjustados ? row.original.cupos_disponibles_ajustados : row.original.cupos_disponibles;
        const reservaActiva = row.original.reserva_activa;
        const alumnosMesAnterior = row.original.alumnos_mes_anterior_count || 0;
        
        return (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <UserGroupIcon className="w-4 h-4 text-gray-500" />
              <button
                onClick={() => openAlumnosModal(row)}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                title="Ver detalles de alumnos"
              >
                {ocupados} / {row.original.cupo_maximo}
              </button>
            </div>
            {alumnosMesAnterior > 0 && (
              <div className={`text-xs px-2 py-1 rounded-full mb-1 ${
                reservaActiva ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {alumnosMesAnterior} reserva(s) {reservaActiva ? 'activas' : 'liberadas'}
              </div>
            )}
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((ocupados / row.original.cupo_maximo) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'cupos_disponibles',
      header: 'Disponibles',
      cell: ({ row }) => {
        const usarAjustados = row.original.cupos_disponibles_ajustados !== undefined;
        const disponibles = usarAjustados ? row.original.cupos_disponibles_ajustados : row.original.cupos_disponibles;
        
        return (
          <div className="text-center">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {disponibles}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'porcentaje_ocupacion',
      header: 'Ocupación',
      cell: ({ row }) => {
        const usarAjustados = row.original.porcentaje_ocupacion_ajustado !== undefined;
        const percentage = usarAjustados ? row.original.porcentaje_ocupacion_ajustado : row.original.porcentaje_ocupacion;
        
        let colorClass = 'text-green-600 dark:text-green-400';
        
        if (percentage >= 80) {
          colorClass = 'text-red-600 dark:text-red-400';
        } else if (percentage >= 60) {
          colorClass = 'text-yellow-600 dark:text-yellow-400';
        }

        return (
          <div className="text-center">
            <span className={`text-lg font-semibold ${colorClass}`}>
              {percentage}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'estado_disponibilidad',
      header: 'Estado',
      cell: ({ getValue }) => {
        const estado = getValue();
        const config = statusConfig[estado] || { color: 'primary', bgClass: '' };
        
        return (
          <div className="flex justify-center">
            <Badge color={config.color}>
              {estado}
            </Badge>
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
        pageSize: 10,
      },
    },
  });

  const visibleRows = table.getRowModel().rows;
  const hasData = data.length > 0;

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-dark-300">Cargando datos...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header de la tabla */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">
              Disponibilidad de Cupos
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              {hasData ? `${data.length} grupos encontrados` : 'No hay datos para mostrar'}
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
              visibleRows.map((row) => {
                const estado = row.original.estado_disponibilidad;
                const config = statusConfig[estado] || { bgClass: '' };
                
                return (
                  <Tr
                    key={row.id}
                    className={`border-b border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-800/50 ${config.bgClass}`}
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
                    <UserGroupIcon className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">
                        No hay datos disponibles
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        No se encontraron grupos con los criterios seleccionados
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

      {/* Modal de alumnos */}
      <AlumnosModal
        isOpen={modalState.isOpen}
        onClose={closeAlumnosModal}
        grupoCodigo={modalState.grupoCodigo}
        horario={modalState.horario}
        alumnos={modalState.alumnos}
        alumnosMesAnterior={modalState.alumnosMesAnterior}
      />
    </Card>
  );
}

DisponibilidadTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  viewType: PropTypes.oneOf(['mensual', 'rango'])
};