// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Percent } from 'lucide-react'
import { toast } from "sonner";

// Local Imports
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { Button, Card, Input } from "components/ui";
import { ContextualHelp } from "components/shared/ContextualHelp";
import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";
import { useEffect } from "react";

import { CreateCouponThunk } from 'slices/thunk'
// Redux Imports
import { useDispatch } from "react-redux";



// ----------------------------------------------------------------------

const initialState = {
  name: "",
  code: "",
  discount_type: "",
  discount_amount: null,
  discount_porcentaje: null,
  max_uses: null,
  start_day: "",
  expiration_day: "",
};


const categories = [
  {
    id: "porcentaje",
    label: "Porcentaje - %",
  },
  {
    id: "cantidad",
    label: "Cantidad Neta - $",
  },
];


const NewPostFrom = () => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialState,
  });

  const selectedCategoryId = watch("discount_type");


  useEffect(() => {
    trigger(['discount_amount', 'discount_porcentaje']);
  }, [selectedCategoryId, trigger]);

  const onSubmit = (data) => {
    console.log(data);
    dispatch(CreateCouponThunk(data));
    toast("New Post Published. Now you can add new one", {
      invert: true,
    });
    reset();
  };

  const renderCategoryOptions = () => {
    if(selectedCategoryId === "cantidad" ) {
      return (
        <div className="max-w-xl space-y-1.5">
          <label htmlFor="discount_amount" className="block">Cantidad Neta</label>

          {/* Grupo completo del input */}
          <div className="flex flex-col">
            <div className="flex -space-x-px">
              {/* Prefijo $ */}
              <div className="flex items-center justify-center border border-gray-300 px-3.5 dark:border-dark-450 ltr:rounded-l-lg rtl:rounded-r-lg">
                <span className="leading-none">$</span>
              </div>

              {/* Input principal */}
              <Controller
                name="discount_amount"
                control={control}
                render={({ field }) => (
                  <div className="flex-1">
                    <Input
                      {...field}
                      autoComplete="off"
                      id="discount_amount"
                      placeholder="30"
                      classNames={{
                        root: "w-full",
                        input: "relative hover:z-1 focus:z-1 rounded-none",
                      }}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </div>
                )}
              />

              {/* Sufijo .00 */}
              <div className="flex items-center justify-center border border-gray-300 px-3.5 dark:border-dark-450 ltr:rounded-r-lg rtl:rounded-l-lg">
                <span className="leading-none">.00</span>
              </div>
            </div>

            {/* Mensaje de error - ahora fuera del grupo flex */}
            {errors?.discount_amount?.message && (
              <p className="text-sm text-red-500 mt-1 pl-2">
                {errors.discount_amount.message}
              </p>
            )}
          </div>
        </div>
      )
    }else if(selectedCategoryId === "porcentaje") {
      return (
        <div className="max-w-xl space-y-1.5">
          <label htmlFor="discount_porcentaje" className="block">Porcentaje</label>

          <div className="flex flex-col">
            <div className="flex -space-x-px">
              {/* Prefijo % con bordes redondeados solo a la izquierda */}
              <div className="flex items-center justify-center border border-gray-300 px-3.5 dark:border-dark-450 rounded-l-lg">
                <span className="leading-none">%</span>
              </div>

              {/* Input con bordes redondeados solo a la derecha */}
              <Controller
                name="discount_porcentaje"
                control={control}
                render={({ field }) => (
                  <div className="flex-1">
                    <Input
                      {...field}
                      autoComplete="off"
                      id="discount_porcentaje"
                      placeholder="50"
                      classNames={{
                        root: "w-full",
                        input: "relative hover:z-1 focus:z-1 rounded-r-lg rounded-l-none",
                      }}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </div>
                )}
              />
            </div>

            {errors?.discount_porcentaje?.message && (
              <p className="text-sm text-red-500 mt-1 pl-2">
                {errors.discount_porcentaje.message}
              </p>
            )}
          </div>
        </div>
      )
    }else{
      return null;
    }
  }


  return (
    <Page title="Nuevo Cupon">
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <Percent  className="size-6" />
            <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
              Nuevo Código de Descuento
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              className="min-w-[7rem]"
              color="primary"
              type="submit"
              form="new-post-form"
            >
              Registrar
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="new-post-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-5">
              <Card className="p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  General
                </h3>
                <div className="mt-5 space-y-5">
                  <Input
                    label="Nombre*"
                    placeholder="Nombre del código de descuento"
                    {...register("name")}
                    error={errors?.name?.message}
                  />

                  <Input
                    label="Código*"
                    placeholder="Ingresa el código de descuento"
                    {...register("code")}
                    error={errors?.code?.message}
                  />
                </div>
              </Card>
              <Card className="p-4 sm:px-5">
                <h6 className="flex space-x-1.5 text-base font-medium text-gray-800 dark:text-dark-100 ">
                  <span>Tipo de descuento</span>
                  <ContextualHelp
                    title="Tipo de descuento*"
                    anchor={{ to: "bottom", gap: 8 }}
                    content={
                      <p>
                        El tipo de descuento determina cómo se aplicará el descuento al total de la compra. Puedes elegir entre un porcentaje o una cantidad fija.
                      </p>
                    }
                  />
                </h6>

                <div className="mt-3 space-y-5">
                  <Controller
                    render={({ field }) => (
                      <Listbox
                        data={categories}
                        value={
                          categories.find((cat) => cat.id === field.value) || null
                        }
                        onChange={(val) => field.onChange(val.id)}
                        name={field.name}
                        label="Descuento de*"
                        placeholder="Selecciona el tipo de descuento"
                        displayField="label"
                        error={errors?.discount_type?.message}
                      />
                    )}
                    control={control}
                    name="discount_type"
                  />

                  {/* Conditional rendering based on discount type */}
                  <div className="flex space-x-4">
                    {renderCategoryOptions()}
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
              <Card className="space-y-5 p-4 sm:px-5">


                <Input
                  autoComplete="off"
                  label="Usos Máximos*"
                  id="max_uses"
                  placeholder="30"
                  {...register("max_uses")}
                  error={errors?.max_uses?.message}
                  classNames={{
                    root: "flex-1",
                    input: "relative  hover:z-1 focus:z-1 rounded-lg",
                  }}
                />


                <Controller
                  render={({ field: { onChange,
                    value,
                    ...rest } }) => (
                    <DatePicker
                      onChange={onChange}
                      value={value || ""}
                      label="Fecha de inicio*"
                      error={errors?.start_day?.message}
                      options={{ disableMobile: true }}
                      placeholder="Seleccione la fecha..."
                      {...rest}
                    />
                  )}
                  control={control}
                  name="start_day"
                />
                <Controller
                  render={({ field: { onChange,
                    value,
                    ...rest } }) => (
                    <DatePicker
                      onChange={onChange}
                      value={value || ""}
                      label="Fecha de expiración*"
                      error={errors?.expiration_day?.message}
                      options={{ disableMobile: true }}
                      placeholder="Seleccione la fecha..."
                      {...rest}
                    />
                  )}
                  control={control}
                  name="expiration_day"
                />
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
};

export default NewPostFrom;
