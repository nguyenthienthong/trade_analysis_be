"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const binance_import_controller_1 = require("../controllers/binance-import.controller");
const trade_controller_1 = require("../controllers/trade.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
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
router.post("/import/binance", auth_middleware_1.default, upload_middleware_1.upload.single("file"), binance_import_controller_1.importBinanceCsvController);
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
router.post("/import/binance/preview", auth_middleware_1.default, upload_middleware_1.upload.single("file"), binance_import_controller_1.previewBinanceCsvController);
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
router.get("/", auth_middleware_1.default, trade_controller_1.getUserTrades);
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
router.get("/:id", auth_middleware_1.default, trade_controller_1.getTradeById);
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
router.patch("/:id/journal", auth_middleware_1.default, trade_controller_1.updateTradeJournal);
exports.default = router;
