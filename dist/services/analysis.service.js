"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBehaviorFlow = exports.getBehavioralAnalysis = exports.getErrorDetection = exports.getAdvancedAnalytics = exports.getEquityCurve = exports.getStatsOverview = void 0;
const trade_model_1 = require("../models/trade.model");
const trade_setup_model_1 = require("../models/trade-setup.model");
const emotion_model_1 = require("../models/emotion.model");
const sequelize_1 = require("sequelize");
const getStatsOverview = async (userId, startDate, endDate) => {
    const whereClause = { userId };
    if (startDate || endDate) {
        whereClause.openTime = {};
        if (startDate)
            whereClause.openTime[sequelize_1.Op.gte] = new Date(startDate);
        if (endDate)
            whereClause.openTime[sequelize_1.Op.lte] = new Date(endDate);
    }
    const trades = await trade_model_1.Trade.findAll({
        where: whereClause,
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
        if (netPnl > 0)
            wins++;
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
exports.getStatsOverview = getStatsOverview;
const getEquityCurve = async (userId) => {
    const trades = await trade_model_1.Trade.findAll({
        where: { userId },
        order: [["openTime", "ASC"]],
    });
    let cumulativePnL = 0;
    let wins = 0;
    let losses = 0;
    const equityData = trades.map((trade) => {
        const netPnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
        cumulativePnL += netPnl;
        if (netPnl > 0)
            wins++;
        else
            losses++;
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
exports.getEquityCurve = getEquityCurve;
const getAdvancedAnalytics = async (userId, startDate, endDate) => {
    const whereClause = { userId };
    if (startDate || endDate) {
        whereClause.openTime = {};
        if (startDate)
            whereClause.openTime[sequelize_1.Op.gte] = new Date(startDate);
        if (endDate)
            whereClause.openTime[sequelize_1.Op.lte] = new Date(endDate);
    }
    const trades = await trade_model_1.Trade.findAll({
        where: whereClause,
        include: [{ model: trade_setup_model_1.TradeSetup, as: 'setup' }],
        order: [["openTime", "ASC"]],
    });
    const symbolStats = {};
    const setupStats = {};
    const hourlyStats = {};
    const dayStats = {};
    let currentLosingStreak = 0;
    let maxLosingStreak = 0;
    let totalLosingStreaks = 0;
    let sumLosingStreaks = 0;
    let inStreak = false;
    trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
        const isWin = pnl > 0;
        if (!isWin) {
            currentLosingStreak++;
            if (!inStreak) {
                inStreak = true;
                totalLosingStreaks++;
            }
            sumLosingStreaks++;
            if (currentLosingStreak > maxLosingStreak) {
                maxLosingStreak = currentLosingStreak;
            }
        }
        else {
            currentLosingStreak = 0;
            inStreak = false;
        }
        const sym = trade.symbol;
        if (!symbolStats[sym])
            symbolStats[sym] = { total: 0, wins: 0, pnl: 0 };
        symbolStats[sym].total++;
        if (isWin)
            symbolStats[sym].wins++;
        symbolStats[sym].pnl += pnl;
        const setupName = trade.setup ? trade.setup.name : "Uncategorized";
        if (!setupStats[setupName])
            setupStats[setupName] = { name: setupName, total: 0, wins: 0, pnl: 0 };
        setupStats[setupName].total++;
        if (isWin)
            setupStats[setupName].wins++;
        setupStats[setupName].pnl += pnl;
        const hour = new Date(trade.openTime).getHours();
        if (!hourlyStats[hour])
            hourlyStats[hour] = { total: 0, wins: 0, pnl: 0 };
        hourlyStats[hour].total++;
        if (isWin)
            hourlyStats[hour].wins++;
        hourlyStats[hour].pnl += pnl;
        const day = new Date(trade.openTime).getDay();
        if (!dayStats[day])
            dayStats[day] = { total: 0, wins: 0, pnl: 0 };
        dayStats[day].total++;
        if (isWin)
            dayStats[day].wins++;
        dayStats[day].pnl += pnl;
    });
    const avgLosingStreak = totalLosingStreaks > 0 ? (sumLosingStreaks / totalLosingStreaks) : 0;
    const formatStats = (stats, keyName, mapKey) => {
        return Object.keys(stats).map(k => {
            const s = stats[k];
            return {
                [keyName]: mapKey ? mapKey(k) : k,
                totalTrades: s.total,
                winRate: (s.wins / s.total) * 100,
                pnl: s.pnl
            };
        }).sort((a, b) => b.totalTrades - a.totalTrades);
    };
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return {
        symbolPerformance: formatStats(symbolStats, 'symbol'),
        setupPerformance: Object.values(setupStats).map(s => ({
            setup: s.name,
            totalTrades: s.total,
            winRate: (s.wins / s.total) * 100,
            pnl: s.pnl
        })).sort((a, b) => b.totalTrades - a.totalTrades),
        hourlyPerformance: formatStats(hourlyStats, 'hour').sort((a, b) => parseInt(a.hour) - parseInt(b.hour)),
        dayOfWeekPerformance: formatStats(dayStats, 'day', k => dayNames[parseInt(k)]),
        streaks: {
            maxLosingStreak,
            avgLosingStreak
        }
    };
};
exports.getAdvancedAnalytics = getAdvancedAnalytics;
const getErrorDetection = async (userId) => {
    const trades = await trade_model_1.Trade.findAll({
        where: { userId },
        order: [["openTime", "ASC"]],
    });
    const errors = {
        overtrade: { name: 'Overtrade', count: 0, pnlImpact: 0, description: 'Traded more than 5 times in a single day' },
        revenge: { name: 'Revenge Trade', count: 0, pnlImpact: 0, description: 'Opened a trade within 15 minutes after a loss' },
        lowRr: { name: 'Low RR', count: 0, pnlImpact: 0, description: 'Risk/Reward ratio was less than 1.0' },
        outsidePlan: { name: 'Outside Plan', count: 0, pnlImpact: 0, description: 'Trade missing setup or journal notes' },
        sizeIncrease: { name: 'Size Increase After Loss', count: 0, pnlImpact: 0, description: 'Increased position size immediately after a losing trade' }
    };
    const dailyCounts = {};
    let previousTrade = null;
    trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
        const isWin = pnl > 0;
        const qty = parseFloat(trade.quantity);
        const dateStr = new Date(trade.openTime).toISOString().split('T')[0];
        if (!dailyCounts[dateStr])
            dailyCounts[dateStr] = 0;
        dailyCounts[dateStr]++;
        if (dailyCounts[dateStr] > 5) {
            errors.overtrade.count++;
            errors.overtrade.pnlImpact += pnl;
        }
        if (previousTrade && !previousTrade.isWin) {
            const prevCloseTime = previousTrade.closeTime ? new Date(previousTrade.closeTime).getTime() : new Date(previousTrade.openTime).getTime();
            const currentOpenTime = new Date(trade.openTime).getTime();
            const diffMins = (currentOpenTime - prevCloseTime) / (1000 * 60);
            if (diffMins >= 0 && diffMins <= 15) {
                errors.revenge.count++;
                errors.revenge.pnlImpact += pnl;
            }
            if (qty > previousTrade.qty * 1.1) {
                errors.sizeIncrease.count++;
                errors.sizeIncrease.pnlImpact += pnl;
            }
        }
        if (trade.rr !== null) {
            const rrValue = parseFloat(trade.rr);
            if (rrValue > 0 && rrValue < 1.0) {
                errors.lowRr.count++;
                errors.lowRr.pnlImpact += pnl;
            }
        }
        if (!trade.setupId || !trade.note || trade.note.trim() === '') {
            errors.outsidePlan.count++;
            errors.outsidePlan.pnlImpact += pnl;
        }
        previousTrade = {
            isWin,
            closeTime: trade.closeTime,
            openTime: trade.openTime,
            qty
        };
    });
    return Object.values(errors).sort((a, b) => b.count - a.count);
};
exports.getErrorDetection = getErrorDetection;
const getBehavioralAnalysis = async (userId, startDate, endDate) => {
    const whereClause = { userId };
    if (startDate || endDate) {
        whereClause.openTime = {};
        if (startDate)
            whereClause.openTime[sequelize_1.Op.gte] = new Date(startDate);
        if (endDate)
            whereClause.openTime[sequelize_1.Op.lte] = new Date(endDate);
    }
    const trades = await trade_model_1.Trade.findAll({
        where: whereClause,
        include: [
            { model: emotion_model_1.Emotion, as: 'emotions' },
        ],
        order: [["openTime", "ASC"]],
    });
    const emotionStats = {};
    let tradesWithSetup = 0;
    let tradesWithoutSetup = 0;
    const mistakesByHour = {};
    for (let i = 0; i < 24; i++)
        mistakesByHour[i] = 0;
    let previousTrade = null;
    let winVolume = 0;
    let winCount = 0;
    let lossVolume = 0;
    let lossCount = 0;
    const dailyCounts = {};
    trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
        const isWin = pnl > 0;
        const qty = parseFloat(trade.quantity);
        const entryPrice = parseFloat(trade.entryPrice);
        const volume = qty * entryPrice;
        if (trade.emotions && trade.emotions.length > 0) {
            trade.emotions.forEach((emo) => {
                if (!emotionStats[emo.name])
                    emotionStats[emo.name] = { count: 0, pnl: 0, wins: 0 };
                emotionStats[emo.name].count++;
                emotionStats[emo.name].pnl += pnl;
                if (isWin)
                    emotionStats[emo.name].wins++;
            });
        }
        else {
            const name = "No Emotion";
            if (!emotionStats[name])
                emotionStats[name] = { count: 0, pnl: 0, wins: 0 };
            emotionStats[name].count++;
            emotionStats[name].pnl += pnl;
            if (isWin)
                emotionStats[name].wins++;
        }
        if (trade.setupId) {
            tradesWithSetup++;
        }
        else {
            tradesWithoutSetup++;
        }
        let tradeHasMistake = false;
        const dateStr = new Date(trade.openTime).toISOString().split('T')[0];
        if (!dailyCounts[dateStr])
            dailyCounts[dateStr] = 0;
        dailyCounts[dateStr]++;
        if (dailyCounts[dateStr] > 5)
            tradeHasMistake = true;
        if (previousTrade && !previousTrade.isWin) {
            const prevCloseTime = previousTrade.closeTime ? new Date(previousTrade.closeTime).getTime() : new Date(previousTrade.openTime).getTime();
            const currentOpenTime = new Date(trade.openTime).getTime();
            const diffMins = (currentOpenTime - prevCloseTime) / (1000 * 60);
            if (diffMins >= 0 && diffMins <= 15)
                tradeHasMistake = true;
            if (qty > previousTrade.qty * 1.1)
                tradeHasMistake = true;
        }
        if (trade.rr !== null && parseFloat(trade.rr) > 0 && parseFloat(trade.rr) < 1.0)
            tradeHasMistake = true;
        if (!trade.setupId || !trade.note || trade.note.trim() === '')
            tradeHasMistake = true;
        if (tradeHasMistake) {
            const hour = new Date(trade.openTime).getHours();
            mistakesByHour[hour]++;
        }
        if (isWin) {
            winVolume += volume;
            winCount++;
        }
        else {
            lossVolume += volume;
            lossCount++;
        }
        previousTrade = {
            isWin,
            closeTime: trade.closeTime,
            openTime: trade.openTime,
            qty
        };
    });
    const avgWinSize = winCount > 0 ? winVolume / winCount : 0;
    const avgLossSize = lossCount > 0 ? lossVolume / lossCount : 0;
    const formattedEmotions = Object.keys(emotionStats).map(name => ({
        emotion: name,
        totalTrades: emotionStats[name].count,
        winRate: (emotionStats[name].wins / emotionStats[name].count) * 100,
        pnl: emotionStats[name].pnl
    })).sort((a, b) => b.totalTrades - a.totalTrades);
    const formattedMistakesByHour = Object.keys(mistakesByHour).map(hour => ({
        hour: `${hour}h`,
        mistakes: mistakesByHour[parseInt(hour)]
    }));
    return {
        emotionPerformance: formattedEmotions,
        setupConsistency: [
            { name: 'With Setup', value: tradesWithSetup },
            { name: 'No Setup', value: tradesWithoutSetup }
        ],
        mistakesByHour: formattedMistakesByHour,
        riskBehavior: {
            avgWinSize,
            avgLossSize,
            riskRatio: avgWinSize > 0 ? avgLossSize / avgWinSize : 0
        }
    };
};
exports.getBehavioralAnalysis = getBehavioralAnalysis;
const getBehaviorFlow = async (userId, startDate, endDate) => {
    const whereClause = { userId };
    if (startDate || endDate) {
        whereClause.openTime = {};
        if (startDate)
            whereClause.openTime[sequelize_1.Op.gte] = new Date(startDate);
        if (endDate)
            whereClause.openTime[sequelize_1.Op.lte] = new Date(endDate);
    }
    const trades = await trade_model_1.Trade.findAll({
        where: whereClause,
        include: [
            { model: trade_setup_model_1.TradeSetup, as: 'setup' },
            { model: emotion_model_1.Emotion, as: 'emotions' },
        ],
    });
    const tree = {
        totalTrades: 0,
        totalPnl: 0,
        setups: {}
    };
    trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) - parseFloat(trade.fee);
        const isWin = pnl > 0;
        tree.totalTrades++;
        tree.totalPnl += pnl;
        const setupName = trade.setup ? trade.setup.name : "No Setup";
        if (!tree.setups[setupName]) {
            tree.setups[setupName] = { name: setupName, count: 0, pnl: 0, emotions: {} };
        }
        const sNode = tree.setups[setupName];
        sNode.count++;
        sNode.pnl += pnl;
        const emoNames = (trade.emotions && trade.emotions.length > 0)
            ? trade.emotions.map((e) => e.name)
            : ["No Emotion"];
        emoNames.forEach((emo) => {
            if (!sNode.emotions[emo]) {
                sNode.emotions[emo] = { name: emo, count: 0, pnl: 0, wins: 0, losses: 0, winPnl: 0, lossPnl: 0 };
            }
            const eNode = sNode.emotions[emo];
            eNode.count++;
            eNode.pnl += pnl;
            if (isWin) {
                eNode.wins++;
                eNode.winPnl += pnl;
            }
            else {
                eNode.losses++;
                eNode.lossPnl += pnl;
            }
        });
    });
    // Convert objects to arrays for easier mapping
    const formattedSetups = Object.values(tree.setups).map(setup => ({
        name: setup.name,
        count: setup.count,
        pnl: setup.pnl,
        emotions: Object.values(setup.emotions).sort((a, b) => b.count - a.count)
    })).sort((a, b) => b.count - a.count);
    return {
        totalTrades: tree.totalTrades,
        totalPnl: tree.totalPnl,
        setups: formattedSetups
    };
};
exports.getBehaviorFlow = getBehaviorFlow;
