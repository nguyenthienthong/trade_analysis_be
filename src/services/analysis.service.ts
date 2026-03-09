import { Trade } from "../models/trade.model";

export const getStatsOverview = async (userId: string) => {
  const trades = await Trade.findAll({ where: { userId } });

  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      bestTrade: 0,
      worstTrade: 0,
    };
  }

  let wins = 0;
  let totalPnL = 0;
  let bestTrade = Number.MIN_SAFE_INTEGER;
  let worstTrade = Number.MAX_SAFE_INTEGER;

  trades.forEach((trade) => {
    const pnl = Number(trade.pnl) || 0;
    totalPnL += pnl;

    if (pnl > 0) wins++;
    if (pnl > bestTrade) bestTrade = pnl;
    if (pnl < worstTrade) worstTrade = pnl;
  });

  const winRate = (wins / trades.length) * 100;

  return {
    totalTrades: trades.length,
    winRate: winRate,
    totalPnL: totalPnL,
    bestTrade: bestTrade === Number.MIN_SAFE_INTEGER ? 0 : bestTrade,
    worstTrade: worstTrade === Number.MAX_SAFE_INTEGER ? 0 : worstTrade,
  };
};

export const getEquityCurve = async (userId: string) => {
  const trades = await Trade.findAll({
    where: { userId },
    order: [["openTime", "ASC"]],
  });

  let cumulativePnL = 0;

  const equityData = trades.map((trade) => {
    cumulativePnL += Number(trade.pnl) || 0;
    return {
      time: trade.openTime,
      pnl: Number(trade.pnl) || 0,
      equity: cumulativePnL,
    };
  });

  return equityData;
};
