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
export const applyCouponBasket = (data) => api.put(`${url.APPLY_COUPON}`, data);
export const unApplyCouponToBasket = (id) => api.delete(`${url.UNAPPLY_COUPON}/${id}`);

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
export const getDiscountCoupons = () => api.get(url.GET_DISCOUNT_COUPONS, null);
export const getAllAvaliableCoupons = () => api.get(url.GET_ALL_AVALIABLE_CUPONS, null)
export const getCouponById = (id) => api.get(`${url.GET_COUPON_BY_ID}/${id}`,null);

// CASH REGISTER CRUD
export const openCashRegister = (data) => api.create(url.OPEN_CASH_REGISTER, data);
export const getOpenCashRegister = () => api.get(url.GET_OPEN_CASH_REGISTER, null);
export const closeCashRegister = (cash_register_id,data) => api.put(`${url.CLOSE_CASH_REGISTER}/${cash_register_id}`, data);

// DASHBOARD
export const getAlumnosStats = () => api.get(url.GET_ALUMNOS_STATS, null);
export const getDashboardStats = () => api.get(url.GET_DASHBOARD_STATS, null);
export const getIngresosDashboard = () => api.get(url.GET_INGRESOS, null);
export const getInscripcionesStatus = () => api.get(url.GET_INSCRIPCIONES_STATUS, null);
export const getMensualidadesStatus = () => api.get(url.GET_MENSUALIDADES_STATUS, null);
export const getAlumnosEnAlberca = () => api.get(url.GET_ALUMNOS_ALBERCA, null);
export const getVentasTiendaDashboard = () => api.get(url.GET_VENTAS_TIENDA, null);

// MENSUALIDADES E INSCRIPCIONES CRUD
export const createInscripcionSola = (data) => api.create(url.CREATE_INSCRIPCION, data);
export const createMensualidadSola = (data) => api.create(url.CREATE_MENSUALIDAD, data);
export const createInscripcionConMensualidades = (data) => api.create(url.CREATE_INSCRIPCION_CON_MENSUALIDADES, data);
export const getAllInscripciones = (params) => api.get(url.GET_ALL_INSCRIPCIONES, params);
export const getInscripcionesByAlumno = (alumnoId) => api.get(`${url.GET_INSCRIPCIONES_BY_ALUMNO}/${alumnoId}`, null);
export const validateInscripcionVigente = (alumnoId) => api.get(`${url.VALIDATE_INSCRIPCION_VIGENTE}/${alumnoId}`, null);
export const getMensualidadesByAlumno = (alumnoId) => api.get(`${url.GET_MENSUALIDADES_BY_ALUMNO}/${alumnoId}`, null);
export const getMensualidadesByInscripcion = (inscripcionId) => api.get(`${url.GET_MENSUALIDADES_BY_INSCRIPCION}/${inscripcionId}`, null);
export const cancelarInscripcion = (data) => api.update(`${url.CANCELAR_INSCRIPCION}/${data.id}`, data.data);
export const cancelarMensualidad = (data) => api.update(`${url.CANCELAR_MENSUALIDAD}/${data.id}`, data.data);
export const getTarifasMensualidad = () => api.get(url.GET_TARIFAS_MENSUALIDAD, null);
export const createTarifaMensualidad = (data) => api.create(url.CREATE_TARIFA_MENSUALIDAD, data);
export const updateTarifaMensualidad = (data) => api.update(`${url.UPDATE_TARIFA_MENSUALIDAD}/${data.id}`, data.data);
export const deleteTarifaMensualidad = (data) => api.delete(`${url.DELETE_TARIFA_MENSUALIDAD}/${data.id}`);
export const getEstadisticasInscripciones = (params) => api.get(url.GET_ESTADISTICAS_INSCRIPCIONES, params);
