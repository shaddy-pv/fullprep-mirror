/**
 * @file problemRoutes.js
 * @description Express router for all problem-related endpoints.
 *
 *  Public (no auth required):
 *    GET    /api/problems              → List problems (paginated + filtered)
 *    GET    /api/problems/tags         → All tags with counts
 *    GET    /api/problems/stats        → DB statistics
 *    GET    /api/problems/search       → Search by query string
 *    GET    /api/problems/random       → Random problem (optional filters)
 *    GET    /api/problems/:id          → Full problem detail (cached)
 *    GET    /api/problems/:id/tests    → Public test cases only
 *
 *  Protected (JWT required):
 *    (Auth users get same data as public — kept for future personalization)
 *
 *  Admin only (JWT + role=admin):
 *    POST   /api/problems/sync         → Bulk import from Codnite API
 *    POST   /api/problems              → Create custom problem
 *    PATCH  /api/problems/:id          → Update problem fields
 *    DELETE /api/problems/:id          → Soft-delete (isActive: false)
 */

import { Router } from "express";
import {
  listProblems,
  getProblem,
  getProblemTests,
  searchProblems,
  getRandomProblem,
  getTags,
  getStats,
  syncProblems,
  getSyncStatus,
  getSyncHistory,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleBookmark,
  getBookmarkedProblems,
  rejudgeProblem,
  voteProblem,
} from "../controllers/problemController.js";
import { protect, restrictTo, optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// NOTE: Specific named paths MUST come before the /:id param route
// to avoid Express matching "tags", "stats", "search", "random" as IDs.

router.get("/tags",   getTags);
router.get("/stats",  getStats);
router.get("/search", searchProblems);
router.get("/random", getRandomProblem);

// Main listing
router.get("/", listProblems);

// ── Admin and Mentor Routes (JWT + role=admin/mentor required) ─────────────────────────────

// NOTE: Order matters
router.post("/sync", protect, restrictTo("admin", "mentor"), syncProblems);
router.get("/sync/status", protect, restrictTo("admin", "mentor"), getSyncStatus);
router.get("/sync/history", protect, restrictTo("admin", "mentor"), getSyncHistory);

// Create a custom problem manually
router.post("/", protect, restrictTo("admin", "mentor"), createProblem);

// ── Dynamic /:id Routes ───────────────────────────────────────────────────────

// Bookmarks list (Private, must be before /:id)
router.get("/bookmarks", protect, getBookmarkedProblems);

// Full problem detail (public, but auth user gets enriched response in future)
router.get("/:id", optionalProtect, getProblem);

// Toggle bookmark on a problem (Private)
router.post("/:id/bookmark", protect, toggleBookmark);

// Vote on a problem (Private)
router.post("/:id/vote", protect, voteProblem);

// Public tests for a problem (optional auth — admins get private tests too)
router.get("/:id/tests", optionalProtect, getProblemTests);

// Update a problem (Admin or Mentor only)
router.patch("/:id", protect, restrictTo("admin", "mentor"), updateProblem);

// Soft-delete a problem (Admin or Mentor only)
router.delete("/:id", protect, restrictTo("admin", "mentor"), deleteProblem);

// Rejudge a problem (Admin or Mentor only)
router.post("/:id/rejudge", protect, restrictTo("admin", "mentor"), rejudgeProblem);

export default router;
