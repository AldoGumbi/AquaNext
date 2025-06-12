import express from 'express';

import {
	createBasket,
	getBasket,
	deleteBasket,
	updateBasket,
	allBaskets, insertBasketItems, deleteBasketItem
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
// get all baskets and their items
router.get("/all-baskets", allBaskets);
// insert items into basket
router.post("/add-items", insertBasketItems);
// delete items from basket
router.delete("/delete-items/:id", deleteBasketItem);

export default router;