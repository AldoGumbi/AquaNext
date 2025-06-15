import db from '../config/db.js';

class Token {
	// Buscar usuario por ID
	static async findById(id) {
		if (!id) return null;
		
		const [users] = await db.query(`
			SELECT u.id, u.username, u.email, u.rol, u.activo, 
			    rt.token as refreshToken
			FROM usuarios u
			LEFT JOIN refresh_tokens rt ON u.id = rt.usuario_id
			WHERE u.id = ? AND u.activo = 1
		`, [id]);
		
		return users[0] || null;
	}

	// Actualizar refresh token del usuario
	static async findByIdAndUpdate(id, updateData) {
		if (!id) return null;

		// Si se está actualizando el refreshToken
		if (updateData.refreshToken !== undefined) {
			if (updateData.refreshToken === null) {
				// Eliminar refresh token
				await db.query(`
					DELETE FROM refresh_tokens WHERE usuario_id = ?
				`, [id]);
			} else {
				// Insertar o actualizar refresh token
				await db.query(`
					INSERT INTO refresh_tokens (usuario_id, token) 
					VALUES (?, ?)
					ON DUPLICATE KEY UPDATE 
					token = VALUES(token), 
					updated_at = CURRENT_TIMESTAMP
				`, [id, updateData.refreshToken]);
			}
		}

		// Retornar el usuario actualizado
		return await this.findById(id);
	}
}

export default Token;