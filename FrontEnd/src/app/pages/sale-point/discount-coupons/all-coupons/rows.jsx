// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Highlight } from "components/shared/Highlight";
import { ensureString } from "utils/ensureString";

// ----------------------------------------------------------------------
export function OrderIdCell({ getValue, column, table }) {
  // (1) get the value from the row
  const val = getValue();
  const [nombre, codigo] = val
  .split(", ")
  .map((item) => (item === "null" ? null : item));

  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());

  return (
    <div className="flex flex-col gap-1 py-2">
      {/* Nombre principal */}
      <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize leading-tight">
        <Highlight query={[globalQuery, columnQuery]}>{nombre}</Highlight>
      </div>

      {/* Código secundario */}
      {codigo && (
        <div className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md inline-block w-fit border border-gray-200 dark:border-gray-700">
          <Highlight query={[globalQuery, columnQuery]}>{codigo}</Highlight>
        </div>
      )}
    </div>
  );
}

export function ExpirationDateCell({ getValue, column, table  }) {

  const dates = getValue();
  const [fecha_inicio, fecha_fin] = dates
  .split(", ")
  .map((item) => (item === "null" ? null : item));


  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());

  return (
    <div className="flex flex-col gap-0.5">
      <div>
        <span className="dark:text-dark-300 text-xs text-gray-500">
          Inicio:
        </span>
          <div>
            <Highlight  query={[globalQuery, columnQuery]}>{fecha_inicio}</Highlight>
          </div>
      </div>
      <div>
        <span className="dark:text-dark-300 text-xs text-gray-500">Vence:</span>
        <div>
          <Highlight  query={[globalQuery, columnQuery]}>{fecha_fin}</Highlight>
        </div>
      </div>
    </div>
  );
}

export function DateCell({ getValue }) {
  const timestapms = getValue();
  return (
    <>
      <p className="font-medium">{timestapms}</p>
    </>
  );
}

export function DiscountCell({ getValue, column, table }) {
  const val = getValue();
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  return (
    <Highlight query={[globalQuery, columnQuery]}>
        {val}
    </Highlight>
  );
}

export function UsageCell({ getValue }) {
  const { usos_actuales, usos_maximos } = getValue();
  const isFull = usos_actuales >= usos_maximos;

  return (
    <div className="flex flex-col">
      <p
        className={`font-medium ${
          isFull
            ? "text-red-500 dark:text-red-400"
            : "text-primary-600 dark:text-primary-400"
        }`}
      >
        {usos_actuales} / {usos_maximos} usos
      </p>
      <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-500">
        {isFull ? "Límite alcanzado" : "Aún disponible"}
      </p>
    </div>
  );
}


OrderIdCell.propTypes = {
  getValue: PropTypes.func,
};

ExpirationDateCell.prototypes = {
  getValue: PropTypes.func,
};

DiscountCell.propTypes = {
  getValue: PropTypes.func,
};

DateCell.propTypes = {
  getValue: PropTypes.func,
};

UsageCell.propTypes = {
  getValue: PropTypes.func,
};
