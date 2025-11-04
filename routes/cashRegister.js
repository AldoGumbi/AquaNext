import express from 'express';

import {
    createCashRegister,
    getAnyOpenCashRegister,
    closeCashRegister,
    getLastClosedCashRegister,
    getCashRegisterAndTransaccionsByDateAndShift,
    getCorteDeCaja
} from '../controllers/cashRegisterController.js';

const router = express.Router();

//create a cash register
router.post('/open', createCashRegister);
//get any open cash register
router.get('/AnyOpen', getAnyOpenCashRegister);
//close a cash register
router.put('/close/:cash_register_id', closeCashRegister);
//get last closed cash register
router.get('/last-closed', getLastClosedCashRegister);
// Get cash register and transactions by date and shift
router.get('/by-date-shift', getCashRegisterAndTransaccionsByDateAndShift);
//get corte by ids multiples
router.post('/corte', getCorteDeCaja);
export default router;
