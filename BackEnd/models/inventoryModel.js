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
  }

}
export default InventoryModel;