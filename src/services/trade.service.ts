import { Trade } from "../models/trade.model";

export const getUserTrades = async (userId: string) => {
  return await Trade.findAll({
    where: { userId },
    order: [["openTime", "DESC"]],
  });
};
