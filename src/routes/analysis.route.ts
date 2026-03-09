import { Router } from "express";
import {
  getStatsOverview,
  getEquityCurve,
} from "../controllers/analysis.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Trade Analysis API
 */

/**
 * @swagger
 * /api/analysis/stats:
 *   get:
 *     summary: Get overall trading stats (PnL, Win Rate, etc.)
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trading stats object
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", authMiddleware, getStatsOverview);

/**
 * @swagger
 * /api/analysis/equity-curve:
 *   get:
 *     summary: Get equity curve data series
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of equity curve data points
 *       401:
 *         description: Unauthorized
 */
router.get("/equity-curve", authMiddleware, getEquityCurve);

export default router;
