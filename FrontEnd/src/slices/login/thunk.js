import { 
    sign_in as signInApi,
    logout as logoutApi,

} from "../../backend/connection.js";
import { loginRequest, loginError, loginSuccess, logoutSuccess } from "./reducer";

export const loginUser = (user) => async (dispatch) => {
    dispatch(loginRequest()); // Activar estado de carga
    console.log("loginUser, user:", user);
    
    try {
        let response;
        response = await signInApi({
            username: user.username,
            password: user.password,
        });
        console.log("loginUser, response:", response);
        localStorage.setItem("key_local", JSON.stringify(response.data));


        if (response) {
            dispatch(loginSuccess(response));
            // history("/dashboard");
        }
    } catch (error) {
        dispatch(loginError(error));
    }
};

export const logoutUser = () => async (dispatch) => {
    try {
        localStorage.removeItem("key_local");
        await logoutApi();
        dispatch(logoutSuccess(true));
    } catch (error) {
        dispatch(loginError(error));
    }
}