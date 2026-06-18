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
  createProblem,
  updateProblem,
  deleteProblem,
  toggleBookmark,
  getBookmarkedProblems,
} from "../controllers/problemController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

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

// ── Admin-only Routes (JWT + role=admin required) ─────────────────────────────

// Bulk sync all problems from Codnite into MongoDB
router.post("/sync", protect, restrictTo("admin"), syncProblems);

// Create a custom problem manually
router.post("/", protect, restrictTo("admin"), createProblem);

// ── Dynamic /:id Routes ───────────────────────────────────────────────────────

// Bookmarks list (Private, must be before /:id)
router.get("/bookmarks", protect, getBookmarkedProblems);

// Full problem detail (public, but auth user gets enriched response in future)
router.get("/:id", getProblem);

// Toggle bookmark on a problem (Private)
router.post("/:id/bookmark", protect, toggleBookmark);

// Public tests for a problem (optional auth — admins get private tests too)
router.get("/:id/tests", getProblemTests);

// Update a problem (Admin only)
router.patch("/:id", protect, restrictTo("admin"), updateProblem);

// Soft-delete a problem (Admin only)
router.delete("/:id", protect, restrictTo("admin"), deleteProblem);

export default router;
