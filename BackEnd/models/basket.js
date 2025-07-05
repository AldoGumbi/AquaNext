import db from '../config/db.js';

class basketModel {

	static async getBasketById(basketId) {
		try {

			const [result] = await db.query(`
			SELECT
			
			CI.id as id,
			CI.cantidad as cantidad,
			CI.comentario as comentario,
			
			p.nombre,
			p.precio_venta,
			p.imagen,
			p.id as producto_id,
				
			c.id_cupones
			
			FROM carrito_items CI 
			INNER JOIN productos p on p.id = CI.producto_id
			INNER JOIN carritos c on c.id = CI.carrito_id
      WHERE CI.carrito_id = ?
			`, [basketId]);

			return result;
		} catch (error) {
			throw error;
		}
	}

	static async create(basketData) {
		try {
			const [result] = await db.query(`
			INSERT INTO carritos (usuario_id) VALUES 
			(?)
			`,  [basketData.user_id]);
			return result.insertId;
		} catch (error) {
			throw error;
		}
	}

	static async update(basketId, basketData) {
		try {
			const result = await db.query(`
				UPDATE carritos SET usuario_id = ? WHERE id = ?;
			`, [basketData.usuario_id, basketId]);

			return result.affectedRows;
		} catch (error) {
			throw error;
		}
	}

	static async delete(basketId) {
		try {
			// delete all items in the basket
			const [basket_items_ans] = await db.query(
				` DELETE FROM carrito_items WHERE carrito_id = ? `
				, [basketId]);

			/// delete the basket itself
			const [basket_ans] = await db.query(
				` DELETE FROM carritos WHERE id = ? `
				, [basketId]);

			// answer
			return  basket_ans.affectedRows;
		} catch (error) {
			throw error;
		}
	}

	static async getAllBaskets() {
		try {
			const [baskets] = await db.query(`SELECT id FROM carritos`);

			// for(const basket of baskets) {
			// 	const [items] = await db.query(`
			// 		SELECT * FROM carrito_items WHERE carrito_id = ?
			// 	`, [basket.id]);
			// 	basketObject.push({
			// 		...basket,
			// 		items: items
			// 	});
			// }

			return baskets;

		} catch (error) {
			console.error('Error fetching all baskets:', error);
			throw error;
		}
	}

	static async applyDiscount(data){
		try{
			const [answer] = await db.query(`
			UPDATE carritos SET id_cupones = ? WHERE id = ?
			`,[data.coupon_id,data.basket_id]);
			return answer.affectedRows;
		}catch(error){
			throw error;
		}
	}
}

export default basketModel;