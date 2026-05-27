"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trade_image_controller_1 = require("../controllers/trade-image.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/trades/{tradeId}/images:
 *   post:
 *     summary: Upload an image for a trade
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 description: Image type (before, after, general)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 */
router.post("/:tradeId/images", auth_middleware_1.default, upload_middleware_1.uploadMiddleware.single("image"), trade_image_controller_1.uploadTradeImage);
/**
 * @swagger
 * /api/trades/images/{imageId}:
 *   delete:
 *     summary: Delete a trade image
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete("/images/:imageId", auth_middleware_1.default, trade_image_controller_1.deleteTradeImage);
exports.default = router;
