import db from '../config/db.js';

class basketItemsModel {
  // insert items into basket
  static async insertItemsBasket(basketId, items) {
    try {
      const {product_id, quantity, comment} = items;
      const [result] = await db.query(`
				INSERT INTO carrito_items (carrito_id,producto_id,cantidad, comentario) VALUES (?, ?, ?, ?)
			`, [basketId, product_id, quantity, comment]);

      return result.insertId;

    } catch (error) {
      throw error;
    }
  }
  // delete items from basket
  static async deleteItems(id) {
    try {
      const [result] = await db.query(`
				DELETE FROM carrito_items WHERE  id = ?
			`, [id]);

      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
  // edit items in basket
  static async editItemsBasket(id, items) {
    try {
      const {product_id, quantity, comment} = items;
      const [result] = await db.query(`
        UPDATE carrito_items SET producto_id = ?, cantidad = ?, comentario = ? WHERE id = ?
      `, [product_id, quantity, comment, id]);

      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

export default basketItemsModel;