import db from '../config/db.js';

class loginModel {
	static async signInModel(user) {
		try {
			// (1) Main variables
			const {username, password, email } = user;

			// (2) query construction
			let query = '';
			let params = [];

			// (3) Check if email or username is provided
			// In case the user provides both, we prioritize email
			if(email){
				query = "SELECT * FROM usuarios WHERE  email = ? AND password = ? LIMIT 1";
				params = [email, password];
			}else if(username) {
				query = "SELECT * FROM usuarios WHERE  username = ? AND password = ? LIMIT 1";
				params = [username, password];
			}else{
				throw new Error('Username or email is required for login');
			}
			// (4)Execute the query
			const [result] = await db.query(query, params);

			// (5) Return the result
			return result;
		} catch (error) {
			throw error;
		}
	}
}

export default loginModel;