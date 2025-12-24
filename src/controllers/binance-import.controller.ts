import { Request, Response } from "express";
import fs from "fs";
import {
  importBinanceCsv,
  parseBinanceCsv,
} from "../services/binance-import.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const importBinanceCsvController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // 1. validate file
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    // 2. validate accountId
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({
        message: "accountId is required",
      });
    }

    // 3. get userId from JWT
    const userId = req.user.id;

    // 4. import CSV
    await importBinanceCsv(req.file.path, userId, accountId);

    // 5. cleanup uploaded file
    fs.unlinkSync(req.file.path);

    return res.json({
      message: "Binance CSV imported successfully",
    });
  } catch (error: any) {
    console.error("Binance import error:", error);

    return res.status(500).json({
      message: error.message || "Import failed",
    });
  }
};

export const previewBinanceCsvController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const preview = parseBinanceCsv(req.file.path);

    fs.unlinkSync(req.file.path);

    return res.json({
      count: preview.length,
      trades: preview.slice(0, 200), // limit preview
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Preview failed",
    });
  }
};
