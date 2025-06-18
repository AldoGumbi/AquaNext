import productsModel from '../models/products.js';

import inventarioModel from '../models/inventoryModel.js';

export const insertProduct = async (req, res) => {
	try {

		if(!req.body || !req.body.general || !req.body.description || !req.body.images) {
			return res.status(400).send({
				data: false,
				message: 'El cuerpo de la solicitud es inválido o incompleto, por favor verifica los datos enviados.'
			})
		}

		const { sku ,name, price, is_available, category_id, cost } = req.body.general;
		const { description } = req.body.description;
		const { cover } = req.body.images;

		if(name.length < 1 || name === undefined || name === null) {
			return res.status(400).json({
				data: false,
				message: 'El nombre es obligatorio para crear un producto.'
			});
		}

		const newProduct = {
			sku : sku,
			nombre : name,
			descripcion : description,
			precio_venta : price,
			activo : is_available,
			categoria : category_id,
			costo : cost,
			imagen : cover
		};

		const productId = await productsModel.create(newProduct);

		if(!productId){
			return res.status(400).send({
				data: false,
				message: 'No se pudo crear el producto, por favor verifica los datos enviados.'
			})
		}
		// Si el producto se crea correctamente, se crea el inventario
		const { stock, minimum_stock, maximum_stock } = req.body.inventory;


		// obj para insertar en la tabla inventario
		const inventoryData = {
			producto_id: productId,
			existencia: stock,
			stock_minimo: minimum_stock,
			stock_maximo: maximum_stock
		};

		const inventoryId = await inventarioModel.createInventory(inventoryData);


		res.status(201).json({
			message: 'Producto creado con exito!',
			data: {
				producto_id : productId,
				invetario_id : inventoryId,
			}
		});

	} catch (error) {
		// error de duplicado de unique colum de sql
		if(error.code === 'ER_DUP_ENTRY') {
			return res.status(400).json({
				data: false,
				message: 'El SKU del producto ya existe, por favor utiliza otro.',
				code : error.errno
			});
		}
		console.log(error);
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

		const { name, cost } = req.body;


		if(name.length < 1 || name === undefined || name === null) {
			return res.status(400).json({
				data: false,
				message: 'El nombre del producto es necesario.'
			});
		}
		const updatedProduct = {
			costo : cost,
			...req.body

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

export const checkSkuAvailability = async (req, res) => {
	try {
		const { sku } = req.params;

		if (!sku || sku.trim() === '') {
			return res.status(400).json({
				data: false,
				message: 'El SKU es necesario para verificar su disponibilidad.'
			});
		}

		const isAvailable = await productsModel.skuAvailability(sku);

		if (!isAvailable) {
			return res.status(200).json({
				data: true,
				message: 'El SKU está disponible.'
			});
		} else {
			return res.status(409).json({
				data: false,
				message: 'El SKU ya está en uso.'
			});
		}
	} catch (error) {
		res.status(500).json({
			data: false,
			message: 'Error interno al verificar la disponibilidad del SKU.',
			error: error.message
		});
	}
}