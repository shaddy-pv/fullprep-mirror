/**
 * @file authController.js
 * @description Handles user registration, login, logout, and profile retrieval.
 *              All handlers are async — errors bubble to the global error handler.
 */

import User from "../models/User.js";
import Session from "../models/Session.js";
import mongoose from "mongoose";
import { sendTokenResponse } from "../utils/generateToken.js";
import firebaseAdmin from "../config/firebase.js";
import { sendEmail } from "../utils/emailService.js";
import crypto from "crypto";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import { invalidateTokenCache, invalidateUserTokenCache } from "../middleware/authMiddleware.js";
import { cacheManager } from "../utils/cacheManager.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validates that required fields are present and non-empty.
 * Returns an array of missing field names.
 * @param {object} body
 * @param {string[]} fields
 * @returns {string[]}
 */
const getMissingFields = (body, fields) =>
  fields.filter((f) => !body[f] || String(body[f]).trim() === "");

// ── @desc    Register a new user
// ── @route   POST /api/auth/register
// ── @access  Public
export const register = async (req, res) => {
  // ── 0. Check System Settings ─────────────────────────────────
  if (req.systemSettings && !req.systemSettings.registrationEnabled) {
    return res.status(403).json({
      success: false,
      message: "Registration is currently disabled by the administrator.",
    });
  }

  const { name, email, password } = req.body;

  // ── 1. Input validation ─────────────────────────────────────
  const missing = getMissingFields(req.body, ["name", "email", "password"]);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  // Basic password strength check
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  // ── 2. Duplicate email check ────────────────────────────────
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists. Please log in.",
    });
  }

  // ── 3. Create user ──────────────────────────────────────────
  // Password is hashed by the pre-save hook in User.js
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const hashedVerifyToken = crypto.createHash("sha256").update(verifyToken).digest("hex");

  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    isEmailVerified: isDevOrTest,
    emailVerificationToken: hashedVerifyToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // ── 4. Send Verification Email ───────────────────────────────
  // Strategy: Try Nodemailer token-based verification (reliable).
  // Also attempt to create Firebase Auth user in background for future hybrid use.
  {
    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;
    const verificationHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f0f1a;color:#e2e8f0;border-radius:12px;">
        <h2 style="color:#6366f1;">Welcome to FullPrep, ${user.name}!</h2>
        <p>Thank you for signing up. Please verify your email address to unlock your dashboard.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email</a>
        <p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours. If you did not sign up, ignore this email.</p>
      </div>
    `;

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: "Verify your FullPrep email address",
        html: verificationHtml,
      });
      if (sent) {
        console.log(`✉️  Verification email sent to ${user.email}`);
      } else {
        console.error(`❌  sendEmail returned false for ${user.email} — check SMTP_USER/SMTP_PASS`);
      }
    } catch (err) {
      console.error("Verification email error:", err.message);
    }

    // Create Firebase Auth user in background (non-blocking, for hybrid sync)
    if (firebaseAdmin) {
      firebaseAdmin.auth().createUser({
        uid: user._id.toString(),
        email: user.email,
        password: password,
        displayName: user.name,
      }).catch((err) => {
        // Silently handle — Firebase user creation is optional
        console.warn("Firebase Auth user creation (background):", err.message);
      });
    }
  }

  // ── 4.5 Create Session ───────────────────────────────────────
  const session = await Session.create({
    user: user._id,
    deviceInfo: req.headers["user-agent"] || "Unknown Device",
    ipAddress: req.ip || req.connection.remoteAddress || "Unknown IP"
  });

  // ── 5. Respond with token ───────────────────────────────────
  sendTokenResponse(user, 201, res, "Account created! Please check your email to verify your account.", session._id);
};

// ── @desc    Authenticate user & return token
// ── @route   POST /api/auth/login
// ── @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  // ── 1. Input validation ─────────────────────────────────────
  const missing = getMissingFields(req.body, ["email", "password"]);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  // ── 2. Find user (explicitly select password for comparison) ─
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // Use a generic message to avoid user enumeration attacks
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  // ── 3. Check account status ─────────────────────────────────
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account has been deactivated. Please contact support.",
    });
  }

  // ── 4. Compare passwords ────────────────────────────────────
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  // ── 5. Update last login timestamp ──────────────────────────
  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

  // ── 5.5 Create Session ──────────────────────────────────────
  const session = await Session.create({
    user: user._id,
    deviceInfo: req.headers["user-agent"] || "Unknown Device",
    ipAddress: req.ip || req.connection.remoteAddress || "Unknown IP"
  });

  // ── 6. Respond with token ───────────────────────────────────
  sendTokenResponse(user, 200, res, "Login successful. Welcome back! 👋", session._id);
};

// ── @desc    Log out — clear the auth cookie
// ── @route   POST /api/auth/logout
// ── @access  Private (Needs token to know which session to delete)
export const logout = async (req, res) => {
  // If the user has a valid token, remove the session from the DB
  if (req.user && req.sessionId) {
    await Session.findByIdAndDelete(req.sessionId);
    invalidateTokenCache(req.sessionId);
  }

  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000), // Expire in 5 seconds
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// ── @desc    Get active sessions for user
// ── @route   GET /api/auth/sessions
// ── @access  Private
export const getSessions = async (req, res) => {
  const sessions = await Session.find({ user: req.user._id }).sort({ lastActive: -1 });
  
  res.status(200).json({
    success: true,
    data: sessions.map(s => ({
      _id: s._id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      isCurrent: s._id.toString() === req.sessionId
    }))
  });
};

// ── @desc    Revoke a specific session
// ── @route   DELETE /api/auth/sessions/:id
// ── @access  Private
export const revokeSession = async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found or already revoked."
    });
  }

  if (session._id.toString() === req.sessionId) {
    return res.status(400).json({
      success: false,
      message: "Cannot revoke current session. Use logout instead."
    });
  }

  await Session.findByIdAndDelete(session._id);
  invalidateTokenCache(session._id);

  res.status(200).json({
    success: true,
    message: "Session revoked successfully."
  });
};

// ── @desc    Get currently authenticated user's profile
// ── @route   GET /api/auth/me
// ── @access  Private
export const getMe = async (req, res) => {
  const publicUser = req.user.toPublicJSON ? req.user.toPublicJSON() : req.user;

  // Calculate global contest rank dynamically
  const rankCount = await User.countDocuments({ 
    isActive: true, 
    $or: [
      { contestRating: { $gt: req.user.contestRating || 0 } },
      { contestRating: req.user.contestRating || 0, createdAt: { $lt: req.user.createdAt || new Date() } }
    ]
  });
  publicUser.globalRank = rankCount + 1;

  // Update highestRating if necessary
  if (!publicUser.highestRating || publicUser.contestRating > publicUser.highestRating) {
    publicUser.highestRating = publicUser.contestRating || 0;
    // Fire and forget save to DB
    User.findByIdAndUpdate(req.user._id, { highestRating: publicUser.highestRating }).exec().catch(console.error);
  }

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully.",
    data:    publicUser, // consistent with all other endpoints
    user:    publicUser, // kept for backward compat
  });
};

// ── @desc    Update profile fields (name, bio, avatar, socialLinks)
// ── @route   PATCH /api/auth/update-profile
// ── @access  Private
export const updateProfile = async (req, res) => {
  // Whitelist updatable fields — never allow role/password here
  const allowedUpdates = [
    "name", "bio", "avatar", "socialLinks", "location", "backupEmail",
    "preferences", "notifs", "visibility", "twoFactor"
  ];
  const updates = {};

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update.",
    });
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,            // Return updated document
    runValidators: true,  // Enforce schema validation on update
  });

  const publicUser = user.toPublicJSON();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data:    publicUser, // consistent with all other endpoints
    user:    publicUser, // kept for backward compat
  });
};

// ── @desc    Update password securely
// ── @route   PATCH /api/auth/update-password
// ── @access  Private
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide both current and new passwords.",
    });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (user.password) {
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password.",
      });
    }
  }

  user.password = newPassword;
  await user.save();

  // Revoke all other sessions of this user for security
  const otherSessions = await Session.find({ user: user._id, _id: { $ne: req.sessionId } });
  await Session.deleteMany({ user: user._id, _id: { $ne: req.sessionId } });
  otherSessions.forEach(s => invalidateTokenCache(s._id));

  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
};

// ── @desc    Resend verification email
// ── @route   POST /api/auth/resend-verification
// ── @access  Private
export const resendVerification = async (req, res) => {
  const user = await User.findById(req.user._id).select("+emailVerificationToken +emailVerificationExpires");

  if (user.isEmailVerified) {
    return res.status(400).json({ success: false, message: "Email is already verified." });
  }

  try {
    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verifyToken}&email=${encodeURIComponent(user.email)}`;

    const sent = await sendEmail({
      to: user.email,
      subject: "Verify your FullPrep email address",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f0f1a;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#6366f1;">Hello ${user.name},</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email</a>
          <p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours.</p>
        </div>
      `,
    });

    if (!sent) throw new Error("SMTP send failed");

    res.status(200).json({ success: true, message: "Verification email sent! Check your inbox." });
  } catch (err) {
    console.error("Resend verification error:", err.message);
    res.status(500).json({ success: false, message: "Could not send verification email. Check SMTP settings." });
  }
};

// ── @desc    Verify email using token from link
// ── @route   GET /api/auth/verify-email?token=...&email=...
// ── @access  Public
export const verifyEmail = async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).json({ success: false, message: "Missing token or email." });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return res.status(400).json({ success: false, message: "Verification link is invalid or has expired." });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully! You can now log in." });
};

// ── @desc    Sync verification status (token-based, no Firebase)
// ── @route   POST /api/auth/sync-verification
// ── @access  Private
export const syncVerification = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return res.status(200).json({ success: true, message: "Already verified.", isVerified: true });
  }

  // Check Firebase if hybrid verification is enabled
  if (firebaseAdmin) {
    try {
      const firebaseUser = await firebaseAdmin.auth().getUser(user._id.toString());
      if (firebaseUser.emailVerified) {
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: "Successfully synced verification from Firebase.", isVerified: true });
      }
    } catch (err) {
      console.error("Firebase sync error:", err.message);
    }
  }

  res.status(200).json({ success: true, message: "Email not verified yet.", isVerified: false });
};

// ── @desc    Upsert OAuth user (Google / GitHub via NextAuth)
// ── @route   POST /api/auth/oauth
// ── @access  Public (called server-to-server from NextAuth callback)
export const oauthSignIn = async (req, res) => {
  const { provider, providerId, email, name, avatar } = req.body;

  if (!email || !provider || !providerId) {
    return res.status(400).json({
      success: false,
      message: "Missing required OAuth fields: provider, providerId, email.",
    });
  }

  let user = await User.findOne({
    $or: [
      { [`oauth.${provider}.id`]: providerId },
      { email: email.toLowerCase() },
    ],
  }).select("+oauth");

  let isNewUser = false;

  if (user) {
    // Update OAuth link and avatar if not already set
    if (!user.oauth?.[provider]?.id) {
      user.oauth = {
        ...user.oauth,
        [provider]: { id: providerId },
      };
      user.markModified("oauth");
    }
    if (avatar && !user.avatar) user.avatar = avatar;
    user.isEmailVerified = true; // OAuth emails are pre-verified
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
  } else {
    // First time — create account (no password for OAuth users)
    user = await User.create({
      name: name?.trim() || email.split("@")[0],
      email: email.toLowerCase().trim(),
      avatar: avatar || "",
      isEmailVerified: true, // OAuth emails are pre-verified by Google/GitHub
      oauth: { [provider]: { id: providerId } },
    });
    isNewUser = true;
  }

  // ── 3. Create Session ─────────────────────────────────────────
  const session = await Session.create({
    user: user._id,
    deviceInfo: req.body.userAgent || req.headers["user-agent"] || "Unknown Device",
    ipAddress: req.body.ipAddress || req.ip || req.connection.remoteAddress || "Unknown IP"
  });

  // Generate token
  const { generateToken } = await import("../utils/generateToken.js");
  const token = generateToken(user._id, user.role, session._id);

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
  };
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: `Signed in with ${provider} successfully! 🎉`,
    token,
    isNewUser, // Frontend uses this to show Create Password modal
    user: user.toPublicJSON(),
  });
};

// ── @desc    Generate a password reset token and send email / log it
// ── @route   POST /api/auth/forgot-password
// ── @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide an email address.",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  console.log("");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║               🔑  PASSWORD RESET LINK REQUEST                  ║");
  console.log("╠════════════════════════════════════════════════════════════════╣");
  console.log(`║ Email : ${user.email}`);
  console.log(`║ Link  : ${resetUrl}`);
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("");

  const emailHtml = `
    <h2>FullPrep Password Reset Request</h2>
    <p>You requested a password reset. Please click the link below to set a new password:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#ff6a00;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
    <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: "Reset your FullPrep Password",
    html: emailHtml,
  });

  res.status(200).json({
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  });
};

