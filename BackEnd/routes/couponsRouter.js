import express from "express";
import {
  insertCoupons,
  getAllCoupons,
  getUsagesById
} from "../controllers/couponsController.js";

const router = express.Router();

//create a new discount coupon
router.post('/create-coupon', insertCoupons);
// Get all discount coupons
router.get("/get-coupons", getAllCoupons);
// Get usages by coupon ID
router.get("/get-usage/:id", getUsagesById);
export default router;