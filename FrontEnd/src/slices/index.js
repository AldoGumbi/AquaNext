import { combineReducers } from 'redux';

// Reducers
import authSlicer from './login/reducer.js';
import productsSlicer from './products/reducer.js';
import basketSlicer from './basket/reducer.js';

// Combine all reducers
const rootReducer = combineReducers({
	// Authentication
  auth: authSlicer,
  // Products
  products: productsSlicer,
  // basket
  basket: basketSlicer,
});

// Export the combined reducer
export default rootReducer;