import { Trade } from "../models/trade.model";
import { Op } from "sequelize";

interface GetTradesParams {
  userId: string;
  page?: number;
  limit?: number;
  symbol?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const getUserTrades = async ({
  userId,
  page = 1,
  limit = 20,
  symbol,
  accountId,
  startDate,
  endDate,
  sortBy = 'openTime',
  sortOrder = 'DESC',
}: GetTradesParams) => {
  const whereClause: any = { userId };

  if (symbol) {
    whereClause.symbol = { [Op.iLike]: `%${symbol}%` }; // or Op.like depending on DB, postgres uses iLike
  }

  if (accountId) {
    whereClause.accountId = accountId;
  }

  if (startDate || endDate) {
    whereClause.openTime = {};
    if (startDate) {
      whereClause.openTime[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.openTime[Op.lte] = new Date(endDate);
    }
  }

  const offset = (page - 1) * limit;
  const validSortColumns = ['openTime', 'pnl', 'fee', 'durationMinutes', 'entryPrice', 'quantity', 'symbol', 'side'];
  const sortCol = validSortColumns.includes(sortBy) ? sortBy : 'openTime';

  const { count, rows } = await Trade.findAndCountAll({
    where: whereClause,
    order: [[sortCol, sortOrder]],
    limit,
    offset,
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit,
    data: rows,
  };
};
