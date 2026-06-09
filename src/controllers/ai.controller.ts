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

    const stream = await aiBrainService.chatWithBrainStream(userId, message, symbol);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.text) {
        fullText += chunk.text;
        res.write(chunk.text);
      }
    }
    
    res.end();

    // Store context after stream ends
    await aiBrainService.storeChatContext(userId, message, fullText);

  } catch (error: any) {
    console.error("Error in AI chat controller:", error);
    // Nếu chưa gửi header thì mới response JSON lỗi
    if (!res.headersSent) {
      res.status(500).json({ message: error.message || "Failed to process AI chat" });
    } else {
      res.end("\n[Error processing request]");
    }
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
