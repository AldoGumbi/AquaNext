import db from '../config/db.js';

class CashRegisterModel {


  // Crear un caja para corte
  static async create(caja) {
    const [result] = await db.query(`
      INSERT INTO caja_registradora (
        shift,
        amount_opening,
        user_id
      )
      VALUES (?, ?, ?)
    `, [
      caja.shift,
      caja.amount_opening,
      caja.user_id
    ]);
    return result.insertId;
  }
  // obtener caja abierta o re-abierta
  static async getOpenCashRegister() {
    const [rows] = await db.query(`
      SELECT id FROM caja_registradora WHERE
       status = 'open' OR status = 'reopened'
    `,);
    return rows;
  }


}

export default CashRegisterModel;