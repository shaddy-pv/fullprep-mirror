import { Router } from "express";
import {
  getLearningPaths,
  getLearningPathById,
  enrollInLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath
} from "../controllers/learningPathController.js";
import { protect, optionalProtect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// We use optionalProtect for GET routes because they are public but we want to calculate progress if logged in
router.get("/", optionalProtect, getLearningPaths);
router.get("/:id", optionalProtect, getLearningPathById);

// Requires auth
router.post("/:id/enroll", protect, enrollInLearningPath);

// Admin only
router.post("/", protect, restrictTo("admin"), createLearningPath);
router.put("/:id", protect, restrictTo("admin"), updateLearningPath);
router.delete("/:id", protect, restrictTo("admin"), deleteLearningPath);

export default router;
