import express from 'express';

import {
    getAllProducts,
    insertProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productsController.js';

const router = express.Router();

router.post('/add', insertProduct);
router.get("/all-products", getAllProducts);
router.put("/update-product/:id", updateProduct);
router.patch("/delete-product/:id", deleteProduct);
export default router;