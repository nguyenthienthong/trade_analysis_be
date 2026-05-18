import { Router } from "express";
import {
  getOHLCV,
  getFundingRate,
  getOpenInterest,
  getIndicatorsSummary,
  getCoinglassSummary,
} from "../controllers/market-data.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Market Data
 *   description: Real-time Market Data and Analytics Service
 */

/**
 * @swagger
 * /api/market-data/ohlcv:
 *   get:
 *     summary: Get OHLCV candle historical data with indicators (RSI, MACD, Trend)
 *     tags: [Market Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *           default: BTCUSDT
 *         description: Trading pair symbol (e.g. BTCUSDT, ETHUSDT)
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           default: 1h
 *           enum: [5m, 15m, 30m, 1h, 4h, 1d]
 *         description: Candle interval
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of candles to return
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           default: binance
 *           enum: [binance, bybit]
 *         description: Exchange data source
 *       - in: query
 *         name: isFutures
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Fetch from Futures market instead of Spot
 *     responses:
 *       200:
 *         description: Successful OHLCV list response
 *       401:
 *         description: Unauthorized
 */
router.get("/ohlcv", authMiddleware, getOHLCV);

/**
 * @swagger
 * /api/market-data/funding-rate:
 *   get:
 *     summary: Get current and historical funding rate for a perpetual market
 *     tags: [Market Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *           default: BTCUSDT
 *         description: Futures symbol
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Historical points limit
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           default: binance
 *           enum: [binance, bybit, coinglass]
 *         description: Data source
 *     responses:
 *       200:
 *         description: Successful funding rate response
 *       401:
 *         description: Unauthorized
 */
router.get("/funding-rate", authMiddleware, getFundingRate);

/**
 * @swagger
 * /api/market-data/open-interest:
 *   get:
 *     summary: Get open interest (OI) current and history
 *     tags: [Market Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *           default: BTCUSDT
 *         description: Futures symbol
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           default: 1h
 *           enum: [5m, 15m, 30m, 1h, 4h, 1d]
 *         description: History aggregation interval
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Historical points limit
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           default: binance
 *           enum: [binance, bybit, coinglass]
 *         description: Data source
 *     responses:
 *       200:
 *         description: Successful open interest response
 *       401:
 *         description: Unauthorized
 */
router.get("/open-interest", authMiddleware, getOpenInterest);

/**
 * @swagger
 * /api/market-data/indicators:
 *   get:
 *     summary: Get TradingView-style Technical Analysis ratings and indicators list
 *     tags: [Market Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *           default: BTCUSDT
 *         description: Trading pair symbol
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           default: 1h
 *           enum: [5m, 15m, 30m, 1h, 4h, 1d]
 *         description: Timeframe interval
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           default: binance
 *           enum: [binance, bybit]
 *         description: Exchange data source
 *     responses:
 *       200:
 *         description: Successful technical analysis summary response
 *       401:
 *         description: Unauthorized
 */
router.get("/indicators", authMiddleware, getIndicatorsSummary);

/**
 * @swagger
 * /api/market-data/coinglass-summary:
 *   get:
 *     summary: Get aggregated derivative market summary dashboard (Coinglass comparison)
 *     tags: [Market Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *           default: BTCUSDT
 *         description: Futures symbol
 *     responses:
 *       200:
 *         description: Successful Coinglass dashboard response
 *       401:
 *         description: Unauthorized
 */
router.get("/coinglass-summary", authMiddleware, getCoinglassSummary);

export default router;
