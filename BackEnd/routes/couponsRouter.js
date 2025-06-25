import express from "express";
import {
  insertCoupons,
  getAllCoupons,
} from "../controllers/couponsController.js";

const router = express.Router();

//create a new discount coupon
router.post('/create-coupon', insertCoupons);
// Get all discount coupons
router.get("/get-coupons", getAllCoupons);

export default router;