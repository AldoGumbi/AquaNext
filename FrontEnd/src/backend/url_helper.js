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
export const EDIT_ALL_PRODUCTS = '/products/update-product';
export const DELETE_PRODUCT = '/products/delete-product';
export const SKU_CHECK_AVAILABILITY = '/products/checkSkuAvailable';

// Baskets
const BASE_BASKET_URL = '/baskets';
export const CREATE_BASKET =  BASE_BASKET_URL + '/create-basket';
export const GET_BASKET = BASE_BASKET_URL + '/get-basket';
export const UPDATE_BASKET = BASE_BASKET_URL + '/update-basket';
export const DELETE_BASKET = BASE_BASKET_URL + '/delete-basket';
export const ALL_BASKETS = BASE_BASKET_URL + '/all-baskets';
export const INSERT_BASKET_ITEM = BASE_BASKET_URL + '/add-items';
export const DELETE_BASKET_ITEM = BASE_BASKET_URL + '/delete-items';