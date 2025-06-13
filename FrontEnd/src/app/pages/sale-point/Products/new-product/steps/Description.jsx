// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import {  useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { Button, Textarea } from "components/ui";
import { useAddProductFormContext } from "../AddProductFormContext";
import { descriptionSchema } from "../schema";

// ----------------------------------------------------------------------



export function Description({ setCurrentStep }) {
  const addProductFormCtx = useAddProductFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    // control,
  } = useForm({
    resolver: yupResolver(descriptionSchema),
    defaultValues: addProductFormCtx.state.formData.description,
  });

  const onSubmit = (data) => {
    addProductFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { description: { ...data } },
    });
    addProductFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { description: { isDone: true } },
    });
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div>
        <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
          <span>Product Description</span>
        </h6>
        <div className="mt-3 space-y-4">
          <Textarea
            rows={4}
            {...register("description")}
            label="Descripción del producto"
            error={errors?.description?.message}
            placeholder="Ingresa una breve descripción del producto"
          />
        </div>
      </div>


      <div className="mt-4 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(0)}>
          Anterior
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Siguiente
        </Button>
      </div>
    </form>
  );
}

Description.propTypes = {
  setCurrentStep: PropTypes.func,
};
