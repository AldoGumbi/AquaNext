import express from 'express';

import {
    createCashRegister,
    getAnyOpenCashRegister,
    closeCashRegister
} from '../controllers/cashRegisterController.js';

const router = express.Router();

//create a cash register
router.post('/open', createCashRegister);
//get any open cash register
router.get('/AnyOpen', getAnyOpenCashRegister);
//close a cash register
router.put('/close/:cash_register_id', closeCashRegister);


export default router;