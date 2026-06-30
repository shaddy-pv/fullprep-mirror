/**
 * @file Submission.js
 * @description Mongoose schema & model for code submissions.
 *
 *  Each submission represents one attempt by a user on a problem.
 *  The judge system (BullMQ worker) updates the status & result
 *  once evaluation is complete.
 *
 *  Used by:
 *    - GET  /api/auth/stats        → aggregate user stats (solved count, acceptance rate)
 *    - GET  /api/submissions        → user submission history
 *    - POST /api/submissions        → create new submission
 */

import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // ── Relations ────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Submission must belong to a user"],
      index: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },

    // External problem ID from Codnite (e.g. "1579_a__casimir...")
    // Stored separately so we can look up stats without joining
    problemExternalId: {
      type: String,
      required: [true, "Problem external ID is required"],
      trim: true,
      index: true,
    },

    problemName: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Submission Content ────────────────────────────────────────
    code: {
      type: String,
      required: [true, "Code is required"],
      maxlength: [100000, "Code cannot exceed 100,000 characters"],
    },

    language: {
      type: String,
      required: [true, "Language is required"],
      enum: {
        values: ["PYTHON3", "CPP17", "CPP20", "JAVA", "JAVASCRIPT", "C", "RUST", "GO"],
        message: "Unsupported language: {VALUE}",
      },
      uppercase: true,
    },

    // ── Judge Result ──────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: [
          "PENDING",         // In queue, not yet judged
          "RUNNING",         // Currently being executed
          "ACCEPTED",        // All test cases passed ✅
          "WRONG_ANSWER",    // Output doesn't match expected
          "TIME_LIMIT",      // Exceeded time limit
          "MEMORY_LIMIT",    // Exceeded memory limit
          "RUNTIME_ERROR",   // Code threw an exception
          "COMPILE_ERROR",   // Code failed to compile
          "SYSTEM_ERROR",    // Internal judge error
        ],
        message: "Invalid submission status: {VALUE}",
      },
      default: "PENDING",
      index: true,
    },

    // Judge output details
    executionTimeMs: { type: Number, default: null },
    memoryUsedMb:    { type: Number, default: null },
    errorMessage:    { type: String, default: "" },

    // Number of test cases passed out of total
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal:  { type: Number, default: 0 },

    // ── BullMQ Job Reference ──────────────────────────────────────
    jobId: {
      type: String,
      default: null,
    },

    // ── Moderation ────────────────────────────────────────────────
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt = submission time, updatedAt = when judge finished
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Compound Indexes ───────────────────────────────────────────────────────────

// Most common query: "all submissions by user X"
submissionSchema.index({ user: 1, createdAt: -1 });

// Stats query: "accepted submissions by user X for problem Y"
submissionSchema.index({ user: 1, problemExternalId: 1, status: 1 });

// Activity feed: daily breakdown for graphs
submissionSchema.index({ user: 1, status: 1, createdAt: -1 });

// ── Virtual: isAccepted ───────────────────────────────────────────────────────

submissionSchema.virtual("isAccepted").get(function () {
  return this.status === "ACCEPTED";
});

// ── Instance Method: Safe Public JSON ─────────────────────────────────────────

submissionSchema.methods.toPublicJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.code;  // Don't return full code in list views (large payload)
  delete obj.__v;
  return obj;
};

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
