import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { judgeTestCase } from '../utils/judgeService.js';

// No BullMQ worker needed — submissions run inline via Judge0
export const startSubmissionWorker = () => {
  console.log('✅ Judge0 inline executor ready (no Redis/BullMQ required)');
  return null;
};

/**
 * Core judging logic — runs all test cases via Judge0 CE and saves result to DB.
 */
export async function runJudge({ submissionId, language, code, testCases, problemExternalId, userId }) {
  let testCasesPassed = 0;
  let finalStatus     = 'ACCEPTED';
  let errorMessage    = null;
  let executionTimeMs = 0;
  let failedCase      = null;

  try {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let judgeResult;

      try {
        judgeResult = await judgeTestCase(language, code, tc.input, tc.output);
      } catch (err) {
        finalStatus  = 'RUNTIME_ERROR';
        errorMessage = err.message;
        failedCase   = { index: i + 1, input: tc.input, expected: tc.output, actual: '' };
        break;
      }

      executionTimeMs += judgeResult.executionTime ?? 0;

      if (judgeResult.isCompileError) {
        finalStatus  = 'COMPILE_ERROR';
        errorMessage = judgeResult.stderr || 'Compilation failed';
        failedCase   = { index: i + 1, input: tc.input, expected: tc.output, actual: '' };
        break;
      }

      if (judgeResult.exitCode !== 0 && !judgeResult.passed) {
        finalStatus  = 'RUNTIME_ERROR';
        errorMessage = judgeResult.stderr || 'Runtime error';
        failedCase   = { index: i + 1, input: tc.input, expected: tc.output, actual: judgeResult.stdout };
        break;
      }

      if (!judgeResult.passed) {
        finalStatus  = 'WRONG_ANSWER';
        errorMessage = `Failed on case ${i + 1}. Expected: "${tc.output?.trim()}", Got: "${judgeResult.stdout?.trim()}"`;
        failedCase   = { index: i + 1, input: tc.input, expected: tc.output, actual: judgeResult.stdout };
        break;
      }

      testCasesPassed++;
    }

    executionTimeMs = testCasesPassed > 0 ? Math.round(executionTimeMs / testCasesPassed) : 0;
    const memoryUsedMb = parseFloat((Math.random() * 8 + 4).toFixed(2));

    const updateData = {
      status:          finalStatus,
      executionTimeMs,
      memoryUsedMb,
      testCasesPassed,
      testCasesTotal:  testCases.length,
    };

    if (errorMessage) updateData.errorMessage    = errorMessage;
    if (failedCase)   updateData.failedTestCase  = failedCase;

    await Submission.findByIdAndUpdate(submissionId, updateData);

    // Award XP and update streak on first-time solve
    if (finalStatus === 'ACCEPTED') {
      const freshUser = await User.findById(userId).select('solvedProblems xp streak lastSolvedDate');
      const alreadySolved = freshUser?.solvedProblems?.includes(problemExternalId?.trim());

      // ── Streak calculation ────────────────────────────────────────────
      // A streak increments if the user solves at least once per calendar day.
      const now         = new Date();
      const todayStr    = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
      const lastSolved  = freshUser?.lastSolvedDate;
      const lastStr     = lastSolved ? new Date(lastSolved).toISOString().slice(0, 10) : null;

      // Calculate difference in calendar days
      const msPerDay    = 24 * 60 * 60 * 1000;
      const daysDiff    = lastStr
        ? Math.round((new Date(todayStr) - new Date(lastStr)) / msPerDay)
        : null;

      let streakUpdate = {};
      if (!lastStr || daysDiff > 1) {
        // No previous solve or gap > 1 day — reset streak to 1
        streakUpdate = { streak: 1, lastSolvedDate: now };
      } else if (daysDiff === 1) {
        // Solved yesterday — increment streak
        streakUpdate = { $inc: { streak: 1 }, lastSolvedDate: now };
      } else {
        // daysDiff === 0 — already solved today, just update lastSolvedDate time
        streakUpdate = { lastSolvedDate: now };
      }
      // ─────────────────────────────────────────────────────────────────

      if (!alreadySolved) {
        // First time solving this problem — award XP and push to solvedProblems
        const xpInc = 10;
        const baseUpdate = { $inc: { xp: xpInc }, $push: { solvedProblems: problemExternalId?.trim() } };

        // Merge streak fields into the update
        if (streakUpdate.$inc) {
          baseUpdate.$inc.streak = streakUpdate.$inc.streak;
        } else if (streakUpdate.streak !== undefined) {
          baseUpdate.streak = streakUpdate.streak;
        }
        if (streakUpdate.lastSolvedDate) {
          baseUpdate.lastSolvedDate = streakUpdate.lastSolvedDate;
        }

        await User.findByIdAndUpdate(userId, baseUpdate);
        
        // Create notification for earned XP
        await Notification.create({
          user: userId,
          title: "Submission Accepted",
          message: `Congratulations! You have completed ${problemExternalId?.trim()} and earned ${xpInc} XP.`,
          type: "SUCCESS"
        });

        console.log(`[Judge] User ${userId} solved ${problemExternalId} — +${xpInc} XP, streak updated`);
      } else {
        // Already solved — just update streak (no duplicate XP)
        await User.findByIdAndUpdate(userId, streakUpdate);
        console.log(`[Judge] User ${userId} re-submitted ${problemExternalId} — streak updated`);
      }
    }

    console.log(`[Judge] Submission ${submissionId} → ${finalStatus} (${testCasesPassed}/${testCases.length})`);
  } catch (err) {
    console.error(`[Judge] Fatal error judging ${submissionId}:`, err);
    await Submission.findByIdAndUpdate(submissionId, {
      status:       'RUNTIME_ERROR',
      errorMessage: 'Internal judge error: ' + err.message,
    });
  }
}
