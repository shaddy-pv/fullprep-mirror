import express from "express";
import { getJobs, createJob } from "../controllers/jobController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getJobs).post(protect, restrictTo("admin"), createJob);

export default router;
