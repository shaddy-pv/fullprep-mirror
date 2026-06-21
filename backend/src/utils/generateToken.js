/**
 * @file generateToken.js
 * @description JWT generation utility.
 *              Signs a token and optionally sets a secure httpOnly cookie.
 */

import jwt from "jsonwebtoken";

// ── Generate & Sign Token ─────────────────────────────────────────────────────

/**
 * Creates a signed JWT containing the user's id and role.
 * @param {string|ObjectId} userId  - MongoDB user _id
 * @param {string}          role    - User role (user | mentor | admin)
 * @returns {string} Signed JWT string
 */
export const generateToken = (userId, role = "user", sessionId = null) => {
  const payload = { id: userId, role };
  if (sessionId) payload.sessionId = sessionId;

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "fullprep.io",
      audience: "fullprep-client",
    }
  );
};

// ── Send Token via Cookie + JSON Body ────────────────────────────────────────

/**
 * Signs a JWT, attaches it as a secure httpOnly cookie,
 * and returns the token string to be sent in the response body too.
 *
 * @param {object} user   - Mongoose user document
 * @param {number} statusCode - HTTP status code for the response
 * @param {object} res    - Express response object
 * @param {string} message - Human-readable success message
 * @param {string} sessionId - Database session ID
 */
export const sendTokenResponse = (user, statusCode, res, message, sessionId = null) => {
  const token = generateToken(user._id, user.role, sessionId);

  const cookieExpiresInDays = parseInt(
    process.env.JWT_COOKIE_EXPIRES_IN || "7",
    10
  );

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true, // Prevents XSS access via document.cookie
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Cross-domain in prod
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  };

  // Set cookie
  res.cookie("token", token, cookieOptions);

  // Build clean public user object
  const userPublic = user.toPublicJSON ? user.toPublicJSON() : user;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userPublic,
  });
};

export default { generateToken, sendTokenResponse };
