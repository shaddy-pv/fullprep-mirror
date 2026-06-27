import mongoose from "mongoose";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";

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

// ── @desc    Get daily contest problem
// ── @route   GET /api/contests/daily
// ── @access  Private
export const getDailyContest = async (req, res) => {
  try {
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // We only need 1 problem for daily
    const totalProblems = await Problem.countDocuments();
    if (totalProblems === 0) {
      return res.status(404).json({ success: false, message: "No problems available in DB." });
    }
    
    const [index] = getDeterministicRandoms(dateSeed, totalProblems, 1);
    
    const problem = await Problem.findOne().skip(index).lean();
    
    res.status(200).json({
      success: true,
      data: {
        id: `daily-${dateSeed}`,
        title: "Daily Challenge: " + problem.name,
        type: "daily",
        problem: problem,
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
    // A week starts on Monday for our logic
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const weekSeed = today.getFullYear() * 100 + weekNumber;
    
    const totalProblems = await Problem.countDocuments();
    if (totalProblems < 4) {
      return res.status(404).json({ success: false, message: "Not enough problems in DB." });
    }
    
    const indices = getDeterministicRandoms(weekSeed, totalProblems, 4);
    
    const problems = await Promise.all(
      indices.map(idx => Problem.findOne().skip(idx).lean())
    );
    
    res.status(200).json({
      success: true,
      data: {
        id: `weekly-${weekSeed}`,
        title: "Weekly Contest " + weekNumber,
        type: "weekly",
        problems: problems,
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
    
    if (!passed) {
      return res.status(200).json({ success: true, message: "No rating change." });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check for previous accepted submission for this contest ID to prevent multiple bumps
    // Usually contestId is saved in the submission. If not, we just give them the bump.
    // For now we assume the frontend is honest or we check if they already solved it today.
    
    // Rating logic
    let points = type === "daily" ? 15 : 40; // 15 for daily, 40 per weekly problem
    
    // Speed bonus
    if (timeTakenMs < 5 * 60 * 1000) {
      points += 10; // Extra 10 for solving under 5 mins
    }
    
    user.contestRating = (user.contestRating || 1200) + points;
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
