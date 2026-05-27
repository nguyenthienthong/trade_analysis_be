"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysis_controller_1 = require("../controllers/analysis.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
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
router.get("/stats", auth_middleware_1.default, analysis_controller_1.getStatsOverview);
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
router.get("/equity-curve", auth_middleware_1.default, analysis_controller_1.getEquityCurve);
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
router.get("/advanced", auth_middleware_1.default, analysis_controller_1.getAdvancedAnalytics);
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
router.get("/errors", auth_middleware_1.default, analysis_controller_1.getErrorDetection);
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
router.get("/behavioral", auth_middleware_1.default, analysis_controller_1.getBehavioralAnalysis);
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
router.get("/flow", auth_middleware_1.default, analysis_controller_1.getBehaviorFlow);
exports.default = router;
