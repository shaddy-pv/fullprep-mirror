import express from "express";
import { getTeam } from "../controllers/teamController.js";

const router = express.Router();

/**
 * @openapi
 * /api/team:
 *   get:
 *     summary: Get team members
 *     description: Fetches the public team members list.
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: Team members fetched
 */
router.route("/").get(getTeam);

export default router;
