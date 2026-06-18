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

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/clear-all", clearAllNotifications);

export default router;
