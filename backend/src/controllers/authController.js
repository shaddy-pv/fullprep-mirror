/**
 * @file authController.js
 * @description Handles user registration, login, logout, and profile retrieval.
 *              All handlers are async — errors bubble to the global error handler.
 */

import User from "../models/User.js";
import { sendTokenResponse } from "../utils/generateToken.js";

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

  // ── 4. Respond with token ───────────────────────────────────
  sendTokenResponse(user, 201, res, "Account created successfully! Welcome to FullPrep 🎉");
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
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // ── 6. Respond with token ───────────────────────────────────
  sendTokenResponse(user, 200, res, "Login successful. Welcome back! 👋");
};

// ── @desc    Log out — clear the auth cookie
// ── @route   POST /api/auth/logout
// ── @access  Private
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

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully.",
    user: user.toPublicJSON(),
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

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: user.toPublicJSON(),
  });
};
