/**
 * @file authController.js
 * @description Handles user registration, login, logout, and profile retrieval.
 *              All handlers are async — errors bubble to the global error handler.
 */

import User from "../models/User.js";
import { sendTokenResponse } from "../utils/generateToken.js";
import firebaseAdmin from "../config/firebase.js";
import { sendEmail } from "../utils/emailService.js";
import crypto from "crypto";
import Submission from "../models/Submission.js";

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
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  // ── 4. Firebase Email Verification (Hybrid) ─────────────────
  if (firebaseAdmin) {
    try {
      // Create user in Firebase Auth
      await firebaseAdmin.auth().createUser({
        uid: user._id.toString(),
        email: user.email,
        password: password,
        displayName: user.name,
      });

      // Generate verification link
      // Redirects user back to frontend after Firebase verifies the email
      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=true`,
      };
      const link = await firebaseAdmin.auth().generateEmailVerificationLink(user.email, actionCodeSettings);

      // Send via Nodemailer
      await sendEmail({
        to: user.email,
        subject: "Verify your email for FullPrep",
        html: `
          <h2>Welcome to FullPrep, ${user.name}!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${link}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
          <p>Or paste this link into your browser: <br/> ${link}</p>
        `,
      });
    } catch (err) {
      console.error("Firebase Auth creation/email error:", err.message);
      // We don't fail the registration if this fails, but they might need to request a new link later
    }
  }

  // ── 5. Respond with token ───────────────────────────────────
  sendTokenResponse(user, 201, res, "Account created! Please check your email to verify your account.");
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

  // ── 6. Respond with token ───────────────────────────────────
  sendTokenResponse(user, 200, res, "Login successful. Welcome back! 👋");
};

// ── @desc    Log out — clear the auth cookie
// ── @route   POST /api/auth/logout
// ── @access  Public (no token needed — just clears the cookie)
export const logout = async (req, res) => {
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

// ── @desc    Get currently authenticated user's profile
// ── @route   GET /api/auth/me
// ── @access  Private
export const getMe = async (req, res) => {
  // req.user is already attached by the protect middleware
  // We re-fetch to ensure the latest data (e.g. XP updates)
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const publicUser = user.toPublicJSON();

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
  const allowedUpdates = ["name", "bio", "avatar", "socialLinks"];
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

// ── @desc    Resend verification email
// ── @route   POST /api/auth/resend-verification
// ── @access  Private
export const resendVerification = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return res.status(400).json({ success: false, message: "Email is already verified." });
  }

  if (!firebaseAdmin) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Dev Mode] Mock resend verification requested for: ${user.email}`);
      return res.status(200).json({
        success: true,
        message: "[Dev Mode] Verification email resend simulated successfully!",
      });
    }
    return res.status(500).json({ success: false, message: "Email verification is not configured on the server." });
  }

  try {
    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=true`,
    };
    const link = await firebaseAdmin.auth().generateEmailVerificationLink(user.email, actionCodeSettings);
    
    const sent = await sendEmail({
      to: user.email,
      subject: "Verify your email for FullPrep",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
      `,
    });

    if (!sent) {
      throw new Error("Failed to send email");
    }

    res.status(200).json({ success: true, message: "Verification email sent!" });
  } catch (err) {
    console.error("Resend verification error:", err.message);
    res.status(500).json({ success: false, message: "Could not send verification email." });
  }
};

// ── @desc    Sync verification status from Firebase
// ── @route   POST /api/auth/sync-verification
// ── @access  Private
export const syncVerification = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return res.status(200).json({ success: true, message: "Already verified.", isVerified: true });
  }

  if (!firebaseAdmin) {
    if (process.env.NODE_ENV === "development") {
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({
        success: true,
        message: "[Dev Mode] Email successfully verified automatically!",
        isVerified: true,
      });
    }
    return res.status(500).json({ success: false, message: "Firebase not configured." });
  }

  try {
    const fbUser = await firebaseAdmin.auth().getUserByEmail(user.email);
    
    if (fbUser.emailVerified) {
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ success: true, message: "Email successfully verified!", isVerified: true });
    }

    res.status(200).json({ success: true, message: "Email not verified yet.", isVerified: false });
  } catch (err) {
    console.error("Sync verification error:", err.message);
    res.status(500).json({ success: false, message: "Failed to check verification status." });
  }
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

  // Find by OAuth provider ID first, then fall back to email
  let user = await User.findOne({
    $or: [
      { [`oauth.${provider}.id`]: providerId },
      { email: email.toLowerCase() },
    ],
  });

  if (user) {
    // Update OAuth link and avatar if not already set
    if (!user.oauth?.[provider]?.id) {
      user.oauth = {
        ...user.oauth,
        [provider]: { id: providerId },
      };
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
  }

  sendTokenResponse(user, 200, res, `Signed in with ${provider} successfully! 🎉`);
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
    const users = await User.find({ isActive: true })
      .sort({ xp: -1 })
      .limit(50);

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
        rank: index + 1,
        username: u.name,
        xp: u.xp || 0,
        streak: u.streak || 0,
        solvedCount: solved,
        level: u.level || 1,
        avatarUrl: u.avatarUrl,
        _id: u._id,
      };
    });

    res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully.",
      data: leaderboard,
    });
  } catch (err) {
    console.error("Leaderboard fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard." });
  }
};

