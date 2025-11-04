import db from '../config/db.js';
import { DateTime } from "luxon";
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
    const query = `SELECT * FROM cupones WHERE activo = 1`;
    const [rows] = await db.query(query);
    return rows;
  }

  static async UsagesById(cpId){
    const [rows] = await db.query(
      `SELECT cp.* , t.*
      FROM cupones_uso cp 
      INNER JOIN transacciones t ON cp.transaccion_id = t.id 
      WHERE transaccion_id = ?`,
      [cpId]
    );
    return rows;
  }
  
  static async AllActiveCoupons(){
    const [cupons] = await db.query(`
      SELECT * FROM cupones
      WHERE activo = true
      AND usos_actuales < usos_maximos
      AND CURDATE() BETWEEN fecha_inicio AND fecha_fin;
    `);
    return cupons;
  }
  
  static async GetCouponById(cpId){
    const [rows] = await db.query(`SELECT * FROM cupones WHERE id = ?`, [cpId]);
    return rows;
  }

  static async UpdateCoupon(cpId, cpData) {
    console.log("Fecha de start: ",cpData.start_day);
    console.log("Fecha de EX: ",cpData.expiration_day);
    const start_date = DateTime.fromJSDate(new Date(cpData.start_day)).toFormat("yyyy-LL-dd");
    const end_date   = DateTime.fromJSDate(new Date(cpData.expiration_day)).toFormat("yyyy-LL-dd");

    const [rows] = await db.query(
      `UPDATE cupones 
       SET codigo = ?, nombre = ?, tipo = ?, valor = ?, usos_maximos = ?,usos_actuales = ? ,
           fecha_inicio = ?, fecha_fin = ? 
       WHERE id = ?`,
      [
        cpData.code,
        cpData.name,
        cpData.discount_type,
        cpData.discount_type === "porcentaje" ? cpData.discount_porcentaje : cpData.discount_amount,
        cpData.max_uses,
        cpData.uses,
        start_date,
        end_date,
        cpId
      ]
    );
    return rows.affectedRows > 0;
  }

  static async DeleteCoupon(cpId){
    const [rows] = await db.query(`UPDATE cupones SET activo = 0 WHERE id = ? `, [cpId]);
    return rows.affectedRows > 0;
  }

  static async RedeemCoupon(
      connection,
      cpId,
      transactionId,
      userId,
      monto_descuento = null,
      cantidadUsos = 1, // cantidad de usos a incrementar (por defecto 1)
  ) {
      try{
          // (1) Actualizar el uso del cupón
          const [updateCoupon] = await connection.query(
              `UPDATE cupones 
              SET usos_actuales = usos_actuales + ?
              WHERE id = ? AND activo = 1 
              AND (usos_actuales < usos_maximos OR usos_maximos IS NULL) 
              AND CURDATE() BETWEEN fecha_inicio AND fecha_fin`,
              [
                  cantidadUsos,
                  cpId
              ]
          );
          
          if(updateCoupon.affectedRows === 0){
              throw new Error('El cupón no es válido o ha alcanzado su límite de usos.');
          }

          // (2) Registrar el uso del cupón en cupones_uso
          const [insertUsage] = await connection.query(
              `INSERT INTO cupones_uso 
                (cupon_id, transaccion_id, monto_descuento, usuario_id) 
              VALUES (?, ?, ?, ?)`,
              [
                  cpId,
                  transactionId,
                  monto_descuento,
                  userId
              ]
          );
          
          if(insertUsage.affectedRows === 0){
              throw new Error('Error al registrar el uso del cupón.');
          }

          return {
              success: true,
              cpId: cpId,
              cpUsoId: insertUsage.insertId,
              message: 'Cupón redimido exitosamente'
          };
          
      } catch(error) {
          console.error('Error al redimir cupón:', error);
          throw new Error(`Error al redimir el cupón de descuento: ${error.message}`);
      }
  }

  static async validateCoupon(cuponId) {
    try {
      const [cuponValido] = await db.query(`
        SELECT 
            id,
            codigo,
            nombre,
            tipo,
            valor,
            usos_actuales,
            usos_maximos,
            fecha_inicio,
            fecha_fin,
            activo
        FROM cupones 
        WHERE id = ? 
        AND activo = 1 
        AND usos_actuales < usos_maximos 
        AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
      `, [cuponId]);

      if (cuponValido && cuponValido.length > 0) {
        return {
          valido: true,
          cupon: cuponValido[0],
          mensaje: 'Cupón válido y disponible'
        };
      }

      // Si no es válido, obtener información para el mensaje de error
      const [cuponInfo] = await db.query(`
        SELECT 
            id,
            codigo,
            nombre,
            activo,
            usos_actuales,
            usos_maximos,
            fecha_inicio,
            fecha_fin
        FROM cupones 
        WHERE id = ?
      `, [cuponId]);

      let mensaje = 'El cupón no existe';
      if (cuponInfo && cuponInfo.length > 0) {
        const cupon = cuponInfo[0];
        if (!cupon.activo) {
            mensaje = `El cupón "${cupon.codigo}" está inactivo`;
        } else if (cupon.usos_actuales >= cupon.usos_maximos) {
            mensaje = `El cupón "${cupon.codigo}" ha alcanzado su límite de usos (${cupon.usos_maximos})`;
        } else if (new Date() < new Date(cupon.fecha_inicio)) {
            mensaje = `El cupón "${cupon.codigo}" aún no ha iniciado su vigencia`;
        } else if (new Date() > new Date(cupon.fecha_fin)) {
            mensaje = `El cupón "${cupon.codigo}" ha expirado`;
        } else {
            mensaje = `El cupón "${cupon.codigo}" no está disponible`;
        }
      }

      return {
        valido: false,
        cupon: cuponInfo && cuponInfo.length > 0 ? cuponInfo[0] : null,
        mensaje: mensaje
      };

    } catch (error) {
      throw new Error(`Error al validar cupón: ${error.message}`);
    }
  }
}

export default couponsModel;
