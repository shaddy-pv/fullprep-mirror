import { Router } from "express";
import { getChatHistory, sendChatMessage, getRecentHistory } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all AI routes
router.use(protect);

/**
 * @openapi
 * /api/ai/history:
 *   get:
 *     summary: Get AI chat history
 *     description: Fetches recent AI chat conversations for the user.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history fetched
 */
router.get("/history", getRecentHistory);
/**
 * @openapi
 * /api/ai/chat/{problemId}:
 *   get:
 *     summary: Get chat for problem
 *     description: Fetches chat history with the AI mentor for a specific problem.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history fetched
 */
router.get("/chat/:problemId", getChatHistory);
/**
 * @openapi
 * /api/ai/chat/{problemId}:
 *   post:
 *     summary: Send message to AI
 *     description: Sends a chat message to the AI mentor for a specific problem.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response generated
 */
router.post("/chat/:problemId", sendChatMessage);

export default router;
