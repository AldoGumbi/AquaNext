import productsModel from '../models/products.js';

export const insertProduct = async (req, res) => {
	try {

		if(!req.body || !req.body.general || !req.body.description || !req.body.images) {
			return res.status(400).send({
				data: false,
				message: 'El cuerpo de la solicitud es inválido o incompleto, por favor verifica los datos enviados.'
			})
		}

		const { sku ,name, price, is_available, category, cost } = req.body.general;
		const { description } = req.body.description;
		const { cover } = req.body.images;

		if(name.length < 1 || name === undefined || name === null) {
			return res.status(400).json({
				data: false,
				message: 'Name is required'
			});
		}

		const newProduct = {
			sku : sku,
			nombre : name,
			descripcion : description,
			precio_venta : price,
			activo : is_available,
			categoria : category,
			costo : cost,
			imagen : cover
		};

		const productId = await productsModel.create(newProduct);

		res.status(201).json({
			message: 'Producto creado con exito!',
			data: productId
		});

	} catch (error) {
		res.status(500).json({
			data:false,
			message: 'Ocurrio un error al crear el producto!',
			error : error.message
		});
	}
}

export const getAllProducts = async (req, res) => {
	try {
		const products = await productsModel.getAll();
		if(products.length === 0) {
			return res.status(404).json({
				data: false,
				message: 'No se encontraron productos!'
			});
		}
		res.status(200).json({
			data: products,
			message: 'Obtención de productos'
		});
	} catch (error) {
		res.status(500).json({
			data:false,
			message: 'Error interno al obtener los productos',
			error : error.message
		});
	}
}

export const updateProduct = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
			return res.status(400).json({
				data: false,
				message: 'Es necesario el ID del producto a modificar!'
			});
		}

		const { sku, name, price, is_avaliable, category, cost, img, description } = req.body;

		if(name.length < 1 || name === undefined || name === null) {
			return res.status(400).json({
				data: false,
				message: 'El nombre del producto es necesario.'
			});
		}
		const updatedProduct = {
			sku,
			name,
			description,
			price,
			is_avaliable,
			category,
			costo : cost,
			img,
			id
		};
		const isUpdated = await productsModel.update(id, updatedProduct);

		if(isUpdated) {
			res.status(200).json({ message: 'Producto actualizado correctame!', data: updatedProduct });
		}
		else {
			res.status(404).json({data: false, message: 'Producto no actualizado, puede que no exista!' });
		}

	}catch (error) {
		res.status(500).json({
			data:false,
			message: 'Error interno en el servidor',
			error : error.message
		});
	}
}

export const deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id || id.trim() === '' || id === ':id' || isNaN(Number(id))) {
			return res.status(400).json({
				data: false,
				message: 'Se necesita un ID del producto valida!'
			});
		}
		const isDeleted = await productsModel.delete(id);
		if(isDeleted) {
			res.status(200).json({
				data : id ,
				message: 'Producto borrado con exito!'
			});
		} else {
			res.status(404).json({
				data: false,
				message: 'Producto no encontrado o ya fue borrado'
			});
		}
	} catch (error) {
		res.status(500).json({
			data:false,
			message: 'Error interno al borrar el producto',
			error : error.message
		});
	}
}