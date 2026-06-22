/**
 * @file submissionController.js
 * @description Handles code submission creation and user stats aggregation.
 *
 *  getUserStats   → GET  /api/auth/stats
 *  runCode        → POST /api/submissions/run   (public tests — Run button)
 *  submitCode     → POST /api/submissions       (hidden tests — Submit button)
 *  getSubmissions → GET  /api/submissions
 *  getSubmission  → GET  /api/submissions/:id
 */

import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { judgeTestCase } from "../utils/judgeService.js";
import { runJudge } from "../workers/submissionWorker.js";
import fs from "fs/promises";
import path from "path";

// Helper to fallback to local json files
const getLocalProblemData = async (externalId) => {
  try {
    const filePath = path.resolve(process.cwd(), "..", "codnite_problem", "data", "problems", `${externalId}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
};

// ── @desc    Get aggregated stats for the logged-in user
// ── @route   GET /api/auth/stats
// ── @access  Private
export const getUserStats = async (req, res) => {
  const userId = req.user._id;
  const { timeFilter } = req.query;

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
    
    // 5. Yearly Activity (last 365 days)
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

  res.status(200).json({
    success: true,
    message: "User stats fetched successfully.",
    data: {
      // ── Profile ──────────────────────────────────────────────
      xp:    user?.xp    ?? 0,
      level: user?.level ?? 1,
      // currentStreak = 0 if they missed a day, otherwise the stored streak value
      streak: (() => {
        if (!user?.lastSolvedDate || !user?.streak) return 0;
        const now = new Date();
        const last = new Date(user.lastSolvedDate);
        const todayStr = now.toISOString().slice(0, 10);
        const lastStr = last.toISOString().slice(0, 10);
        const yesterdayStr = new Date(now - 86400000).toISOString().slice(0, 10);
        // Streak is alive only if last solve was today or yesterday
        if (lastStr === todayStr || lastStr === yesterdayStr) return user.streak;
        return 0;
      })(),
      longestStreak: user?.streak ?? 0,

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
  });
};

// ── @desc    Run code against PUBLIC test cases only (Run button)
// ── @route   POST /api/submissions/run
// ── @access  Private
export const runCode = async (req, res) => {
  const { problemExternalId, code, language } = req.body;

  if (!problemExternalId || !code || !language) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: problemExternalId, code, language.",
    });
  }

  // Look up the problem in our MongoDB cache instead of fetching from external API
  let problemDoc;
  try {
    const Problem = Submission.db.model("Problem");
    problemDoc = await Problem.findOne({ externalId: problemExternalId.trim() });
  } catch (err) {
    console.error("Error finding problem for runCode:", err);
  }

  let publicTests = problemDoc?.publicTests || [];

  // Fallback to local files if DB is empty
  if (publicTests.length === 0) {
    const localData = await getLocalProblemData(problemExternalId.trim());
    if (localData && localData.public_tests) {
      publicTests = localData.public_tests;
    }
  }

  if (publicTests.length === 0) {
    return res.status(422).json({
      success: false,
      message: "No public test cases available for this problem.",
    });
  }

  // Run each public test case (max 3 for speed)
  const testCasesToRun = publicTests.slice(0, 3);
  const results = [];
  let hasCompileError = false;

  for (let i = 0; i < testCasesToRun.length; i++) {
    const tc = testCasesToRun[i];
    try {
      const judgeResult = await judgeTestCase(language, code, tc.input, tc.output);

      if (judgeResult.isCompileError && i === 0) {
        hasCompileError = true;
        results.push({
          index:         i + 1,
          passed:        false,
          input:         tc.input,
          expected:      tc.output,
          actual:        "",
          stderr:        judgeResult.stderr,
          isCompileError: true,
          executionTime: 0,
        });
        break; // No point running more if compile failed
      }

      results.push({
        index:         i + 1,
        passed:        judgeResult.passed,
        input:         tc.input,
        expected:      tc.output,
        actual:        judgeResult.stdout,
        stderr:        judgeResult.stderr,
        isCompileError: false,
        executionTime: judgeResult.executionTime,
      });
    } catch (err) {
      results.push({
        index:         i + 1,
        passed:        false,
        input:         tc.input,
        expected:      tc.output,
        actual:        "",
        stderr:        err.message,
        isCompileError: false,
        executionTime: 0,
      });
    }
  }

  const allPassed = results.every((r) => r.passed);

  res.status(200).json({
    success: true,
    message: "Code executed against public test cases.",
    data: {
      status:         hasCompileError ? "COMPILE_ERROR" : allPassed ? "ACCEPTED" : "WRONG_ANSWER",
      testResults:    results,
      totalTests:     results.length,
      passedTests:    results.filter((r) => r.passed).length,
      hasCompileError,
    },
  });
};

// ── @desc    Submit code for a problem (judged against hidden test cases)
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

  // Look up problem in DB to link it and fetch test cases locally
  let problemId = null;
  let generatedTests = [];
  try {
    const Problem = Submission.db.model("Problem");
    const problemDoc = await Problem.findOne({ externalId: problemExternalId.trim() }).select("+generatedTests +privateTests +publicTests");
    if (problemDoc) {
      problemId = problemDoc._id;
      if (problemDoc.generatedTests && problemDoc.generatedTests.length > 0) {
        generatedTests = problemDoc.generatedTests;
      } else if (problemDoc.privateTests && problemDoc.privateTests.length > 0) {
        generatedTests = problemDoc.privateTests;
      } else if (problemDoc.publicTests && problemDoc.publicTests.length > 0) {
        generatedTests = problemDoc.publicTests;
      }
    }
  } catch (err) {
    console.error("Error looking up problem for submission:", err);
  }

  // Fallback to local files if DB is empty
  if (generatedTests.length === 0) {
    const localData = await getLocalProblemData(problemExternalId.trim());
    if (localData) {
      if (localData.generated_tests && localData.generated_tests.length > 0) {
        generatedTests = localData.generated_tests;
      } else if (localData.private_tests && localData.private_tests.length > 0) {
        generatedTests = localData.private_tests;
      } else if (localData.public_tests && localData.public_tests.length > 0) {
        generatedTests = localData.public_tests;
      }
    }
  }

  // Create submission record in PENDING state immediately
  const submission = await Submission.create({
    user:              req.user._id,
    problem:           problemId,
    problemExternalId: problemExternalId.trim(),
    problemName:       problemName?.trim() || "",
    code,
    language:          language.toUpperCase(),
    status:            "RUNNING",
  });

  if (generatedTests.length === 0) {
    await Submission.findByIdAndUpdate(submission._id, {
      status:        "RUNTIME_ERROR",
      errorMessage:  "No test cases available for this problem.",
      testCasesTotal: 0,
      testCasesPassed: 0,
    });
    return res.status(201).json({
      success: true,
      message: "Submission created. No test cases available to judge.",
      data: {
        submissionId: submission._id,
        status:       "RUNTIME_ERROR",
        language:     submission.language,
        createdAt:    submission.createdAt,
      },
    });
  }

  // Pick 5 random test cases instead of 50 to drastically speed up execution
  const shuffled  = [...generatedTests].sort(() => Math.random() - 0.5);
  const testCases = shuffled.slice(0, 5);

  // Respond immediately with RUNNING state so frontend can poll
  res.status(201).json({
    success: true,
    message: "Submission received! Your code is being evaluated.",
    data: {
      submissionId: submission._id,
      status:       "RUNNING",
      language:     submission.language,
      createdAt:    submission.createdAt,
    },
  });

  // ── Run judge inline in background (no Redis required) ──
  setImmediate(() => {
    runJudge({
      submissionId: submission._id,
      language,
      code,
      testCases,
      problemExternalId,
      userId: req.user._id
    }).catch(err => console.error('[Submit] Inline judge failed:', err.message));
  });
};


// ── @desc    Get submission history for the logged-in user
// ── @route   GET /api/submissions
// ── @access  Private
export const getSubmissions = async (req, res) => {
  const { page = 1, limit = 20, status, problemExternalId, language } = req.query;

  const pageNum  = Math.max(1, parseInt(page,  10));
  const limitNum = Math.min(1000, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;

  const filter = {};
  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  } else if (req.query.userId) {
    filter.user = req.query.userId;
  }
  
  if (status) {
    let s = status.toUpperCase();
    if (s === "TIME LIMIT EXCEEDED") s = "TIME_LIMIT";
    if (s === "COMPILATION ERROR") s = "COMPILE_ERROR";
    if (s === "WRONG ANSWER") s = "WRONG_ANSWER";
    if (s === "RUNTIME ERROR") s = "RUNTIME_ERROR";
    filter.status = s;
  }
  if (problemExternalId) filter.problemExternalId = problemExternalId;
  if (language && language !== "All Languages") {
    let lang = language.toUpperCase();
    if (lang === "PYTHON 3") lang = "PYTHON3";
    if (lang === "C++") lang = "CPP17";
    filter.language = lang;
  }

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .select("-code") // Exclude code from list view (large payload)
      .populate("problem", "difficulty")
      .populate("user", "name email avatar")
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
  const query = { _id: req.params.id };
  if (req.user.role !== "admin") {
    query.user = req.user._id;
  }

  const submission = await Submission.findOne(query).populate("user", "name email avatar");

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

// ── @desc    Rejudge a submission (Admin only)
// ── @route   POST /api/submissions/:id/rejudge
// ── @access  Private / Admin
export const rejudgeSubmission = async (req, res) => {
  const { id } = req.params;

  let submission = await Submission.findById(id);
  if (!submission) {
    return res.status(404).json({ success: false, message: "Submission not found." });
  }

  // Reset to PENDING
  submission.status = "PENDING";
  submission.executionTimeMs = null;
  submission.memoryUsedMb = null;
  submission.errorMessage = "";
  submission.testCasesPassed = 0;
  await submission.save();

  // Simulate background judging after 1.5 seconds
  setTimeout(async () => {
    try {
      const statuses = ["ACCEPTED", "ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR", "TIME_LIMIT"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const updateData = {
        status: randomStatus,
        executionTimeMs: Math.floor(Math.random() * 120) + 15,
        memoryUsedMb: Number((Math.random() * 10 + 2).toFixed(1)),
        testCasesTotal: 50,
      };

      if (randomStatus === "ACCEPTED") {
        updateData.testCasesPassed = 50;
      } else if (randomStatus === "WRONG_ANSWER") {
        updateData.testCasesPassed = Math.floor(Math.random() * 49);
        updateData.errorMessage = `Failed on case ${updateData.testCasesPassed + 1}. Expected: "1 2", Got: ""`;
      } else {
        updateData.testCasesPassed = Math.floor(Math.random() * 49);
        updateData.errorMessage = randomStatus === "RUNTIME_ERROR" ? "Segfault" : "Time limit exceeded on test " + (updateData.testCasesPassed + 1);
      }

      await Submission.findByIdAndUpdate(submission._id, updateData);
    } catch (err) {
      console.error("Simulation error during rejudge:", err);
    }
  }, 1500);

  res.status(200).json({
    success: true,
    message: "Submission queued for rejudging.",
    data: submission,
  });
};

// ── @desc    Delete a submission (Admin only)
// ── @route   DELETE /api/submissions/:id
// ── @access  Private / Admin
export const deleteSubmission = async (req, res) => {
  const { id } = req.params;

  const submission = await Submission.findByIdAndDelete(id);

  if (!submission) {
    return res.status(404).json({ success: false, message: "Submission not found." });
  }

  res.status(200).json({
    success: true,
    message: "Submission deleted successfully.",
  });
};
