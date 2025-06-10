import { APIClient} from "./api_model.js";

// import the urls predefined
import * as url from './url_helper.js'

// Create an instance of APIClient
const api = new APIClient();

// EXAMPLE :
// export const addProduct = (data) => api.create(url.ADD_PRODUCT, data);
// export const editAllProducts = (id, data) => api.put(`${url.EDIT_ALL_PRODUCTS}/${id}`, data);
