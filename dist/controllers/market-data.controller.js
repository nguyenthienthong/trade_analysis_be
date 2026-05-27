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
exports.getPatternDetectionSummary = exports.getCoinglassSummary = exports.getIndicatorsSummary = exports.getOpenInterest = exports.getFundingRate = exports.getOHLCV = void 0;
const marketService = __importStar(require("../services/market-data.service"));
const getOHLCV = async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTCUSDT";
        const interval = req.query.interval || "1h";
        const limit = Number(req.query.limit) || 100;
        const source = req.query.source || "binance";
        const isFutures = req.query.isFutures !== "false"; // default true
        const data = await marketService.getOHLCV(symbol, interval, limit, source, isFutures);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getOHLCV controller:", error);
        res.status(400).json({ message: error.message || "Failed to fetch OHLCV data" });
    }
};
exports.getOHLCV = getOHLCV;
const getFundingRate = async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTCUSDT";
        const limit = Number(req.query.limit) || 20;
        const source = req.query.source || "binance";
        const data = await marketService.getFundingRate(symbol, limit, source);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getFundingRate controller:", error);
        res.status(400).json({ message: error.message || "Failed to fetch funding rate" });
    }
};
exports.getFundingRate = getFundingRate;
const getOpenInterest = async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTCUSDT";
        const interval = req.query.interval || "1h";
        const limit = Number(req.query.limit) || 30;
        const source = req.query.source || "binance";
        const data = await marketService.getOpenInterest(symbol, interval, limit, source);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getOpenInterest controller:", error);
        res.status(400).json({ message: error.message || "Failed to fetch open interest" });
    }
};
exports.getOpenInterest = getOpenInterest;
const getIndicatorsSummary = async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTCUSDT";
        const interval = req.query.interval || "1h";
        const source = req.query.source || "binance";
        const data = await marketService.getTechnicalIndicatorsSummary(symbol, interval, source);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getIndicatorsSummary controller:", error);
        res.status(400).json({ message: error.message || "Failed to fetch indicator summary" });
    }
};
exports.getIndicatorsSummary = getIndicatorsSummary;
const getCoinglassSummary = async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTCUSDT";
        const data = await marketService.getCoinglassSummary(symbol);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getCoinglassSummary controller:", error);
        res.status(400).json({ message: error.message || "Failed to fetch Coinglass dashboard summary" });
    }
};
exports.getCoinglassSummary = getCoinglassSummary;
const getPatternDetectionSummary = async (req, res) => {
    try {
        const symbol = req.query.symbol || "BTCUSDT";
        const interval = req.query.interval || "1h";
        const source = req.query.source || "binance";
        const data = await marketService.getPatternDetectionSummary(symbol, interval, source);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error in getPatternDetectionSummary controller:", error);
        res.status(400).json({ message: error.message || "Failed to fetch pattern detection summary" });
    }
};
exports.getPatternDetectionSummary = getPatternDetectionSummary;
