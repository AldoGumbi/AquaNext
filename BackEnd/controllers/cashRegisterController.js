import CashRegisterModel from "../models/cashRegisterModel.js";


export const createCashRegister = async (req, res) => {
  try {
    const { shift, amount_opening, user_id } = req.body;

    // Validar que el shift sea un número válido
    if (!shift || (shift !== 'vespertino' && shift !== 'matutino')) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un turno válido para crear la caja.'
      });
    }

    // Validar que el amount_opening sea un número válido
    if (amount_opening === undefined || isNaN(Number(amount_opening))) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un monto de apertura válido para crear la caja.'
      });
    }

    // Validar que el user_id sea un número válido
    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({
        data: false,
        message: 'Es necesario un ID de usuario válido para crear la caja.'
      });
    }

    const newCashRegister = await CashRegisterModel.create({
      shift,
      amount_opening,
      user_id
    });

    if (!newCashRegister) {
      return res.status(400).json({
        data: false,
        message: 'No se pudo crear la caja registradora.'
      });
    }

    res.status(201).json({
      data: { id: newCashRegister },
      message: 'Caja registradora creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error al crear la caja registradora',
      error: error.message
    });
  }
}

export const getAnyOpenCashRegister = async (req, res) => {
  try {
    const openCashRegisters = await CashRegisterModel.getOpenCashRegister();

    if (openCashRegisters.length === 0) {
      return res.status(404).json({
        data: false,
        message: 'No hay cajas registradoras abiertas o reabiertas.',
        error: 10001 // Custom error code for no open cash registers
      });
    }

    res.status(200).json({
      data: openCashRegisters,
      message: 'Cajas registradoras abiertas o reabiertas obtenidas exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error al obtener las cajas registradoras abiertas',
      error: error.message
    });
  }
}