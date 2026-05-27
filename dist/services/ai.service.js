"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamAIChat = exports.analyzeTradeContext = void 0;
const genai_1 = require("@google/genai");
const market_data_service_1 = require("./market-data.service");
const trade_service_1 = require("./trade.service");
const analysis_service_1 = require("./analysis.service");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const analyzeTradeContext = async (input) => {
    const prompt = `
You are a highly advanced Context-aware Trading AI. 
Your task is to analyze the market data and the user's trading history to provide a trading recommendation.
You MUST respond strictly in valid JSON format matching the following schema. Do not include any markdown formatting (like \`\`\`json) or conversational text outside the JSON object.

Schema:
{
  "bias": "string (e.g., strongly bullish, slightly bullish, neutral, slightly bearish, strongly bearish)",
  "entry_zone": [number, number] (suggested lower and upper price for entry),
  "risk": "string (low, medium, high)",
  "reasoning": ["string", "string"] (list of reasons for your decision based on the input)
}

Input Context:
- Symbol: ${input.symbol}
- Current Price: ${input.price}
- Market Trend: ${input.trend}
- RSI (Relative Strength Index): ${input.rsi}
- User Trading History/Context: ${JSON.stringify(input.user_history)}

Based on this, generate the analysis JSON.
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        if (!response.text) {
            throw new Error("Empty response from AI");
        }
        const cleanedText = response.text.replace(/```json\n?|\n?```/g, '').trim();
        const parsedResponse = JSON.parse(cleanedText);
        return parsedResponse;
    }
    catch (error) {
        console.error("AI Analysis Error:", error);
        throw new Error("Failed to generate AI analysis");
    }
};
exports.analyzeTradeContext = analyzeTradeContext;
const streamAIChat = async (userId, message, symbol, isWeeklyReview) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const startDate = isWeeklyReview ? sevenDaysAgo : undefined;
    let contextStr = "User hasn't provided a specific symbol.";
    if (symbol) {
        try {
            const [ta, patterns, ohlcv] = await Promise.all([
                (0, market_data_service_1.getTechnicalIndicatorsSummary)(symbol, '1h', 'binance').catch(() => null),
                (0, market_data_service_1.getPatternDetectionSummary)(symbol, '1h', 'binance').catch(() => []),
                (0, market_data_service_1.getOHLCV)(symbol, '1h', 24, 'binance').catch(() => [])
            ]);
            contextStr = `Current Symbol: ${symbol}\n`;
            if (ohlcv && ohlcv.length > 0) {
                const currentPrice = ohlcv[ohlcv.length - 1].close;
                const recentHigh = Math.max(...ohlcv.map(o => o.high));
                const recentLow = Math.min(...ohlcv.map(o => o.low));
                contextStr += `Current Price: ${currentPrice}\n`;
                contextStr += `24h High: ${recentHigh} | 24h Low: ${recentLow}\n`;
            }
            if (ta) {
                contextStr += `Technical Analysis (1h): Rating=${ta.summary.rating}, ATR=${ta.volatility.atr.toFixed(2)}, OBV=${ta.volume.obvAction}\n`;
            }
            if (patterns && patterns.length > 0) {
                contextStr += `Detected Patterns: ${patterns.map(p => `[${p.type}: ${p.signal}] ${p.description}`).join(' | ')}\n`;
            }
            else {
                contextStr += `Detected Patterns: None\n`;
            }
        }
        catch (e) {
            console.warn("Failed to fetch market data for AI context:", e);
        }
    }
    let tradeHistoryStr = "No recent trades found.";
    try {
        const recentTrades = await (0, trade_service_1.getUserTrades)({ userId, limit: isWeeklyReview ? 50 : 5, startDate });
        if (recentTrades.data && recentTrades.data.length > 0) {
            tradeHistoryStr = recentTrades.data.map(t => `- Trade on ${t.symbol}: Side=${t.side}, Entry=${t.entryPrice}, PNL=${t.pnl}, Duration=${t.durationMinutes} mins`).join('\n');
        }
    }
    catch (e) {
        console.warn("Failed to fetch user trades for AI context:", e);
    }
    let userProfileStr = "User Profile not available.";
    if (userId !== "anonymous") {
        try {
            const [stats, behavior] = await Promise.all([
                (0, analysis_service_1.getStatsOverview)(userId, startDate).catch(() => null),
                (0, analysis_service_1.getBehavioralAnalysis)(userId, startDate).catch(() => null)
            ]);
            if (stats && behavior) {
                userProfileStr = `Win Rate: ${stats.winRate.toFixed(1)}%, Total PnL: ${stats.totalPnL.toFixed(2)}, Max Drawdown: ${stats.maxDrawdown.toFixed(2)}\n`;
                // Emotional weaknesses
                const losingEmotions = behavior.emotionPerformance?.filter((e) => e.pnl < 0).slice(0, 2) || [];
                if (losingEmotions.length > 0) {
                    userProfileStr += `Emotional weaknesses: ${losingEmotions.map((e) => e.emotion).join(', ')} often lead to losses.\n`;
                }
                // Risk profile
                if (behavior.riskBehavior) {
                    userProfileStr += `Risk Profile: Avg Win = ${behavior.riskBehavior.avgWinSize.toFixed(2)}, Avg Loss = ${behavior.riskBehavior.avgLossSize.toFixed(2)}\n`;
                }
                // Mistakes by hour
                const worstHour = behavior.mistakesByHour?.sort((a, b) => b.mistakes - a.mistakes)[0];
                if (worstHour && worstHour.mistakes > 0) {
                    userProfileStr += `Warning: User makes the most mistakes around ${worstHour.hour}.\n`;
                }
            }
        }
        catch (e) {
            console.warn("Failed to fetch user profile for AI context:", e);
        }
    }
    let prompt = ``;
    if (isWeeklyReview) {
        prompt = `
You are an expert AI Trading Copilot assisting a crypto trader.
The user is requesting a "Weekly Review". Use the provided 7-day context (User Trading Profile and Recent Trades) to generate a comprehensive weekly report.
You MUST reply using the following structured format (use Vietnamese if the user asks in Vietnamese):

1. **Weekly Summary**: Tóm tắt tổng quan về Win Rate, PnL, Khối lượng giao dịch trong 7 ngày qua. Đánh giá xem tuần này là một tuần tốt hay xấu.
2. **Mistake Analysis**: Phân tích các lỗi sai phổ biến trong tuần (Khung giờ chết, Cảm xúc tiêu cực, Overtrading). Lấy dẫn chứng từ các lệnh lỗ hoặc dữ liệu "Warning".
3. **Improvement Suggestion**: Đưa ra lời khuyên thực tế để khắc phục các lỗi sai ở mục 2.
4. **Strategy Recommendation**: Khuyến nghị chiến lược cho tuần tới dựa trên Risk Profile và các điểm sáng trong tuần (nếu có).

--- USER TRADING PROFILE (Last 7 Days) ---
${userProfileStr}

--- RECENT USER TRADES (Last 7 Days) ---
${tradeHistoryStr}
`;
    }
    else {
        prompt = `
You are an expert AI Trading Copilot assisting a crypto trader.
Use the following context to provide insightful, concise, and professional advice. Do not output markdown code block for JSON. Output regular markdown text for a conversation.
If the user asks a question about whether to buy/sell a specific coin or asks for a trading analysis (e.g., "ADA giờ mua được chưa?", "Should I buy BTC?", "Analyze ETH"), you MUST reply using the following structured format (use Vietnamese if the user asks in Vietnamese):

1. **Bias Analysis**: Xu hướng hiện tại (Bullish/Bearish/Neutral) dựa trên Technical Analysis và Pattern.
2. **Support/Resistance Summary**: Tóm tắt vùng Hỗ trợ (Support) và Kháng cự (Resistance) gần nhất dựa trên 24h High/Low.
3. **RR Suggestion**: Gợi ý vùng vào lệnh (Entry), Cắt lỗ (Stop Loss), và Chốt lời (Take Profit) với tỷ lệ Risk/Reward hợp lý.
4. **Risk Warning**: Lời khuyên quản lý rủi ro dựa trên độ biến động (ATR), lịch sử giao dịch gần đây VÀ **Hồ sơ tâm lý giao dịch (Emotional weaknesses)** của người dùng. Hãy đưa ra cảnh báo cá nhân hóa nếu họ đang giao dịch vào khung giờ thường mắc sai lầm hoặc hay mắc lỗi tâm lý (như FOMO).

If the user just asks a general question, answer it directly and cite the market data or their recent trades if relevant.

--- MARKET CONTEXT ---
${contextStr}

--- USER TRADING PROFILE ---
${userProfileStr}

--- RECENT USER TRADES (Last 5) ---
${tradeHistoryStr}

--- USER MESSAGE ---
${message}
`;
    }
    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return stream;
    }
    catch (error) {
        console.error("AI Chat Stream Error:", error);
        throw new Error("Failed to generate AI chat stream");
    }
};
exports.streamAIChat = streamAIChat;
