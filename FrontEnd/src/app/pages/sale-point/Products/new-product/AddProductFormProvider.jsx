// Import Dependencies
import { useReducer } from "react";
import PropTypes from "prop-types";

// Local Imports
import { AddProductFormContextProvider } from "./AddProductFormContext";

// ----------------------------------------------------------------------

const initialState = {
  formData: {
    general: {
      name: "",
      sku: "",
      price: null,
      cost: null,
      category: "",
      is_available: true,
    },
    description: {
      description: "",
    },
    inventory: {
      stock: 0,
      minimum_stock: 0,
      maximum_stock: 0,
    },
    images: {
      cover: null,
    },
  },
  stepStatus: {
    general: {
      isDone: false,
    },
    description: {
      isDone: false,
    },
    Inventory: {
      isDone: false,
    },
    images: {
      isDone: false,
    },
  },
};

const reducerHandlers = {
  SET_FORM_DATA: (state, action) => {
    return {
      ...state,
      formData: {
        ...state.formData,
        ...action.payload,
      },
    };
  },
  SET_STEP_STATUS: (state, action) => {
    return {
      ...state,
      stepStatus: {
        ...state.stepStatus,
        ...action.payload,
      },
    };
  },
};

const reducer = (state, action) =>
  reducerHandlers[action.type]?.(state, action) || state;

export function AddProductFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <AddProductFormContextProvider value={value}>
      {children}
    </AddProductFormContextProvider>
  );
}

AddProductFormProvider.propTypes = {
  children: PropTypes.node,
};

