/*
* URL Helper Module
* This module provides utility functions to construct URLs for API endpoints.
*/

// AUTH
const AUTH_BASE_URL = '/auth';
export const SIGN_IN_REQUEST = AUTH_BASE_URL + '/sign-in';
export const GET_PROFILE = AUTH_BASE_URL + '/profile';
export const LOG_OUT_REQUEST = AUTH_BASE_URL + '/logout';

//DASHBOARD
const BASE_DASHBOARD_URL = '/dashboard';
export const GET_DASHBOARD_STATS = BASE_DASHBOARD_URL + '/stats';
export const GET_INGRESOS = BASE_DASHBOARD_URL + '/ingresos';
export const GET_INSCRIPCIONES_STATUS = BASE_DASHBOARD_URL + '/inscripciones-status';
export const GET_MENSUALIDADES_STATUS = BASE_DASHBOARD_URL + '/mensualidades-status';
export const GET_ALUMNOS_ALBERCA = BASE_DASHBOARD_URL + '/alumnos-en-alberca';
export const GET_VENTAS_TIENDA = BASE_DASHBOARD_URL + '/ventas-tienda';

// PRODUCTS
export const ADD_PRODUCT = '/products/add';
export const GET_PRODUCTS = '/products/all-products';
export const EDITPRODUCTS = '/products/update-product';
export const DELETE_PRODUCT = '/products/delete-product';
export const SKU_CHECK_AVAILABILITY = '/products/checkSkuAvailable';

// Baskets
const BASE_BASKET_URL = '/baskets';
export const CREATE_BASKET =  BASE_BASKET_URL + '/create-basket';
export const GET_BASKET = BASE_BASKET_URL + '/get-basket';
export const UPDATE_BASKET = BASE_BASKET_URL + '/update-basket';
export const DELETE_BASKET = BASE_BASKET_URL + '/delete-basket';
export const ALL_BASKETS = BASE_BASKET_URL + '/all-baskets';
export const APPLY_COUPON = BASE_BASKET_URL + '/apply-coupon';
export const UNAPPLY_COUPON = BASE_BASKET_URL + '/unApply-coupon';
// Basket Items
const BASE_BASKET_ITEM_URL = '/basket-items';
export const INSERT_BASKET_ITEM = BASE_BASKET_ITEM_URL + '/add-items';
export const DELETE_BASKET_ITEM = BASE_BASKET_ITEM_URL + '/delete-items';
export const UPDATE_BASKET_ITEM = BASE_BASKET_ITEM_URL + '/update-items';

// ALUMNO CRUD
const BASE_ALUMNO_URL = '/alumnos';
export const ADD_ALUMNO = BASE_ALUMNO_URL + '/register';
export const GET_ALUMNOS = BASE_ALUMNO_URL + '/all-students';
export const EDIT_ALUMNO = BASE_ALUMNO_URL + '/update-student';
export const DELETE_ALUMNO = BASE_ALUMNO_URL + '/delete-student';

// PROFESORES CRUD
const BASE_PROFESOR_URL = '/profesores';
export const ADD_PROFESOR = BASE_PROFESOR_URL + '/add-profesor';
export const GET_PROFESORS = BASE_PROFESOR_URL + '/all-profesores';
export const EDIT_PROFESOR = BASE_PROFESOR_URL + '/update-profesor';
export const DELETE_PROFESOR = BASE_PROFESOR_URL + '/delete-profesor';

// GROUPS CRUD
const BASE_GROUP_URL = '/groups';
export const ADD_GRUPO = BASE_GROUP_URL + '/add-grupo';
export const GET_GRUPOS = BASE_GROUP_URL + '/all-grupos';
export const EDIT_GRUPO = BASE_GROUP_URL + '/update-grupo';
export const DELETE_GRUPO = BASE_GROUP_URL + '/delete-grupo';
export const GET_GRUPOS_CON_HORARIOS = BASE_GROUP_URL + '/grupos-con-horarios';
export const GET_GRUPOS_POR_TIPO = BASE_GROUP_URL + '/grupos-por-tipo';

// DISCOUNTS COUPONS
const BASE_DISCOUNT_URL = '/coupons';
export const CREATE_DISCOUNT_COUPON = BASE_DISCOUNT_URL + '/create-coupon';
export const GET_DISCOUNT_COUPONS = BASE_DISCOUNT_URL + '/get-coupons';
export const GET_ALL_AVALIABLE_CUPONS = BASE_DISCOUNT_URL + '/All-active-coupons';
export const GET_COUPON_BY_ID = BASE_DISCOUNT_URL + '/get-coupon-by-id';

// CASH REGISTER
const BASE_CASH_REGISTER_URL = '/cash-register';
export const OPEN_CASH_REGISTER = BASE_CASH_REGISTER_URL + '/open';
export const GET_OPEN_CASH_REGISTER = BASE_CASH_REGISTER_URL + '/AnyOpen';
export const CLOSE_CASH_REGISTER = BASE_CASH_REGISTER_URL + '/close';