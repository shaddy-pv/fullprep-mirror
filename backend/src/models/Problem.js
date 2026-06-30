/**
 * @file Problem.js
 * @description Mongoose schema & model for FullPrep problems.
 *
 *  Problems are sourced from the Codnite Problem API (Codeforces dataset)
 *  and cached in MongoDB. The `externalId` field maps back to the Codnite
 *  problem id so we can efficiently sync updates.
 *
 *  Cache strategy:
 *    - On first GET /api/problems/:id, fetch from Codnite → save to MongoDB.
 *    - Re-fetch if lastSyncedAt is older than CACHE_TTL_MS (24 hours).
 *    - Admin POST /api/problems/sync bulk-imports all problems.
 */

import mongoose from "mongoose";

// ── Sub-schema: Test Case ──────────────────────────────────────────────────────

const testCaseSchema = new mongoose.Schema(
  {
    input:  { type: String, default: "" },
    output: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  {
    language: { type: String, default: "UNKNOWN" },
    code: { type: String, default: "" },
  },
  { _id: false }
);

const editorialSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    timeComplexity: { type: String, default: "" },
    spaceComplexity: { type: String, default: "" },
  },
  { _id: false }
);

const judgeConfigSchema = new mongoose.Schema(
  {
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    outputMatchingStrategy: { type: String, default: "EXACT_MATCH" },
  },
  { _id: false }
);

// ── Sub-schema: Solution ──────────────────────────────────────────────────────

const solutionSchema = new mongoose.Schema(
  {
    language: { type: String, default: "UNKNOWN" },
    solution: { type: String, default: "" },
  },
  { _id: false }
);

// ── Sub-schema: Problem Stats ─────────────────────────────────────────────────

const statsSchema = new mongoose.Schema(
  {
    totalPublicTests:     { type: Number, default: 0 },
    totalPrivateTests:    { type: Number, default: 0 },
    totalGeneratedTests:  { type: Number, default: 0 },
    totalSolutions:       { type: Number, default: 0 },
    totalIncorrectSolutions: { type: Number, default: 0 },
    upvotes:              { type: Number, default: 0 },
    downvotes:            { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main Problem Schema ───────────────────────────────────────────────────────

const problemSchema = new mongoose.Schema(
  {
    // ── External Reference (Codnite API) ────────────────────────────
    externalId: {
      type: String,
      required: [true, "External problem ID is required"],
      unique: true,
      trim: true,
      index: true,
    },

    serialNo: {
      type: Number,
      default: 0,
    },

    // ── Core Problem Data ────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Problem name is required"],
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    descriptionPreview: {
      type: String,
      default: "",
      maxlength: [500, "Description preview cannot exceed 500 characters"],
    },

    source: {
      type: String,
      enum: {
        values: ["CODEFORCES", "CODECHEF", "HACKEREARTH", "CODEJAM", "ATCODER", "LEETCODE", "FULLPREP", "UNKNOWN"],
        message: "Invalid problem source",
      },
      default: "CODEFORCES",
    },

    // ── Difficulty & Rating ──────────────────────────────────────────
    difficulty: {
      type: String,
      enum: {
        values: ["EASY", "MEDIUM", "HARD", "HARDER", "HARDEST", "EXPERT", "VERY HARD", "UNKNOWN"],
        message: "Invalid difficulty level",
      },
      default: "UNKNOWN",
      index: true,
    },

    cfRating: {
      type: Number,
      default: 0,
      min: [0, "CF rating cannot be negative"],
      index: true,
    },

    cfTags: {
      type: [String],
      default: [],
      index: true,
    },

    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints: { type: [String], default: [] },
    notes: { type: String, default: "" },
    examples: { type: [exampleSchema], default: [] },
    hints: { type: [String], default: [] },
    starterCodeTemplates: { type: [starterCodeSchema], default: [] },
    editorial: { type: editorialSchema, default: null },
    judgeConfig: { type: judgeConfigSchema, default: () => ({}) },
    problemCode: { type: String, default: "" },
    problemSlug: { type: String, default: "" },
    originalProblemLink: { type: String, default: "" },

    // ── Constraints ──────────────────────────────────────────────────
    timeLimitSeconds: {
      type: Number,
      default: 2,
    },

    memoryLimitMb: {
      type: Number,
      default: 256,
    },

    // ── Test Cases ───────────────────────────────────────────────────
    // Public tests are visible to all users (shown as examples in problem statement)
    publicTests: {
      type: [testCaseSchema],
      default: [],
    },

    // Private & generated tests — only accessible to admins / judge system
    // NOT returned to regular users via API
    privateTests: {
      type: [testCaseSchema],
      default: [],
      select: false, // Never returned by default
    },

    generatedTests: {
      type: [testCaseSchema],
      default: [],
      select: false, // Never returned by default
    },

    // ── Solutions ────────────────────────────────────────────────────
    // Only admins can access solutions
    solutions: {
      type: [solutionSchema],
      default: [],
      select: false,
    },

    incorrectSolutions: {
      type: [solutionSchema],
      default: [],
      select: false,
    },

    // ── Aggregated Stats ─────────────────────────────────────────────
    stats: {
      type: statsSchema,
      default: () => ({}),
    },

    // ── FullPrep-specific Fields ─────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Admin who imported / created this problem
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Cache Metadata ───────────────────────────────────────────────
    // When was this problem last fetched from the Codnite API
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Compound Indexes ──────────────────────────────────────────────────────────

problemSchema.index({ difficulty: 1, cfRating: 1 }); // filter + sort
problemSchema.index({ cfTags: 1, difficulty: 1 });     // tag filter
problemSchema.index({ name: "text", descriptionPreview: "text" }); // text search
problemSchema.index({ isActive: 1, serialNo: 1 }); // default list sort

// ── Virtual: isCacheStale ─────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

problemSchema.virtual("isCacheStale").get(function () {
  if (!this.lastSyncedAt) return true;
  return Date.now() - this.lastSyncedAt.getTime() > CACHE_TTL_MS;
});

// ── Instance Method: Safe Public JSON ─────────────────────────────────────────

/**
 * Returns a sanitised problem object safe to send in API responses.
 * Strips private/generated tests, solutions — fields regular users shouldn't see.
 * @returns {object}
 */
problemSchema.methods.toPublicJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.privateTests;
  delete obj.generatedTests;
  delete obj.solutions;
  delete obj.incorrectSolutions;
  delete obj.__v;
  delete obj.lastSyncedAt;
  delete obj.isCacheStale;
  if (!obj.editorial) delete obj.editorial;
  return obj;
};

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
