// Local Imports
import { DatePicker } from "components/shared/form/Datepicker";
import { Card } from "components/ui";
import { useState } from "react";
import { Spanish } from "flatpickr/dist/l10n/es";


// ----------------------------------------------------------------------

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  const datePickerOptions = {
    // Establece la fecha actual por defecto
    defaultDate: new Date(),
    onChange: (selectedDates) => {
      setSelectedDate(selectedDates[0]);
    },
    locale: Spanish,
  };

  return (
    <>
      <Card className="flex items-center justify-center overflow-hidden p-2 [&_.flatpickr-calendar]:min-w-full">
        <DatePicker isCalendar options={datePickerOptions} />
      </Card>
      {selectedDate && (
        <div className="mt-4 text-center">
          Fecha seleccionada: {selectedDate.toLocaleDateString()}
        </div>
      )}
    </>
  );
}
