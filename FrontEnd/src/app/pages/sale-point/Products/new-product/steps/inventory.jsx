// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input } from "components/ui";
import { useAddProductFormContext } from "../AddProductFormContext";
import { inventorySchema } from "../schema";

// ----------------------------------------------------------------------

export function Inventory({ setCurrentStep }) {
  const addProductFormCtx = useAddProductFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    // control,
  } = useForm({
    resolver: yupResolver(inventorySchema),
    defaultValues: addProductFormCtx.state.formData.inventory,
  });

  const onSubmit = (data) => {
    addProductFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { inventory: { ...data } },
    });
    addProductFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { inventory: { isDone: true } },
    });
    setCurrentStep(3);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="flex grow flex-col"
    >
      <div>
        <h6 className="dark:text-dark-100 mb-4 text-base font-medium text-gray-800">
          <span>Inventario Inicial</span>
        </h6>
        <div className="grow space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("stock")}
              label="Existencia*"
              error={errors?.stock?.message}
              placeholder="Existencia del prodocuto"
            />
            <Input
              {...register("minimum_stock")}
              label={
                <>
                  Existencia minima {" "}
                  <span className="text-xs text-gray-400 dark:text-dark-300">
                    (opcional)
              </span>
                </>
              }
              error={errors?.minimum_stock?.message}
              placeholder="Ingrese la existencia mínima"
            />
            <Input
              {...register("maximum_stock")}
              label={
                <>
                  Existencia Maxima {" "}
                  <span className="text-xs text-gray-400 dark:text-dark-300">
                    (opcional)
              </span>
                </>
              }
              error={errors?.maximum_stock?.message}
              placeholder="Ingrese la existencia mínima"
            />
          </div>

        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(1)}>
          Anterior
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Siguiente
        </Button>
      </div>
    </form>
  );
}

Inventory.propTypes = {
  setCurrentStep: PropTypes.func,
};
