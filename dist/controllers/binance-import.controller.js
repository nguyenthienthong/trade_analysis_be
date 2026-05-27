"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewBinanceCsvController = exports.importBinanceCsvController = void 0;
const fs_1 = __importDefault(require("fs"));
const binance_import_service_1 = require("../services/binance-import.service");
const importBinanceCsvController = async (req, res) => {
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
        await (0, binance_import_service_1.importBinanceCsv)(req.file.path, userId, accountId);
        // 5. cleanup uploaded file
        fs_1.default.unlinkSync(req.file.path);
        return res.json({
            message: "Binance CSV imported successfully",
        });
    }
    catch (error) {
        console.error("Binance import error:", error);
        return res.status(500).json({
            message: error.message || "Import failed",
        });
    }
};
exports.importBinanceCsvController = importBinanceCsvController;
const previewBinanceCsvController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "CSV file required" });
        }
        const preview = (0, binance_import_service_1.parseBinanceCsv)(req.file.path);
        fs_1.default.unlinkSync(req.file.path);
        return res.json({
            count: preview.length,
            trades: preview.slice(0, 200), // limit preview
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Preview failed",
        });
    }
};
exports.previewBinanceCsvController = previewBinanceCsvController;
