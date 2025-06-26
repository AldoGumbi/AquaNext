// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { BanknoteArrowUp  } from 'lucide-react'
import { toast } from "sonner";

// Local Imports
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { Button, Card, Input } from "components/ui";
// import { ContextualHelp } from "components/shared/ContextualHelp";
// import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";


import { OpenCashRegisterThunk } from 'slices/thunk'
// Redux Imports
import { useDispatch } from "react-redux";
import { useAuthContext } from "app/contexts/auth/context";


// ----------------------------------------------------------------------

const initialState = {
  amount_opening: "",
  shift: "",
};


const categories = [
  {
    id: "matutino",
    label: "Turno Matutino",
  },
  {
    id: "vespertino",
    label: "Turno Despertino",
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
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialState,
  });
  const { user } = useAuthContext();


  const onSubmit = (data) => {

    if (!user) {
      toast.error("No se pudo obtener el usuario autenticado.");
      return;
    }
    
    const payload = {
      ...data,
      user_id : user.id,
    }
    
    console.log(payload);
    dispatch(OpenCashRegisterThunk(payload));
    toast("New Post Published. Now you can add new one", {
      invert: true,
    });
    reset();
  };



  return (
    <Page title="Iniciar Caja ">
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex-col flex">
            <div className="flex items-center gap-1">
              <BanknoteArrowUp className="size-6" />
              <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
                Iniciar Caja de corte
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              Completa el formulario para iniciar una nueva caja
            </p>
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
                    label="Cantidad para abrir*"
                    placeholder="Ingrese la cantidad para abrir la caja"
                    {...register("amount_opening")}
                    error={errors?.amount_opening?.message}
                  />
                  <Controller
                    render={({ field }) => (
                      <Listbox
                        data={categories}
                        value={
                          categories.find((cat) => cat.id === field.value) || null
                        }
                        onChange={(val) => field.onChange(val.id)}
                        name={field.name}
                        label="Turno responsable*"
                        placeholder="Selecciona el horario de la caja"
                        displayField="label"
                        error={errors?.shift?.message}
                      />
                    )}
                    control={control}
                    name="shift"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="min-w-[7rem]"
                      color="primary"
                      type="submit"
                      form="new-post-form"
                    >
                      Abrir Caja
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </form>
      </div>
    </Page>
  );
};

export default NewPostFrom;
