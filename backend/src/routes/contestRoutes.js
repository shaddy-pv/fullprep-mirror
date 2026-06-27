import { Router } from "express";
import { getDailyContest, getWeeklyContest, submitContestResult } from "../controllers/contestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/daily", getDailyContest);
router.get("/weekly", getWeeklyContest);
router.post("/submit", submitContestResult);

export default router;
