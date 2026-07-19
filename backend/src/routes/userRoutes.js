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
/**
 * @openapi
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by name or email.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users found
 */
router.get("/search", searchUsers);
/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Update profile
 *     description: Update user profile details.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", updateProfile);

// Routes restricted to admin
router.use(restrictTo("admin"));

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List users
 *     description: List users with pagination and filtering (Admin only).
 *     tags: [Users Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users fetched
 */
router.get("/", getUsers);
/**
 * @openapi
 * /api/users/admin:
 *   post:
 *     summary: Create Admin
 *     description: Create a new admin or mentor user (Admin only).
 *     tags: [Users Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, mentor]
 *     responses:
 *       201:
 *         description: Admin created
 */
router.post("/admin", createAdminUser);
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user details
 *     description: Fetch details of a specific user (Admin only).
 *     tags: [Users Admin]
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
 *         description: User details
 */
router.get("/:id", getUserById);
/**
 * @openapi
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get user stats
 *     description: Fetch statistics for a specific user (Admin only).
 *     tags: [Users Admin]
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
 *         description: User stats
 */
router.get("/:id/stats", getAdminUserStats);
/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update role
 *     description: Update the role of a user (Admin only).
 *     tags: [Users Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, mentor, admin]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/:id/role", updateUserRole);
/**
 * @openapi
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update status
 *     description: Update the active status of a user (Admin only).
 *     tags: [Users Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", updateUserStatus);
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Permanently delete a user (Admin only).
 *     tags: [Users Admin]
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
 *         description: User deleted
 */
router.delete("/:id", deleteUser);

export default router;
