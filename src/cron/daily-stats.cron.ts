import cron from "node-cron";
import { Trade } from "../models/trade.model";
import { DailyStat } from "../models/daily-stat.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";

export const initCronJobs = () => {
  // Run every day at 00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily stats aggregation job...");
    await aggregateDailyStats();
  });
};

export const aggregateDailyStats = async (targetDate?: Date) => {
  try {
    // If targetDate not provided, compute for yesterday
    const dateToProcess = targetDate || new Date();
    if (!targetDate) {
      dateToProcess.setDate(dateToProcess.getDate() - 1);
    }
    dateToProcess.setHours(0, 0, 0, 0);

    const nextDate = new Date(dateToProcess);
    nextDate.setDate(nextDate.getDate() + 1);

    const users = await User.findAll({ attributes: ["id"] });

    for (const user of users) {
      const trades = await Trade.findAll({
        where: {
          userId: user.id,
          openTime: {
            [Op.gte]: dateToProcess,
            [Op.lt]: nextDate,
          },
        },
        order: [["openTime", "ASC"]],
      });

      if (trades.length === 0) continue;

      let wins = 0;
      let losses = 0;
      let dailyPnL = 0;

      let cumulativePnL = 0;
      let peak = 0;
      let maxDrawdown = 0;

      for (const trade of trades) {
        const netPnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
        
        if (netPnl > 0) wins++;
        else losses++;

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

      await DailyStat.upsert({
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
  } catch (err) {
    console.error("Error in daily stats aggregation:", err);
  }
};
