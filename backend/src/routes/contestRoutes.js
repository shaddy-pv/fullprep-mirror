import { Router } from "express";
import { getDailyContest, getWeeklyContest, submitContestResult, createContest, getAdminContests, getContestById, updateContest, deleteContest, getActiveContests } from "../controllers/contestController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", getActiveContests);
router.get("/daily", getDailyContest);
router.get("/weekly", getWeeklyContest);
router.post("/submit", submitContestResult);

// ── Admin-only Routes ─────────────────────────────────────────────────────────
router.post("/", restrictTo("admin"), createContest);
router.get("/admin", restrictTo("admin"), getAdminContests);
router.get("/:id", getContestById);
router.patch("/:id", restrictTo("admin"), updateContest);
router.delete("/:id", restrictTo("admin"), deleteContest);

export default router;
