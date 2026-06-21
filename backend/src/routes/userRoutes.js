/**
 * @file userRoutes.js
 * @description Express router for user management endpoints (Admin only).
 */

import { Router } from "express";
import { getUsers, getUserById, updateUserRole, createAdminUser, getAdminUserStats, deleteUser, updateUserStatus, updateProfile } from "../controllers/userController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// All user routes require authentication and admin role
router.use(protect, restrictTo("admin"));

router.get("/", getUsers);
router.put("/profile", updateProfile);
router.post("/admin", createAdminUser);
router.get("/:id", getUserById);
router.get("/:id/stats", getAdminUserStats);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
