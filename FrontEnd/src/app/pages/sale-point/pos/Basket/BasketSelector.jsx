// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment } from "react";

// Local Imports
import { Button } from "components/ui";


// MY IMPORTS
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { allBasketsThunk } from "slices/basket/thunk.js"
import { setActiveBasket } from "slices/basket/reducer.js";

// ----------------------------------------------------------------------


export function BasketSelector() {
  const dispatch = useDispatch();
  const { activeBasket,baskets  } = useSelector((state) => state.basket);



  useEffect(() => {
    // Fetch all baskets when the component mounts
    dispatch(allBasketsThunk())
  }, [dispatch]);


  // // Function to set the active basket
  useEffect(() => {
    if(baskets?.length > 0 && !activeBasket) {
      dispatch(setActiveBasket(baskets[0].id));
    }
  },[baskets, dispatch, activeBasket]);


  // console.log(baskets, activeBasket);

  return (
    <div className="flex items-center gap-1">
      <div className="min-w-0">
        <span className="dark:text-dark-100 truncate text-base leading-none font-medium text-gray-800">
          Ticket
        </span>{" "}
        <span>#{activeBasket || "000"}</span>
      </div>

      <BasketSelectorMenu baskets={baskets} />
    </div>
  );
}

function BasketSelectorMenu({baskets} ) {
  const dispatch = useDispatch();
  const { activeBasket } = useSelector((state) => state.basket);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-7 rounded-full"
      >
        <ChevronDownIcon className="size-5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems className="absolute z-100 mt-1.5 min-w-[8rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0">
          {Array.isArray(baskets) && baskets.length > 0 ? (
            baskets.map((basket, index) => (
              <MenuItem key={index}>
                {({ focus }) => (
                  <button
                    className={clsx(
                      "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                      "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                    )}
                    onClick={() => {
                      dispatch(setActiveBasket(basket.id));
                    }}
                  >
                    <span>{ ("Ticket #" + basket.id) }</span>
                    {activeBasket === basket.id && (
                      <span className="ml-2">✓</span> // Indicador visual
                    )}
                  </button>
                )}
              </MenuItem>
            ))
          ) : (
            <MenuItem>
              <div className="px-3 py-2 text-gray-500">No existen carritos.</div>
            </MenuItem>
          )}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
