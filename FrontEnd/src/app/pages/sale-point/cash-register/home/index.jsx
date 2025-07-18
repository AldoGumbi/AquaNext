import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  ChevronLeft,
  User,
  Clock,
  Sun,
  Moon,
  CreditCard,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  BanknoteArrowDown,
  ArrowDown,
  ArrowUp,
  BanknoteArrowUp
  // BanknoteArrowDown
} from "lucide-react";
// import { Page } from "components/shared/Page";

import {
Page,
Select,
Button,
Input,
Textarea,
Card
} from "./components/index";

import { openCashSchema, closeCashSchema } from "./schema";

import {useDispatch, useSelector} from "react-redux";

import {useEffect} from "react";

import {
  CloseCashRegisterThunk,
  GetLastClosedCashRegisterThunk,
  GetOpenCashRegisterThunk,
  OpenCashRegisterThunk
} from "slices/thunk";

import { useAuthContext } from "app/contexts/auth/context";

import { DateTime } from 'luxon';


// Datos de turnos
const shifts = [
  {
    id: "matutino",
    label: "Turno Matutino (6:00 AM - 2:00 PM)",
  },
  {
    id: "vespertino",
    label: "Turno Vespertino (2:00 PM - 10:00 PM)",
  },
];


export default function CashRegisterComponent() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [showAmount, setShowAmount] = useState(true);
  const dispatch = useDispatch();
  const {
    openCashRegister,
    loading,
    lastClosedCashRegister
  } = useSelector((state) => state.cashRegister);
  const { user } = useAuthContext();
  const [cashRegisterState, setCashRegisterState] = useState({
    isOpen: false,
    openAmount: 0,
    closeAmount: 0,
    user: "",
    shift: "",
    comment: "",
    lastModified: "",
    totalSales: 0,
    transactions: 0,
  });
  

  const fechaActual = DateTime.now()
    .setLocale('es') //
    .toFormat("dd 'de' LLLL 'de' yyyy, HH:mm");

  
  useEffect(() => {
    dispatch(GetOpenCashRegisterThunk());
  },[dispatch]);
  
  useEffect(() => {
    if(!loading) {
      console.log("caja: ", openCashRegister);
      if(openCashRegister && openCashRegister != -1) {
        console.log("CashRegister open");
        setCashRegisterState(prevState => ({
          ...prevState,
          isOpen: true,
          user: openCashRegister.username || user.username,
          shift: openCashRegister.shift,
          lastModified: openCashRegister.updated_at,
          totalSales: Number(openCashRegister.total)
        }))
      } else {
        console.log("CashRegister closed");
        setCashRegisterState(prevState => ({
          ...prevState,
          user: ' ',
          lastModified: ' ',
          isOpen: false,
          shift: " ",
        }))
      }
    }
  }, [openCashRegister, loading, fechaActual, user.username]);
  
  useEffect(() => {
    if(!cashRegisterState.isOpen){
      console.log("dispatching last closed cash register");
      dispatch(GetLastClosedCashRegisterThunk());
    }
  },[cashRegisterState.isOpen, dispatch]);
  
  console.log("Ultima caja: ",lastClosedCashRegister)
  
  // Formulario para abrir caja
  const openForm = useForm({
    resolver: yupResolver(openCashSchema),
    defaultValues: {
      amount_opening: "",
      shift: "",
    },
  });
  
  // Formulario para cerrar caja
  const closeForm = useForm({
    resolver: yupResolver(closeCashSchema),
    defaultValues: {
      amount_closing: "",
      comment: "",
    },
  });
  
  // Handle opening the cash register to db
  const handleOpenCash = (data) => {
    if(data){
      const payload = {
        ...data,
        user_id : user.id,
      }
      
      console.log("Opening caja: ",payload);
      dispatch(OpenCashRegisterThunk(payload));
    }
    
    setCashRegisterState({
      ...cashRegisterState,
      isOpen: true,
      openAmount: parseFloat(data.amount_opening),
      shift: data.shift,
      user: "Sandra",
      lastModified: fechaActual,
    });
    setCurrentView("dashboard");
    openForm.reset();
  };
  
  // Handle closing the cash register to db
  const handleCloseCash = (data) => {
    if(data){
      const payload = {
        ...data,
        cash_register_id: openCashRegister.id,
        user_id: user.id,
      }
      
      console.log(payload);
      dispatch(CloseCashRegisterThunk(payload));
      return;
    }
    setCashRegisterState({
      ...cashRegisterState,
      isOpen: false,
      closeAmount: parseFloat(data.amount_closing),
      comment: data.comment,
      user: " ",
      shift: " ",
      lastModified: fechaActual,
    });
    setCurrentView("dashboard");
    closeForm.reset();
  };
  
  // Vista del Dashboard
  if (currentView === "dashboard") {
    return (
      <Page title="Apertura de Caja Registradora">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Apertura de Caja Registradora
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Administra las operaciones de apertura y cierre de caja
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* CARD ventas totals */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  VENTAS TOTALES
                </p>
                <div className="flex items-center">
                  <p className="text-gray-800 dark:text-gray-100 text-2xl font-bold">
                    ${showAmount ? cashRegisterState.totalSales.toFixed(2) : "****"}
                  </p>
                  <button
                    onClick={() => setShowAmount(!showAmount)}
                    className="ml-2 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showAmount ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
          {/* CARD transacciones */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  TRANSACCIONES
                </p>
                <p className="text-gray-800 dark:text-gray-100 text-2xl font-bold">
                  {cashRegisterState.transactions}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
          {/* CARD estado de caja */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  ESTADO
                </p>
                <p className={`text-2xl font-bold ${cashRegisterState.isOpen ? "text-green-500" : "text-red-500"}`}>
                  {cashRegisterState.isOpen ? "ABIERTA" : "CERRADA"}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${cashRegisterState.isOpen ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-pink-600"}`}>
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Open Cash Register Card */}
          <Card className="overflow-hidden hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 mr-4 rounded-full p-3">
                    <BanknoteArrowDown className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Abrir Caja</h3>
                    <p className="text-green-100">Iniciar nuevo turno</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full ${cashRegisterState.isOpen ? "bg-green-300" : "bg-white bg-opacity-50"} animate-pulse`} />
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Última modificación:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {cashRegisterState.lastModified}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Usuario:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {cashRegisterState.user}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sun className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Turno:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
                    {cashRegisterState.shift}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentView("open")}
                disabled={cashRegisterState.isOpen}
                variant="primary"
              >
                {cashRegisterState.isOpen ? "Caja ya abierta" : "Abrir Caja"}
              </Button>
            </div>
          </Card>
          
          {/* Close Cash Register Card */}
          <Card className="overflow-hidden hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 mr-4 rounded-full p-3">
                    <BanknoteArrowUp  className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cerrar Caja</h3>
                    <p className="text-red-100">Finalizar turno</p>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full ${!cashRegisterState.isOpen ? "bg-red-300" : "bg-white bg-opacity-50"} animate-pulse`} />
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Última modificación:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {!cashRegisterState?.isOpen ? (
                      lastClosedCashRegister?.updated_at || ' '  ): (
                      cashRegisterState?.lastModified || " "
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Usuario:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                   {!cashRegisterState?.isOpen ? (
                     lastClosedCashRegister?.username || ''  ): (
                     cashRegisterState?.username || " "
                   )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Moon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Turno:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                     {!cashRegisterState?.isOpen ? (
                       lastClosedCashRegister?.shift || ' '  ): (
                       cashRegisterState?.shift || " "
                     )}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentView("close")}
                disabled={!cashRegisterState.isOpen}
                variant="danger"
              >
                {!cashRegisterState.isOpen ? "Caja ya cerrada" : "Cerrar Caja"}
              </Button>
            </div>
          </Card>
        </div>
      </Page>
    );
  }
  
  // Vista para abrir caja
  if (currentView === "open") {
    return (
      <Page title="Iniciar Caja">
        <div className="transition-content px-6 pb-6">
          <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="mr-4 rounded-full p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <ChevronLeft className="h-6 w-6 text-blue-600" />
              </button>
              <div className="flex-col flex">
                <div className="flex items-center gap-1">
                  <ArrowUp className="size-6" />
                  <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-gray-50">
                    Iniciar Caja de corte
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Completa el formulario para iniciar una nueva caja
                </p>
              </div>
            </div>
          </div>
          
          <form
            autoComplete="off"
            onSubmit={openForm.handleSubmit(handleOpenCash)}
            id="open-cash-form"
          >
            <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-5">
                <Card className="p-4 sm:px-5">
                  <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    General
                  </h3>
                  <div className="mt-5 space-y-5">
                    <Input
                      label="Cantidad para abrir*"
                      placeholder="Ingrese la cantidad para abrir la caja"
                      type="number"
                      step="0.01"
                      icon={DollarSign}
                      {...openForm.register("amount_opening")}
                      error={openForm.formState.errors?.amount_opening?.message}
                    />
                    
                    <Controller
                      render={({ field }) => (
                        <Select
                          label="Turno responsable*"
                          icon={Sun}
                          value={field.value}
                          onChange={field.onChange}
                          name={field.name}
                          error={openForm.formState.errors?.shift?.message}
                        >
                          <option value="">Selecciona el horario de la caja</option>
                          {shifts.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                              {shift.label}
                            </option>
                          ))}
                        </Select>
                      )}
                      control={openForm.control}
                      name="shift"
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        className="min-w-[7rem]"
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
  }
  
  // Vista para cerrar caja
  if (currentView === "close") {
    return (
      <Page title="Cerrar Caja">
        <div className="transition-content px-6 pb-6">
          <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="mr-4 rounded-full p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <ChevronLeft className="h-6 w-6 text-blue-600" />
              </button>
              <div className="flex-col flex">
                <div className="flex items-center gap-1">
                  <ArrowDown className="size-6" />
                  <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-gray-50">
                    Corte de Caja
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Registra el monto de cierre y finaliza el turno
                </p>
              </div>
            </div>
          </div>
          
          <form
            autoComplete="off"
            onSubmit={closeForm.handleSubmit(handleCloseCash)}
            id="close-cash-form"
          >
            <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-5">
                <Card className="p-4 sm:px-5">
                  <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    Cierre de Caja # {openCashRegister?.id || "N/A"}
                  </h3>
                  <div className="mt-5 space-y-5">
                    <Input
                      label="Cantidad de Cierre*"
                      placeholder="Ingrese la cantidad de cierre"
                      type="number"
                      step="0.01"
                      icon={DollarSign}
                      {...closeForm.register("amount_closing")}
                      error={closeForm.formState.errors?.amount_closing?.message}
                    />
                    
                    <Textarea
                      label="Comentario"
                      placeholder="Ingrese un comentario opcional..."
                      rows={3}
                      {...closeForm.register("comment")}
                      error={closeForm.formState.errors?.comment?.message}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="danger"
                        className="min-w-[7rem]"
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
  }
}