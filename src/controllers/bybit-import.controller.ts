import { Response } from "express";
import fs from "fs";
import {
  importBybitCsv,
  parseBybitCsv,
} from "../services/bybit-import.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const importBybitCsvController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({
        message: "accountId is required",
      });
    }

    const userId = req.user.id;

    await importBybitCsv(req.file.path, userId, accountId);

    fs.unlinkSync(req.file.path);

    return res.json({
      message: "Bybit CSV imported successfully",
    });
  } catch (error: any) {
    console.error("Bybit import error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message || "Import failed",
    });
  }
};

export const previewBybitCsvController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const preview = parseBybitCsv(req.file.path);

    fs.unlinkSync(req.file.path);

    return res.json({
      count: preview.length,
      trades: preview.slice(0, 200),
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      message: error.message || "Preview failed",
    });
  }
};
