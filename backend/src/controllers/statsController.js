/**
 * @file statsController.js
 * @description Handles user profile statistics aggregation.
 *              Separated from submissionController.js to enforce SOLID/SRP principles.
 */

import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { cacheManager } from "../utils/cacheManager.js";

// ── @desc    Get aggregated stats for the logged-in user
// ── @route   GET /api/auth/stats
// ── @access  Private
export const getUserStats = async (req, res) => {
  const userId = req.user._id;
  const { timeFilter } = req.query;

  const cacheKey = `${userId.toString()}_${timeFilter || "all"}`;
  const cachedData = await cacheManager.get(`stats:${cacheKey}`);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  let startDate = null;
  if (timeFilter === "last_7_days") {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeFilter === "last_30_days") {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const baseMatch = { user: userId };
  const acceptedMatch = { user: userId, status: "ACCEPTED" };
  if (startDate) {
    baseMatch.createdAt = { $gte: startDate };
    acceptedMatch.createdAt = { $gte: startDate };
  }

  // ── Run all aggregations in parallel for speed ────────────────
  const [
    user,
    totalSubmissions,
    acceptedSubmissions,
    solvedProblems,
    globalRank,
    dailyActivity,
    languageBreakdown,
    difficultyBreakdown,
    yearlyActivity,
    topicBreakdown,
  ] = await Promise.all([

    // 1. Fresh user data (xp, streak, level)
    User.findById(userId),

    // 2. Total submissions ever made by this user (filtered)
    Submission.countDocuments(baseMatch),

    // 3. Total accepted submissions (filtered)
    Submission.countDocuments(acceptedMatch),

    // 4. Distinct problems solved (filtered)
    Submission.distinct("problemExternalId", acceptedMatch),

    // 5. Global rank: how many active users have MORE XP than this user
    // Rank = (active users with more XP) + 1
    User.countDocuments({ isActive: true, xp: { $gt: req.user.xp ?? 0 } }),

    // 6. Daily submission activity for the last 7 days (for the graph)
    Submission.aggregate([
      {
        $match: {
          user:      userId,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total:    { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // 7. Language usage breakdown
    Submission.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // 8. Difficulty breakdown (requires looking up problem difficulty)
    Submission.aggregate([
      { $match: { user: userId, status: "ACCEPTED" } },
      {
        $group: {
          _id: "$problem", // Group by problem ObjectId to get unique solved problems
        }
      },
      {
        $lookup: {
          from:         "problems",
          localField:   "_id",
          foreignField: "_id",
          as:           "problemData",
        },
      },
      { $unwind: { path: "$problemData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id:   "$problemData.difficulty",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    
    // 9. Yearly Activity (last 365 days)
    Submission.aggregate([
      { 
        $match: { 
          user: userId, 
          status: "ACCEPTED",
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]),

    // 10. Topic Breakdown (most common tags among solved problems)
    Submission.aggregate([
      { $match: { user: userId, status: "ACCEPTED" } },
      {
        $group: {
          _id: "$problem", // unique problems
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemData",
        }
      },
      { $unwind: { path: "$problemData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$problemData.cfTags", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$problemData.cfTags",
          count: { $sum: 1 },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
  ]);

  // ── Computed values ───────────────────────────────────────────
  const problemsSolved  = solvedProblems.length;
  const acceptanceRate  = totalSubmissions > 0
    ? Math.round((acceptedSubmissions / totalSubmissions) * 1000) / 10  // 1 decimal place
    : 0;
  const globalRankNum   = globalRank + 1; // +1 because rank starts at 1

  // ── Fill in missing days with 0 for the graph ─────────────────
  const activityMap = {};
  dailyActivity.forEach((d) => { activityMap[d._id] = d; });
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key  = date.toISOString().split("T")[0];
    last7Days.push({
      date,
      label:    date.toLocaleDateString("en-US", { weekday: "short" }),
      total:    activityMap[key]?.total    ?? 0,
      accepted: activityMap[key]?.accepted ?? 0,
    });
  }

  const responseData = {
    success: true,
    message: "User stats fetched successfully.",
    data: {
      // ── Profile ──────────────────────────────────────────────
      xp:    user?.xp    ?? 0,
      level: user?.level ?? 1,
      streak: user?.streak ?? 0,

      // ── Key Stats ─────────────────────────────────────────────
      problemsSolved,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,   // percentage, e.g. 78.4
      globalRank: globalRankNum,

      // ── Breakdowns ────────────────────────────────────────────
      languageBreakdown: languageBreakdown.map((l) => ({
        language: l._id,
        count:    l.count,
      })),
      difficultyBreakdown: difficultyBreakdown
        .filter((d) => d._id) // Remove null difficulty entries
        .map((d) => ({
          difficulty: d._id,
          count:      d.count,
        })),
      topicStrength: topicBreakdown
        .filter((t) => t._id) // Remove null tags
        .map((t) => ({
          topic: t._id,
          count: t.count,
        })),

      // ── Graph data ──────────────────────────────
      dailyActivity: last7Days,
      yearlyActivity: yearlyActivity.map(y => ({ date: y._id, count: y.count })),
    },
  };

  await cacheManager.set(`stats:${cacheKey}`, responseData, 10); // 10 seconds TTL
  res.status(200).json(responseData);
};
