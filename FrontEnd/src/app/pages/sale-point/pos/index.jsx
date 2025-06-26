// Local Imports
import { Page } from "components/shared/Page";
import { Categories } from "./Categories";
import { Products } from "./Products";
import { Basket } from "./Basket";

// redux Imports
import { useSelector,useDispatch } from "react-redux";
import { GetOpenCashRegisterThunk } from "slices/thunk"
import { useEffect } from "react";


// ----------------------------------------------------------------------




export default function Pos() {
  const dispatch = useDispatch();
  // Get the open cash register from the Redux store
  const { openCashRegister } = useSelector((state) => state.cashRegister);

  useEffect(() => {
    // Fetch the open cash register when the component mounts
    if (!openCashRegister) {
      dispatch(GetOpenCashRegisterThunk());
    }
  }, [openCashRegister]);

  console.log("Open Cash Register Id:", openCashRegister);

  return (
    <Page title="Punto de venta">
      <main className="px-(--margin-x) transition-content grid grid-cols-12 gap-4 pb-6 pt-5 sm:gap-5 lg:gap-6 ">
        <div className="col-span-12 sm:col-span-6 lg:col-span-8">
          <Categories />
          <Products />
        </div>
        <div className="max-sm:block sm:sticky sm:top-20 sm:col-span-6 sm:self-start lg:col-span-4">
          <Basket />
        </div>
      </main>
    </Page>
  );
}