// ── @desc    Reset password using token
// ── @route   POST /api/auth/reset-password
// ── @access  Public
export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: token, email, password.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Password reset link is invalid or has expired.",
    });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Revoke ALL active sessions for this user on password reset
  await Session.deleteMany({ user: user._id });
  invalidateUserTokenCache(user._id);

  res.status(200).json({
    success: true,
    message: "Password reset successful! You can now log in.",
  });
};

// ── @desc    Get top users sorted by XP for the leaderboard
// ── @route   GET /api/auth/leaderboard
// ── @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const { main = 'Global', filter = 'Overall', page = 1 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limit = 50;
    const skip = (pageNum - 1) * limit;
    
    // Determine the user's details for Friends/Country filtering
    let currentUser = null;
    if (main === 'Friends' || main === 'Country') {
      currentUser = await User.findById(req.user?._id).lean();
    }
    
    const cacheKey = `leaderboard_${main}_${filter}_${main !== 'Global' ? req.user?._id : 'all'}_page_${pageNum}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      const isArray = Array.isArray(cachedData);
      return res.status(200).json({
        success: true,
        message: "Leaderboard fetched successfully (cached).",
        data: isArray ? cachedData : cachedData.leaderboard,
        totalUsers: isArray ? cachedData.length : cachedData.totalUsers
      });
    }

    // 1. Determine Scope Filter (Global, Country, Friends)
    const matchQuery = { isActive: true };
    
    if (main === 'Friends' && currentUser) {
      const friendIds = Array.isArray(currentUser.friends) ? currentUser.friends : [];
      matchQuery._id = { $in: [currentUser._id, ...friendIds] };
    } else if (main === 'Country' && currentUser) {
      if (currentUser.location) {
        matchQuery.location = { $regex: new RegExp(`^${currentUser.location}$`, 'i') };
      } else {
        matchQuery._id = currentUser._id;
      }
    }

    const totalUsers = await User.countDocuments(matchQuery);

    let users = [];

    // 2. Determine Time Filter (Overall, All Time, Monthly, Weekly)
    if (filter === 'Monthly' || filter === 'Weekly') {
      const days = filter === 'Weekly' ? 7 : 30;
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const subMatch = { status: "ACCEPTED", createdAt: { $gte: dateLimit } };
      
      if (main === 'Friends' && currentUser) {
        const friendIds = Array.isArray(currentUser.friends) ? currentUser.friends : [];
        subMatch.user = { $in: [currentUser._id, ...friendIds] };
      }

      const recentSolvedCounts = await Submission.aggregate([
        { $match: subMatch },
        { $group: { _id: { user: "$user", prob: "$problemExternalId" } } },
        { $group: { _id: "$_id.user", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const topUserIds = recentSolvedCounts.map(s => s._id);
      
      let topUsersRaw = await User.find({ _id: { $in: topUserIds }, ...matchQuery });
      
      const countMap = {};
      recentSolvedCounts.forEach(s => countMap[s._id.toString()] = s.count);
      
      topUsersRaw.sort((a, b) => (countMap[b._id.toString()] || 0) - (countMap[a._id.toString()] || 0));
      users = topUsersRaw;
    } else {
      // Overall / All Time
      users = await User.find(matchQuery)
        .sort({ xp: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit);
    }

    // Total lifetime solved for ALL users for display
    const userIds = users.map((u) => u._id);
    const solvedCounts = await Submission.aggregate([
      { $match: { user: { $in: userIds }, status: "ACCEPTED" } },
      { $group: { _id: { user: "$user", prob: "$problemExternalId" } } },
      { $group: { _id: "$_id.user", count: { $sum: 1 } } },
    ]);

    const solvedMap = {};
    solvedCounts.forEach((s) => {
      solvedMap[s._id.toString()] = s.count;
    });

    const leaderboard = users.map((u, index) => {
      const solved = solvedMap[u._id.toString()] || 0;
      return {
        rank: skip + index + 1,
        username: u.name,
        xp: u.xp || 0,
        streak: u.streak || 0,
        solvedCount: solved,
        level: u.level || 1,
        avatarUrl: u.avatarUrl,
        _id: u._id,
      };
    });

    const responseData = { leaderboard, totalUsers };
    
    // Cache for 5 minutes
    await cacheManager.set(cacheKey, responseData, 300);

    return res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully.",
      data: responseData.leaderboard,
      totalUsers: responseData.totalUsers
    });
  } catch (err) {
    console.error("Leaderboard fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard." });
  }
};


// -- @desc    Export user data (Profile & Submissions)
// -- @route   GET /api/auth/export
// -- @access  Private
export const exportData = async (req, res) => {
  // ── 1. Gather all user data ─────────────────────────────────
  const user = await User.findById(req.user.id).lean();
  const sessions = await Session.find({ user: req.user.id }).lean();
  const submissions = await Submission.find({ user: req.user.id }).lean();

  // ── 2. Format export ──────────────────────────────────────
  const exportBlob = {
    generatedAt: new Date().toISOString(),
    account: user,
    sessions,
    activity: submissions,
  };

  res.status(200).json({
    success: true,
    data: exportBlob,
  });
};

// ── @desc    Get public profile by ID or username
// ── @route   GET /api/auth/public/:id
// ── @access  Public
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support finding by MongoDB ID or username/name match
    let query = mongoose.isValidObjectId(id) ? { _id: id } : { name: new RegExp(`^${id}$`, "i") };
    
    const user = await User.findOne(query).select("name avatar bio socialLinks xp level streak contestRating contestRatingHistory contestsParticipated highestRating activityMap lastSolvedDate createdAt").lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Calculate solved problems count for this user
    // A user can submit the same problem multiple times, we just want the unique count of solved problems
    // Wait, the best way is user.solvedProblems?.length but it's not selected.
    // Instead we can just count distinct problemExternalId where status is ACCEPTED
    const solvedSubmissions = await Submission.distinct("problemExternalId", { user: user._id, status: "ACCEPTED" });
    const solvedCount = solvedSubmissions.length;
    
    const yearlyActivity = await Submission.aggregate([
      { 
        $match: { 
          user: user._id, 
          status: "ACCEPTED",
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const activityMap = {};
    yearlyActivity.forEach(y => {
      activityMap[y._id] = y.count;
    });

    // Calculate solved difficulty breakdown
    const solvedDifficultyBreakdownRaw = await Submission.aggregate([
      { $match: { user: user._id, status: "ACCEPTED" } },
      {
        $group: { _id: "$problem" } // unique problems
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemData"
        }
      },
      { $unwind: { path: "$problemData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$problemData.difficulty",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total platform problems by difficulty
    const totalProblemsRaw = await Problem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 }
        }
      }
    ]);

    // Map difficulties to Easy, Medium, Hard
    const mapDifficulty = (diff) => {
      if (!diff) return "Unknown";
      const upper = diff.toUpperCase();
      if (upper === "EASY") return "Easy";
      if (upper === "MEDIUM") return "Medium";
      return "Hard"; // Hard, Harder, Hardest, Expert, etc.
    };

    const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };
    solvedDifficultyBreakdownRaw.forEach(item => {
      difficultyBreakdown[mapDifficulty(item._id)] += item.count;
    });

    const totalProblemsByDifficulty = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };
    totalProblemsRaw.forEach(item => {
      totalProblemsByDifficulty[mapDifficulty(item._id)] += item.count;
    });
    
    // Return sanitized public info
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        socialLinks: user.socialLinks,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        contestRating: user.contestRating,
        contestRatingHistory: user.contestRatingHistory || [],
        contestsParticipated: user.contestsParticipated,
        highestRating: user.highestRating,
        joinedAt: user.createdAt,
        subscriptionTier: user.subscriptionTier,
        solvedCount,
        activityMap,
        difficultyBreakdown,
        totalProblemsByDifficulty
      }
    });
  } catch (error) {
    console.error("Public Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Create password for the first time (OAuth-only users)
// ── @route   POST /api/auth/create-password
// ── @access  Private (JWT required)
export const createPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: "Please provide both newPassword and confirmPassword." });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
  }

  // Fetch user with password field to verify they don't already have one
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (user.password) {
    return res.status(400).json({
      success: false,
      message: "You already have a password. Use 'Change Password' instead.",
    });
  }

  // Set the password — pre-save hook will hash it
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password created successfully! You can now log in with your email and password.",
  });
};
