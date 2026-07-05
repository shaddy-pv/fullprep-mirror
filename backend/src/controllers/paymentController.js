/**
 * @file paymentController.js
 * @description Razorpay payment integration for FullPrep Premium.
 *              Rs.399/month — activates Premium for 30 days on successful payment.
 *              (Forced backend restart to load new .env variables)
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -- @desc    Create a Razorpay order for Premium subscription
// -- @route   POST /api/payment/create-order
// -- @access  Private (JWT required)
export const createOrder = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Payment gateway is not configured. Please contact support.",
    });
  }

  try {
    const order = await razorpay.orders.create({
      amount:   39900,   // Rs.399 in paise (1 INR = 100 paise)
      currency: "INR",
      receipt:  `fp_${req.user._id.toString().slice(-6)}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan:   "premium_monthly",
        email:  req.user.email,
      },
    });

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      user: {
        name:  req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(502).json({
      success: false,
      message: "Payment gateway is currently unavailable. Please try again later.",
    });
  }
};

// -- @desc    Verify Razorpay payment signature and activate Premium
// -- @route   POST /api/payment/verify
// -- @access  Private (JWT required)
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification fields.",
    });
  }

  // Verify HMAC-SHA256 signature
  // Razorpay signs: order_id|payment_id with the key_secret
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed. Invalid signature.",
    });
  }

  // Activate Premium for 30 days from now
  const proExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      subscriptionTier: "premium",
      proExpiresAt,
      $push: {
        paymentHistory: {
          razorpayOrderId:   razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount:            39900,
          currency:          "INR",
          status:            "captured",
          createdAt:         new Date(),
        },
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Welcome to FullPrep Premium! Your subscription is active for 30 days.",
    proExpiresAt,
    user: user.toPublicJSON(),
  });
};

// -- @desc    Get payment history for the current user
// -- @route   GET /api/payment/history
// -- @access  Private (JWT required)
export const getPaymentHistory = async (req, res) => {
  const user = await User.findById(req.user._id).select("+paymentHistory");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.status(200).json({
    success: true,
    paymentHistory: (user.paymentHistory || []).reverse(), // newest first
  });
};
