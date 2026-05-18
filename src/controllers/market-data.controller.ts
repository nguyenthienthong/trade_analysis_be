import { Request, Response } from "express";
import * as marketService from "../services/market-data.service";

export const getOHLCV = async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || "BTCUSDT";
    const interval = (req.query.interval as string) || "1h";
    const limit = Number(req.query.limit) || 100;
    const source = (req.query.source as "binance" | "bybit") || "binance";
    const isFutures = req.query.isFutures !== "false"; // default true

    const data = await marketService.getOHLCV(symbol, interval, limit, source, isFutures);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in getOHLCV controller:", error);
    res.status(400).json({ message: error.message || "Failed to fetch OHLCV data" });
  }
};

export const getFundingRate = async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || "BTCUSDT";
    const limit = Number(req.query.limit) || 20;
    const source = (req.query.source as "binance" | "bybit" | "coinglass") || "binance";

    const data = await marketService.getFundingRate(symbol, limit, source);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in getFundingRate controller:", error);
    res.status(400).json({ message: error.message || "Failed to fetch funding rate" });
  }
};

export const getOpenInterest = async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || "BTCUSDT";
    const interval = (req.query.interval as string) || "1h";
    const limit = Number(req.query.limit) || 30;
    const source = (req.query.source as "binance" | "bybit" | "coinglass") || "binance";

    const data = await marketService.getOpenInterest(symbol, interval, limit, source);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in getOpenInterest controller:", error);
    res.status(400).json({ message: error.message || "Failed to fetch open interest" });
  }
};

export const getIndicatorsSummary = async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || "BTCUSDT";
    const interval = (req.query.interval as string) || "1h";
    const source = (req.query.source as "binance" | "bybit") || "binance";

    const data = await marketService.getTechnicalIndicatorsSummary(symbol, interval, source);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in getIndicatorsSummary controller:", error);
    res.status(400).json({ message: error.message || "Failed to fetch indicator summary" });
  }
};

export const getCoinglassSummary = async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || "BTCUSDT";

    const data = await marketService.getCoinglassSummary(symbol);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in getCoinglassSummary controller:", error);
    res.status(400).json({ message: error.message || "Failed to fetch Coinglass dashboard summary" });
  }
};
