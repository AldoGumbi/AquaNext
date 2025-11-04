import basketItemsModel from "../models/basketItems.js";
import inventarioModel from '../models/inventoryModel.js';

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

    let items = {};

    let cantidadTotal = Number(quantity);

    const exitsItem = await basketItemsModel.findItemInBasket(basketId, product_id);

    if(exitsItem){
      cantidadTotal += Number(exitsItem.cantidad);
    }

    // Checar la disponibilidad del producto
    const stockInfo = await inventarioModel.getProductoAvailability(product_id);

    if (!stockInfo || stockInfo.stock < cantidadTotal ) {
      return res.status(400).json({
        data: false,
        message: 'No hay suficiente inventario disponible para agregar la cantidad solicitada al carrito.'
      });
    }

    // En caso que exista el producto en el carrito, actualizamos la cantidad
    if(exitsItem){

      // seleccion de id del item en el carrito
      const cartItemId = exitsItem.carrito_items_id;


      // objeto de actulizacion
      items = {
        quantity : Number(exitsItem.cantidad) + Number(quantity),
        comment : comment || exitsItem.comment,
      }

      // update a la base de datos
      const updateItem = await basketItemsModel.editItemsBasket(cartItemId, items);

      // manejo de error
      if (!updateItem) {
        return res.status(400).json({
          data: false,
          message: 'No se pudo modifcar la cantidad de venta el producto al carrito.'
        });
      }

      // respuesta del item actualizado objeto
      const ans = {
        id : cartItemId,
        imagen : req.body.img || '',
        nombre : req.body.name || '',
        precio_venta : req.body.price || 0,
        cantidad: Number(exitsItem.cantidad) + Number(quantity) || 0,
        comentario: comment || exitsItem.comment,
        producto_id : product_id
      }

      // respuesta exitosa
      res.status(201).json({
        data: ans,
        message: 'Producto agregado al carrito exitosamente'
      });

    }
    // En caso que no exista el producto en el carrito, creamos una instancia nueva
    else{
      items = {
        product_id,
        quantity,
        comment
      }

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
        comentario: comment || '',
        producto_id : product_id
      }

      res.status(201).json({
        data: ans,
        message: 'Producto agregado al carrito exitosamente'
      });
    }

  } catch (error) {
    console.log(error);
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
        data: Number(id)
      });
    }else {
      return res.status(400).json({
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
    const { quantity, comment } = req.body;

    console.log(req.body)

    // Validar que el id sea un número válido
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un ID del carrito_items a editar.'
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
      quantity,
      comment,
      basket_items_id : Number(id)
    }
    // Obtener detalles del item en el carrito
    const basketItemDetails = await basketItemsModel.getProductIdByBasketItemId(id);
    if (!basketItemDetails) {
      return res.status(400).json({
        data: false,
        message: 'No se encontró el item en el carrito.'
      });
    }
    // Verificar la disponibilidad del producto en inventario
    let cantidadTotal = Number(quantity);


    // Checar la disponibilidad del producto
    const stockInfo = await inventarioModel.getProductoAvailability(basketItemDetails.producto_id);

    if (!stockInfo || stockInfo.stock < cantidadTotal ) {
      return res.status(400).json({
        data: false,
        message: 'No hay suficiente inventario disponible para agregar la cantidad solicitada al carrito.'
      });
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
  } catch (error){
    console.log(error);
    res.status(500).json({
      message: 'Error al editar el item del carrito',
      error : error.message
    });
  }
}
