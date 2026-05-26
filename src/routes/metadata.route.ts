import { Router } from "express";
import { getMetadata, createTag, createSetup, createEmotion } from "../controllers/metadata.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getMetadata);
router.post("/tags", authMiddleware, createTag);
router.post("/setups", authMiddleware, createSetup);
router.post("/emotions", authMiddleware, createEmotion);

export default router;
