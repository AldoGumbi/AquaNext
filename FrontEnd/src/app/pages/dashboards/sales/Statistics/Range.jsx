// Range.jsx
import { DatePicker } from "components/shared/form/Datepicker";
import { Card } from "components/ui";
import { Spanish } from "flatpickr/dist/l10n/es.js";

const Range = ({ onChange }) => {
  return (
    <Card className="flex items-center justify-center overflow-hidden p-2 [&_.flatpickr-calendar]:min-w-full">
      <DatePicker
        options={{
          mode: "range",
          dateFormat: "d/m/Y",   // formato estilo ES
          locale: Spanish,       // idioma español
          defaultDate: [new Date(), new Date()], // hoy–hoy (cámbialo a [new Date()] si quieres solo inicio)
          // ⬇️ IMPORTANTE: flatpickr toma onChange desde options
            onChange: (selectedDates) => {
            if (typeof onChange === "function") onChange(selectedDates);
            },
        }}
        placeholder="Selecciona un rango..."
        // nota: ya no pasamos onChange aquí arriba, lo maneja options.onChange
      />
    </Card>
  );
};

export { Range };
