import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/settings:
 *   get:
 *     summary: Get settings
 *     description: Fetches system settings (Admin only).
 *     tags: [Settings Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings fetched
 */
/**
 * @openapi
 * /api/settings:
 *   put:
 *     summary: Update settings
 *     description: Updates system settings (Admin only).
 *     tags: [Settings Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.route("/")
  .get(protect, restrictTo("admin"), getSettings)
  .put(protect, restrictTo("admin"), updateSettings);

export default router;
