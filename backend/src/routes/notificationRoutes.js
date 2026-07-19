import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications
} from "../controllers/notificationController.js";

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List notifications
 *     description: Fetches the authenticated user's notifications.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched
 */
router.get("/", getNotifications);
/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all as read
 *     description: Marks all unread notifications as read.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", markAllAsRead);
/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark single notification as read
 *     description: Marks a specific notification as read.
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 */
router.patch("/:id/read", markAsRead);
/**
 * @openapi
 * /api/notifications/clear-all:
 *   delete:
 *     summary: Clear all notifications
 *     description: Deletes all notifications for the user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications cleared
 */
router.delete("/clear-all", clearAllNotifications);

export default router;
