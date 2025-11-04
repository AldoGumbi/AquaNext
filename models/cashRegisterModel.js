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
  static async getCurrentCashRegister() {
    const [rows] = await db.query(`
      SELECT
        cr.id,
        cr.shift,
        cr.total,
        cr.updated_at,
        u.username,
        COUNT(t.id) AS transaction_count,
        COALESCE(SUM(t.monto_total), 0) AS total_sales
      FROM caja_registradora cr
             LEFT JOIN transacciones t
                       ON cr.id = t.caja_registradora_id
                         AND t.cancelada = false
             INNER JOIN usuarios u
                        ON cr.user_id = u.id
      WHERE cr.status IN ('open', 'reopened') 
      GROUP BY cr.id, cr.shift, cr.total, cr.updated_at, u.username;
    `,);
    return rows;
  }

  // close a cash register
  static async close(caja) {
    const [result] = await db.query(`
      UPDATE caja_registradora
      SET status = 'close',
          amount_closing = ?,
          comment = ?
      WHERE id = ?
    `, [
      caja.amount_closing,
      caja.comment,
      caja.cash_register_id
    ]);
    return result.affectedRows;
  }
  
  // Last cash register closed
  static async getLastClosedCashRegister() {
    const [rows] = await db.query(`
      SELECT
          cr.id, cr.shift, cr.total, cr.updated_at,
          u.username
      FROM caja_registradora cr
               INNER JOIN usuarios u on cr.user_id = u.id
      WHERE status = 'close'
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    return rows[0];
  }

  // Get cash register and their transactions by date and shift
  static async getByDateAndShift(date, shift) {
    // Convertimos la fecha a rango de día completo
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    // (2) Construimos la consulta SQL dinámicamente
    let query =`
      SELECT
        distinct t.folio,
                 t.id as transaccion_id,
                 cr.id as caja_id,
                 u.username,

                 t.monto_subtotal as transaccion_subtotal,
                 t.monto_descuento as transaccion_descuento,
                 t.monto_total as transaccion_total,
                 t.metodo_pago,
                 t.created_at as fecha_transaccion,

                 cr.shift as turno_caja,
                 cr.status as caja_status,
                 t.tipo_transaccion as tipo_transaccion,
                 cr.updated_at as updated_at

      FROM transacciones t
             INNER JOIN caja_registradora cr ON t.caja_registradora_id = cr.id
             INNER JOIN usuarios u ON cr.user_id = u.id
             INNER JOIN transaccion_detalles td ON t.id = td.transaccion_id

      WHERE (cr.created_at BETWEEN ? AND ?) AND t.cancelada = 0`
    // (2.1) En caso de que both o indivual
    if(shift === "both"){
      query += ` AND (cr.shift = 'matutino' OR cr.shift = 'vespertino') `;
    }else{
      query += ` AND cr.shift = ? `;
    }
    // (2.2) En caso de que sea individual
    let params = [ startOfDay, endOfDay];
    if(shift !== "both"){
      params.push(shift);
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get cash register and their transactions by date and shift
  static async getCategoriasByDatesAndShifts(date, shift) {
    // Convertimos la fecha a rango de día completo
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    // (2) Construimos la consulta SQL dinámicamente
    let query =`
      SELECT
        referencia_tipo,
        COUNT(*) AS cantidad
      FROM transacciones t
             INNER JOIN caja_registradora cr ON t.caja_registradora_id = cr.id
             INNER JOIN usuarios u ON cr.user_id = u.id
             INNER JOIN transaccion_detalles td ON t.id = td.transaccion_id

      WHERE (cr.created_at BETWEEN ? AND ?) AND cr.shift = ? AND t.cancelada = 0
    GROUP BY referencia_tipo `;

    let params = [ startOfDay, endOfDay,shift];

    const [rows] = await db.query(query, params);
    return rows;
  }

  // GET HOW MUCH OPENS AND CLOSE CASH REGISTERS BY DATE AND
  // ESTO ES PARA OBETENER CON CUANTO ABRE Y CIERRA UNA CAJA JUNTO CON SU TURNO
  // SE USA EN EL CARD DE TOTALES EN EL HISTORICO DE LA CAJA REGISTRADORA
  static async getStaredDetails(date, shift) {
    // Convertimos la fecha a rango de día completo
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;
    let params = [startOfDay, endOfDay,shift];

    // (2) Construimos la consulta SQL dinámicamente
    let query =`
    SELECT
        SUM(cr.amount_opening) as monto_apertura,
        SUM(cr.amount_closing) as monto_cierre,
        cr.shift as turno
    
    FROM caja_registradora cr
    INNER JOIN transacciones t ON cr.id = t.caja_registradora_id 
        WHERE (cr.created_at BETWEEN ? AND ?) AND t.cancelada = 0
        AND (cr.shift = ?)
    `;
    const [rows] = await db.query(query, params);
    return rows[0];
  }

  // Get amount collected by date and shift
  static async getCashCollected(date, shift) {
    // Convertimos la fecha a rango de día completo
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    // (2) Construimos la consulta SQL dinámicamente
    let query =`
      SELECT 'transacciones' AS origen, COALESCE(SUM(t.monto_total), 0) AS total
      FROM transacciones t
      WHERE t.metodo_pago = 'efectivo' AND t.cancelada = 0

      UNION ALL

      SELECT 'inscripciones' AS origen, COALESCE(SUM(i.monto), 0) AS total
      FROM inscripciones i
      WHERE i.metodo_pago = 'efectivo' AND t.cancelada = 0

      UNION ALL

      SELECT 'mensualidades' AS origen, COALESCE(SUM(m.monto_pagado), 0) AS total
      FROM mensualidades m
      WHERE m.metodo_pago = 'efectivo' AND t.cancelada = 0
      `;


    let params = [ startOfDay, endOfDay,shift];

    const [rows] = await db.query(query, params);
    return rows;
  }


  static async getCorteById(cashRegisterId) {
    const [rows] = await db.query(`
    SELECT
        -- transacciones
      t.metodo_pago,
      t.folio,
  
      -- transacciones details
      td.referencia_tipo as tipo_venta,
      td.subtotal as detalle_subtotal,
      td.descuento as detalle_descuento,
      td.total as detalle_total,
      td.cantidad as detalle_cantidad,
      td.concepto,
  
      -- producto
      CONCAT(p.nombre, ' (', p.sku, ')') as producto,
  
      -- mensualidad info
      CONCAT(DATE_FORMAT(m.fecha_inicio, '%d/%m/%Y'), ' - ',DATE_FORMAT(m.fecha_fin, '%d/%m/%Y')) as mensualidad,
  
      -- inscripcion info
      CONCAT(DATE_FORMAT(i.fecha_inscripcion, '%d/%m/%Y'), ' - ',DATE_FORMAT(i.fecha_fin, '%d/%m/%Y')) as inscripcion,
      i.anos_vigencia as inscripcion_anos_vigencia,
  
  
      -- alumno info
      CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', IFNULL(a.apellido_materno, '')) as nombre_completo_alumno,
      -- usuario
      u.username
      
    FROM transacciones t
    INNER JOIN transaccion_detalles td ON t.id = td.transaccion_id
    LEFT JOIN productos p ON td.referencia_id = p.id AND td.referencia_tipo = 'producto'
    LEFT JOIN mensualidades m ON td.referencia_id = m.id AND td.referencia_tipo = 'mensualidad'
    LEFT JOIN inscripciones i ON td.referencia_id = i.id AND td.referencia_tipo = 'inscripcion'
    LEFT JOIN alumnos a ON t.alumno_id = a.id
    LEFT JOIN usuarios u ON t.usuario_id = u.id
    WHERE caja_registradora_id = ? AND t.cancelada = 0
    ORDER BY t.folio ASC;
    `,[cashRegisterId]);
    return rows;
  }

}

export default CashRegisterModel;
