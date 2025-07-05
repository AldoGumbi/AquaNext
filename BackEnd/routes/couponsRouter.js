import express from "express";
import {
  insertCoupons,
  getAllCoupons,
  getUsagesById,
  getAllActiveCoupons,
  getCouponById
} from "../controllers/couponsController.js";

const router = express.Router();

//create a new discount coupon
router.post('/create-coupon', insertCoupons);
// Get all discount coupons
router.get("/get-coupons", getAllCoupons);
// Get usages by coupon ID
router.get("/get-usage/:id", getUsagesById);
// Get all active coupons
router.get("/All-active-coupons",getAllActiveCoupons)
//Get coupon by id
router.get("/get-coupon-by-id/:id", getCouponById);

export default router;