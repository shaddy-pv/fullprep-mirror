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

/**
 * @openapi
 * /api/payment/create-order:
 *   post:
 *     summary: Create Razorpay order
 *     description: Generates a Razorpay order ID to initiate a premium subscription purchase.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order created successfully
 */
router.post("/create-order", createOrder);
/**
 * @openapi
 * /api/payment/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     description: Verifies the payment signature and activates the premium subscription.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 */
router.post("/verify", verifyPayment);
/**
 * @openapi
 * /api/payment/history:
 *   get:
 *     summary: Get payment history
 *     description: Fetches a history of the user's successful payments.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history fetched
 */
router.get("/history", getPaymentHistory);

export default router;
