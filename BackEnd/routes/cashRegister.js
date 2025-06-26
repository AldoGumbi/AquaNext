import express from 'express';

import {
    createCashRegister,
    getAnyOpenCashRegister
} from '../controllers/cashRegisterController.js';

const router = express.Router();

//create a cash register
router.post('/open', createCashRegister);
//get any open cash register
router.get('/AnyOpen', getAnyOpenCashRegister);

export default router;