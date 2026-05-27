import { Request, Response } from "express";
import { analyzeTradeContext, AIAnalysisInput, streamAIChat } from "../services/ai.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const analyzeTrade = async (req: Request, res: Response) => {
  try {
    const input: AIAnalysisInput = req.body;
    
    // Basic validation
    if (!input.symbol || input.price === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields: symbol, price" });
    }

    const analysis = await analyzeTradeContext(input);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error("Controller Error in analyzeTrade:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, symbol, isWeeklyReview } = req.body;
    // Assuming userId is available via auth middleware
    const userId = req.user?.id || "anonymous";

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const stream = await streamAIChat(userId, message, symbol, isWeeklyReview);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of stream) {
      res.write(chunk.text);
    }

    res.end();
  } catch (error: any) {
    console.error("Controller Error in chat stream:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    } else {
      res.end();
    }
  }
};
