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

router.post("/run",  runCode);      // Run button — public tests only (synchronous)
router.post("/",     submitCode);   // Submit button — hidden tests (async + poll)
router.get("/",      getSubmissions);
router.get("/:id",   getSubmission);
router.post("/:id/rejudge", restrictTo('admin'), rejudgeSubmission);
router.patch("/:id/flag", restrictTo('admin'), flagSubmission);
router.delete("/:id", restrictTo('admin'), deleteSubmission);

export default router;
