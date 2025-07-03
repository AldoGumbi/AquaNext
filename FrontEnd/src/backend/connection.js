import { APIClient} from "./api_model.js";

// import the urls predefined
import * as url from './url_helper.js'

// Create an instance of APIClient
const api = new APIClient();

// AUTHENTICATION
export const sign_in = (data) => api.create(url.SIGN_IN_REQUEST, data);
export const getProfile = (data) => api.get(url.GET_PROFILE, { userId: data.id });
export const logout = () => api.delete(url.LOG_OUT_REQUEST);

// PRODUCTS CRUD
export const addProduct = (data) => api.create(url.ADD_PRODUCT, data);
export const getProducts = (data) => api.get(url.GET_PRODUCTS, data);
export const editProducts = (id, data) => api.put(`${url.EDITPRODUCTS}/${id}`, data);
export const deleteProduct = (id) => api.update(`${url.DELETE_PRODUCT}/${id}`);
export const skuCheckAvailability = (sku) => api.get(`${url.SKU_CHECK_AVAILABILITY}/${sku}`);

// GROUPS CRUD
export const addGrupo = (data) => api.create(url.ADD_GRUPO, data);
export const getGrupos = () => api.get(url.GET_GRUPOS, null);
export const updateGrupo = (data) => api.update(`${url.EDIT_GRUPO}/${data.id}`, data.data);
export const deleteGrupo = (data) => api.delete(`${url.DELETE_GRUPO}/${data.id}`);
export const getGruposConHorarios = () => api.get(url.GET_GRUPOS_CON_HORARIOS, null);
export const getGruposPorTipo = (tipo) => api.get(`${url.GET_GRUPOS_POR_TIPO}/${tipo}`, null);

// BASKET CRUD
export const createBasket = (data) => api.create(url.CREATE_BASKET, data);
export const getBasket = (id) => api.get(`${url.GET_BASKET}/${id}`);
export const updateBasket = (id, data) => api.put(`${url.UPDATE_BASKET}/${id}`, data);
export const deleteBasket = (id) => api.delete(`${url.DELETE_BASKET}/${id}`);
export const allBaskets = () => api.get(url.ALL_BASKETS);

// BASKET ITEMS CRUD
export const insertBasketItems = (data) => api.create(`${url.INSERT_BASKET_ITEM}`, data);
export const deleteBasketItem = (id) => api.delete(`${url.DELETE_BASKET_ITEM}/${id}`);
export const updateBasketItem = (id, data) => api.put(`${url.UPDATE_BASKET_ITEM}/${id}`, data);

//ALUMNO CRUD
export const addAlumno = (data) => api.create(url.ADD_ALUMNO, data);
export const getAlumnos = () => api.get(url.GET_ALUMNOS, null);
export const updateAlumno = (data) => api.update(`${url.EDIT_ALUMNO}/${data.id}`, data.data);
export const deleteAlumno = (data) => api.delete(`${url.DELETE_ALUMNO}/${data.id}`);

// PROFESORES CRUD
export const addProfesor = (data) => api.create(url.ADD_PROFESOR, data);
export const getProfesores = () => api.get(url.GET_PROFESORS, null);
export const updateProfesor = (data) => api.update(`${url.EDIT_PROFESOR}/${data.id}`, data.data);
export const deleteProfesor = (data) => api.delete(`${url.DELETE_PROFESOR}/${data.id}`);

// DISCOUNTS COUPONS CRUD
export const createDiscountCoupon = (data) => api.create(url.CREATE_DISCOUNT_COUPON, data);
