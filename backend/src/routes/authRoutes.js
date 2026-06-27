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
  verifyEmail,
  oauthSignIn,
  forgotPassword,
  resetPassword,
  getLeaderboard,
  updatePassword,
  getSessions,
  revokeSession,
  exportData,
  getPublicProfile,
} from "../controllers/authController.js";
import { getUserStats, getSidebarStats } from "../controllers/statsController.js";
import { protect, restrictTo, optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

router.post("/register", register);
router.post("/login", login);
router.post("/logout", optionalProtect, logout);
router.post("/oauth", oauthSignIn);  // Called by NextAuth to upsert OAuth users
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);  // Email verification link handler
router.get("/public/:id", getPublicProfile); // Public profile fetcher

// ── Private Routes ────────────────────────────────────────────────────────────

// All routes below this line require a valid JWT
router.use(protect);

router.get("/me", getMe);
router.get("/stats", getUserStats);
router.get("/sidebar-stats", getSidebarStats);
router.get("/leaderboard", getLeaderboard);
router.patch("/update-profile", updateProfile);
router.patch("/update-password", updatePassword);
router.get("/sessions", getSessions);
router.delete("/sessions/:id", revokeSession);
router.get("/export", exportData);
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

