"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateDailyStats = exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const trade_model_1 = require("../models/trade.model");
const daily_stat_model_1 = require("../models/daily-stat.model");
const user_model_1 = require("../models/user.model");
const sequelize_1 = require("sequelize");
const initCronJobs = () => {
    // Run every day at 00:00 (midnight)
    node_cron_1.default.schedule("0 0 * * *", async () => {
        console.log("Running daily stats aggregation job...");
        await (0, exports.aggregateDailyStats)();
    });
};
exports.initCronJobs = initCronJobs;
const aggregateDailyStats = async (targetDate) => {
    try {
        // If targetDate not provided, compute for yesterday
        const dateToProcess = targetDate || new Date();
        if (!targetDate) {
            dateToProcess.setDate(dateToProcess.getDate() - 1);
        }
        dateToProcess.setHours(0, 0, 0, 0);
        const nextDate = new Date(dateToProcess);
        nextDate.setDate(nextDate.getDate() + 1);
        const users = await user_model_1.User.findAll({ attributes: ["id"] });
        for (const user of users) {
            const trades = await trade_model_1.Trade.findAll({
                where: {
                    userId: user.id,
                    openTime: {
                        [sequelize_1.Op.gte]: dateToProcess,
                        [sequelize_1.Op.lt]: nextDate,
                    },
                },
                order: [["openTime", "ASC"]],
            });
            if (trades.length === 0)
                continue;
            let wins = 0;
            let losses = 0;
            let dailyPnL = 0;
            let cumulativePnL = 0;
            let peak = 0;
            let maxDrawdown = 0;
            for (const trade of trades) {
                const netPnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
                if (netPnl > 0)
                    wins++;
                else
                    losses++;
                dailyPnL += netPnl;
                cumulativePnL += netPnl;
                if (cumulativePnL > peak) {
                    peak = cumulativePnL;
                }
                const drawdown = peak - cumulativePnL;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }
            }
            const dateStr = dateToProcess.toISOString().split("T")[0];
            await daily_stat_model_1.DailyStat.upsert({
                userId: user.id,
                date: dateStr,
                totalTrades: trades.length,
                wins,
                losses,
                pnl: dailyPnL.toFixed(8),
                maxDrawdown: maxDrawdown.toFixed(8),
            });
        }
        console.log("Daily stats aggregation completed.");
    }
    catch (err) {
        console.error("Error in daily stats aggregation:", err);
    }
};
exports.aggregateDailyStats = aggregateDailyStats;
