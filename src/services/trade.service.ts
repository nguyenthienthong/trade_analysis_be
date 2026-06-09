import { Trade } from "../models/trade.model";
import { Account } from "../models/account.model";
import { Emotion } from "../models/emotion.model";
import { Tag } from "../models/tag.model";
import { TradeSetup } from "../models/trade-setup.model";
import { TradeEmotion } from "../models/trade-emotion.model";
import { TradeTag } from "../models/trade-tag.model";
import { TradeImage } from "../models/trade-image.model";
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

  let targetAccountId = accountId;
  if (!targetAccountId) {
    const defaultAccount = await Account.findOne({
      where: { user_id: userId, is_default: true }
    });
    if (defaultAccount) {
      targetAccountId = defaultAccount.id;
    }
  }

  if (targetAccountId && targetAccountId !== 'all') {
    whereClause.accountId = targetAccountId;
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

export const getTradeById = async (userId: string, tradeId: string) => {
  const trade = await Trade.findOne({
    where: { id: tradeId, userId },
    include: [
      { model: TradeSetup, as: 'setup' },
      { model: Emotion, as: 'emotions', through: { attributes: [] } },
      { model: Tag, as: 'tags', through: { attributes: [] } },
      { model: TradeImage, as: 'images' },
    ],
  });

  return trade;
};

export const updateTradeJournal = async (
  userId: string,
  tradeId: string,
  data: { note?: string; setupId?: string; emotionIds?: string[]; tagIds?: string[] }
) => {
  const trade = await Trade.findOne({ where: { id: tradeId, userId } });
  if (!trade) throw new Error("Trade not found");

  if (data.note !== undefined) trade.note = data.note;
  if (data.setupId !== undefined) trade.setupId = data.setupId || null;
  await trade.save();

  if (data.emotionIds !== undefined) {
    await TradeEmotion.destroy({ where: { tradeId: trade.id } });
    if (data.emotionIds.length > 0) {
      const emos = data.emotionIds.map(eId => ({ tradeId: trade.id, emotionId: eId }));
      await TradeEmotion.bulkCreate(emos);
    }
  }

  if (data.tagIds !== undefined) {
    await TradeTag.destroy({ where: { tradeId: trade.id } });
    if (data.tagIds.length > 0) {
      const tags = data.tagIds.map(tId => ({ tradeId: trade.id, tagId: tId }));
      await TradeTag.bulkCreate(tags);
    }
  }

  // Return updated trade
  return getTradeById(userId, tradeId);
};

