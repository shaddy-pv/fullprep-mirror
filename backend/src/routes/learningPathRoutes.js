import { Router } from "express";
import {
  getLearningPaths,
  getLearningPathById,
  enrollInLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath
} from "../controllers/learningPathController.js";
import { protect, optionalProtect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// We use optionalProtect for GET routes because they are public but we want to calculate progress if logged in
/**
 * @openapi
 * /api/learning-paths:
 *   get:
 *     summary: List learning paths
 *     description: Returns a list of learning paths (supports optional auth for progress).
 *     tags: [LearningPaths]
 *     responses:
 *       200:
 *         description: Learning paths fetched
 */
router.get("/", optionalProtect, getLearningPaths);
/**
 * @openapi
 * /api/learning-paths/{id}:
 *   get:
 *     summary: Get learning path details
 *     description: Fetches full details of a specific learning path.
 *     tags: [LearningPaths]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Learning path details fetched
 */
router.get("/:id", optionalProtect, getLearningPathById);

// Requires auth
/**
 * @openapi
 * /api/learning-paths/{id}/enroll:
 *   post:
 *     summary: Enroll in learning path
 *     description: Enrolls the current user in a learning path.
 *     tags: [LearningPaths]
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
 *         description: Enrolled successfully
 */
router.post("/:id/enroll", protect, enrollInLearningPath);

// Admin and Mentor only
/**
 * @openapi
 * /api/learning-paths:
 *   post:
 *     summary: Create learning path
 *     description: Create a new learning path (Admin only).
 *     tags: [LearningPaths Admin]
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
 *               description:
 *                 type: string
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Learning path created
 */
router.post("/", protect, restrictTo("admin", "mentor"), createLearningPath);
/**
 * @openapi
 * /api/learning-paths/{id}:
 *   put:
 *     summary: Update learning path
 *     description: Update an existing learning path (Admin only).
 *     tags: [LearningPaths Admin]
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
 *               description:
 *                 type: string
 *               modules:
 *                 type: array
 *     responses:
 *       200:
 *         description: Learning path updated
 */
router.put("/:id", protect, restrictTo("admin", "mentor"), updateLearningPath);
/**
 * @openapi
 * /api/learning-paths/{id}:
 *   delete:
 *     summary: Delete learning path
 *     description: Permanently delete a learning path (Admin only).
 *     tags: [LearningPaths Admin]
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
 *         description: Learning path deleted
 */
router.delete("/:id", protect, restrictTo("admin", "mentor"), deleteLearningPath);

export default router;
