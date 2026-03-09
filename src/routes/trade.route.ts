import { Router } from "express";
import {
  importBinanceCsvController,
  previewBinanceCsvController,
} from "../controllers/binance-import.controller";
import { getUserTrades } from "../controllers/trade.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: Trades API
 */

/**
 * @swagger
 * /api/trades/import/binance:
 *   post:
 *     summary: Import Binance CSV trades
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - accountId
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: "b9e8f6b1-..."
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import success
 */

router.post(
  "/import/binance",
  authMiddleware,
  upload.single("file"),
  importBinanceCsvController,
);

/**
 * @swagger
 * /api/trades/import/binance/preview:
 *   post:
 *     summary: Preview Binance CSV trades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Preview parsed trades
 */

router.post(
  "/import/binance/preview",
  authMiddleware,
  upload.single("file"),
  previewBinanceCsvController,
);

/**
 * @swagger
 * /api/trades:
 *   get:
 *     summary: Get trade history of the user
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trades
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getUserTrades);

export default router;
