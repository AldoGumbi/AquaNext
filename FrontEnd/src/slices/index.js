import { combineReducers } from 'redux';

// productos
import productosReducer from './products/reducer.js';
import basketReducer from './basket/reducer.js';

const rootReducer = combineReducers({
	products: productosReducer,
});



export default rootReducer;