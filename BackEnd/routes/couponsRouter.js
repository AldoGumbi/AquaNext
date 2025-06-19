import express from "express";
import {
  insertCoupons
} from "../controllers/couponsController.js";

const router = express.Router();

//create a new discount coupon
router.post('/create-coupon', insertCoupons);

export default router;