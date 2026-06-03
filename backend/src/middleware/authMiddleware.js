/**
 * @file authMiddleware.js
 * @description JWT authentication middleware for protecting private routes.
 *              Supports token from Authorization header OR httpOnly cookie.
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Protect Middleware ────────────────────────────────────────────────────────

/**
 * Verifies the JWT and attaches the authenticated user to req.user.
 * Token is read from:
 *   1. Authorization: Bearer <token>  header
 *   2. Signed httpOnly cookie named "token"
 */
export const protect = async (req, res, next) => {
  let token;

  // ── 1. Extract token ────────────────────────────────────────
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided.",
    });
  }

  // ── 2. Verify token ─────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "fullprep.io",
      audience: "fullprep-client",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Authentication failed.",
    });
  }

  // ── 3. Fetch user from DB ───────────────────────────────────
  // We re-fetch on every request to catch deactivated / deleted accounts.
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User belonging to this token no longer exists.",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated. Contact support.",
    });
  }

  // ── 4. Attach user to request ───────────────────────────────
  req.user = user;
  next();
};

// ── Role-based Access Control (RBAC) Middleware ───────────────────────────────

/**
 * Restricts access to users with specific roles.
 * Must be used AFTER the `protect` middleware.
 *
 * @example router.get('/admin-only', protect, restrictTo('admin'), handler)
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'mentor')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role "${req.user.role}" is not permitted to perform this action.`,
      });
    }
    next();
  };
};

export default { protect, restrictTo };
