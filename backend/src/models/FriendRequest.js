import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// A sender can only have one pending request to a specific receiver
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
