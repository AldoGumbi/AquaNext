// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { useState} from "react";

// react-redux
import { useDispatch } from 'react-redux';


// Local Imports
import { Button, GhostSpinner } from "components/ui";
import { useAddProductFormContext } from "../AddProductFormContext";
import { CoverImageUpload } from "../components/CoverImageUpload";
import { imageSchema } from "../schema";
import {addProductThunk} from "slices/thunk.js";

import { toast} from "react-toastify";

// ----------------------------------------------------------------------




export function Images({ setCurrentStep, setFinished }) {
  const dispatch = useDispatch();


  const addProductFormCtx = useAddProductFormContext();

  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    setError,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(imageSchema),
    defaultValues: addProductFormCtx.state.formData.images,
  });



  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const base64 = data.cover.base64;

      if(!base64) {
        toast.error("Por favor, sube una imagen de portada.");
        return;
      }

      // 1. Actualiza el contexto local (síncrono)
       await addProductFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { images: { cover: base64 } },
      });
      addProductFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { images: { isDone: true } },
      });

      console.log(addProductFormCtx.state.formData);

      // 2. Dispatch asíncrono con manejo de errores
      await dispatch(addProductThunk({
        ...addProductFormCtx.state.formData,
        images: { cover: base64 },
      })).unwrap();

      // 3. Solo se ejecuta si el thunk tuvo éxito
      setFinished(true);

    } catch (error) {
      if(error?.error?.API?.code === 1062){
        // Error de duplicado de SKU
        toast.error("El SKU del producto ya existe, por favor utiliza otro.");
        setCurrentStep(0);
        setError("sku", {
          type: "manual",
          message: "El SKU del producto ya existe, por favor utiliza otro.",
        })
      }
      // console.error("Error al enviar el producto:", error);
    } finally {
      setLoading(false); // Siempre desactiva el loading
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="space-y-4">
        <Controller
          render={({ field }) => (
            <CoverImageUpload
              label="Imagen del producto"
              classNames={{
                box: "mt-1.5",
              }}
              error={errors?.cover?.message}
              {...field}
            />
          )}
          name="cover"
          control={control}
        />

      </div>

      <div className="mt-4 flex justify-end space-x-3 ">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(1)}>
          Anterior
        </Button>
        <Button
          type="submit"
          className="min-w-[7rem] space-x-2 "
          color="primary"
          disabled={loading}
        >
          {loading && <GhostSpinner className="size-4 border-2" />}
          <span>Agregar</span>
        </Button>
      </div>
    </form>
  );
}

Images.propTypes = {
  setCurrentStep: PropTypes.func,
  setFinished: PropTypes.func,
};
