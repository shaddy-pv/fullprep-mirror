import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    // Array of external problem IDs (e.g., "1579_a__casimir...")
    problems: [{ type: String }],
  },
  { _id: true } // generate ObjectIds for modules so we can uniquely identify them if needed
);

const learningPathSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    estimatedTime: {
      type: String, // e.g., "45h"
      default: "",
    },
    color: {
      type: String,
      default: "#3b82f6", // Default blue
    },
    icon: {
      type: String, // Maps to a Lucide icon name on the frontend
      default: "BookOpen",
    },
    popularity: {
      type: Number,
      default: 0,
    },
    isPro: {
      type: Boolean,
      default: false, // true = Paid/Pro path, false = Free path
    },
    contentType: {
      type: String,
      enum: ["problems", "notes"],
      default: "problems",
    },
    content: {
      type: String, // Stores markdown/rich-text if contentType === "notes"
      default: "",
    },
    modules: [moduleSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual to calculate total problems
learningPathSchema.virtual("problemsCount").get(function () {
  if (!this.modules) return 0;
  return this.modules.reduce((total, mod) => total + (mod.problems?.length || 0), 0);
});

learningPathSchema.virtual("topicsCount").get(function () {
  return this.modules ? this.modules.length : 0;
});

// Ensure virtuals are included in JSON/Object conversions
learningPathSchema.set("toJSON", { virtuals: true });
learningPathSchema.set("toObject", { virtuals: true });

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

export default LearningPath;
