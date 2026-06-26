/**
 * @file authMiddleware.js
 * @description JWT authentication middleware for protecting private routes.
 *              Supports token from Authorization header OR httpOnly cookie.
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";

// Simple in-memory cache for token verification to prevent cloud database query flooding under concurrent load
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 30000; // 30 seconds cache TTL

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

  // Check in-memory token cache first
  const now = Date.now();
  if (tokenCache.has(token)) {
    const cached = tokenCache.get(token);
    if (now - cached.timestamp < TOKEN_CACHE_TTL) {
      req.user = cached.user;
      req.sessionId = cached.sessionId;
      return next();
    }
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

  // ── 3. Fetch user and Session from DB in parallel ────────────
  if (!decoded.sessionId) {
    return res.status(401).json({
      success: false,
      message: "Invalid token format. Session ID missing. Please log in again.",
    });
  }

  const [user, session] = await Promise.all([
    User.findById(decoded.id).select("-password"),
    Session.findById(decoded.sessionId)
  ]);

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

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Session expired or revoked. Please log in again.",
    });
  }

  // Update last active on the session (throttled to max once per minute, non-blocking)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  if (!session.lastActive || session.lastActive < oneMinuteAgo) {
    session.lastActive = new Date();
    session.save().catch(() => {}); // Non-blocking background save
  }

  // Cache token verification result
  tokenCache.set(token, {
    user,
    sessionId: decoded.sessionId,
    timestamp: now,
  });

  // ── 4. Attach user & session to request ───────────────────────
  req.user = user;
  req.sessionId = decoded.sessionId;
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

// ── Optional Protect Middleware ───────────────────────────────────────────────

/**
 * Optionally verifies the JWT and attaches req.user / req.sessionId if present.
 * Does NOT throw a 401 error if the token is missing or invalid.
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  // Check in-memory token cache first
  const now = Date.now();
  if (tokenCache.has(token)) {
    const cached = tokenCache.get(token);
    if (now - cached.timestamp < TOKEN_CACHE_TTL) {
      req.user = cached.user;
      req.sessionId = cached.sessionId;
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "fullprep.io",
      audience: "fullprep-client",
    });

    if (decoded.sessionId) {
      const [user, session] = await Promise.all([
        User.findById(decoded.id).select("-password"),
        Session.findById(decoded.sessionId)
      ]);

      if (user && user.isActive && session) {
        // Update last active on the session (throttled, non-blocking)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        if (!session.lastActive || session.lastActive < oneMinuteAgo) {
          session.lastActive = new Date();
          session.save().catch(() => {});
        }

        // Cache token verification result
        tokenCache.set(token, {
          user,
          sessionId: decoded.sessionId,
          timestamp: now,
        });

        req.user = user;
        req.sessionId = decoded.sessionId;
      }
    }
  } catch (err) {
    // Ignore verification errors for optional protect — user remains anonymous guest
  }

  next();
};

// ── Invalidation Helpers ──────────────────────────────────────────────────────

/**
 * Invalidates cached tokens for a specific session ID.
 * @param {string} sessionId
 */
export const invalidateTokenCache = (sessionId) => {
  if (!sessionId) return;
  const targetId = sessionId.toString();
  for (const [token, cached] of tokenCache.entries()) {
    if (cached.sessionId?.toString() === targetId) {
      tokenCache.delete(token);
    }
  }
};

/**
 * Invalidates all cached tokens for a specific user ID.
 * @param {string} userId
 */
export const invalidateUserTokenCache = (userId) => {
  if (!userId) return;
  const targetId = userId.toString();
  for (const [token, cached] of tokenCache.entries()) {
    if (cached.user?._id?.toString() === targetId) {
      tokenCache.delete(token);
    }
  }
};

export default { protect, restrictTo, optionalProtect, invalidateTokenCache, invalidateUserTokenCache };
