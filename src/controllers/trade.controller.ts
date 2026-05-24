import { Request, Response } from "express";
import * as tradeService from "../services/trade.service";

export const getUserTrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { page, limit, symbol, accountId, startDate, endDate, sortBy, sortOrder } = req.query;

    const trades = await tradeService.getUserTrades({
      userId,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      symbol: symbol as string,
      accountId: accountId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'ASC' | 'DESC',
    });
    
    res.status(200).json(trades);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
