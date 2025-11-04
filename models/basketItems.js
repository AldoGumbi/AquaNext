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
      const { quantity, comment} = items;
      const [result] = await db.query(`
        UPDATE carrito_items SET  cantidad = ?, comentario = ? WHERE id = ?
      `,  [quantity, comment, id]);

      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
  // search for the item in a basket
  static async findItemInBasket(basketId, productId) {
    try {
      const [rows] = await db.query(`
      SELECT
            id as carrito_items_id,
            comentario,
            cantidad
      FROM carrito_items
      WHERE carrito_id = ? AND producto_id = ? LIMIT 1
      `, [basketId, productId]);

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get the product id in carrito items by its id
  static async getProductIdByBasketItemId(basketItemId) {
    try {
      const [rows] = await db.query(`
        SELECT 
            producto_id,
            carrito_id
        FROM carrito_items 
        WHERE id = ? 
        LIMIT 1
      `, [basketItemId]);

      return rows[0] ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

export default basketItemsModel;
