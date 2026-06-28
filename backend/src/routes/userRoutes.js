/**
 * @file userRoutes.js
 * @description Express router for user management endpoints (Admin only).
 */

import { Router } from "express";
import { getUsers, getUserById, updateUserRole, createAdminUser, getAdminUserStats, deleteUser, updateUserStatus, updateProfile, searchUsers } from "../controllers/userController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// Routes available to any authenticated user
router.use(protect);
router.get("/search", searchUsers);
router.put("/profile", updateProfile);

// Routes restricted to admin
router.use(restrictTo("admin"));

router.get("/", getUsers);
router.post("/admin", createAdminUser);
router.get("/:id", getUserById);
router.get("/:id/stats", getAdminUserStats);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
