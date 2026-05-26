import { Request, Response } from "express";
import { TradeImage } from "../models/trade-image.model";
import { Trade } from "../models/trade.model";
import fs from "fs";
import path from "path";

export const uploadTradeImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    const { tradeId } = req.params;
    const { type } = req.body; // 'before', 'after', 'general'

    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    // Verify trade belongs to user
    const trade = await Trade.findOne({ where: { id: tradeId, userId } });
    if (!trade) {
      // Clean up uploaded file if trade not found or unauthorized
      fs.unlinkSync(req.file.path);
      res.status(404).json({ message: "Trade not found" });
      return;
    }

    const url = `/uploads/${req.file.filename}`;

    const tradeImage = await TradeImage.create({
      tradeId,
      url,
      type: type || 'general'
    });

    res.status(201).json(tradeImage);
  } catch (e: any) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
    }
    res.status(400).json({ message: e.message });
  }
};

export const deleteTradeImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    const { imageId } = req.params;

    const tradeImage = await TradeImage.findByPk(imageId, {
      include: [{ model: Trade, as: 'trade' }]
    });

    if (!tradeImage) {
      res.status(404).json({ message: "Image not found" });
      return;
    }

    if (tradeImage.trade.userId !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Delete file from disk
    const filename = path.basename(tradeImage.url);
    const filePath = path.join(process.cwd(), "uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await tradeImage.destroy();
    res.status(200).json({ message: "Image deleted" });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
