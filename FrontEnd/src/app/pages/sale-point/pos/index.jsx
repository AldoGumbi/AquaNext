// Local Imports
import { Page } from "components/shared/Page";
import { Categories } from "./Categories";
import { Products } from "./Products";
import { Basket } from "./Basket";
import { CashWithrawalActionsModal } from "./Cash-Register/CashWithrawalActionsModal";
// import { SplashScreen } from "components/template/SplashScreen";
// redux Imports
import { useSelector, useDispatch } from "react-redux";
import { GetOpenCashRegisterThunk } from "slices/thunk"
import { useEffect, useState } from "react";
import { Button } from "components/ui";
// import { useDisclosure } from "hooks";
// ----------------------------------------------------------------------


const loader = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-lg">Cargando...</div>
        </div>
      </div>
    </div>
  );
};


export default function Pos() {
  const dispatch = useDispatch();
  // Get the open cash register from the Redux store
  const {  loading,openCashRegister } = useSelector((state) => state.cashRegister);
  // State to manage the cash withdrawal counter (same as cash register)
  const [isModalOpen, setIsModalOpen] = useState({
    isOpen: false,
  });



  useEffect(() => {
    // Fetch the open cash register when the component mounts
    dispatch(GetOpenCashRegisterThunk());
  }, [ dispatch]);

  useEffect(() => {
    // If the open cash register is not found, set the modal to create a new one
    if (openCashRegister === -1) {
      setIsModalOpen({ isOpen: true, isCreating: true });
    }
  }, [openCashRegister]);


  return (
    <Page title="Punto de venta">
      {loading ? loader() : (
        <>
          <main className="px-(--margin-x) transition-content grid grid-cols-12 gap-4 pb-6 pt-5 sm:gap-5 lg:gap-6 ">
            <div className="col-span-12 sm:col-span-6 lg:col-span-8">
              <Categories />
              <Products />
            </div>
            <div className="max-sm:block sm:sticky sm:top-20 sm:col-span-6 sm:self-start lg:col-span-4">
              <Basket />
              <Button onClick={() => setIsModalOpen({ isOpen: true, isCreating: true })}>
                Abrir Modal Manualmente
              </Button>
            </div>
          </main>
          <CashWithrawalActionsModal
            isOpen={isModalOpen.isOpen}
            onClose={() => setIsModalOpen(prev => ({ ...prev, isOpen: false }))}
          />
        </>
      )}
    </Page>
  );
} 
