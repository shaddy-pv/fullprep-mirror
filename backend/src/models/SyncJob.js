import mongoose from "mongoose";

const syncJobSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["ALL", "STALE", "MISSING"],
      default: "ALL",
    },
    status: {
      type: String,
      enum: ["RUNNING", "COMPLETED", "FAILED"],
      default: "RUNNING",
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    totalToSync: {
      type: Number,
      default: 0,
    },
    syncedCount: {
      type: Number,
      default: 0,
    },
    skippedCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    logs: [
      {
        type: String,
      },
    ],
    errors: [
      {
        id: String,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

syncJobSchema.index({ createdAt: -1 });

const SyncJob = mongoose.model("SyncJob", syncJobSchema);

export default SyncJob;
