import couponsModel from '../models/discountCoupons.js';


export const insertCoupons = async (req, res) => {
  try {
    const {
      name,
      code,
      max_uses,
      discount_type,
      discount_amount,
      discount_porcentaje,
      expiration_day,
      start_day
    } = req.body;

    let discount_value = 0;

    // Validar que el código del cupón no esté vacío
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({
        data: false,
        message: 'El código del cupón es obligatorio.'
      });
    }

    // Validar que el Nombre del descuento sea válido
    if(!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        data: false,
        message: 'El nombre del cupón es obligatorio.'
      });
    }

    // Validar que max_uses sea un número válido
    if (!max_uses || isNaN(Number(max_uses)) || Number(max_uses) <= 0) {
      return res.status(400).json({
        data: false,
        message: 'El número máximo de usos es obligatorio y debe ser un número mayor a 0.'
      });
    }

    // Validar que la fecha de expiración sea una fecha válida
    if (!expiration_day || isNaN(new Date(expiration_day).getTime())) {
      return res.status(400).json({
        data: false,
        message: 'La fecha de expiración es obligatoria y debe ser una fecha válida.'
      });
    }

    // Validar que la fecha de inicio sea una fecha válida
    if (!start_day || isNaN(new Date(start_day).getTime())) {
      return res.status(400).json({
        data: false,
        message: 'La fecha de inicio es obligatoria y debe ser una fecha válida.'
      });
    }

    // Si el tipo de descuento es porcentaje, validar que el porcentaje sea un número válido
    if(discount_type === 'porcentaje'){
      // Solo en caso que sea porcentaje y no exista discount_amount
      if (!discount_porcentaje || isNaN(Number(discount_porcentaje)) || Number(discount_porcentaje) <= 0 || Number(discount_porcentaje) > 100) {
        return res.status(400).json({
          data: false,
          message: 'El porcentaje de descuento es obligatorio y debe ser un número entre 0 y 100.'
        });
      }
      discount_value =  Number(discount_porcentaje);
    }
    else{ // Obiamente si no es porcentaje, debe ser monto fijo
      if(!discount_amount || isNaN(Number(discount_amount)) || Number(discount_amount) <= 0) {
        return res.status(400).json({
          data: false,
          message: 'El monto de descuento es obligatorio y debe ser un número mayor a 0.'
        });
      }
      discount_value = Number(discount_amount);
    }
    // Verificar que el código del cupón no exista en la base de datos
    const newCoupon = await couponsModel.createCoupon({
      code,
      name,
      max_uses: Number(max_uses),
      discount_type,
      discount_value,
      start_date: new Date(start_day),
      end_date: new Date(expiration_day)
    });

    if (!newCoupon) {
      return res.status(400).json({
        data: false,
        message: 'Hubo un error al crear el cupón de descuento. Por favor, inténtalo de nuevo.'
      });
    }

    res.status(201).json({
      data: newCoupon,
      message: 'Cupón de descuento creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el cupón de descuento',
      error : error.message
    });
  }
}

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponsModel.getCoupons();
    if (!coupons || coupons.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No se encontraron cupones de descuento.'
      });
    }
    res.status(200).json({
      data: coupons,
      message: 'Cupones de descuento obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los cupones de descuento',
      error : error.message
    });
  }
}

export const getUsagesById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: 'El ID del cupón es obligatorio y debe ser un número válido.'
      });
    }
    const usages = await couponsModel.UsagesById(Number(id));
    if (!usages || usages.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No se encontraron usos para el cupón de descuento.'
      });
    }
    res.status(200).json({
      data: usages,
      message: 'Usos del cupón de descuento obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los usos del cupón de descuento',
      error : error.message
    });
  }
}

// this return all the cupons that are avaliable this mean
// that has to be active and between the range of date between
// fecha de inicio and fecha de fin.
export const getAllActiveCoupons = async (req, res) => {
  try {
    const coupons = await couponsModel.AllActiveCoupons();
    if (!coupons || coupons.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No se encontraron cupones de descuento.'
      });
    }
    res.status(200).json({
      data: coupons,
      message: 'Cupones de descuento obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los cupones de descuento',
      error : error.message
    });
  }
}

export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        error: true,
        message : "Es necesario el identificador del codigo de descuento."
      });
    }
    
    const coupon = await couponsModel.GetCouponById(id);
    if (!coupon || coupon.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No se encontraró cupon de descuento.'
      });
    }
    res.status(200).json({
      data: coupon,
      message: 'Cupon de descuento obtenido exitosamente!'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los cupones de descuento',
      error : error.message
    });
  }
}
