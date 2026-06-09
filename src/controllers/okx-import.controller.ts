import { Response } from "express";
import fs from "fs";
import {
  importOkxCsv,
  parseOkxCsv,
} from "../services/okx-import.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const importOkxCsvController = async (
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

    await importOkxCsv(req.file.path, userId, accountId);

    fs.unlinkSync(req.file.path);

    return res.json({
      message: "OKX CSV imported successfully",
    });
  } catch (error: any) {
    console.error("OKX import error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message || "Import failed",
    });
  }
};

export const previewOkxCsvController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const preview = parseOkxCsv(req.file.path);

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
