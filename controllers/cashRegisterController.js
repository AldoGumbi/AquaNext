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

    // Validacion que no exista una caja abierta o reabierta
    const openCashRegisters = await CashRegisterModel.getCurrentCashRegister();
    if (openCashRegisters.length > 0) {
      return res.status(400).json({
        data :   {
          id: openCashRegisters[0].id,
          shift : openCashRegisters[0].shift
        },
        message: 'Ya existe una caja abierta o reabierta. Cierra la caja actual antes de abrir una nueva.',
        error: 10001 // Custom error code for existing open cash register
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
      data: {
        id: newCashRegister,
        shift
      },
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
    const openCashRegisters = await CashRegisterModel.getCurrentCashRegister();

    if (openCashRegisters.length === 0) {
      return res.status(400).json({
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
    console.log("Close caja: ",isClosed);
    // answer successfully
    res.status(200).json({
      data: true,
      message: 'Caja registradora cerrada exitosamente.'
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: false,
      message: 'Error al cerrar la caja registradora',
      error: error.message
    });
  }
}

export const getLastClosedCashRegister = async (req, res) => {
  try {
    const lastClosedCashRegister = await CashRegisterModel.getLastClosedCashRegister();

    if (!lastClosedCashRegister) {
      return res.status(400).json({
        data: false,
        message: 'No se encontró ninguna caja registradora cerrada recientemente.',
        error: true // Custom error code for no closed cash registers
      });
    }

    res.status(200).json({
      data: lastClosedCashRegister,
      message: 'Ultima caja registradora cerrada obtenida exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      data: false,
      message: 'Error al obtener la última caja registradora cerrada',
      error: error.message
    });
  }
}

export const getCashRegisterAndTransaccionsByDateAndShift = async (req, res) => {
  try {
    const query = req.query;

    // (1) Date is required and must be a valid date
    if (!query?.date || query?.date === 'undefined' ) {
      return res.status(400).json({
        data: false,
        message: 'La fecha es requerida para obtener la caja.'
      });
    }
    // (2) Shift is required and must be either 'vespertino' , 'matutino' or both
    if (!query?.shift || query?.shift === 'undefined') {
      return res.status(400).json({
        data: false,
        message: 'El turno es requerido y debe ser "vespertino" o "matutino".'
      });
    }

    let shift;
    const CashRegisterDetails = [];
    let totals = [];

    if(query.shift === 'vespertino' || query.shift === 'Vespertino'){
      shift = 'vespertino';
      CashRegisterDetails.push(await CashRegisterModel.getStaredDetails(query.date, 'vespertino'));
      totals.push(await CashRegisterModel.getCategoriasByDatesAndShifts(query.date, 'vespertino'));
    }else if(query.shift === 'Matutino' || query.shift === 'matutino'){
      shift = 'matutino';
      totals.push(await CashRegisterModel.getCategoriasByDatesAndShifts(query.date, 'matutino'));
      CashRegisterDetails.push(await CashRegisterModel.getStaredDetails(query.date, 'matutino'));
    }else{
      shift = 'both';
      // totales de ambos turnos
      totals.push(await CashRegisterModel.getCategoriasByDatesAndShifts(query.date, 'matutino'));
      totals.push(await CashRegisterModel.getCategoriasByDatesAndShifts(query.date, 'vespertino'));

      // detalles de ambos turnos
      CashRegisterDetails.push(await CashRegisterModel.getStaredDetails(query.date, 'matutino'));
      CashRegisterDetails.push(await CashRegisterModel.getStaredDetails(query.date, 'vespertino'));
    }

    // TABLE FOR TRANSACCION CASH REGISTER
    const tableTransaccions = await CashRegisterModel.getByDateAndShift(query.date, shift);
    console.log(tableTransaccions);



    console.log(CashRegisterDetails);

    res.status(200).json({
      data: {
        table : tableTransaccions,
        totals,
        CashRegisterDetails,
      },
      message: 'Caja obtenida exitosamente'
    })


  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      data: false,
      message: 'Error al obtener la caja',
      error: error
    });
  }
}

/*
* @route GET /api/cash-register/corte/:ids
* @desc Obtener el corte de caja para los IDs proporcionados
* @params ids - Array de IDs de caja registradora separados por comas
* */
export const getCorteDeCaja = async (req, res) => {
  try {

    const body = req.body;
    console.log(body);


    // Validar que los IDs sean un array válido
    if(body.length === 0){
      return res.status(400).json({
        data: false,
        message: 'No se han proporcionado IDs de caja registradora.'
      });
    }

    const answer = [];

    for (const id of body) {
      if (isNaN(Number(id))) {
        return res.status(400).json({
          data: false,
          message: `El ID ${id} no es un número válido.`
        });
      }

      const cashRegisterData = await CashRegisterModel.getCorteById(id);
      if (cashRegisterData) {
        answer.push(...cashRegisterData); // suponiendo que devuelve array de ventas
      }
    }

    // Agrupar por folio
    const groupedByFolio = answer.reduce((acc, venta) => {
      const folio = venta.folio;
      if (!acc[folio]) {
        acc[folio] = [];
      }
      acc[folio].push(venta);
      return acc;
    }, {});

    res.status(200).json({
      data: groupedByFolio,
      message: 'Corte de caja obtenido exitosamente'
    });
  }
  catch(error) {
    console.log(error);
    res.status(500).json({
      data: false,
      message: 'Error al obtener el corte de caja',
      error: error.message
    });
  }
}
