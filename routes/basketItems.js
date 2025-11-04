import express from 'express';

import {
 insertBasketItems,
 deleteBasketItem,
 updateBasketItem
} from '../controllers/basketItemsController.js';

const router = express.Router();

// insert items into basket
router.post("/add-items", insertBasketItems);
// delete items from basket
router.delete("/delete-items/:id", deleteBasketItem);
// edit items in basket
router.put("/update-items/:id", updateBasketItem);

export default router;