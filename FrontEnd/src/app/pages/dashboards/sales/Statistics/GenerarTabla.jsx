// Statistics/TablaInscripciones/GenerarTabla.jsx
// Enrutador de tablas: recibe el "tipo" y delega a OrdersTable con (tabla/opcion)

import { useMemo } from "react";
import { Card } from "components/ui";
import OrdersTable from "./OrdersTable"; // -> Statistics/OrdersTable/index.jsx

/**
 * Props:
 * - tipo: "inscripciones-vigentes" | "inscripciones-vencidas"
 * - tablaCompleta: any[]   // dataset crudo con TODAS las inscripciones
 * - rango?: { startISO?: string, endISO?: string } // opcional
 */
export default function GenerarTabla({ tipo, tablaCompleta = [], rango }) {
  // Mapeo de tipo -> { tabla, opcion, titulo }
  const { tabla, opcion, titulo } = useMemo(() => {
    switch (tipo) {
      case "inscripciones-vigentes":
        return {
          tabla: "inscripciones",
          opcion: "vigentes",
          titulo: "Inscripciones Vigentes",
        };
      case "inscripciones-vencidas":
        return {
          tabla: "inscripciones",
          opcion: "vencidas",
          titulo: "Inscripciones Vencidas",
        };
      default:
        return { tabla: null, opcion: null, titulo: "Selecciona una opción" };
    }
  }, [tipo]);

  // Estado vacío / sin selección
  if (!tipo || !tabla || !opcion) {
    return (
      <Card className="p-6 text-center text-sm text-gray-400">
        No hay una opción seleccionada. Elige un botón del dashboard para generar la tabla.
      </Card>
    );
  }

  return (
    
    <Card className="p-4">
      <div className="mb-3 text-base font-semibold text-gray-100">{titulo}</div>
      <OrdersTable
        tabla={tabla}
        opcion={opcion}
        data={tablaCompleta}
        rango={rango}
      />
    </Card>
  );
}
