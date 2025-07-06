import { useEffect } from "react";
import PropTypes from "prop-types";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { inscripcionSchema } from "../schema";

// UI Components
import { DatePicker } from "components/shared/form/Datepicker";
import { Button, Input } from "components/ui";
import { insertBasketItemsThunk, createBasketThunk } from "slices/thunk";
import { toast } from "react-toastify";

// Constantes
const INSCRIPCION_COSTO = 300;

function formatDateToDMY(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function PersonalInfo() {
  const dispatch = useDispatch();
  const { activeBasket } = useSelector((state) => state.basket);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(inscripcionSchema),
    defaultValues: {
      startDate: "",
      years: 1,
      coupon: "",
    },
  });

  const startDate = watch("startDate");
  const years = watch("years");

  useEffect(() => {
    if (startDate && years) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setFullYear(start.getFullYear() + parseInt(years));
      setValue("endDate", end.toISOString().split("T")[0]);
    }
  }, [startDate, years, setValue]);

  const onSubmit = async (data) => {
    if (!activeBasket) {
      await dispatch(createBasketThunk({ user_id: 1 }));
      toast.info("Se creó una nueva canasta. Vuelve a intentar agregar la inscripción.");
      return;
    }

    const total = data.years * INSCRIPCION_COSTO;
    const fechaInicio = formatDateToDMY(data.startDate);
    const fechaFin = formatDateToDMY(data.endDate);

    const inscripcionItem = {
      basketId: activeBasket,
      product_id: 9,
      quantity: 1,
      comment: `Inscripción de ${data.years} año(s): ${fechaInicio} a ${fechaFin}`,
      img: "/images/icons/inscripcion.png",
      name: `Inscripción (${fechaInicio} - ${fechaFin})`,
      price: total,
    };

    dispatch(insertBasketItemsThunk(inscripcionItem))
      .unwrap()
      .then(() => toast.success("Inscripción agregada a la lista correctamente"))
      .catch(() => toast.error("Error al agregar inscripción. Intenta de nuevo."));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Fecha de inicio*"
              error={errors?.startDate?.message}
              placeholder="Selecciona fecha de inicio"
              options={{ disableMobile: true }}
            />
          )}
        />

        <Input
          label="Fecha fin"
          disabled
          {...register("endDate")}
          placeholder="Se calcula automáticamente"
        />

        <Input
          type="number"
          label="Cantidad de años*"
          min={1}
          {...register("years", { valueAsNumber: true })}
          placeholder="Ej. 1, 2, 3"
          error={errors?.years?.message}
        />

        <Input
          {...register("coupon")}
          label="Cupón (opcional)"
          placeholder="Código de cupón"
          error={errors?.coupon?.message}
        />

        <div className="md:col-span-2">
          <span className="block text-sm text-gray-600 dark:text-dark-200">
            Importe total estimado:
          </span>
          <span className="font-semibold text-base text-gray-900 dark:text-dark-100">
            ${parseInt(years || 0) * INSCRIPCION_COSTO} MXN
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" color="primary" className="min-w-[10rem]">
          Agregar a la lista
        </Button>
      </div>
    </form>
  );
}

PersonalInfo.propTypes = {
  setCurrentTab: PropTypes.func,
};
