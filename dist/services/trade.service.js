"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTradeJournal = exports.getTradeById = exports.getUserTrades = void 0;
const trade_model_1 = require("../models/trade.model");
const emotion_model_1 = require("../models/emotion.model");
const tag_model_1 = require("../models/tag.model");
const trade_setup_model_1 = require("../models/trade-setup.model");
const trade_emotion_model_1 = require("../models/trade-emotion.model");
const trade_tag_model_1 = require("../models/trade-tag.model");
const trade_image_model_1 = require("../models/trade-image.model");
const sequelize_1 = require("sequelize");
const getUserTrades = async ({ userId, page = 1, limit = 20, symbol, accountId, startDate, endDate, sortBy = 'openTime', sortOrder = 'DESC', }) => {
    const whereClause = { userId };
    if (symbol) {
        whereClause.symbol = { [sequelize_1.Op.iLike]: `%${symbol}%` }; // or Op.like depending on DB, postgres uses iLike
    }
    if (accountId) {
        whereClause.accountId = accountId;
    }
    if (startDate || endDate) {
        whereClause.openTime = {};
        if (startDate) {
            whereClause.openTime[sequelize_1.Op.gte] = new Date(startDate);
        }
        if (endDate) {
            whereClause.openTime[sequelize_1.Op.lte] = new Date(endDate);
        }
    }
    const offset = (page - 1) * limit;
    const validSortColumns = ['openTime', 'pnl', 'fee', 'durationMinutes', 'entryPrice', 'quantity', 'symbol', 'side'];
    const sortCol = validSortColumns.includes(sortBy) ? sortBy : 'openTime';
    const { count, rows } = await trade_model_1.Trade.findAndCountAll({
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
exports.getUserTrades = getUserTrades;
const getTradeById = async (userId, tradeId) => {
    const trade = await trade_model_1.Trade.findOne({
        where: { id: tradeId, userId },
        include: [
            { model: trade_setup_model_1.TradeSetup, as: 'setup' },
            { model: emotion_model_1.Emotion, as: 'emotions', through: { attributes: [] } },
            { model: tag_model_1.Tag, as: 'tags', through: { attributes: [] } },
            { model: trade_image_model_1.TradeImage, as: 'images' },
        ],
    });
    return trade;
};
exports.getTradeById = getTradeById;
const updateTradeJournal = async (userId, tradeId, data) => {
    const trade = await trade_model_1.Trade.findOne({ where: { id: tradeId, userId } });
    if (!trade)
        throw new Error("Trade not found");
    if (data.note !== undefined)
        trade.note = data.note;
    if (data.setupId !== undefined)
        trade.setupId = data.setupId || null;
    await trade.save();
    if (data.emotionIds !== undefined) {
        await trade_emotion_model_1.TradeEmotion.destroy({ where: { tradeId: trade.id } });
        if (data.emotionIds.length > 0) {
            const emos = data.emotionIds.map(eId => ({ tradeId: trade.id, emotionId: eId }));
            await trade_emotion_model_1.TradeEmotion.bulkCreate(emos);
        }
    }
    if (data.tagIds !== undefined) {
        await trade_tag_model_1.TradeTag.destroy({ where: { tradeId: trade.id } });
        if (data.tagIds.length > 0) {
            const tags = data.tagIds.map(tId => ({ tradeId: trade.id, tagId: tId }));
            await trade_tag_model_1.TradeTag.bulkCreate(tags);
        }
    }
    // Return updated trade
    return (0, exports.getTradeById)(userId, tradeId);
};
exports.updateTradeJournal = updateTradeJournal;
