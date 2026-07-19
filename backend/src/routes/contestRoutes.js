import { Router } from "express";
import { getDailyContest, getWeeklyContest, submitContestResult, createContest, getAdminContests, getContestById, updateContest, deleteContest, getActiveContests } from "../controllers/contestController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/contests:
 *   get:
 *     summary: List active contests
 *     description: Returns a list of active or upcoming contests.
 *     tags: [Contests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contests fetched successfully
 */
router.get("/", getActiveContests);
/**
 * @openapi
 * /api/contests/daily:
 *   get:
 *     summary: Get daily contest
 *     description: Fetches the current daily challenge.
 *     tags: [Contests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily contest fetched
 */
router.get("/daily", getDailyContest);
/**
 * @openapi
 * /api/contests/weekly:
 *   get:
 *     summary: Get weekly contest
 *     description: Fetches the current weekly challenge.
 *     tags: [Contests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly contest fetched
 */
router.get("/weekly", getWeeklyContest);
/**
 * @openapi
 * /api/contests/submit:
 *   post:
 *     summary: Submit contest results
 *     description: Submit the user's score/results for a contest.
 *     tags: [Contests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contestId, timeTaken]
 *             properties:
 *               contestId:
 *                 type: string
 *               timeTaken:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Results submitted
 */
router.post("/submit", submitContestResult);

// ── Admin and Mentor Routes ─────────────────────────────────────────────────────────
/**
 * @openapi
 * /api/contests:
 *   post:
 *     summary: Create contest
 *     description: Create a new contest (Admin only).
 *     tags: [Contests Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Daily, Weekly, Custom]
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Contest created
 */
router.post("/", restrictTo("admin", "mentor"), createContest);
/**
 * @openapi
 * /api/contests/admin:
 *   get:
 *     summary: List all contests
 *     description: Fetch all contests including inactive ones (Admin only).
 *     tags: [Contests Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contests fetched
 */
router.get("/admin", restrictTo("admin", "mentor"), getAdminContests);
/**
 * @openapi
 * /api/contests/{id}:
 *   get:
 *     summary: Get contest details
 *     description: Fetches full details of a specific contest.
 *     tags: [Contests]
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
 *         description: Contest details fetched
 */
router.get("/:id", getContestById);
/**
 * @openapi
 * /api/contests/{id}:
 *   patch:
 *     summary: Update contest
 *     description: Modifies an existing contest (Admin only).
 *     tags: [Contests Admin]
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
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contest updated
 */
router.patch("/:id", restrictTo("admin", "mentor"), updateContest);
/**
 * @openapi
 * /api/contests/{id}:
 *   delete:
 *     summary: Delete contest
 *     description: Removes a contest (Admin only).
 *     tags: [Contests Admin]
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
 *         description: Contest deleted
 */
router.delete("/:id", restrictTo("admin", "mentor"), deleteContest);

export default router;
