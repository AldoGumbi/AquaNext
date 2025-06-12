// Local Imports
import { Page } from "components/shared/Page";
import { Categories } from "./Categories";
import { Products } from "./Products";
import { Basket } from "./Basket";

// ----------------------------------------------------------------------

export default function Pos() {
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
