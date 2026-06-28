import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// @desc    Send a friend request
// @route   POST /api/friends/request/:id
// @access  Private
export const sendFriendRequest = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;

  if (senderId.toString() === receiverId) {
    return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself." });
  }

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if already friends
    if (receiver.friends && receiver.friends.includes(senderId)) {
      return res.status(400).json({ success: false, message: "You are already friends." });
    }

    // Check if request already exists in either direction
    const existingReq = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingReq) {
      if (existingReq.status === "pending") {
        return res.status(400).json({ success: false, message: "A friend request is already pending between you two." });
      } else if (existingReq.status === "accepted") {
        return res.status(400).json({ success: false, message: "You are already friends." });
      } else if (existingReq.status === "rejected") {
        // If they rejected previously, we might allow resending, so let's update it to pending
        if (existingReq.sender.toString() === senderId.toString()) {
          existingReq.status = "pending";
          await existingReq.save();
        } else {
          return res.status(400).json({ success: false, message: "You cannot send a request to this user right now." });
        }
      }
    } else {
      await FriendRequest.create({
        sender: senderId,
        receiver: receiverId
      });
    }

    // Create Notification for the receiver
    await Notification.create({
      user: receiverId,
      title: "New Friend Request",
      message: `${req.user.name} sent you a friend request.`,
      type: "INFO"
    });

    res.status(200).json({ success: true, message: "Friend request sent successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:id
// @access  Private
export const acceptFriendRequest = async (req, res) => {
  const receiverId = req.user._id;
  const senderId = req.params.id; // ID of the user who sent the request

  try {
    const friendReq = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    });

    if (!friendReq) {
      return res.status(404).json({ success: false, message: "Friend request not found or already processed." });
    }

    friendReq.status = "accepted";
    await friendReq.save();

    // Add to each other's friends list
    await User.findByIdAndUpdate(receiverId, { $addToSet: { friends: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { friends: receiverId } });

    // Notify the sender
    await Notification.create({
      user: senderId,
      title: "Friend Request Accepted",
      message: `${req.user.name} accepted your friend request.`,
      type: "SUCCESS"
    });

    res.status(200).json({ success: true, message: "Friend request accepted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a friend request
// @route   POST /api/friends/reject/:id
// @access  Private
export const rejectFriendRequest = async (req, res) => {
  const receiverId = req.user._id;
  const senderId = req.params.id;

  try {
    const friendReq = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    });

    if (!friendReq) {
      return res.status(404).json({ success: false, message: "Friend request not found." });
    }

    friendReq.status = "rejected";
    await friendReq.save();

    res.status(200).json({ success: true, message: "Friend request rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "name email avatar bio xp level globalRank");
    res.status(200).json({ success: true, data: user.friends || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending"
    }).populate("sender", "name email avatar");
    
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get friend status with a specific user
// @route   GET /api/friends/status/:id
// @access  Private
export const getFriendStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetId = req.params.id;

    if (user.friends && user.friends.includes(targetId)) {
      return res.status(200).json({ success: true, data: "friends" });
    }

    const friendReq = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: targetId },
        { sender: targetId, receiver: req.user._id }
      ],
      status: "pending"
    });

    if (friendReq) {
      if (friendReq.sender.toString() === req.user._id.toString()) {
        return res.status(200).json({ success: true, data: "pending_sent" });
      } else {
        return res.status(200).json({ success: true, data: "pending_received" });
      }
    }

    res.status(200).json({ success: true, data: "none" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
