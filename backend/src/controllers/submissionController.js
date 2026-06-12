/**
 * @file submissionController.js
 * @description Handles code submission creation and user stats aggregation.
 *
 *  getUserStats   → GET  /api/auth/stats
 *  submitCode     → POST /api/submissions
 *  getSubmissions → GET  /api/submissions
 *  getSubmission  → GET  /api/submissions/:id
 */

import Submission from "../models/Submission.js";
import User from "../models/User.js";

// ── @desc    Get aggregated stats for the logged-in user
// ── @route   GET /api/auth/stats
// ── @access  Private
export const getUserStats = async (req, res) => {
  const userId = req.user._id;

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
  ] = await Promise.all([

    // 1. Fresh user data (xp, streak, level)
    User.findById(userId),

    // 2. Total submissions ever made by this user
    Submission.countDocuments({ user: userId }),

    // 3. Total accepted submissions
    Submission.countDocuments({ user: userId, status: "ACCEPTED" }),

    // 4. Distinct problems solved (unique problem IDs with at least one ACCEPTED)
    Submission.distinct("problemExternalId", {
      user:   userId,
      status: "ACCEPTED",
    }),

    // 5. Global rank: how many users have MORE XP than this user
    // Rank = (users with more XP) + 1
    User.countDocuments({ xp: { $gt: req.user.xp ?? 0 } }),

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
        $lookup: {
          from:         "problems",
          localField:   "problem",
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

  res.status(200).json({
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

      // ── Graph data (last 7 days) ──────────────────────────────
      dailyActivity: last7Days,
    },
  });
};

// ── @desc    Submit code for a problem
// ── @route   POST /api/submissions
// ── @access  Private
export const submitCode = async (req, res) => {
  const { problemExternalId, problemName, code, language } = req.body;

  if (!problemExternalId || !code || !language) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: problemExternalId, code, language.",
    });
  }

  // Look up problem in DB to link it
  let problemId = null;
  try {
    const Problem = Submission.db.model("Problem");
    const problemDoc = await Problem.findOne({ externalId: problemExternalId.trim() });
    if (problemDoc) {
      problemId = problemDoc._id;
    }
  } catch (err) {
    console.error("Error looking up problem for submission:", err);
  }

  // Create submission record in PENDING state
  const submission = await Submission.create({
    user:              req.user._id,
    problem:           problemId,
    problemExternalId: problemExternalId.trim(),
    problemName:       problemName?.trim() || "",
    code,
    language:          language.toUpperCase(),
    status:            "PENDING",
  });

  // Simulate background judging after 1.5 seconds
  setTimeout(async () => {
    try {
      const statuses = ["ACCEPTED", "ACCEPTED", "WRONG_ANSWER", "ACCEPTED"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const updateData = {
        status: randomStatus,
        executionTimeMs: Math.floor(Math.random() * 120) + 15,
        memoryUsedMb: parseFloat((Math.random() * 10 + 5).toFixed(2)),
        testCasesPassed: randomStatus === "ACCEPTED" ? 3 : 2,
        testCasesTotal: 3,
      };

      if (randomStatus === "WRONG_ANSWER") {
        updateData.errorMessage = "Assertion failed: expected [1, 2] but got [0, 1] on case 3.";
      }

      await Submission.findByIdAndUpdate(submission._id, updateData);

      // If accepted, add XP to the user
      if (randomStatus === "ACCEPTED") {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { xp: 10 }
        });
      }
      
      console.log(`[Simulation] Submission ${submission._id} updated to ${randomStatus}`);
    } catch (err) {
      console.error("[Simulation] Failed to update submission status:", err);
    }
  }, 1500);

  res.status(201).json({
    success: true,
    message: "Submission received! Your code is being evaluated.",
    data: {
      submissionId: submission._id,
      status:       submission.status,
      language:     submission.language,
      createdAt:    submission.createdAt,
    },
  });
};

// ── @desc    Get submission history for the logged-in user
// ── @route   GET /api/submissions
// ── @access  Private
export const getSubmissions = async (req, res) => {
  const { page = 1, limit = 20, status, problemExternalId } = req.query;

  const pageNum  = Math.max(1, parseInt(page,  10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;

  const filter = { user: req.user._id };
  if (status)            filter.status            = status.toUpperCase();
  if (problemExternalId) filter.problemExternalId = problemExternalId;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .select("-code") // Exclude code from list view (large payload)
      .populate("problem", "difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Submissions fetched successfully.",
    pagination: {
      page:       pageNum,
      limit:      limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext:    pageNum < Math.ceil(total / limitNum),
      hasPrev:    pageNum > 1,
    },
    data: submissions,
  });
};

// ── @desc    Get a single submission with full code
// ── @route   GET /api/submissions/:id
// ── @access  Private
export const getSubmission = async (req, res) => {
  const submission = await Submission.findOne({
    _id:  req.params.id,
    user: req.user._id, // Users can only view their own submissions
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Submission fetched successfully.",
    data:    submission.toPublicJSON(),
  });
};
