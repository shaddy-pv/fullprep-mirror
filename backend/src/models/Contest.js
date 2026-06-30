import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Contest title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      default: "Codnite",
      trim: true,
    },
    registrationUrl: {
      type: String,
      default: "",
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["custom"],
        message: "Invalid contest type",
      },
      default: "custom",
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Basic indexing for faster lookups based on active status and timing
contestSchema.index({ isActive: 1, startTime: 1 });

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;
