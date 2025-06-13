import express from 'express';

import {
    getAllProducts,
    insertProduct,
    updateProduct,
    deleteProduct,
    checkSkuAvailability
} from '../controllers/productsController.js';

const router = express.Router();

router.post('/add', insertProduct);
router.get("/all-products", getAllProducts);
router.put("/update-product/:id", updateProduct);
router.patch("/delete-product/:id", deleteProduct);
router.get('/checkSkuAvailable/:sku',checkSkuAvailability );
export default router;