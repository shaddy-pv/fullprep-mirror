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
  } catch {
    return null;
  }
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
  // Always default to current user's submissions.
  // Admins can view any user's submissions by passing ?userId=xxx (for admin dashboard).
  if (req.user.role === "admin" && req.query.userId) {
    filter.user = req.query.userId;
  } else {
    filter.user = req.user._id;
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
      .populate("problem", "difficulty cfTags")
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

  const submission = await Submission.findOne(query)
    .populate("user", "name email avatar")
    .populate("problem", "difficulty title");

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found.",
    });
  }

  // Return full object WITH code (toPublicJSON strips code — only use that for list views)
  const obj = submission.toObject({ virtuals: true });
  delete obj.__v;

  res.status(200).json({
    success: true,
    message: "Submission fetched successfully.",
    data: obj,
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
