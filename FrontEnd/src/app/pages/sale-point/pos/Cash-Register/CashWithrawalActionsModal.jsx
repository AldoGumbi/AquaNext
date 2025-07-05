// Import Dependencies
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
//CheckCircleIcon
import { Fragment } from "react";

// Local Imports
import { Button } from "components/ui";
// import { useDisclosure } from "hooks";

// ----------------------------------------------------------------------

export function CashWithrawalActionsModal({ isOpen, onClose }) {
  //   const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={onClose}
          static
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogPanel className="scrollbar-sm dark:bg-dark-700 relative flex max-w-md flex-col overflow-y-auto rounded-lg bg-white px-4 py-10 text-center transition-opacity duration-300 sm:px-5">
              <BanknotesIcon className="text-success mx-auto inline size-28 shrink-0" />
              <div className="mt-4">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-100 text-2xl text-gray-800"
                >
                  Sin caja registradora
                </DialogTitle>
                <div className="text-md mt-2 text-gray-500">
                  Actualmente el sistema no reconece ninguna caja abierta, esto
                  quiere decir que no puedes generar ninguna venta de productos,
                  mensualidad, inscripción o anualidad.
                </div>
                <div className="text-md mt-2 text-gray-500">
                  Abré una caja registradora para empezar a vender.
                </div>

                <div className="mt-5 space-x-4">
                  <Button className="" onClick={onClose}>
                    Cerrar
                  </Button>
                  <a href="/sale-point/cash-register/open">
                  <Button color="primary" className="bg-blue-500" onClick={onClose}>
                    Abrir caja
                  </Button>
                  </a>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
