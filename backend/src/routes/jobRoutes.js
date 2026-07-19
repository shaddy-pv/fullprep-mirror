import express from "express";
import { getJobs, createJob } from "../controllers/jobController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: List jobs
 *     description: Fetches a list of available jobs.
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
 */
/**
 * @openapi
 * /api/jobs:
 *   post:
 *     summary: Create job
 *     description: Creates a new job posting (Admin only).
 *     tags: [Jobs Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company, description]
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created
 */
router.route("/").get(getJobs).post(protect, restrictTo("admin", "mentor"), createJob);

export default router;
