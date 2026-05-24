import { Request, Response } from "express";
import { analyzeTradeContext, AIAnalysisInput } from "../services/ai.service";

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
