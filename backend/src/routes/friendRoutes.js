import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  getFriendStatus
} from "../controllers/friendController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/friends/request/{id}:
 *   post:
 *     summary: Send friend request
 *     description: Sends a friend request to another user.
 *     tags: [Friends]
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
 *         description: Friend request sent
 */
router.post("/request/:id", sendFriendRequest);
/**
 * @openapi
 * /api/friends/accept/{id}:
 *   post:
 *     summary: Accept friend request
 *     description: Accepts a pending friend request from a user.
 *     tags: [Friends]
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
 *         description: Friend request accepted
 */
router.post("/accept/:id", acceptFriendRequest);
/**
 * @openapi
 * /api/friends/reject/{id}:
 *   post:
 *     summary: Reject friend request
 *     description: Rejects a pending friend request from a user.
 *     tags: [Friends]
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
 *         description: Friend request rejected
 */
router.post("/reject/:id", rejectFriendRequest);
/**
 * @openapi
 * /api/friends/status/{id}:
 *   get:
 *     summary: Get friend status
 *     description: Checks the friendship status between current user and target user.
 *     tags: [Friends]
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
 *         description: Status fetched successfully
 */
router.get("/status/:id", getFriendStatus);
/**
 * @openapi
 * /api/friends:
 *   get:
 *     summary: List friends
 *     description: Returns a list of all accepted friends.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends list fetched
 */
router.get("/", getFriends);
/**
 * @openapi
 * /api/friends/requests:
 *   get:
 *     summary: Get pending requests
 *     description: Returns a list of incoming pending friend requests.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests list fetched
 */
router.get("/requests", getPendingRequests);

export default router;
