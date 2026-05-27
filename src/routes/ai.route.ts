import express from "express";
import { analyzeTrade, chat } from "../controllers/ai.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/analyze", authMiddleware, analyzeTrade);
router.post("/chat", authMiddleware, chat);

export default router;
