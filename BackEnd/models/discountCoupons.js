import db from '../config/db.js';

class couponsModel {
  static async createCoupon(coupon) {
    const query = `INSERT INTO cupones 
    (codigo,nombre,tipo,valor,usos_maximos,fecha_inicio,fecha_fin) VALUES 
    (?,?,?,?,?,?,?)`;
    const [rows] = await db.query(
      query,
      [
        coupon.code,
        coupon.name,
        coupon.discount_type,
        coupon.discount_value,
        coupon.max_uses,
        coupon.start_date,
        coupon.end_date
      ]
    );
    return rows.insertId;
  }
  static async getCoupons() {
    const query = `SELECT * FROM cupones`;
    const [rows] = await db.query(query);
    return rows;
  }
}

export default couponsModel;