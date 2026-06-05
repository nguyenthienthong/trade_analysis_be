import { Router } from "express";
import { chat, syncProfile } from "../controllers/ai.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI Context Builder
 *   description: AI Brain and RAG system
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI using RAG Memory, Trading Profile, and Market Context
 *     tags: [AI Context Builder]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               symbol:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI Response
 *       401:
 *         description: Unauthorized
 */
router.post("/chat", authMiddleware, chat);

/**
 * @swagger
 * /api/ai/sync-profile:
 *   post:
 *     summary: Manually sync trading history into Vector Profile
 *     tags: [AI Context Builder]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile synced
 *       401:
 *         description: Unauthorized
 */
router.post("/sync-profile", authMiddleware, syncProfile);

export default router;
