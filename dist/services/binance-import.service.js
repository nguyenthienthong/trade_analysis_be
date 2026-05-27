"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBinanceCsv = exports.importBinanceCsv = exports.buildTradesFromRows = void 0;
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
const trade_model_1 = require("../models/trade.model");
const buildTradesFromRows = (rows, userId, accountId) => {
    const parseBinanceDate = (dateStr) => {
        if (!dateStr)
            return new Date("Invalid");
        // Handle YY-MM-DD HH:mm:ss (often corrupted by Excel)
        const matchYY = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
        if (matchYY)
            return new Date(`20${matchYY[1]}-${matchYY[2]}-${matchYY[3]}T${matchYY[4]}Z`);
        // Handle YYYY-MM-DD HH:mm:ss
        const matchYYYY = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
        if (matchYYYY)
            return new Date(`${matchYYYY[1]}-${matchYYYY[2]}-${matchYYYY[3]}T${matchYYYY[4]}Z`);
        return new Date(dateStr);
    };
    // Filter out invalid rows first
    const validRows = rows.filter(r => {
        const timeStr = r["Date(UTC)"] || r["Time"] || r["Date"];
        if (!timeStr)
            return false;
        const time = parseBinanceDate(timeStr);
        return !isNaN(time.getTime());
    });
    // Sort rows chronologically (oldest first)
    const sortedRows = validRows.sort((a, b) => {
        const timeA = a["Date(UTC)"] || a["Time"] || a["Date"];
        const timeB = b["Date(UTC)"] || b["Time"] || b["Date"];
        return parseBinanceDate(timeA).getTime() - parseBinanceDate(timeB).getTime();
    });
    const activePositions = {};
    const finishedTrades = [];
    for (const row of sortedRows) {
        const symbol = row.Pair || row.Market || row.Symbol;
        const rawSide = row.Side || row.Type || "";
        const side = rawSide.toUpperCase();
        const priceStr = row.Price || "0";
        const executedStr = row.Executed || row.Quantity || row.Amount || "0";
        const feeStr = row.Fee || "0";
        const pnlStr = row["Realized PnL"] || row["Realized Profit"] || "0";
        const timeStr = row["Date(UTC)"] || row["Time"] || row["Date"];
        if (!symbol || !side || !timeStr)
            continue;
        const price = parseFloat(priceStr.replace(/,/g, ''));
        const executed = parseFloat(executedStr.replace(/,/g, ''));
        // Fee parsing logic: Binance Spot format often has fee as "0.123 BNB"
        let fee = 0;
        if (typeof feeStr === 'string') {
            const feeMatch = feeStr.match(/-?[\d.]+/);
            if (feeMatch)
                fee = parseFloat(feeMatch[0]);
        }
        else {
            fee = parseFloat(feeStr);
        }
        const pnl = parseFloat(pnlStr.replace(/,/g, ''));
        const time = parseBinanceDate(timeStr);
        if (!activePositions[symbol]) {
            // Open new position
            activePositions[symbol] = {
                symbol,
                side: side,
                entryPrice: price,
                totalCost: price * executed,
                quantity: executed,
                openTime: time,
                fee: fee,
                pnl: pnl,
            };
            continue;
        }
        const pos = activePositions[symbol];
        if (pos.side === side) {
            // DCA - Increase size
            pos.quantity += executed;
            pos.totalCost += price * executed;
            pos.entryPrice = pos.totalCost / pos.quantity;
            pos.fee += fee;
            pos.pnl += pnl;
        }
        else {
            // Opposite side - Closing (partial or full)
            pos.fee += fee;
            pos.pnl += pnl;
            pos.quantity -= executed;
            if (pos.quantity <= 0.000001) {
                // Position fully closed or reversed
                finishedTrades.push({
                    userId: userId || null,
                    accountId: accountId || null,
                    symbol: pos.symbol,
                    side: pos.side === "BUY" ? "long" : "short",
                    entryPrice: pos.entryPrice,
                    exitPrice: price,
                    quantity: pos.totalCost / pos.entryPrice,
                    pnl: pos.pnl,
                    fee: pos.fee,
                    openTime: pos.openTime,
                    closeTime: time,
                    durationMinutes: Math.round((time.getTime() - pos.openTime.getTime()) / 60000),
                    note: "Imported via Binance Trade Builder",
                });
                const remainingQuantity = Math.abs(pos.quantity);
                delete activePositions[symbol];
                // If it was a reversal (sold more than owned), open a new position with the remainder
                if (remainingQuantity > 0.000001) {
                    activePositions[symbol] = {
                        symbol,
                        side: side,
                        entryPrice: price,
                        totalCost: price * remainingQuantity,
                        quantity: remainingQuantity,
                        openTime: time,
                        fee: 0, // fee already attributed to the closed trade
                        pnl: 0,
                    };
                }
            }
        }
    }
    // Handle remaining open positions
    for (const sym in activePositions) {
        const pos = activePositions[sym];
        finishedTrades.push({
            userId: userId || null,
            accountId: accountId || null,
            symbol: pos.symbol,
            side: pos.side === "BUY" ? "long" : "short",
            entryPrice: pos.entryPrice,
            exitPrice: null,
            quantity: pos.quantity,
            pnl: pos.pnl,
            fee: pos.fee,
            openTime: pos.openTime,
            closeTime: null,
            durationMinutes: null,
            note: "Open position imported from Binance",
        });
    }
    return finishedTrades;
};
exports.buildTradesFromRows = buildTradesFromRows;
const importBinanceCsv = async (filePath, userId, accountId) => {
    const csv = fs_1.default.readFileSync(filePath);
    const rows = (0, sync_1.parse)(csv, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
    });
    const trades = (0, exports.buildTradesFromRows)(rows, userId, accountId);
    await trade_model_1.Trade.bulkCreate(trades);
};
exports.importBinanceCsv = importBinanceCsv;
const parseBinanceCsv = (filePath) => {
    const csv = fs_1.default.readFileSync(filePath);
    const rows = (0, sync_1.parse)(csv, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
    });
    return (0, exports.buildTradesFromRows)(rows);
};
exports.parseBinanceCsv = parseBinanceCsv;
