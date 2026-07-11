/**
 * @file userController.js
 * @description Handles user management for Admins.
 */

import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Session from "../models/Session.js";
import { invalidateUserTokenCache } from "../middleware/authMiddleware.js";

// ── @desc    Update admin profile
// ── @route   PUT /api/users/profile
// ── @access  Private / Admin
export const updateProfile = async (req, res) => {
  const { name } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  user.name = name || user.name;
  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
};

// ── @desc    Get all users (paginated)
// ── @route   GET /api/users
// ── @access  Private / Admin
export const getUsers = async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(10000, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (role) filter.role = role.toLowerCase();

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Convert to public JSON equivalent
  const data = users.map((u) => {
    delete u.passwordChangedAt;
    delete u.passwordResetToken;
    delete u.passwordResetExpires;
    delete u.emailVerificationToken;
    delete u.emailVerificationExpires;
    delete u.oauth;
    return u;
  });

  res.status(200).json({
    success: true,
    message: "Users fetched successfully.",
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
    data,
  });
};

// ── @desc    Get a single user by ID
// ── @route   GET /api/users/:id
// ── @access  Private / Admin
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -__v");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const u = user.toObject();
  delete u.passwordChangedAt;
  delete u.passwordResetToken;
  delete u.passwordResetExpires;
  delete u.emailVerificationToken;
  delete u.emailVerificationExpires;
  delete u.oauth;

  res.status(200).json({
    success: true,
    message: "User fetched successfully.",
    data: u,
  });
};

// ── @desc    Update user role
// ── @route   PATCH /api/users/:id/role
// ── @access  Private / Admin
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin", "mentor"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password -__v");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.status(200).json({ success: true, message: "Role updated successfully.", data: user });
};

// ── @desc    Create a new admin user manually
// ── @route   POST /api/users/admin
// ── @access  Private / Admin
export const createAdminUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: "User already exists with this email" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
    isEmailVerified: true, // Auto-verify admin accounts
  });

  const u = user.toObject();
  delete u.password;

  res.status(201).json({ success: true, message: "Admin created successfully.", data: u });
};

// ── @desc    Get aggregated stats for any user (Admin only)
// ── @route   GET /api/users/:id/stats
// ── @access  Private / Admin
export const getAdminUserStats = async (req, res) => {
  const userId = req.params.id;

  const [
    user,
    totalSubmissions,
    acceptedSubmissions,
    solvedProblems,
  ] = await Promise.all([
    User.findById(userId),
    Submission.countDocuments({ user: userId }),
    Submission.countDocuments({ user: userId, status: "ACCEPTED" }),
    Submission.distinct("problemExternalId", { user: userId, status: "ACCEPTED" }),
  ]);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const realGlobalRank = await User.countDocuments({
    isActive: true,
    $or: [
      { xp: { $gt: user.xp ?? 0 } },
      { xp: user.xp ?? 0, createdAt: { $lt: user.createdAt || new Date() } }
    ]
  });

  // 6. Daily submission activity for the last 7 days
  const dailyActivityReal = await Submission.aggregate([
    { $match: { user: user._id, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
  ]);

  // 7. Language usage breakdown
  const languageBreakdownReal = await Submission.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: "$language", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 8. Difficulty breakdown
  const difficultyBreakdownReal = await Submission.aggregate([
    { $match: { user: user._id, status: "ACCEPTED" } },
    { $lookup: { from: "problems", localField: "problem", foreignField: "_id", as: "problemData" } },
    { $unwind: { path: "$problemData", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$problemData.difficulty", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const problemsSolved = solvedProblems.length;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 1000) / 10 : 0;
  const globalRankNum = realGlobalRank + 1;

  const activityMap = {};
  dailyActivityReal.forEach((d) => { activityMap[d._id] = d; });
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split("T")[0];
    last7Days.push({
      date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      total: activityMap[key]?.total ?? 0,
      accepted: activityMap[key]?.accepted ?? 0,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      xp: user.xp ?? 0,
      level: user.level ?? 1,
      streak: user.streak ?? 0,
      problemsSolved,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      globalRank: globalRankNum,
      languageBreakdown: languageBreakdownReal.map((l) => ({ language: l._id, count: l.count })),
      difficultyBreakdown: difficultyBreakdownReal.filter((d) => d._id).map((d) => ({ difficulty: d._id, count: d.count })),
      dailyActivity: last7Days,
    },
  });
};

// ── @desc    Delete a user and all their submissions completely
// ── @route   DELETE /api/users/:id
// ── @access  Private / Admin
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Delete all submissions
  await Submission.deleteMany({ user: user._id });
  // Delete all sessions & invalidate cache
  await Session.deleteMany({ user: user._id });
  invalidateUserTokenCache(user._id);
  // Delete user
  await user.deleteOne();

  res.status(200).json({ success: true, message: "User deleted completely." });
};

// ── @desc    Toggle user active status
// ── @route   PATCH /api/users/:id/status
// ── @access  Private / Admin
export const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password -__v");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!isActive) {
    // Force logout: delete all active sessions and clear token cache
    await Session.deleteMany({ user: user._id });
    invalidateUserTokenCache(user._id);
  }

  res.status(200).json({ success: true, message: `User account ${isActive ? 'activated' : 'suspended'}.`, data: user });
};

// ── @desc    Search users by name
// ── @route   GET /api/users/search
// ── @access  Private
export const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }
  
  const regex = new RegExp(q, "i");
  const users = await User.find({ name: regex })
    .select("name avatar level contestRating globalRank")
    .limit(10);
    
  res.status(200).json({ success: true, data: users });
};
