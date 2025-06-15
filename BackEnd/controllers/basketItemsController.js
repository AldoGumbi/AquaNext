import basketItemsModel from "../models/basketItems.js";

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


    console.log(basketId,items);
    const newItem = await basketItemsModel.insertItemsBasket(basketId, items);

    if (!newItem) {
      return res.status(400).json({
        data: false,
        message: 'No se pudo agregar el producto al carrito.'
      });
    }

    const ans = {
      id : newItem,
      imagen : req.body.img || '',
      nombre : req.body.name || '',
      precio_venta : req.body.price || 0,
      cantidad: quantity || 0,
      comentario: comment || ''
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

    const deletedItem = await basketItemsModel.deleteItems(id);

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

export const updateBasketItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, quantity, comment } = req.body;

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id)) ) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un ID del item a editar.'
      });
    }
    // Validar que el product_id sea un número válido
    if (!product_id || isNaN(Number(product_id))) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un ID del producto a editar.'
      });
    }
    // Validar que la cantidad sea un número válido y mayor a 0
    if(!quantity || isNaN(Number(quantity)) || quantity <= 0) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario una cantidad valida del producto a editar.'
      });
    }

    const items = {
      product_id,
      quantity,
      comment,
      id
    }


    const updatedItem = await basketItemsModel.editItemsBasket(id, items);

    if(updatedItem){
      res.status(200).json({
        message: 'Item editado correctamente.',
        data: items
      });
    }else {
      return res.status(404).json({
        message: 'No se encontro el item en el carrito.'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error al editar el item del carrito',
      error : error.message
    });
  }
}


