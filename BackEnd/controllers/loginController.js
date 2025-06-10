import loginModel from "../models/login.js";


export const signIn = async (req, res) => {
	try{
		// (1) ask for the body from the request
		const { email, username, password } = req.body;

		// (2) Need the email or the username to login
		if(!email && !username) {
			return res.status(400).json({
				data: false,
				message: 'El email o el nombre de usuario no fueron proporcionados'
			});
		}

		// (3) Need the password to login
		if(!password) {
			return res.status(400).json({
				data: false,
				message: 'La contraseña no fue proporcionada'
			});
		}

		// (4) Call the model to sign in
		const user = await loginModel.signInModel({ email, username, password });

		// (5) If the user is not found, return an error
		if(user.length === 0) {
			return res.status(404).json({
				data: false,
				message: 'Usuario no encontrado'
			});
		}
		// (6) If the user is found, return the user data
		else{
			return res.status(200).json({
				data: user[0],
				message: 'Usuario encontrado'
			})
		}

	}	catch(err){
		res.status(500).json({
			data: false,
			message: 'Error interno del servidor',
			error: err.message
		})
	}
}

