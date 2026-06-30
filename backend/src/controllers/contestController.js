
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
  const now = new Date();
  
  // 1. Check for explicit active daily contest
  const activeContest = await Contest.findOne({
    type: "daily",
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now }
  }).populate("problems");
  
  if (activeContest && activeContest.problems.length > 0) {
    return activeContest.problems[0];
  }

  // 2. Fallback to PRNG over DAILY tagged problems
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  let totalProblems = await Problem.countDocuments({ contestType: "DAILY" });
  let queryFilter = { contestType: "DAILY" };
  
  if (totalProblems === 0) {
    // If no problems tagged, fallback to any active problem
    totalProblems = await Problem.countDocuments({ isActive: true });
    queryFilter = { isActive: true };
  }
  
  if (totalProblems === 0) return null;
  const [index] = getDeterministicRandoms(dateSeed, totalProblems, 1);
  return await Problem.findOne(queryFilter).skip(index).lean();
};

// Helper to get this week's problems
const getCurrentWeeklyProblems = async () => {
  const now = new Date();
  
  // 1. Check for explicit active weekly contest
  const activeContest = await Contest.findOne({
    type: "weekly",
    isActive: true,
    endTime: { $gte: now }
  }).sort({ startTime: 1 }).populate("problems");
  
  if (activeContest && activeContest.problems.length > 0) {
    return activeContest.problems;
  }

  // 2. Fallback to PRNG over WEEKLY tagged problems
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  const weekSeed = now.getFullYear() * 100 + weekNumber;
  
  let totalProblems = await Problem.countDocuments({ contestType: "WEEKLY" });
  let queryFilter = { contestType: "WEEKLY" };
  
  if (totalProblems < 4) {
    totalProblems = await Problem.countDocuments({ isActive: true });
    queryFilter = { isActive: true };
  }
  
  if (totalProblems < 4) return [];
  const indices = getDeterministicRandoms(weekSeed, totalProblems, 4);
  const problems = await Promise.all(
    indices.map(idx => Problem.findOne(queryFilter).skip(idx).lean())
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
    
    // Check if it's from an explicit contest or fallback
    const now = new Date();
    const activeContest = await Contest.findOne({
      type: "daily",
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    
    const contestId = activeContest ? activeContest._id.toString() : `daily-${dateSeed}`;
    const user = await User.findById(req.user.id);
    const isCompleted = user?.claimedContests?.includes(contestId) || false;
    
    res.status(200).json({
      success: true,
      data: {
        id: contestId,
        title: activeContest ? activeContest.title : "Daily Challenge: " + problem.name,
        type: "daily",
        isCompleted,
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
    
    const now = new Date();
    const activeContest = await Contest.findOne({
      type: "weekly",
      isActive: true,
      endTime: { $gte: now }
    }).sort({ startTime: 1 });

    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const weekSeed = now.getFullYear() * 100 + weekNumber;
    
    const contestId = activeContest ? activeContest._id.toString() : `weekly-${weekSeed}`;
    const user = await User.findById(req.user.id);
    const isCompleted = user?.claimedContests?.includes(contestId) || false;
    
    // Determine start/end times
    let startTime, endTime;
    if (activeContest) {
      startTime = activeContest.startTime;
      endTime = activeContest.endTime;
    } else {
      startTime = new Date();
      const dayOfWeek = startTime.getDay();
      const daysToSaturday = (dayOfWeek === 6) ? 0 : (dayOfWeek === 0) ? -1 : (6 - dayOfWeek);
      startTime.setDate(startTime.getDate() + daysToSaturday);
      startTime.setHours(0, 0, 0, 0);
      
      endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + 1); // Sunday
      endTime.setHours(23, 59, 59, 999);
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: contestId,
        title: activeContest ? activeContest.title : "Weekly Contest " + weekNumber,
        type: "weekly",
        startTime,
        endTime,
        isCompleted,
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
    const { contestId, type } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (contestId && user.claimedContests?.includes(contestId)) {
      return res.status(400).json({ success: false, message: "Already claimed points for this contest" });
    }

    let expectedExternalIds = [];
    let contestStartTime = new Date();

    if (type === "daily") {
      const p = await getCurrentDailyProblem();
      if (p) expectedExternalIds.push(p.externalId);
      contestStartTime.setHours(0, 0, 0, 0); // start of today
    } else if (type === "weekly") {
      const ps = await getCurrentWeeklyProblems();
      expectedExternalIds = ps.map(p => p.externalId);
      // Start of Saturday this week (or appropriate start time based on explicit contest)
      const now = new Date();
      const activeContest = await Contest.findOne({
        type: "weekly", isActive: true, startTime: { $lte: now }, endTime: { $gte: now }
      });
      if (activeContest) {
        contestStartTime = activeContest.startTime;
      } else {
        const dayOfWeek = contestStartTime.getDay();
        const daysToSaturday = (dayOfWeek === 6) ? 0 : (dayOfWeek === 0) ? -1 : (6 - dayOfWeek);
        contestStartTime.setDate(contestStartTime.getDate() + daysToSaturday);
        contestStartTime.setHours(0, 0, 0, 0);
      }
    }
    
    const submissions = await Submission.find({
      user: req.user.id,
      status: "ACCEPTED",
      problemExternalId: { $in: expectedExternalIds },
      createdAt: { $gte: contestStartTime }
    });
    
    const uniqueSolved = new Set(submissions.map(s => s.problemExternalId));
    const realSolvedCount = uniqueSolved.size;
    let points = realSolvedCount * 20;
    
    user.contestRating = (user.contestRating || 0) + points;
    if (user.contestRating > (user.highestRating || 0)) {
      user.highestRating = user.contestRating;
    }
    user.contestsParticipated = (user.contestsParticipated || 0) + 1;
    if (contestId) {
      user.claimedContests.push(contestId);
    }
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

// ── @desc    Create a contest (Admin)
// ── @route   POST /api/contests
// ── @access  Private (Admin)
export const createContest = async (req, res) => {
  try {
    const contest = new Contest({
      ...req.body,
      createdBy: req.user.id,
    });
    await contest.save();

    // Tag selected problems for future pseudo-random selection if needed
    if (contest.problems && contest.problems.length > 0) {
      if (contest.type === "daily") {
        await Problem.updateMany(
          { _id: { $in: contest.problems } },
          { $set: { contestType: "DAILY" } }
        );
      } else if (contest.type === "weekly") {
        await Problem.updateMany(
          { _id: { $in: contest.problems } },
          { $set: { contestType: "WEEKLY" } }
        );
      }
    }

    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    console.error("Create contest error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ── @desc    Get all active contests for frontend calendar (Daily & Weekly)
// ── @route   GET /api/contests          → upcoming + live (endTime >= now)
// ── @route   GET /api/contests?all=true → all active regardless of end time
// ── @access  Private
export const getActiveContests = async (req, res) => {
  try {
    const now = new Date();
    const showAll = req.query.all === "true";

    const query = { isActive: true };
    // When not showing all, only show contests that haven't ended
    if (!showAll) {
      query.endTime = { $gte: now };
    }

    const contests = await Contest.find(query)
      .populate("problems", "name externalId difficulty cfRating cfTags")
      .sort({ startTime: 1 }); // chronological order

    const formattedContests = contests.map((c) => {
      const obj = c.toObject();
      if (obj.problems) {
        obj.problems = obj.problems.map(p => ({ ...p, slug: p.externalId }));
      }
      return obj;
    });

    res.status(200).json({ success: true, data: formattedContests });
  } catch (error) {
    console.error("Get active contests error:", error);
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
    
    // Re-tag problems just in case
    if (contest.problems && contest.problems.length > 0) {
      if (contest.type === "daily") {
        await Problem.updateMany(
          { _id: { $in: contest.problems } },
          { $set: { contestType: "DAILY" } }
        );
      } else if (contest.type === "weekly") {
        await Problem.updateMany(
          { _id: { $in: contest.problems } },
          { $set: { contestType: "WEEKLY" } }
        );
      }
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
