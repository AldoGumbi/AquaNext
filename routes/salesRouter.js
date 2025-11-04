import express from 'express';

import {
	MakeASale,
	GetSales,
	getSaleById
} from '../controllers/SaleController.js';

const router = express.Router();

// Un applying the discount to the cart
router.post("/process-sale", MakeASale);
// Get all sales
router.get("/get-sales", GetSales);
// Get sale by ID
router.get("/get-sale/:id", getSaleById);

export default router;
