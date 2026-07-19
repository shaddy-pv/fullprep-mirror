/**
 * @file submissionRoutes.js
 * @description Express router for code submission endpoints.
 *
 *  All routes require JWT authentication (protect middleware).
 *
 *  POST  /api/submissions/run   → Run code against public tests (Run button)
 *  POST  /api/submissions       → Submit code against hidden tests (Submit button)
 *  GET   /api/submissions       → Get own submission history (paginated)
 *  GET   /api/submissions/:id   → Get a single submission with full code
 */

import { Router } from "express";
import {
  runCode,
  submitCode,
  getSubmissions,
  getSubmission,
  rejudgeSubmission,
  deleteSubmission,
  flagSubmission,
} from "../controllers/submissionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// All submission routes require authentication
router.use(protect);

/**
 * @openapi
 * /api/submissions/run:
 *   post:
 *     summary: Run code (Public tests)
 *     description: Executes the provided code against public test cases only.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, languageId, problemId]
 *             properties:
 *               code:
 *                 type: string
 *               languageId:
 *                 type: integer
 *               problemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code executed successfully
 */
router.post("/run",  runCode);      // Run button — public tests only (synchronous)
/**
 * @openapi
 * /api/submissions:
 *   post:
 *     summary: Submit code (All tests)
 *     description: Submits code for full evaluation against all test cases.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, languageId, problemId]
 *             properties:
 *               code:
 *                 type: string
 *               languageId:
 *                 type: integer
 *               problemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code submitted successfully
 */
router.post("/",     submitCode);   // Submit button — hidden tests (async + poll)
/**
 * @openapi
 * /api/submissions:
 *   get:
 *     summary: List submissions
 *     description: Fetches the authenticated user's submission history.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: problemId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Submissions fetched
 */
router.get("/",      getSubmissions);
/**
 * @openapi
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission
 *     description: Fetches details and code of a specific submission.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission details
 */
router.get("/:id",   getSubmission);
/**
 * @openapi
 * /api/submissions/{id}/rejudge:
 *   post:
 *     summary: Rejudge submission
 *     description: Re-evaluates a single submission (Admin only).
 *     tags: [Submissions Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission rejudged
 */
router.post("/:id/rejudge", restrictTo('admin', 'mentor'), rejudgeSubmission);
/**
 * @openapi
 * /api/submissions/{id}/flag:
 *   patch:
 *     summary: Flag submission
 *     description: Flags a submission for review (Admin only).
 *     tags: [Submissions Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission flagged
 */
router.patch("/:id/flag", restrictTo('admin', 'mentor'), flagSubmission);
/**
 * @openapi
 * /api/submissions/{id}:
 *   delete:
 *     summary: Delete submission
 *     description: Deletes a submission (Admin only).
 *     tags: [Submissions Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission deleted
 */
router.delete("/:id", restrictTo('admin', 'mentor'), deleteSubmission);

export default router;
