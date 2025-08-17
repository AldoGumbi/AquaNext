// CardLine.jsx
import { Card } from "components/ui";

export function CardLine({
  title = "Daily traffic",
  value = "4.54",
  suffix = "",
  color = "info",
  size = "sm",
  className = "",
  onClick,
  disabled = false,
  ...rest
}) {
  const colorCtx =
    color === "primary" ? "this:primary" :
    color === "secondary" ? "this:secondary" :
    color === "success" ? "this:success" :
    color === "warning" ? "this:warning" :
    color === "error" ? "this:error" :
    "this:info";

  const paddings   = size === "lg" ? "p-6" : "p-4";
  const valueSize  = size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl";
  const titleSize  = size === "lg" ? "text-sm" : "text-xs";
  const suffixSize = size === "lg" ? "text-sm" : "text-xs";

  const interactive =
    !!onClick && !disabled
      ? "cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white/20"
      : "cursor-default";

  return (
    <Card className={`overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        className={`flex w-full items-stretch ${paddings} ${interactive} bg-gray-800 text-gray-300`}
        {...rest}
      >
        {/* Barra/acento izquierda */}
        <div className={`${colorCtx} w-1 shrink-0 bg-this dark:bg-this-light`} />

        {/* Contenido en columna, alineado a la izquierda */}
        <div className="ml-4 flex flex-col items-start flex-1">
          <div className="flex items-baseline gap-x-2">
            {/* Usa text-current para heredar blanco del botón */}
            <p className={`${valueSize} font-semibold text-current`}>
              {value}
            </p>
            {suffix ? <p className={`${suffixSize} text-current/80`}>{suffix}</p> : null}
          </div>
          {title ? (
            <p className={`${titleSize} mt-1 text-white/70`}>
              {title}
            </p>
          ) : null}
        </div>
      </button>
    </Card>
  );
}
