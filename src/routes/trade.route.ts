import { Router } from "express";
import {
  importBinanceCsvController,
  previewBinanceCsvController,
} from "../controllers/binance-import.controller";
import {
  importBybitCsvController,
  previewBybitCsvController,
} from "../controllers/bybit-import.controller";
import {
  importOkxCsvController,
  previewOkxCsvController,
} from "../controllers/okx-import.controller";
import { getUserTrades, getTradeById, updateTradeJournal } from "../controllers/trade.controller";
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

router.post(
  "/import/bybit",
  authMiddleware,
  upload.single("file"),
  importBybitCsvController,
);

router.post(
  "/import/bybit/preview",
  authMiddleware,
  upload.single("file"),
  previewBybitCsvController,
);

router.post(
  "/import/okx",
  authMiddleware,
  upload.single("file"),
  importOkxCsvController,
);

router.post(
  "/import/okx/preview",
  authMiddleware,
  upload.single("file"),
  previewOkxCsvController,
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

/**
 * @swagger
 * /api/trades/{id}:
 *   get:
 *     summary: Get trade by ID
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trade object
 *       404:
 *         description: Not found
 */
router.get("/:id", authMiddleware, getTradeById);

/**
 * @swagger
 * /api/trades/{id}/journal:
 *   patch:
 *     summary: Update trade journal (note, setup, tags, emotions)
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated trade
 *       404:
 *         description: Not found
 */
router.patch("/:id/journal", authMiddleware, updateTradeJournal);

export default router;
