import express from 'express';

import {
	createBasket,
	getBasket,
	deleteBasket,
	updateBasket,
	allBaskets,
	applyCuponBasket, unApplyDiscount
} from '../controllers/basketController.js';

const router = express.Router();

//create a new basket
router.post('/create-basket', createBasket);
//get basket by id
router.get("/get-basket/:id", getBasket);
// update basket by id
router.put("/update-basket/:id", updateBasket);
// delete basket by id and the items in it
router.delete("/delete-basket/:id", deleteBasket);
// get all baskets and their items`
router.get("/all-baskets", allBaskets);
// Apply the discount coupon to the cart
router.put("/apply-coupon", applyCuponBasket);
// Un applying the discount to the cart
router.delete("/unApply-coupon/:id", unApplyDiscount);

export default router;