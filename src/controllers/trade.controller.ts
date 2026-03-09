import { Request, Response } from "express";
import * as tradeService from "../services/trade.service";

export const getUserTrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const trades = await tradeService.getUserTrades(userId);
    res.status(200).json(trades);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
