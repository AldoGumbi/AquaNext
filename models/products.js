import db from '../config/db.js';

class productsModel {
	// Obtener todos los productos
	static async getAll() {
		const [products] = await db.query(`
		SELECT p.*,
		       p.activo as is_available,
		       i.existencia as stock,
		       i.stock_minimo,
		       i.stock_maximo
		FROM productos p
		INNER JOIN inventario i ON p.id = i.producto_id
		WHERE borrado = 0
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
		, product.categoria, product.precio_venta, product.costo, product.imagen]);
		return result.insertId;
	}

// editar producto
	static async update(id, product) {
		// Construir dinámicamente los campos a actualizar
		const fieldsToUpdate = [];
		const values = [];

		// Mapeo de campos del producto a columnas de la base de datos
		const fieldMap = {
			sku: 'sku',
			name: 'nombre',
			description: 'descripcion',
			price: 'precio_venta',
			is_available: 'activo',
			category: 'categoria',
			costo: 'costo',
			img: 'imagen'
		};

		// Iterar sobre los campos y agregar solo los que tienen valor
		for (const [key, dbColumn] of Object.entries(fieldMap)) {
			if (product[key] !== undefined && product[key] !== null && product[key] !== '') {
				fieldsToUpdate.push(`${dbColumn} = ?`);
				values.push(product[key]);
			}
		}

		// Si no hay campos para actualizar, retornar 0
		if (fieldsToUpdate.length === 0) {
			return 0;
		}

		// Agregar el ID al final de los valores
		values.push(id);

		// Construir la query dinámica
		const query = `
    UPDATE productos 
    SET ${fieldsToUpdate.join(', ')}
    WHERE id = ? AND borrado = 0
  `;

		const [result] = await db.query(query, values);
		return result.affectedRows;
	}

	// Eliminar un producto (marcar como eliminado)
	static async delete(id) {
		const [result] = await db.query(`
		UPDATE productos SET borrado = 1 WHERE id = ? AND borrado = 0
		`, [id]);
		return result.affectedRows > 0;
	}

	// Verificar si el SKU ya existe
	static async skuAvailability(sku) {
		const [result] = await db.query(`
		SELECT COUNT(*) as count FROM productos WHERE sku = ? AND borrado = 0
		`, [sku]);
		return result[0].count > 0;
	}

	// Change product stock
	static async changeStock(id,quantity) {
		const [result] = await db.query(`
		UPDATE inventario SET existencia = existencia + ? WHERE producto_id = ?
		`, [quantity, id]);
		return result.affectedRows > 0;
	}

	// Update movimiento de inventario
	static async InsertMovimiento(data) {
		const [movimientos] = await db.query(`
		INSERT INTO movimientos_inventario
    ( producto_id,tipo_movimiento,cantidad,
     existencia_anterior, existencia_nueva, transaccion_id ,
     observaciones,usuario_id
    )
		VALUES (?,?,?,?,?,?,?,?)
		`,[
			data.producto_id,
			data.tipo_movimiento,
			data.cantidad || 0,
			data.existencia_anterior,
			data.existencia_nueva,
			data.transaccion_id || null,
			data.observaciones || null,
			data.usuario_id
		]);
	}

	// Check

}
export default productsModel;
