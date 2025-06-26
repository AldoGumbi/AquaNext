import { combineReducers } from 'redux';

// Reducers
import authSlicer from './login/reducer.js';
import productsSlicer from './products/reducer.js';
import basketSlicer from './basket/reducer.js';
import alumnosSlicer from './alumnos/reducer.js';
import couponsSlicer from './coupons/reducer.js';
import profesoresSlicer from './profesores/reducer.js';
import cashRegisterSlicer from './cash-register/reducer.js';
// Combine all reducers
const rootReducer = combineReducers({
	// Authentication
  auth: authSlicer,
  // Products
  products: productsSlicer,
  // basket
  basket: basketSlicer,
  // alumnos
  alumnos: alumnosSlicer,
  // coupons
  coupons: couponsSlicer,
  // profesores
  profesores: profesoresSlicer,
  // cash-register
  cashRegister: cashRegisterSlicer,
});

// Export the combined reducer
export default rootReducer;