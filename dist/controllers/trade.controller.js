"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTradeJournal = exports.getTradeById = exports.getUserTrades = void 0;
const tradeService = __importStar(require("../services/trade.service"));
const getUserTrades = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { page, limit, symbol, accountId, startDate, endDate, sortBy, sortOrder } = req.query;
        const trades = await tradeService.getUserTrades({
            userId,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            symbol: symbol,
            accountId: accountId,
            startDate: startDate,
            endDate: endDate,
            sortBy: sortBy,
            sortOrder: sortOrder,
        });
        res.status(200).json(trades);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getUserTrades = getUserTrades;
const getTradeById = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        const trade = await tradeService.getTradeById(userId, id);
        if (!trade) {
            res.status(404).json({ message: "Trade not found" });
            return;
        }
        res.status(200).json(trade);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.getTradeById = getTradeById;
const updateTradeJournal = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        const data = req.body;
        const updatedTrade = await tradeService.updateTradeJournal(userId, id, data);
        res.status(200).json(updatedTrade);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.updateTradeJournal = updateTradeJournal;
