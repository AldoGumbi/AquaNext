import {
  combineReducers
} from 'redux';

// Reducers
import authSlicer from './login/reducer.js';

// Combine all reducers
const rootReducer = combineReducers({
	// Authentication
  auth: authSlicer,
});

// Export the combined reducer
export default rootReducer;