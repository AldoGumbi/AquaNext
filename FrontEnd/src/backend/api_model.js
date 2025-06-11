// imports
import axios from 'axios';


// define if out proyect is in development or production mode
const ENV_MODE = import.meta.env.VITE_ENV_MODE;

// define the base URL for the API
if(ENV_MODE === 'dev') {
	axios.defaults.baseURL = import.meta.env.VITE_API_URL_DEV;
}else if(ENV_MODE === 'production') {
	axios.defaults.baseURL = import.meta.env.VITE_API_URL_PROD;
}else{
	axios.defaults.baseURL = import.meta.env.VITE_API_URL_DEV_LOCAL;
}

// headers for the API requests
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Obtener token del localStorage
const getToken = () => {
	const authUser = localStorage.getItem('authUser');
	return authUser ? JSON.parse(authUser).token : null;
};
// Configurar el token inicial
const token = getToken();
if (token) {
	axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

// Interceptor de solicitudes simplificado
axios.interceptors.request.use(
	(config) => {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor de respuestas simplificado
axios.interceptors.response.use(
	function (response) {
		return response.data ? response.data : response;
	},
	function (error) {

		let message;
		switch (error.response?.status) {
			case 500:
				message = "Error interno del servidor";
				break;
			case 401:
				message = "Credenciales inválidas o expiradas";
				break;
			case 404:
				message = "No se encontró el recurso solicitado";
				break;
			default:
				message = error.message || error;
		}
		return Promise.reject({
			status: error.response?.status || 500,
			message: message,
			API_message: error.response?.data?.message || null,
      API_error: error.response?.data?.error || null,
      API: error.response?.data || null
		});
	}
);


/**
 * Establece la autorización por defecto
 * @param {*} token
 */
const setAuthorization = (token) => {
	if (token) {
		axios.defaults.headers.common["Authorization"] = "Bearer " + token;
	} else {
		delete axios.defaults.headers.common["Authorization"];
	}
};

class APIClient {
	/**
	 * Obtiene datos de la URL proporcionada
	 */
	get = (url, params) => {
	let response;
	let paramKeys = [];

	if (params) {
		Object.keys(params).forEach(key => {
			paramKeys.push(key + '=' + params[key]);
		});

		const queryString = paramKeys.length ? paramKeys.join('&') : "";
		response = axios.get(`${url}?${queryString}`, params);
	} else {
	response = axios.get(`${url}`, params);
}

return response;
};

/**
 * Envía datos a la URL proporcionada
 */
create = (url, data) => {
	return axios.post(url, data);
};

/**
 * Actualiza datos
 */
update = (url, data) => {
	return axios.patch(url, data);
};

/**
 * Actualiza todos los datos (PUT)
 */
put = (url, data) => {
	return axios.put(url, data);
};

/**
 * Elimina un recurso
 */
delete = (url, config) => {
	return axios.delete(url, { ...config });
};
}

/**
 * Obtiene el usuario autenticado del localStorage
 */
const getLoggedUser = () => {
	const user = localStorage.getItem("authUser");
	return user ? JSON.parse(user) : null;
};

export { APIClient, setAuthorization, getLoggedUser };

