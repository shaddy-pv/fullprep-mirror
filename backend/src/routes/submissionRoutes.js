/**
 * @file submissionRoutes.js
 * @description Express router for code submission endpoints.
 *
 *  All routes require JWT authentication (protect middleware).
 *
 *  POST  /api/submissions       → Submit code for a problem
 *  GET   /api/submissions       → Get own submission history (paginated)
 *  GET   /api/submissions/:id   → Get a single submission with full code
 */

import { Router } from "express";
import {
  submitCode,
  getSubmissions,
  getSubmission,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All submission routes require authentication
router.use(protect);

router.post("/",    submitCode);
router.get("/",     getSubmissions);
router.get("/:id",  getSubmission);

export default router;
