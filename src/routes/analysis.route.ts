import { Router } from "express";
import {
  getStatsOverview,
  getEquityCurve,
  getAdvancedAnalytics,
  getErrorDetection,
  getBehavioralAnalysis,
  getBehaviorFlow,
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

/**
 * @swagger
 * /api/analysis/advanced:
 *   get:
 *     summary: Get advanced analytics data (winrate by symbol, setup, streaks, etc.)
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date
 *     responses:
 *       200:
 *         description: Advanced analytics object
 */
router.get("/advanced", authMiddleware, getAdvancedAnalytics);

/**
 * @swagger
 * /api/analysis/errors:
 *   get:
 *     summary: Get trading errors and rule violations
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of error detection objects
 */
router.get("/errors", authMiddleware, getErrorDetection);

/**
 * @swagger
 * /api/analysis/behavioral:
 *   get:
 *     summary: Get behavioral analytics data
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Behavioral analytics object
 */
router.get("/behavioral", authMiddleware, getBehavioralAnalysis);

/**
 * @swagger
 * /api/analysis/flow:
 *   get:
 *     summary: Get tree data for Behavior Flow
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Behavior Flow Tree
 */
router.get("/flow", authMiddleware, getBehaviorFlow);

export default router;
