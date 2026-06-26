import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    language: {
      type: String,
    },
    approach: {
      type: [String],
    },
    complexity: {
      time: String,
      space: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    problemExternalId: {
      type: String,
      // Optional: tie a chat to a specific problem
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch a user's recent conversations
aiChatSchema.index({ user: 1, updatedAt: -1 });

const AiChat = mongoose.model("AiChat", aiChatSchema);

export default AiChat;
