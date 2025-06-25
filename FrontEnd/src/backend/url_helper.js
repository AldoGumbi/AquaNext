/*
* URL Helper Module
* This module provides utility functions to construct URLs for API endpoints.
*/

// AUTH
const AUTH_BASE_URL = '/auth';
export const SIGN_IN_REQUEST = AUTH_BASE_URL + '/sign-in';
export const GET_PROFILE = AUTH_BASE_URL + '/profile';
export const LOG_OUT_REQUEST = AUTH_BASE_URL + '/logout';


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

// DISCOUNTS COUPONS
const BASE_DISCOUNT_URL = '/coupons';
export const CREATE_DISCOUNT_COUPON = BASE_DISCOUNT_URL + '/create-coupon';
export const GET_DISCOUNT_COUPONS = BASE_DISCOUNT_URL + '/get-coupons';

