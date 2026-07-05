import { Router } from "express";
import { getChatHistory, sendChatMessage, getRecentHistory } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all AI routes
router.use(protect);

router.get("/history", getRecentHistory);
router.get("/chat/:problemId", getChatHistory);
router.post("/chat/:problemId", sendChatMessage);

export default router;
