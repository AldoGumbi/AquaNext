// Import Dependencies
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

// Local Imports
import { Button } from "components/ui";
// import { useDisclosure } from "hooks";

// ----------------------------------------------------------------------




export function CashWithrawalActionsModal({ isOpen, onClose, isCreating }) {
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
            <DialogPanel className="scrollbar-sm relative flex max-w-md flex-col overflow-y-auto rounded-lg bg-white px-4 py-10 text-center transition-opacity duration-300 dark:bg-dark-700 sm:px-5">
              <CheckCircleIcon className="mx-auto inline size-28 shrink-0 text-success" />

              {isCreating ?
                (<>
                  <div className="mt-4">
                    <DialogTitle
                      as="h3"
                      className="text-2xl text-gray-800 dark:text-dark-100"
                    >
                      Success Message
                    </DialogTitle>
                    <p className="mt-2">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Consequuntur dignissimos soluta totam?
                    </p>
                    <Button onClick={onClose} color="success" className="mt-6">
                      Close
                    </Button>
                  </div>
                </>) : (
                  <>
                    <div className="mt-4">
                      <DialogTitle
                        as="h3"
                        className="text-2xl text-gray-800 dark:text-dark-100"
                      >
                        Editing Mode
                      </DialogTitle>
                      <div className="text-gray-500 text-lg mt-2">
                        Editing content goes here...
                      </div>
                    </div>
                  </>)}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
