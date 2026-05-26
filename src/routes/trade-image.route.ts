import { Router } from "express";
import { uploadTradeImage, deleteTradeImage } from "../controllers/trade-image.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const router = Router();

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
router.post("/:tradeId/images", authMiddleware, uploadMiddleware.single("image"), uploadTradeImage);

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
router.delete("/images/:imageId", authMiddleware, deleteTradeImage);

export default router;
