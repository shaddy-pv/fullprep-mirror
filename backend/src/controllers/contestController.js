import mongoose from "mongoose";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import Contest from "../models/Contest.js";

// Helper to deterministically pick problems based on date
const getDeterministicRandoms = (seed, max, count) => {
  const result = [];
  let currentSeed = seed;
  for (let i = 0; i < count; i++) {
    // Simple LCG PRNG
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    result.push(currentSeed % max);
  }
  return result;
};

// Helper to get today's daily problem
const getCurrentDailyProblem = async () => {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const totalProblems = await Problem.countDocuments();
  if (totalProblems === 0) return null;
  const [index] = getDeterministicRandoms(dateSeed, totalProblems, 1);
  return await Problem.findOne().skip(index).lean();
};

// Helper to get this week's problems
const getCurrentWeeklyProblems = async () => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  const weekSeed = today.getFullYear() * 100 + weekNumber;
  
  const totalProblems = await Problem.countDocuments();
  if (totalProblems < 4) return [];
  const indices = getDeterministicRandoms(weekSeed, totalProblems, 4);
  const problems = await Promise.all(
    indices.map(idx => Problem.findOne().skip(idx).lean())
  );
  return problems.filter(Boolean);
};

// ── @desc    Get daily contest problem
// ── @route   GET /api/contests/daily
// ── @access  Private
export const getDailyContest = async (req, res) => {
  try {
    const problem = await getCurrentDailyProblem();
    if (!problem) {
      return res.status(404).json({ success: false, message: "No problems available in DB." });
    }
    
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    res.status(200).json({
      success: true,
      data: {
        id: `daily-${dateSeed}`,
        title: "Daily Challenge: " + problem.name,
        type: "daily",
        problem: {
          ...problem,
          slug: problem.externalId, // use externalId as slug for routing
        },
      }
    });
  } catch (error) {
    console.error("Daily contest error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Get weekly contest problems
// ── @route   GET /api/contests/weekly
// ── @access  Private
export const getWeeklyContest = async (req, res) => {
  try {
    const problems = await getCurrentWeeklyProblems();
    if (problems.length < 4) {
      return res.status(404).json({ success: false, message: "Not enough problems in DB." });
    }
    
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const weekSeed = today.getFullYear() * 100 + weekNumber;
    
    res.status(200).json({
      success: true,
      data: {
        id: `weekly-${weekSeed}`,
        title: "Weekly Contest " + weekNumber,
        type: "weekly",
        problems: problems.map(p => ({ ...p, slug: p.externalId })),
      }
    });
  } catch (error) {
    console.error("Weekly contest error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Submit contest result
// ── @route   POST /api/contests/submit
// ── @access  Private
export const submitContestResult = async (req, res) => {
  try {
    const { contestId, type, timeTakenMs, passed } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Determine expected problems and start time
    let expectedExternalIds = [];
    let contestStartTime = new Date();

    if (type === "daily") {
      const p = await getCurrentDailyProblem();
      if (p) expectedExternalIds.push(p.externalId);
      contestStartTime.setHours(0, 0, 0, 0); // start of today
    } else if (type === "weekly") {
      const ps = await getCurrentWeeklyProblems();
      expectedExternalIds = ps.map(p => p.externalId);
      // Start of Saturday this week
      const dayOfWeek = contestStartTime.getDay();
      const daysToSaturday = (dayOfWeek === 6) ? 0 : (dayOfWeek === 0) ? -1 : (6 - dayOfWeek);
      contestStartTime.setDate(contestStartTime.getDate() + daysToSaturday);
      contestStartTime.setHours(0, 0, 0, 0);
    }
    
    // Find unique problems solved successfully during this timeframe
    const submissions = await Submission.find({
      user: req.user.id,
      status: "ACCEPTED",
      problemExternalId: { $in: expectedExternalIds },
      createdAt: { $gte: contestStartTime }
    });
    
    const uniqueSolved = new Set(submissions.map(s => s.problemExternalId));
    const realSolvedCount = uniqueSolved.size;
    
    // Rating logic: User requested exactly 20 points per question actually solved
    let points = realSolvedCount * 20;
    
    user.contestRating = (user.contestRating || 0) + points;
    user.contestsParticipated = (user.contestsParticipated || 0) + 1;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        newRating: user.contestRating,
        pointsEarned: points,
      }
    });
  } catch (error) {
    console.error("Submit contest error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Create a custom contest
// ── @route   POST /api/contests
// ── @access  Private (Admin)
export const createContest = async (req, res) => {
  try {
    const contest = new Contest({
      ...req.body,
      createdBy: req.user.id,
    });
    await contest.save();
    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    console.error("Create contest error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ── @desc    Get all active custom contests for frontend
// ── @route   GET /api/contests
// ── @access  Private
export const getActiveCustomContests = async (req, res) => {
  try {
    const now = new Date();
    // Return contests that are active, and have not yet ended (endTime >= now)
    const contests = await Contest.find({
      type: "custom",
      isActive: true,
      endTime: { $gte: now },
    }).populate("problems", "name externalId difficulty cfRating cfTags");
    
    // Transform problems to include 'slug' like daily/weekly do
    const formattedContests = contests.map((c) => {
      const obj = c.toObject();
      if (obj.problems) {
        obj.problems = obj.problems.map(p => ({ ...p, slug: p.externalId }));
      }
      return obj;
    });

    res.status(200).json({ success: true, data: formattedContests });
  } catch (error) {
    console.error("Get active custom contests error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Get all contests for admin
// ── @route   GET /api/contests/admin
// ── @access  Private (Admin)
export const getAdminContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate("problems", "name externalId difficulty").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contests });
  } catch (error) {
    console.error("Get admin contests error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Get a contest by ID
// ── @route   GET /api/contests/:id
// ── @access  Private
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems", "name externalId difficulty cfRating cfTags");
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    console.error("Get contest by ID error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ── @desc    Update a contest
// ── @route   PATCH /api/contests/:id
// ── @access  Private (Admin)
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    console.error("Update contest error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ── @desc    Delete a contest
// ── @route   DELETE /api/contests/:id
// ── @access  Private (Admin)
export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("Delete contest error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
