"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTradeImage = exports.uploadTradeImage = void 0;
const trade_image_model_1 = require("../models/trade-image.model");
const trade_model_1 = require("../models/trade.model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadTradeImage = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { tradeId } = req.params;
        const { type } = req.body; // 'before', 'after', 'general'
        if (!req.file) {
            res.status(400).json({ message: "No image file provided" });
            return;
        }
        // Verify trade belongs to user
        const trade = await trade_model_1.Trade.findOne({ where: { id: tradeId, userId } });
        if (!trade) {
            // Clean up uploaded file if trade not found or unauthorized
            fs_1.default.unlinkSync(req.file.path);
            res.status(404).json({ message: "Trade not found" });
            return;
        }
        const url = `/uploads/${req.file.filename}`;
        const tradeImage = await trade_image_model_1.TradeImage.create({
            tradeId,
            url,
            type: type || 'general'
        });
        res.status(201).json(tradeImage);
    }
    catch (e) {
        if (req.file) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (err) { }
        }
        res.status(400).json({ message: e.message });
    }
};
exports.uploadTradeImage = uploadTradeImage;
const deleteTradeImage = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { imageId } = req.params;
        const tradeImage = await trade_image_model_1.TradeImage.findByPk(imageId, {
            include: [{ model: trade_model_1.Trade, as: 'trade' }]
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
        const filename = path_1.default.basename(tradeImage.url);
        const filePath = path_1.default.join(process.cwd(), "uploads", filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await tradeImage.destroy();
        res.status(200).json({ message: "Image deleted" });
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.deleteTradeImage = deleteTradeImage;
