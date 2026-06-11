/**
 * @file authRoutes.js
 * @description Express router for all authentication endpoints.
 *
 *  Public:
 *    POST   /api/auth/register        → Create new account
 *    POST   /api/auth/login           → Authenticate & get token
 *    POST   /api/auth/logout          → Clear auth cookie
 *
 *  Private (JWT required):
 *    GET    /api/auth/me              → Get own profile
 *    PATCH  /api/auth/update-profile  → Update name / bio / avatar
 */

import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  resendVerification,
  syncVerification,
  oauthSignIn,
} from "../controllers/authController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/oauth", oauthSignIn);  // Called by NextAuth to upsert OAuth users

// ── Private Routes ────────────────────────────────────────────────────────────

// All routes below this line require a valid JWT
router.use(protect);

router.get("/me", getMe);
router.patch("/update-profile", updateProfile);

router.post("/resend-verification", resendVerification);
router.post("/sync-verification", syncVerification);

// ── Example Admin-only Route ──────────────────────────────────────────────────
// Demonstrates combining protect + restrictTo for RBAC
router.get("/admin-check", restrictTo("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, Admin ${req.user.name}! 🛡️`,
  });
});

export default router;
