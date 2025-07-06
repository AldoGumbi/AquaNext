// Import Dependencies
import { useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, Select } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { useKYCFormContext } from "../KYCFormContext";
import { inscripcionSchema } from "../schema.js";

// ----------------------------------------------------------------------

const classTypes = [
  "Grupales",
  "Nado libre",
  "Aquafitness",
  "Matronatación",
  "Adultos Mayores"
];

const grupalesOptions = ["Preescolar", "Escolar", "Adultos"];

export function AddressInfo({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();

  const {
    register,
    handleSubmit,
    control,
    watch,
  } = useForm({
    resolver: yupResolver(inscripcionSchema),
    defaultValues: kycFormCtx.state.formData.addressInfo,
  });

  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const startDate = watch("startDate");
  const monthsCount = watch("months") || 1;

  const monthLabel = useMemo(() => {
    if (!startDate) return "";
    const base = new Date(startDate);
    base.setMonth(base.getMonth() + currentMonthOffset);
    return base.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  }, [startDate, currentMonthOffset]);

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { addressInfo: { ...data } },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { addressInfo: { isDone: true } },
    });
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 m-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Controller
          name="classType"
          control={control}
          render={({ field }) => (
            <Select {...field} defaultValue={field.value}>
              <option value="">Tipo de clase</option>
              {classTypes.map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </Select>
          )}
        />

        <Controller
          name="subType"
          control={control}
          render={({ field }) => (
            <Select {...field} defaultValue={field.value}>
              <option value="">Subtipo (Grupales)</option>
              {grupalesOptions.map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </Select>
          )}
        />
      </div>

      <div className="mt-6 m-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              placeholder="Fecha inicio"
              options={{ disableMobile: true }}
            />
          )}
        />

        <Input
          {...register("months")}
          type="number"
          min={1}
          placeholder="Cantidad"
        />

        <div className="flex items-center justify-between">
          <Button type="button" onClick={() => setCurrentMonthOffset((prev) => Math.max(prev - 1, 0))}>
            ◀
          </Button>
          <span className="text-center font-medium capitalize text-sm">{monthLabel}</span>
          <Button type="button" onClick={() => setCurrentMonthOffset((prev) => Math.min(prev + 1, monthsCount - 1))}>
            ▶
          </Button>
        </div>
      </div>

      {/* Tabla de días de la semana con horarios y profesor */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
          <div key={day} className="p-3 rounded-lg bg-dark">
            <div className="text-center font-bold text-light">{day}</div>
            <div className="flex flex-col space-y-2">
              <Controller
                name={`schedule.${day}.time`}
                control={control}
                render={({ field }) => (
                  <Select {...field} defaultValue={field.value}>
                    <option value="">Horario</option>
                    <option value="4:00pm">4:00pm</option>
                    <option value="5:00pm">5:00pm</option>
                    <option value="6:00pm">6:00pm</option>
                  </Select>
                )}
              />

              <Input
                {...register(`schedule.${day}.teacher`)}
                placeholder="Profesor"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Cupón y total */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Input {...register("coupon")} placeholder="Cupón (opcional)" label="Cupón de descuento" />
        <div className="flex flex-col justify-end">
          <span className="text-sm text-gray-500 dark:text-dark-300">Importe Total</span>
          <span className="text-xl font-bold text-gray-800 dark:text-dark-100">
            $ {watch("months") * 600 || 0} MXN
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-8 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(0)}>
          Regresar
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Siguiente
        </Button>
      </div>
    </form>
  );
}

AddressInfo.propTypes = {
  setCurrentStep: PropTypes.func,
};

{/*
Una consulta para mostrar los tipos de clases
Una consulta para mostrar los tipos de niveles en grupales
Una consulta para mostrar los horarios disponibles en cada día
Una consulta para enlistar a los profesores disponibles por día
Una consulta para verificar disponibilidad de horarios en ese mes
Una consulta para verificar disponibilidad de horario en los siguientes meses seleccionados
Una consulta para enlistar los cupones de descuento
Una consulta para dejar disabled si no hay días disponibles para una clase

Una insercion a la tabla de inscripciones
Una insercion a la tabla de mensualidades
Una insercion a la tabla de clases por cada clase que tomara el alumno en las fechas seleccionadas
Una insercion a la tabla de tickets (o ventas)
Generar un ticket con cada mensualidad registrada (por cada mes)

Consideraciones para el modulo de cambiar clase en mensualidad posterior al mes corriente
Consideraciones al eliminar una mensualidad (administrador) para tambien borrar las clases de esa mensualidad


Consideraciones de que pasa si un día especifico, una clase especifica no se puede tomar
Consideraciones de cupos llenos en un mes en ese plan mensualidad
Consideraciones de que no haya profesores disponibles para una clase en un día especifico
Consideraciones para las clases personalizadas
  */}