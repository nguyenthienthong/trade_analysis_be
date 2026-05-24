import express from "express";
import { analyzeTrade } from "../controllers/ai.controller";

const router = express.Router();

router.post("/analyze", analyzeTrade);

export default router;
