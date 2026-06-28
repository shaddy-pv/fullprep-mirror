import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests
} from "../controllers/friendController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/request/:id", sendFriendRequest);
router.post("/accept/:id", acceptFriendRequest);
router.post("/reject/:id", rejectFriendRequest);
router.get("/", getFriends);
router.get("/requests", getPendingRequests);

export default router;
