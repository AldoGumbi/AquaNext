// Import Dependencies
import PropTypes from "prop-types";
import { useReducer } from "react";

// Local Imports
import { TeacherFormContextProvider } from "./TeacherFormContext";

// ----------------------------------------------------------------------

const initialState = {
  formData: {
    personalInfo: {
      nombre: "",
      apellido: "",
      telefono: "",
      fecha_nacimiento: null,
    },
    addressInfo: {
      calle: "",
      colonia: "",
      codigoPostal: "",
      ciudad: "",
      estado: "",
      referencias: "",
    },
    professionalInfo: {
      especialidad: "",
      fecha_contratacion: null,
    },
    declaration: {
      agreed: false,
      fullName: "",
      dateSigned: "",
    },
  },
  stepStatus: {
    personalInfo: {
      isDone: false,
    },
    addressInfo: {
      isDone: false,
    },
    professionalInfo: {
      isDone: false,
    },
    declaration: {
      isDone: false,
    },
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    case "SET_STEP_STATUS":
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export function TeacherFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <TeacherFormContextProvider value={value}>{children}</TeacherFormContextProvider>
  );
}

TeacherFormProvider.propTypes = {
  children: PropTypes.node,
};