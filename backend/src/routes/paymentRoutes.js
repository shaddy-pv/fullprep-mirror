/**
 * @file paymentRoutes.js
 * @description Routes for Razorpay payment integration.
 *
 *  Private (JWT required):
 *    POST /api/payment/create-order  -> Create Razorpay order (Rs.399)
 *    POST /api/payment/verify        -> Verify signature, activate Premium
 *    GET  /api/payment/history       -> Get user's payment history
 */

import { Router } from "express";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All payment routes require authentication
router.use(protect);

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);

export default router;
