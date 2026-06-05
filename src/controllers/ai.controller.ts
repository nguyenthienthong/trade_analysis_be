import { Request, Response } from "express";
import * as aiBrainService from "../services/ai-brain.service";

export const chat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    const { message, symbol } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const reply = await aiBrainService.chatWithBrain(userId, message, symbol);
    res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Error in AI chat controller:", error);
    res.status(500).json({ message: error.message || "Failed to process AI chat" });
  }
};

export const syncProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const profileText = await aiBrainService.syncTradingProfile(userId);
    res.status(200).json({ message: "Profile synced successfully", profileText });
  } catch (error: any) {
    console.error("Error in AI sync profile controller:", error);
    res.status(500).json({ message: error.message || "Failed to sync profile" });
  }
};
