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

export const insertBasketItems = async (req, res) => {
	try {
		const { product_id, quantity, comment, basketId, } = req.body;
		// Validar que el basketId sea un número válido
		if (!basketId || isNaN(Number(basketId))) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario el ID del carrito para agregar un producto.'
			});
		}

		// Validar que el producto_id sea un número válido
		if (!product_id  || isNaN(Number(product_id))) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario un ID del producto a agregar.'
			});
		}
		// Validar que la cantidad sea un número válido y mayor a 0
		if(!quantity || isNaN(Number(quantity)) || quantity <= 0) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario una cantidad valida del producto a agregar.'
			});
		}

		const items = {
			product_id,
			quantity,
			comment
		}

		const newItem = await basketModel.insertItemsBasket(basketId, items);

		if (!newItem) {
			return res.status(400).json({
				data: false,
				message: 'No se pudo agregar el producto al carrito.'
			});
		}

		const ans = {
			id : newItem,
			img : req.body.img || '',
			name : req.body.name || '',
			price : req.body.price || 0,
			quantity: quantity || 0,
			comment: comment || ''
		}

		res.status(201).json({
			data: ans,
			message: 'Producto agregado al carrito exitosamente'
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error al agregar el producto al carrito',
			error : error.message
		});
	}
}

export const deleteBasketItem = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id || isNaN(Number(id)) ) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario un ID del item a borrar.'
			});
		}

		const deletedItem = await basketModel.deleteItems(id);

		if(deletedItem){
			res.status(200).json({
				message: 'Item agregado corretamente al carrito.',
				data: deletedItem
			});
		}else {
			return res.status(404).json({
				message: 'No se encontro el item en el carrito.'
			});
		}


	} catch (error) {
		res.status(500).json({
			message: 'Error al borrar el item del carrito',
			error : error.message
		});
	}
}