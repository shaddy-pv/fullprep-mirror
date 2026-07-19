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
  createPassword,
  getSessions,
  revokeSession,
  exportData,
  getPublicProfile,
} from "../controllers/authController.js";
import { getUserStats, getSidebarStats } from "../controllers/statsController.js";
import { protect, restrictTo, optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a verification email. Returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Missing fields or invalid password
 *       409:
 *         description: Email already in use
 */
router.post("/register", register);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Logs in a user using email and password, returning a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 */
router.post("/login", login);
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Clears the authentication cookie and revokes the active session.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", optionalProtect, logout);
/**
 * @openapi
 * /api/auth/oauth:
 *   post:
 *     summary: OAuth Sign In
 *     description: Upserts users authenticated via third-party providers (NextAuth).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, providerId, email]
 *             properties:
 *               provider:
 *                 type: string
 *                 example: google
 *               providerId:
 *                 type: string
 *                 example: 1234567890
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: OAuth login successful
 */
router.post("/oauth", oauthSignIn);  // Called by NextAuth to upsert OAuth users
/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Sends a password reset email if the account exists.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post("/forgot-password", forgotPassword);
/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Resets user password using the token sent to their email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, email, password]
 *             properties:
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", resetPassword);
/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify Email
 *     description: Validates the email verification link.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired link
 */
router.get("/verify-email", verifyEmail);  // Email verification link handler
/**
 * @openapi
 * /api/auth/public/{id}:
 *   get:
 *     summary: Public profile fetcher
 *     tags: [auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/public/:id", getPublicProfile); // Public profile fetcher

// ── Private Routes ────────────────────────────────────────────────────────────

// All routes below this line require a valid JWT
router.use(protect);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Fetches the profile of the currently authenticated user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", getMe);
/**
 * @openapi
 * /api/auth/stats:
 *   get:
 *     summary: Endpoint for GET /stats
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/stats", getUserStats);
/**
 * @openapi
 * /api/auth/sidebar-stats:
 *   get:
 *     summary: Endpoint for GET /sidebar-stats
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/sidebar-stats", getSidebarStats);
/**
 * @openapi
 * /api/auth/leaderboard:
 *   get:
 *     summary: Get user leaderboard
 *     description: Fetches the top users ranked by XP or solved problems.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: main
 *         schema:
 *           type: string
 *           enum: [Global, Country, Friends]
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [Overall, Weekly, Monthly]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Leaderboard fetched successfully
 */
router.get("/leaderboard", getLeaderboard);
/**
 * @openapi
 * /api/auth/update-profile:
 *   patch:
 *     summary: Update profile
 *     description: Updates the authenticated user's profile details.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               location:
 *                 type: string
 *               socialLinks:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid fields provided
 */
router.patch("/update-profile", updateProfile);
/**
 * @openapi
 * /api/auth/update-password:
 *   patch:
 *     summary: Update password
 *     description: Allows the user to securely change their password.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Incorrect current password
 */
router.patch("/update-password", updatePassword);
/**
 * @openapi
 * /api/auth/sessions:
 *   get:
 *     summary: Endpoint for GET /sessions
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/sessions", getSessions);
/**
 * @openapi
 * /api/auth/sessions/{id}:
 *   delete:
 *     summary: Endpoint for DELETE /sessions/:id
 *     tags: [auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete("/sessions/:id", revokeSession);
/**
 * @openapi
 * /api/auth/export:
 *   get:
 *     summary: Endpoint for GET /export
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/export", exportData);
/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     summary: Endpoint for POST /resend-verification
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.post("/resend-verification", resendVerification);
/**
 * @openapi
 * /api/auth/sync-verification:
 *   post:
 *     summary: Endpoint for POST /sync-verification
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.post("/sync-verification", syncVerification);
/**
 * @openapi
 * /api/auth/create-password:
 *   post:
 *     summary: OAuth-only users setting password for first time
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.post("/create-password", createPassword); // OAuth-only users setting password for first time

// ── Example Admin-only Route ──────────────────────────────────────────────────
// Demonstrates combining protect + restrictTo for RBAC
/**
 * @openapi
 * /api/auth/admin-check:
 *   get:
 *     summary: Endpoint for GET /admin-check
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/admin-check", restrictTo("admin", "mentor"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, Admin ${req.user.name}! 🛡️`,
  });
});

export default router;
