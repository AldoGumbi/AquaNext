import db from '../config/db.js';
import discountCoupons from "./discountCoupons.js";
import inscripcionesModel from "./inscripciones.js";
import { DateTime } from "luxon";


class SalesModel {
	// Crear una venta
	static async MakeSale(transaction, transactionDetails,coupons) {
		// obtener una conexion
		const connection = await db.getConnection();
		try {

			const folio = await inscripcionesModel.generateFolio(connection)

			// iniciar transaccion
			await connection.beginTransaction();

			// (1) crear la transacción
			const [transactions_insert] = await connection.query(
				`INSERT INTO transacciones 
				(tipo_transaccion, monto_subtotal, 
				 monto_descuento,folio,
				 monto_total, metodo_pago, usuario_id,caja_registradora_id) 
				VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
				[
					transaction.transaction_type,
					transaction.subTotal,
					transaction.discount,
					folio,
					transaction.totalAmount,
					transaction.paymentMethod,
					transaction.user_id,
					transaction.cashRegisterId
				]
			);
			// (1.2) Validad error
			if(transactions_insert.affectedRows === 0){
				throw new Error('Error al crear la transacción, en la tabla de transacciones');
			}
			// (1.3) Obtener el id de la transacción
			const transactionId = transactions_insert.insertId;

			// (1.4) Si hay cupón, redimirlo
			if(coupons){
				const cupones_uso =await discountCoupons.RedeemCoupon(
					connection,
					coupons.id,
					transactionId,
					transaction.user_id,
					coupons.valor
				);

				if(!cupones_uso.cpUsoId){
					throw new Error('Error al redimir el cupón. ' + cupones_uso.message);
				}
			}

			// (2) insert a transection details
			for( const item of transactionDetails) {
				const concepto = `Venta de producto ID: ${item.producto_id}`;

				console.log("item: ",item);
				// (2.0) Insertar el detalle de la transacción
				const [details_insert] = await connection.query(
					`INSERT INTO transaccion_detalles
           (transaccion_id, concepto, cantidad, 
            precio_unitario, total,referencia_id,referencia_tipo)
           VALUES (?, ?, ?, ?,?,?,?)`,
					[
						transactionId,
						concepto,
						item.cantidad,
						item.precio_venta,
						(item.cantidad * item.precio_venta),
						item.producto_id,
						'producto'
					]
				);
				// (2.1) Validar error
				if (details_insert.affectedRows === 0) {
					throw new Error('Error al crear el detalle de la transacción del producto ' + item?.producto_id);
				}

				/* (2.2) Actualizar el stock del producto */

				// (2.2.1) Obtencion de la existencia actual del producto
				const [producto_existencia] = await connection.query(
					`SELECT existencia FROM inventario WHERE producto_id = ? LIMIT 1 `,
					[item.producto_id]
				);
				if (producto_existencia.length === 0) {
					throw new Error('No se encontro el producto ' + item.producto_id);
				}


				// stock del producto
				const existencia_actual = producto_existencia[0].existencia;

				// (2.2.2) Actualizar el stock tabla de inventario
				const [product_update] = await connection.query(
					`UPDATE inventario 
					SET existencia = existencia - ? 
					WHERE producto_id = ? AND existencia >= ?	LIMIT 1
					`,
					[
						item.cantidad,
						item.producto_id,
						item.cantidad
					]
				);
				// (2.3) Validar error de actualizacion de stock
				if (product_update.affectedRows === 0) {
					throw new Error(`Error al actualizar el stock del producto ID: ${item.producto_id}. Puede que no haya suficiente inventario.`);
				}
				// (2.5) Movimientos de inventario
				const [movieminetos_inventario] = await connection.query(
				` INSERT INTO movimientos_inventario 
 					(producto_id, tipo_movimiento, cantidad,
 					 existencia_anterior, existencia_nueva,
 					 transaccion_id, observaciones, usuario_id
				  ) 
 				VALUES (?,?,?,?,?,?,?,?)`,
					[
					item.producto_id,
					'salida',
					item.cantidad,
					existencia_actual ,
					(existencia_actual - item.cantidad),
					transactionId,
					concepto,
					transaction.user_id
				]);
			}

			await connection.commit();

			return transactionId;
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	}

	static async GetAllSales() {
		const connection = await db.getConnection();
		try {
			const [rows] = await connection.query(`
          SELECT
              t.id as transaccion_id,
              t.folio,
              t.monto_subtotal as subtotal,
              t.monto_descuento as descuento,
              t.monto_total as total,
              t.metodo_pago,
              t.cancelada as status_cancelacion,
              t.usuario_id,
              t.fecha_cancelacion,
              t.created_at as fecha_creacion,
              t.caja_registradora_id,

              u.username,
              u.email,
              u.rol,

              cu.monto_descuento as descuento_cupon,
              c.codigo as codigo_cupon,
              c.nombre as nombre_cupon,
              c.tipo as tipo_cupon,
              cu.usuario_id as user_uso_cupon,
              cu.created_at as fecha_uso_cupon

--               td.cantidad,
--               td.precio_unitario,
--               td.total as detalle_total
          FROM transacciones t
                   LEFT JOIN usuarios u ON t.usuario_id = u.id
                   LEFT JOIN cupones_uso cu ON t.id = cu.transaccion_id
                   LEFT JOIN cupones c ON cu.cupon_id = c.id
--                    LEFT JOIN transaccion_detalles td ON t.id = td.transaccion_id
--                    LEFT JOIN productos p ON td.referencia_id = p.id
          WHERE t.tipo_transaccion = 'producto' 
          ORDER BY t.created_at DESC;
			`);

			// // Agrupar en JS
			// const transactionsMap = new Map();
			//
			// for (const row of rows) {
			// 	if (!transactionsMap.has(row.transaccion_id)) {
			// 		transactionsMap.set(row.transaccion_id, {
			// 			transaccion_id: row.transaccion_id,
			// 			folio: row.folio,
			// 			subtotal: row.subtotal,
			// 			descuento: row.descuento,
			// 			total: row.total,
			// 			metodo_pago: row.metodo_pago,
			// 			status_cancelacion: row.status_cancelacion,
			// 			usuario_id: row.usuario_id,
			// 			fecha_cancelacion: row.fecha_cancelacion,
			// 			fecha_creacion: row.fecha_creacion,
			// 			username: row.username,
			// 			email: row.email,
			// 			rol: row.rol,
			// 			descuento_cupon: row.descuento_cupon,
			// 			codigo_cupon: row.codigo_cupon,
			// 			nombre_cupon: row.nombre_cupon,
			// 			tipo_cupon: row.tipo_cupon,
			// 			user_uso_cupon: row.user_uso_cupon,
			// 			fecha_uso_cupon: row.fecha_uso_cupon,
			// 			detalles: []
			// 		});
			// 	}
			//
			// 	// Agregar detalles si existen
			// 	if (row.producto_id) {
			// 		transactionsMap.get(row.transaccion_id).detalles.push({
			// 			cantidad: row.cantidad,
			// 			precio_unitario: row.precio_unitario,
			// 			total: row.detalle_total,
			// 			producto_id: row.producto_id,
			// 			producto_nombre: row.producto_nombre,
			// 			producto_sku: row.producto_sku,
			// 			producto_descripcion: row.producto_descripcion,
			// 			producto_precio_venta: row.producto_precio_venta
			// 		});
			// 	}
			// }

			// return Array.from(transactionsMap.values());

			return rows;
		} catch (error) {
			throw error;
		} finally {
			connection.release();
		}
	}

	static async getSaleById(transactionId) {
		try{
			const connection = await db.getConnection();
			const [rows] = await connection.query(`
          SELECT
              t.id as transaccion_id,
              t.folio,
              t.monto_subtotal as subtotal,
              t.monto_descuento as descuento_transaccion,
              t.monto_total as total_transaccion,
              t.metodo_pago,
              t.created_at as fecha_creacion,
              t.cancelada as status_cancelacion,
              t.fecha_cancelacion,

              u.username,

              c.codigo as codigo_cupon,
              c.nombre as nombre_cupon,

              a.id AS alumno_id,
              CONCAT_WS(" ", a.nombre, a.apellido_paterno, a.apellido_materno) AS alumno_nombre

          FROM transacciones t
                   LEFT JOIN usuarios u ON t.usuario_id = u.id
                   LEFT JOIN cupones_uso cu ON t.id = cu.transaccion_id
                   LEFT JOIN cupones c ON cu.cupon_id = c.id
                   LEFT JOIN alumnos a ON a.id = t.alumno_id
          WHERE t.id = ? AND t.cancelada = 0
              LIMIT 1;
			`, [transactionId]);


			const [rows_details] = await
				connection.query(`SELECT * FROM transaccion_detalles WHERE transaccion_id = ?`, [transactionId]);


			const detallesMap = new Map();

			// 	// IKER AQUI TIENES QUE HACER EL SELECT
			// 	// PARA OBTENER LOS DETALLES DE LA REFERENCIA
			// 	// DEL MENSUALIDADES O INSCRIPCIONES SI NECESITAS CLARO
			for (const detalle of rows_details) {
				if (detalle.referencia_tipo === 'producto') {
					const [producto] = await connection.query(
						`SELECT id, nombre, sku, descripcion, precio_venta 
       				FROM productos WHERE id = ? LIMIT 1`,
						[detalle.referencia_id]
					);
					if (producto.length > 0) {
						const prod = producto[0];
						// Si ya existe, acumula
						if (detallesMap.has(prod.id)) {
							const existente = detallesMap.get(prod.id);
							existente.cantidad += detalle.cantidad;
							existente.total += detalle.total;
						} else {
							// Nuevo producto agregado con la estructura que quieres
							detallesMap.set(prod.id, {
								id_producto: prod.id,
								titulo: prod.nombre,
								cantidad: detalle.cantidad,
								precio_unitario: detalle.precio_unitario,
								total: detalle.total,
								type : 'producto'
							});
						}
					}
				}
				else if (detalle.referencia_tipo === 'inscripcion') {
					const [inscripcion] = await connection.query(
						`SELECT * FROM inscripciones WHERE id = ? LIMIT 1`,
						[detalle.referencia_id]
					);
					if (inscripcion.length > 0) {
						const insc = inscripcion[0];
						const fechaInicio = DateTime.fromJSDate(insc.fecha_inscripcion).toFormat("dd/MM/yyyy");
						const fechaFin = DateTime.fromJSDate(insc.fecha_fin).toFormat("dd/MM/yyyy");
						detallesMap.set(insc.id, {
								id: insc.id,
								titulo : `Inscripción`,
								metodo_pago: insc?.metodo_pago ?? 'N/A',
								subtitulo : `Vigencia: ${insc.anos_vigencia} años`,
								subtitulo2 : `Periodo: ${fechaInicio} - ${fechaFin}`,
								cantidad: insc.anos_vigencia,
								precio_unitario: detalle.precio_unitario,
								total: detalle.total,
							type : 'inscripcion'
						});
					}
				}
				else if (detalle.referencia_tipo === 'mensualidad') {
					const [mensualidad] = await connection.query(
						`SELECT * FROM mensualidades WHERE id = ? LIMIT 1`,
						[detalle.referencia_id]
					);
					if (mensualidad.length > 0) {
						const mens = mensualidad[0];
						const fechaInicioDT = DateTime.fromJSDate(mens.fecha_inicio);
						const fechaFinDT = DateTime.fromJSDate(mens.fecha_fin);

						console.log(mensualidad);
						const fechaInicio = fechaInicioDT.toFormat("dd/MM/yyyy");
						const fechaFin = fechaFinDT.toFormat("dd/MM/yyyy");

						let diffMeses = Math.floor(fechaFinDT.diff(fechaInicioDT, 'months').months);

						diffMeses = diffMeses == 0 ? 1 : diffMeses;
						detallesMap.set(mens.id, {
							id: mens.id,
							metodo_pago: mens?.metodo_pago ?? 'N/A',
							titulo : `Mensualidad`,
							subtitulo : `Periodo: ${fechaInicio} - ${fechaFin} (${diffMeses} meses)`,
							cantidad: diffMeses,
							precio_unitario: detalle?.precio_unitario / diffMeses,
							total: detalle?.total,
							type : 'mensualidad'
						});
					}
				}
				else if (detalle.referencia_tipo === 'clase_prueba') {
					const alumno = rows[0].alumno_id ? {
						id : rows[0].alumno_id,
						nombre : rows[0].alumno_nombre
					} : null;

					const [clase] = await connection.query(
						`SELECT
                 c.id,
                 CONCAT('Clase de prueba - ' , g.nombre) AS titulo,
                 '0.00' as precio_unitario,
                 p.nombre AS profesor_nombre,
                 g.nivel,
                 h.dia AS horario_dia,
                 TIME_FORMAT(h.hora_inicio, '%H:%i') AS horario_hora_inicio,
								 TIME_FORMAT(h.hora_fin, '%H:%i') AS horario_hora_fin,
									DATE_FORMAT(c.fecha ,'%d/%m/%Y') as fecha_clase

             FROM clases c
                      INNER JOIN horarios h ON h.id = c.horario_id
                      INNER JOIN grupos g ON g.id = h.grupo_id
                      INNER JOIN profesores p ON p.id = h.profesor_id
             WHERE c.id = ? LIMIT 1`,
						[detalle.referencia_id]
					);

					if (clase.length > 0) {
						const cls = clase[0];
						detallesMap.set(cls.id, {
							alumno_id: alumno.id ?? null,
							alumno_nombre : alumno.nombre ?? null,
							id: cls.id,
							titulo: cls.titulo,
							subtitulo: `Profesor: ${cls.profesor_nombre} - Nivel: ${cls.nivel}`,
							subtitulo2: `Fecha: ${cls.fecha_clase} Horario: ${cls.horario_dia} ${cls.horario_hora_inicio} - ${cls.horario_hora_fin}`,
							cantidad: detalle.cantidad,
							precio_unitario: detalle.precio_unitario,
							total: detalle.total,
							type: 'clase_prueba'
						});
					}
				}
			}

			// Convertir a objeto
			const detalles = Array.from(detallesMap.values());

			return {
				...rows[0],
				detalles: detalles,

			};

		}catch(err){
			throw err;
		}
	}

	static async venderClasePrueba(connection,transaction, transactionDetails, alumnoId) {
		// obtener una conexion
		try {

			// iniciar transaccion
			await connection.beginTransaction();

			const folio = await inscripcionesModel.generateFolio(connection)


			// (1) crear la transacción
			const [transactions_insert] = await connection.query(
				`INSERT INTO transacciones
         (tipo_transaccion,
          monto_subtotal,
          folio,
          monto_total,
          metodo_pago,
          usuario_id,
          alumno_id,
          caja_registradora_id)
         VALUES (?, ?, ?, ?, ?,? , ?, ?)`,
				[
					'clase_prueba',
					transaction.subTotal,
					folio,
					transaction.totalAmount,
					"efectivo",
					transaction.user_id,
					alumnoId, // alumno id
					transaction.cashRegisterId
				]
			);

			//(1.2) obtencion del id de la transaccion creada
			const transactionId = transactions_insert.insertId;

			// (2) detalles de la transaccion perro.
			const [details_insert] = await connection.query(
				`INSERT INTO transaccion_detalles
         (transaccion_id,
          concepto,
          cantidad,
          precio_unitario,
          total,
          referencia_tipo,
          referencia_id)
         VALUES (?, ?, ?, ?, ?, ?,?)`,
				[
					transactionId,
					transactionDetails.concepto,
					transactionDetails.cantidad,
					transactionDetails.precio_unitario,
					(transactionDetails.cantidad * transactionDetails.precio_unitario),
					'clase_prueba',
					transactionDetails.referencia_id
				]
			);

			await connection.commit();
			return {
				transactionId,
				detailsId: details_insert.insertId
			};

		} catch (error) {
			await connection.rollback();
			throw error;
		}
	}
}

export default SalesModel;


//          p.id as producto_id,
//            p.nombre as producto_nombre,
//             p.sku as producto_sku,
//            p.descripcion as producto_descripcion,
//           p.precio_venta as producto_precio_venta
//                LEFT JOIN transaccion_detalles td ON t.id = td.transaccion_id
//LEFT JOIN productos p ON td.referencia_id = p.id
