import basketModel from '../models/basket.js';

export const createBasket = async (req, res) => {
	try {
		const {  user_id } = req.body;

		const newBasket = await basketModel.create({ user_id });
		res.status(201).json({
			data: newBasket,
			message: 'Carrito creado exitosamente.',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al crear el carrito',
			error: error.message
		});
	}
}

export const getBasket = async (req, res) => {
	try {
		const basketId = req.params.id;

		if (!basketId || basketId.trim() === '' || basketId === ':basketId' || isNaN(Number(basketId))) {
			return res.status(400).json({
				data: false,
				message: 'No se obtuvo un ID de carrito válido'
			});
		}

		const basket = await basketModel.getBasketById(basketId);
		if (!basket) {
			return res.status(404).json({
				message: 'No se encontró el carrito.',
			});
		}

		res.status(200).json({
			data: basket,
			message: 'Carrito encontrado correctamente.'
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al obtener el carrito',
			error : error.message
		});
	}
}

export const updateBasket = async (req, res) => {
	try {
		const basketId = req.params.id;

		if (!basketId || basketId.trim() === '' || basketId === ':basketId' || isNaN(Number(basketId))) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario del ID del carrito!'
			});
		}

		const { usuario_id } = req.body;
		const updatedBasket = await basketModel.update(basketId, { usuario_id });

		if (updatedBasket === 0) {
			return res.status(404).json({
				message: 'No se encontro el carrito correspondiente.'
			});
		}

		res.status(200).json({
			message: 'Carrito actualizado con exito!.',
			data: updatedBasket
		});

	} catch (error) {
		res.status(500).json({
			message: 'Error al actualizar el carrito',
			error : error.message
		});
	}
}

export const deleteBasket = async (req, res) => {
	try {
		const basketId = req.params.id;

		if (!basketId || basketId.trim() === '' || basketId === ':basketId' || isNaN(Number(basketId))) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario ID del carrito para ser borrado.'
			});
		}

		const deletedBasket = await basketModel.delete(basketId);

		if (!deletedBasket) {
			return res.status(404).json({
				message: 'No se encotro el carrito.'
			});
		}

		res.status(200).json({
			message: 'Carrito borrado con exito!' ,
			data: basketId
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error interno al borrar el carrito',
			error : error.message
		});
	}
}

export const allBaskets = async (req, res) => {
	try {
		const baskets = await basketModel.getAllBaskets();
		if (baskets.length === 0) {
			return res.status(404).json({
				data: false,
				message: 'No existen carritos activos'
			});
		}
		res.status(200).json({
			data: baskets,
			message: 'Carritos obtenidos con exito!'
		});
	} catch (error) {
		res.status(500).json({
			data: false,
			message: 'Error interno al obtener los carritos',
			error : error.message
		});
	}
}

// applying discount to the cart
export const applyCuponBasket = async (req, res) => {
	try {
		if (!req.body.coupon_id || req.body.coupon_id === null) {
			return res.status(400).json({
				data: false,
				error: true,
				message: 'Es necesario del identificador del cupon no existe.'
			})
		}
		if (!req.body.basket_id || req.body.basket_id === null) {
			return res.status(400).json({
				data: false,
				error: true,
				message: 'No se selecciono ningun carrito de venta.'
			})
		}
		
		const affectedRows = await basketModel.applyDiscount({
			coupon_id : req.body.coupon_id,
			basket_id: req.body.basket_id,
		});
		
		if(affectedRows){
			return res.status(200).json({
				data : {
					...req.body
				},
				message : "Cupon aplicado correctamente al carrito."
			})
		}else{
			return res.status(400).json({
				data: false,
				message: 'No se encontro el carrito',
			})
		}
	} catch (error) {
		res.status(500).json({
			data: false,
			message: 'Error interno al obtener los carritos',
			error : error.message
		});
	}
}


export const unApplyDiscount = async (req, res) => {
	try{
		// (1) Making sure the id from the basket exist!
		if(!req.params.id){
			return res.status(400).json({
				data: false,
				error: true,
				message: 'Es necesario del identificador del carrito!',
			})
		}
		
		// (2) calling the model
		const answer = basketModel.unApplyDiscount(req.params.id);
		
		// (3) processing the answer in case we got it rigth
		if(answer){
			return res.status(200).json({
				data : null,
				message : "Cupon eliminado correctamente al carrito."
			})
		}
		
		// (4) if the cart dosent exit or the cart dont have any coupon linked
		res.status(404).json({
			data: null,
			message: 'No se encontro el carrito o el carrito no cuenta con un descuento activo!',
		})
		
	
	}catch (error){
		res.status(500).json({
			data: false,
			message: 'Error interno al desasignar el descuento al carrito!',
			error : true,
			error_message : error.message
		})
	}
}