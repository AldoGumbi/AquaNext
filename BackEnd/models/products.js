import db from '../config/db.js';

class productsModel {
	// Obtener todos los productos
	static async getAll() {
		const [products] = await db.query(`
		SELECT * FROM productos where borrado = 0
		`);
		return products;
	}
	// Obtener un producto por su id
	static async getById(id) {
		const [product] = await db.query(`
		SELECT * FROM productos WHERE id = ? AND borrado = 0
		`, [id]);
		return product[0];
	}
	// Crear un producto
	static async create(product) {
		const [result] = await db.query(`
		INSERT INTO productos (sku, nombre, descripcion, categoria, precio_venta, costo, imagen)
		VALUES (?, ?, ?,?, ?, ?,? )
		`, [product.sku, product.nombre, product.descripcion
		, product.categoria, product.precio_venta, product.costo, product.img]);
		return result.insertId;
	}

	// editar producto
	static async update(id, product) {
		const [result] = await db.query(`
		UPDATE productos SET sku = ?, nombre = ?, descripcion = ?,
		 precio_venta = ?, activo = ?, categoria = ?,
		 costo = ?, imagen = ?
		WHERE id = ? AND borrado = 0
		`, [
			product.sku, product.name, product.description,
			product.price, product.is_avaliable, product.category,
			product.costo, product.img,
			id
		]);
		return result.affectedRows;
	}

	// Eliminar un producto (marcar como eliminado)
	static async delete(id) {
		const [result] = await db.query(`
		UPDATE productos SET borrado = 1 WHERE id = ? AND borrado = 0
		`, [id]);
		return result.affectedRows > 0;
	}
}
export default productsModel;