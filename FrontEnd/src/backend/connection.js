import { APIClient} from "./api_model.js";

// import the urls predefined
import * as url from './url_helper.js'

// Create an instance of APIClient
const api = new APIClient();

// AUTHENTICATION
export const sign_in = (data) => api.create(url.SIGN_IN_REQUEST, data);


