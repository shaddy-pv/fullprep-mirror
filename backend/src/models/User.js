/**
 * @file User.js
 * @description Mongoose schema & model for FullPrep users.
 *              Includes pre-save password hashing and instance helpers.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

// ── Sub-schema: Social Links ──────────────────────────────────────────────────

const socialLinksSchema = new mongoose.Schema(
  {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    website: { type: String, default: "" },
    leetcode: { type: String, default: "" },
  },
  { _id: false }
);

// ── Main User Schema ──────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // ── Identity ────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Please provide a valid email address",
      },
    },

    password: {
      type: String,
      // Not required — OAuth users have no password
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password in query results by default
    },

    // ── Profile ─────────────────────────────────────────────
    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },

    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    // ── Gamification ────────────────────────────────────────
    xp: {
      type: Number,
      default: 0,
      min: [0, "XP cannot be negative"],
    },

    streak: {
      type: Number,
      default: 0,
      min: [0, "Streak cannot be negative"],
    },

    lastSolvedDate: {
      type: Date,
      default: null,
    },

    level: {
      type: Number,
      default: 1,
      min: [1, "Level starts at 1"],
    },

    // ── Access Control ───────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["user", "mentor", "admin"],
        message: "Role must be one of: user, mentor, admin",
      },
      default: "user",
    },

    subscriptionTier: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    aiHintsUsed: {
      type: Number,
      default: 0,
    },

    aiHintsLastReset: {
      type: Date,
      default: Date.now,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Auth & Security ──────────────────────────────────────
    passwordChangedAt: {
      type: Date,
    },

    lastLoginAt: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ── OAuth Provider Links ─────────────────────────────────
    // Stores provider-specific user IDs for Google / GitHub sign-in
    oauth: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false, // Internal — not exposed in API responses
    },

    // ── Solved Problems ───────────────────────────────────────────
    // Array of problemExternalIds the user has solved (ACCEPTED submission).
    // Used to: (1) show solved checkmark on problem list, (2) award XP only once.
    solvedProblems: {
      type: [String],
      default: [],
      index: true,
    },

    // ── Bookmarked Problems ───────────────────────────────────────
    // Array of problemExternalIds the user has bookmarked.
    bookmarks: {
      type: [String],
      default: [],
      index: true,
    },

    location: {
      type: String,
      default: "",
    },

    backupEmail: {
      type: String,
      default: "",
    },

    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    notifs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    visibility: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    twoFactor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

userSchema.index({ role: 1 });
userSchema.index({ xp: -1 }); // Leaderboard queries

// ── Pre-save Hook: Hash Password ──────────────────────────────────────────────

userSchema.pre("save", async function (next) {
  // Only hash when password field is new or modified, AND actually exists (OAuth users have no password)
  if (!this.isModified("password") || !this.password) return next();

  const salt = await bcrypt.genSalt(12); // Cost factor 12 — good security/perf balance
  this.password = await bcrypt.hash(this.password, salt);

  // Record password change time (skip on first save)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // 1s buffer for token timing
  }

  next();
});

// ── Instance Method: Compare Password ────────────────────────────────────────

/**
 * Compares a plain-text candidate password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Safe Public Profile ─────────────────────────────────────

/**
 * Returns a sanitised user object safe to send in API responses.
 * Strips password, __v, and internal fields.
 * @returns {object}
 */
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.passwordChangedAt;
  return obj;
};

// ── Virtual: Full Avatar URL Fallback ────────────────────────────────────────

userSchema.virtual("avatarUrl").get(function () {
  if (this.avatar) return this.avatar;
  // Gravatar-style initials fallback using UI Avatars
  const encoded = encodeURIComponent(this.name || "FP");
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=128`;
});

const User = mongoose.model("User", userSchema);

export default User;
