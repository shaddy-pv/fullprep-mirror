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

/**
 * @openapi
 * /api/problems/tags:
 *   get:
 *     summary: Get all tags
 *     description: Fetches a list of all unique problem tags and their usage counts.
 *     tags: [Problems]
 *     responses:
 *       200:
 *         description: Tags fetched successfully
 */
router.get("/tags",   getTags);
/**
 * @openapi
 * /api/problems/stats:
 *   get:
 *     summary: Get problem stats
 *     description: Fetches total problem counts by difficulty, source, and top tags.
 *     tags: [Problems]
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 */
router.get("/stats",  getStats);
/**
 * @openapi
 * /api/problems/search:
 *   get:
 *     summary: Search problems
 *     description: Full-text search for problems by name or description.
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search completed
 *       400:
 *         description: Missing search query
 */
router.get("/search", searchProblems);
/**
 * @openapi
 * /api/problems/random:
 *   get:
 *     summary: Get random problem
 *     description: Fetches a random problem matching optional filters.
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Random problem fetched
 */
router.get("/random", getRandomProblem);

// Main listing
/**
 * @openapi
 * /api/problems:
 *   get:
 *     summary: List problems
 *     description: Fetches a paginated and filtered list of problems.
 *     tags: [Problems]
 *     parameters:
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
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: serialNo
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: asc
 *     responses:
 *       200:
 *         description: Problems fetched successfully
 */
router.get("/", listProblems);

// ── Admin and Mentor Routes (JWT + role=admin/mentor required) ─────────────────────────────
router.get("/", listProblems);

// ── Admin and Mentor Routes (JWT + role=admin/mentor required) ─────────────────────────────

// NOTE: Order matters
/**
 * @openapi
 * /api/problems/sync:
 *   post:
 *     summary: Sync problems from Codnite
 *     description: Bulk imports or syncs problems from the upstream Codnite API.
 *     tags: [Problems Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [ALL, MISSING, STALE]
 *                 default: ALL
 *     responses:
 *       202:
 *         description: Sync job started
 */
router.post("/sync", protect, restrictTo("admin", "mentor"), syncProblems);
/**
 * @openapi
 * /api/problems/sync/status:
 *   get:
 *     summary: Get sync status
 *     description: Returns the status of the latest sync job.
 *     tags: [Problems Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status fetched
 */
router.get("/sync/status", protect, restrictTo("admin", "mentor"), getSyncStatus);
/**
 * @openapi
 * /api/problems/sync/history:
 *   get:
 *     summary: Get sync history
 *     description: Fetches a history of recent sync jobs.
 *     tags: [Problems Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History fetched
 */
router.get("/sync/history", protect, restrictTo("admin", "mentor"), getSyncHistory);

// Create a custom problem manually
/**
 * @openapi
 * /api/problems:
 *   post:
 *     summary: Create custom problem
 *     description: Manually create a new problem.
 *     tags: [Problems Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               cfTags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Problem created
 */
router.post("/", protect, restrictTo("admin", "mentor"), createProblem);

// ── Dynamic /:id Routes ───────────────────────────────────────────────────────

// Bookmarks list (Private, must be before /:id)
/**
 * @openapi
 * /api/problems/bookmarks:
 *   get:
 *     summary: Get bookmarked problems
 *     description: Returns a list of problems the user has bookmarked.
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmarks fetched
 */
router.get("/bookmarks", protect, getBookmarkedProblems);

// Full problem detail (public, but auth user gets enriched response in future)
/**
 * @openapi
 * /api/problems/{id}:
 *   get:
 *     summary: Get problem by ID
 *     description: Fetches full details for a specific problem.
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Problem details
 */
router.get("/:id", optionalProtect, getProblem);

// Toggle bookmark on a problem (Private)
/**
 * @openapi
 * /api/problems/{id}/bookmark:
 *   post:
 *     summary: Toggle bookmark
 *     description: Adds or removes a problem from the user's bookmarks.
 *     tags: [Problems]
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
 *         description: Bookmark toggled
 */
router.post("/:id/bookmark", protect, toggleBookmark);

// Vote on a problem (Private)
/**
 * @openapi
 * /api/problems/{id}/vote:
 *   post:
 *     summary: Vote on problem
 *     description: Upvote or downvote a problem.
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote:
 *                 type: integer
 *                 enum: [1, -1, 0]
 *     responses:
 *       200:
 *         description: Vote recorded
 */
router.post("/:id/vote", protect, voteProblem);

// Public tests for a problem (optional auth — admins get private tests too)
/**
 * @openapi
 * /api/problems/{id}/tests:
 *   get:
 *     summary: Get problem tests
 *     description: Fetches public (or all, if admin) test cases for a problem.
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: test_type
 *         schema:
 *           type: string
 *           enum: [public, private, all]
 *     responses:
 *       200:
 *         description: Tests fetched
 */
router.get("/:id/tests", optionalProtect, getProblemTests);

// Update a problem (Admin or Mentor only)
/**
 * @openapi
 * /api/problems/{id}:
 *   patch:
 *     summary: Update problem
 *     description: Modify an existing problem (Admin only).
 *     tags: [Problems Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               difficulty:
 *                 type: string
 *     responses:
 *       200:
 *         description: Problem updated
 */
router.patch("/:id", protect, restrictTo("admin", "mentor"), updateProblem);

// Soft-delete a problem (Admin or Mentor only)
/**
 * @openapi
 * /api/problems/{id}:
 *   delete:
 *     summary: Delete problem
 *     description: Soft-deletes a problem by marking it inactive (Admin only).
 *     tags: [Problems Admin]
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
 *         description: Problem deleted
 */
router.delete("/:id", protect, restrictTo("admin", "mentor"), deleteProblem);

// Rejudge a problem (Admin or Mentor only)
/**
 * @openapi
 * /api/problems/{id}/rejudge:
 *   post:
 *     summary: Rejudge problem
 *     description: Triggers a rejudge of all submissions for this problem (Admin only).
 *     tags: [Problems Admin]
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
 *         description: Rejudge initiated
 */
router.post("/:id/rejudge", protect, restrictTo("admin", "mentor"), rejudgeProblem);

export default router;
