// Import Dependencies
import { PencilSquareIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Button } from "components/ui";


import {useDispatch,  useSelector } from "react-redux";
import { getBasketThunk } from "../../../../../slices/basket/thunk.js"
import {useEffect, useState} from "react";
// import {setActiveBasket} from "../../../../../slices/basket/reducer.js";

import { ProductModal} from "../Products/ProductModal.jsx";

// ----------------------------------------------------------------------


export function Items() {
  const dispatch = useDispatch();
  const { basket_items, activeBasket } = useSelector((state) => state.basket);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);

  useEffect(() => {
    if (activeBasket) {
      dispatch(getBasketThunk(activeBasket));
    }
  }, [activeBasket, dispatch]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // console.log("Basket items: ", basket_items);
  return (
    <>
      <div className="flex flex-col space-y-3.5">
        {basket_items?.length > 0 ? (
          basket_items.map((item) => (
            <div
              key={`${item.id}`} // Key más única
              className="group flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex shrink-0">
                  <img
                    src={item.img || '/placeholder-product.png'}
                    className="mask is-star size-11 origin-center object-cover"
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png';
                    }}
                  />
                  <div className="absolute right-0 top-0 -m-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-white bg-gray-200 px-1 text-tiny-plus font-medium leading-none text-gray-800 dark:border-dark-700 dark:bg-dark-450 dark:text-white">
                    {item.quantity}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate font-medium text-gray-800 dark:text-dark-100">
                      {item.name}
                    </p>
                    <Button
                      isIcon
                      variant="flat"
                      className="size-6 rounded-full opacity-0 group-hover:opacity-100"
                      aria-label={`Editar ${item.name}`}
                    >
                      <PencilSquareIcon
                        className="size-4"
                        onClick={() => handleEditClick(item)}
                      />
                    </Button>
                  </div>
                  <p className="truncate text-xs-plus text-gray-400 dark:text-dark-300">
                    {item.comment || 'Sin comentario'}
                  </p>
                </div>
              </div>
              <p className="font-semibold">
                {item.price ? item.price : '$0.00'}
              </p>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-500">
            No hay productos en la cesta
          </div>
        )}
      </div>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rowData={selectedItem}
      />
    </>
  );
}
