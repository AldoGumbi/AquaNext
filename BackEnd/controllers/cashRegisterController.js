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

export const closeCashRegister = async (req, res) => {
  try {
    const { cash_register_id } = req.params;
    const {
      amount_closing,
      comment,
    } = req.body;

    // Validar que el amount_closing sea un número válido
    if (!amount_closing || isNaN(Number(amount_closing) || Number(amount_closing) < 0)) {
      return res.status(400).json({
        data: false,
        message: 'El monto de cierre es requerido y debe ser un número válido.'
      });
    }
    // Validar que el comment sea un string válido
    if (!cash_register_id || isNaN(Number(cash_register_id))) {
      return res.status(400).json({
        data: false,
        message: 'No se ha proporcionado un ID de caja registradora a cerrar.',
        id: cash_register_id
      });
    }

    const isClosed = await CashRegisterModel.close({
      amount_closing,
      comment,
      cash_register_id,
    });
    // cant close the cash register
    if (!isClosed) {
      return res.status(400).json({
        data: false,
        message: 'No se cerro la caja, revisa que la caja este disponible para cerrar.'
      });
    }
    // answer successfully
    res.status(200).json({
      data: true,
      message: 'Caja registradora cerrada exitosamente.'
    });

  } catch (error) {
    return res.status(500).json({
      data: false,
      message: 'Error al cerrar la caja registradora',
      error: error.message
    });
  }
}
