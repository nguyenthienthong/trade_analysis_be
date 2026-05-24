import { Trade } from "../models/trade.model";

export const getStatsOverview = async (userId: string) => {
  const trades = await Trade.findAll({ 
    where: { userId },
    order: [["openTime", "ASC"]],
  });

  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      maxDrawdown: 0,
      totalVolume: 0,
    };
  }

  let wins = 0;
  let totalPnL = 0;
  let totalVolume = 0;
  
  let cumulativePnL = 0;
  let peak = 0;
  let maxDrawdown = 0;

  trades.forEach((trade) => {
    const netPnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
    totalPnL += netPnl;
    
    const qty = parseFloat(trade.quantity) || 0;
    const price = parseFloat(trade.entryPrice) || 0;
    totalVolume += (qty * price);

    if (netPnl > 0) wins++;

    cumulativePnL += netPnl;
    if (cumulativePnL > peak) {
      peak = cumulativePnL;
    }
    const drawdown = peak - cumulativePnL;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const winRate = (wins / trades.length) * 100;

  return {
    totalTrades: trades.length,
    winRate: winRate,
    totalPnL: totalPnL,
    maxDrawdown: maxDrawdown,
    totalVolume: totalVolume,
  };
};

export const getEquityCurve = async (userId: string) => {
  const trades = await Trade.findAll({
    where: { userId },
    order: [["openTime", "ASC"]],
  });

  let cumulativePnL = 0;
  let wins = 0;
  let losses = 0;

  const equityData = trades.map((trade) => {
    const netPnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
    cumulativePnL += netPnl;
    
    if (netPnl > 0) wins++;
    else losses++;
    
    return {
      time: trade.openTime,
      pnl: netPnl,
      equity: cumulativePnL,
    };
  });

  return {
    equity: equityData,
    winLoss: [
      { name: 'Wins', value: wins },
      { name: 'Losses', value: losses }
    ]
  };
};
