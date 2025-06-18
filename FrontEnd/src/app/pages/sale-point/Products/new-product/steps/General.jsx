// Import Dependencies
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";

// Local Imports
import { Listbox } from "components/shared/form/Listbox";
import { Button, Input, Switch } from "components/ui";
import { useAddProductFormContext } from "../AddProductFormContext";
import { generalSchema } from "../schema";
import { skuCheckAvailabilityThunk } from "../../../../../../slices/products/thunk.js";
import { useDispatch } from "react-redux";

// ----------------------------------------------------------------------

const categories = [
  {
    id: "cafeteria",
    label: "Cafetería",
  },
  {
    id: "articulo_deportivo",
    label: "Artículo Deportivo",
  },
  {
    id: "accesorios",
    label: "Accesorios",
  },
  {
    id: "otros",
    label: "Otros",
  },
];

export function General({ setCurrentStep }) {
  const dispatch = useDispatch();
  const addProductFormCtx = useAddProductFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setError,
    clearErrors,
    setValue,
  } = useForm({
    resolver: yupResolver(generalSchema),
    defaultValues: addProductFormCtx.state.formData.general,
  });

  const onSubmit = (data) => {
    addProductFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { general: { ...data } },
    });
    addProductFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { general: { isDone: true } },
    });
    setCurrentStep(1);
  };
  // check SKU availability
  const handleSkuCheckAvailability = async (sku) => {
    try {
      if (sku.length > 0) {
        // Primero valida con Yup
        await generalSchema.validateAt("sku", { sku });

        // Luego verifica disponibilidad con Redux
        await dispatch(skuCheckAvailabilityThunk(sku)).unwrap();

        // Si pasa ambas validaciones, limpia errores
        clearErrors("sku");
      }
    } catch (error) {
      // se limpia el input de SKU si hay un error
      setValue("sku", "", {});

      if (error?.error?.status === 409) {
        setError("sku", {
          type: "manual",
          message: "El SKU ya existe. Por favor, usa otro.",
        });
      }
      // Esto conserva los errores de Yup automáticamente
      else if (error.name === "ValidationError") {
        return;
      } else {
        setError("sku", {
          type: "manual",
          message: "Error al validar el SKU",
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="flex grow flex-col"
    >
      <div className="grow space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("name")}
            label="Nombre del Producto*"
            error={errors?.name?.message}
            placeholder="Ingresa el nombre del producto"
          />
          <Input
            {...register("sku")}
            label="Sku del Producto*"
            error={errors?.sku?.message}
            placeholder="Ingresa el skue del producto"
            onBlur={(e) => handleSkuCheckAvailability(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("price")}
            label="Precio del Producto*"
            type="number"
            error={errors?.price?.message}
            placeholder="Ingrese el precio del producto $(0.00)"
          />
          <Input
            {...register("cost")}
            label="Costo del Producto*"
            error={errors?.cost?.message}
            type="number"
            placeholder="Ingrese el costo del producto $(0.00)"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            render={({ field: { value, onChange, ...rest } }) => (
              <Listbox
                data={categories}
                value={categories.find((cat) => cat.id === value) || null}
                onChange={(val) => onChange(val.id)}
                label="Categoria*"
                placeholder="Categoria del Producto"
                displayField="label"
                error={errors?.category_id?.message}
                {...rest}
              />
            )}
            control={control}
            name="category_id"
          />
        </div>

        <Switch label="Disponible" {...register("is_available")} />
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <Button className="min-w-[7rem]">Cancelar</Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Siguiente
        </Button>
      </div>
    </form>
  );
}

General.propTypes = {
  setCurrentStep: PropTypes.func,
};
