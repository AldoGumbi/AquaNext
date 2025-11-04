import db from '../config/db.js';

class InventoryModel {
  // Method to create a new inventory item
  static async createInventory(data) {
    const [result] = await db.query(
      `INSERT INTO inventario
      (producto_id,existencia,stock_minimo,stock_maximo)
      VALUES (?,?,?,?)`,
      [data.producto_id, data.existencia, data.stock_minimo, data.stock_maximo]
    );
    return result.insertId;
    return availability[0].count === 0;
  }


  // Method to get inventory by product ID
  static async getProductoAvailability(productId) {
    const [rows] = await db.query(
      `SELECT 
        id as inventario_id,
        producto_id,
        existencia as stock,
        stock_minimo as minimum_stock,
        stock_maximo as maximum_stock
    FROM inventario WHERE producto_id = ?`,
      [productId]
    );
    return rows[0];

  }
}
export default InventoryModel;
