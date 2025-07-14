// Importar dependencias
import PropTypes from "prop-types";
import { TbPinned, TbPinnedOff } from "react-icons/tb";

// Importaciones locales
import { Button, Checkbox, Switch } from "components/ui";

// ----------------------------------------------------------------------

export function TableSettings({ table }) {
  const tableSettings = table.getState().tableSettings;
  const setTableSettings = table.options.meta.setTableSettings;

  return (
    <>
      {Object.keys(tableSettings).length > 0 && (
        <div className="mb-4 mt-3 flex flex-col items-start space-y-2 px-3 text-gray-600 dark:text-dark-100">
          {Object.prototype.hasOwnProperty.call(tableSettings, "enableFullScreen") && (
            <Switch
              label="Pantalla completa"
              checked={tableSettings.enableFullScreen}
              onChange={(e) =>
                setTableSettings((state) => ({
                  ...state,
                  enableFullScreen: e.target.checked,
                }))
              }
              className="h-4 w-8"
            />
          )}

          {Object.prototype.hasOwnProperty.call(tableSettings, "enableRowDense") && (
            <Switch
              label="Filas compactas"
              checked={tableSettings.enableRowDense}
              onChange={(e) =>
                setTableSettings((state) => ({
                  ...state,
                  enableRowDense: e.target.checked,
                }))
              }
              className="h-4 w-8"
            />
          )}

          {Object.prototype.hasOwnProperty.call(tableSettings, "enableColumnFilters") && (
            <Switch
              label="Filtros por columna"
              checked={tableSettings.enableColumnFilters}
              onChange={(e) => {
                setTableSettings((state) => ({
                  ...state,
                  enableColumnFilters: e.target.checked,
                }));

                table.resetColumnFilters();
              }}
              className="h-4 w-8"
            />
          )}

          {Object.prototype.hasOwnProperty.call(tableSettings, "enableSorting") && (
            <Switch
              label="Ordenamiento"
              checked={tableSettings.enableSorting}
              onChange={(e) => {
                setTableSettings((state) => ({
                  ...state,
                  enableSorting: e.target.checked,
                }));
                table.resetSorting();
              }}
              className="h-4 w-8"
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 px-3 ">
        <p className="text-tiny uppercase">visibilidad de columnas</p>
        <hr className="flex-1 border-gray-300 dark:border-dark-500" />
      </div>

      <div className="mt-3 flex max-h-[50vh] flex-col space-y-2 overflow-y-auto overscroll-y-contain px-3 pb-3 text-gray-600 dark:text-dark-100">
        {table
          .getAllLeafColumns()
          .filter((column) => !column.columnDef?.isHiddenColumn)
          .map((column) => (
            <div
              className="flex items-center justify-between ltr:-mr-2 rtl:-ml-2"
              key={column.id}
            >
              <Checkbox
                label={column?.columnDef?.label || column.id}
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
                className="size-4.5"
              />
              {column.getCanPin() &&
                (column.getIsPinned() ? (
                  <Button
                    onClick={() => column.pin(false)}
                    variant="flat"
                    className="size-6 rounded-full"
                    isIcon
                    title="Desanclar columna"
                    aria-label="Desanclar columna"
                  >
                    <TbPinnedOff className="size-4" />
                  </Button>
                ) : (
                  <div className="flex">
                    <Button
                      onClick={() => {
                        column.pin("left");
                      }}
                      variant="flat"
                      className="size-6 rounded-full rtl:rotate-180"
                      isIcon
                      title="Anclar a la izquierda"
                      aria-label="Anclar a la izquierda"
                    >
                      <TbPinned className="size-4 rotate-90" />
                    </Button>

                    <Button
                      onClick={() => {
                        column.pin("right");
                      }}
                      variant="flat"
                      className="size-6 -rotate-90 rounded-full"
                      isIcon
                      title="Anclar a la derecha"
                      aria-label="Anclar a la derecha"
                    >
                      <TbPinned className="size-4 rtl:rotate-180" />
                    </Button>
                  </div>
                ))}
            </div>
          ))}
      </div>

      <Button
        variant="flat"
        className="h-9 w-full shrink-0 rounded-t-none border-t border-gray-300 text-xs-plus leading-none dark:border-dark-500"
        onClick={() => table.resetColumnVisibility()}
      >
        Mostrar todas las columnas
      </Button>
    </>
  );
}

TableSettings.propTypes = {
  table: PropTypes.object,
};
