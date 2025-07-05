// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { BanknoteArrowDown } from 'lucide-react'
import { toast } from "sonner";

// Local Imports
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { Button, Card, Input } from "components/ui";
// import { ContextualHelp } from "components/shared/ContextualHelp";
// import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";


import {
  CloseCashRegisterThunk,
  GetOpenCashRegisterThunk
} from 'slices/thunk'
// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "app/contexts/auth/context";
import { useEffect, useState } from "react";
// import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------




const categories = [
  {
    id: 1,
    label: "admin - caja 1",
  },
  {
    id: 2,
    label: "cajero 1 - caja 2",
  },
  {
    id: 3,
    label: "cajero 2 - caja 3",
  },
  {
    id: "3",
    label: "cajero 3 - caja 4",
  },
];


const CloseCashRegister = () => {
  // Get the open cash register from the Redux store
  const { openCashRegister } = useSelector((state) => state.cashRegister);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isAdmindin, setIsAdmin] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount_closing: 0,
      comment: "",
    },
  });

  // Get the open cash register from the api
  useEffect(() => {
    // Fetch the open cash register when the component mounts
    dispatch(GetOpenCashRegisterThunk());
  }, [dispatch]);

  //verify if the cash register is already open
  useEffect(() => {
    // If the open cash register is not found, set the modal to create a new one
    if (user.type == "admin") {
      setIsAdmin(true);
      return
    }
    if (openCashRegister === -1) {
      toast.info("No hay caja abierta, por favor inicie una nueva caja.", { autoClose: 5000 });
      setShouldRedirect(true);
      navigate("/sale-point/cash-register/open");

    }
  }, [openCashRegister, setShouldRedirect, setIsAdmin, user,navigate]);

  // // If the user dont have any open cash register, redirect to the open cash register page
  if (shouldRedirect) {
    // return <Navigate to="/sale-point/cash-register/open" />
    console.log("Redirecting to open cash register page");
  }


  const onSubmit = (data) => {

    if (!user) {
      toast.error("No se pudo obtener el usuario autenticado.");
      return;
    }

    if (openCashRegister <= 0) {
      toast.error("No se obtuvo el folio de la caja a cerrar, selecciona una caja.");
      return;
    }

    const payload = {
      ...data,
      cash_register_id: openCashRegister,
      user_id: user.id,
    }

    console.log(payload);
    dispatch(CloseCashRegisterThunk(payload));
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
              <BanknoteArrowDown className="size-6" />
              <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
                Corte de Caja
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-300">
              En el siguiente formulario podrás cerrar la caja de ventas,
              registrando el monto de cierre y algun comentario.
            </p>
          </div>

        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="close-cash-register"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-5">
              <Card className="p-4 sm:px-5">
                <div className="flex">
                  <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                    Cierre de Caja
                  </h3>
                  {openCashRegister !== -1 ? (
                    <span className="ml-2 text-sm text-gray-500 dark:text-dark-300">
                      # {openCashRegister}
                    </span>
                  ) : null}
                </div>
                <div className="mt-5 space-y-5">
                  {/* In case the use is admin we allowed to select any open cash register to closed */}
                  {isAdmindin ? (
                    <Controller
                      render={({ field }) => (
                        <Listbox
                          data={categories}
                          value={
                            categories.find((cat) => cat.id === field.value) || null
                          }
                          onChange={(val) => field.onChange(val.id)}
                          name={field.name}
                          label="Selecciona la caja para el cierre*"
                          placeholder="Caja para el cierre"
                          displayField="label"
                          error={errors?.cash_register_id?.message}
                        />
                      )}
                      control={control}
                      name="cash_register_id"
                    />

                  ) : null}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Cantidad de Cierre*"
                      placeholder="Ingrese la cantidad de cierre de la caja"
                      {...register("amount_closing")}
                      type="number"
                      error={errors?.amount_closing?.message}
                    />

                    <Input
                      label="Comentario"
                      placeholder="Ingrese un comentario"
                      {...register("comment")}
                      error={errors?.comment?.message}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="min-w-[7rem]"
                      color="primary"
                      type="submit"
                      form="close-cash-register"
                    >
                      Cerrar Caja
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

export default CloseCashRegister;
