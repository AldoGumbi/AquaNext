import SalesModel from '../models/SaleModel.js';
import basketModel from "../models/basket.js";

export const MakeASale = async (req, res) => {
	try {
		// (1) Se crea el objeto del request body
		const body = req.body;
		// (2) Validar los datos para generar la insercion a la tabla de transacciones
		if(!body?.transaction_type || !body?.subTotal
			|| !body?.totalAmount
			 || !body?.paymentMethod
			 || !body?.basketId
		){

			return res.status(400).json({
				data: false,
				message: 'Error: Información de venta incompleta',
				error: true
			});
		}

		let pago;
		switch (body.paymentMethod) {
			case 'cash':
				pago = 'efectivo';
				break;
			case 'card':
				pago = 'tarjeta';
				break;
			case 'transfer':
				pago = 'transferencia';
				break;
			default:
				pago = 'efectivo';
				break;
		}

		const basketId = body.basketId || null;
		if(!basketId){
			return res.status(400).json({
				data: false,
				message: 'Error: No se proporcionó el ID del carrito.',
				error: true
			});
		}

		const cashRegisterId = body?.cashRegisterId;
		if(cashRegisterId === null || cashRegisterId === undefined){
			return res.status(400).json({
				data: false,
				message: 'Error: No se proporcionó el ID de la caja registradora.',
				error: true
			});
		}

		// (2) Objeto transaccion

		// (2.1) Objeto para llamar al metodo
		const transaction = {
			transaction_type: body.transaction_type || null,
			subTotal: body.discount + body.totalAmount,
			discount: body.discount || 0.00,
			totalAmount: body.totalAmount || 0.00,
			paymentMethod: pago,
			user_id: body.user_id || null,
			cashRegisterId
		};


		// (3) Objeto Detalles de la transaccion
		const items = body.items || [];
		if(items.length === 0){
			return res.status(400).json({
				data: false,
				message: 'Error: No hay productos a vender.',
				error: true
			});
		}

		const coupon = body.coupon || null;

		// (3.1) crear la transaccion
		const transccionId = await SalesModel.MakeSale(transaction, items,coupon);

		// eliminamos los carritos y todo eso
		await basketModel.delete(basketId);


		res.status(201).json({
			data: {
				transccionId,
				basketId
			},
			message: 'Venta procesada correctamente'
		});

	} catch (error) {
		console.log("Error en la generacion de la venta: ",error.errno);

		if(error.errno == 1364 ){
			return res.status(400).json({
				data: false,
				message: 'No hay una caja registradora abierta. Por favor, abra una caja antes de procesar la venta.',
				error: error.sqlMessage
			})
		}

		res.status(500).json({
			data: false,
			message: 'Error interno al procesar la venta',
			error: error.message
		});
	}
}

export const GetSales = async (req, res) => {
	try {
		const sales = await SalesModel.GetAllSales();
		res.status(200).json({
			data: sales,
			message: 'Ventas obtenidas correctamente'
		});
	} catch (error) {
		console.log("Error al obtener las ventas: ",error);
		res.status(500).json({
			data: false,
			message: 'Error interno al obtener las ventas',
			error: error.message
		});
	}
}

export const getSaleById = async (req, res) => {
	try {
		const transsacionId = req.params.id;

		if(!transsacionId){
			return res.status(400).json({
				error: true,
				message: 'Error: No se proporcionó el ID de la transacción'
			});
		}

		const sale = await SalesModel.getSaleById(transsacionId);
		if(!sale){
			return res.status(404).json({
				data: false,
				message: 'Error: No se encontró la venta con el ID proporcionado',
				error: true
			});
		}

		res.status(200).json({
			data: sale,
			message: 'Venta obtenida correctamente'
		});

	}catch (error) {
		console.log("Error al obtener la venta por ID: ",error);
		res.status(500).json({
			data: false,
			message: 'Error interno al obtener la venta por ID',
			error: error
		});
	}
}
