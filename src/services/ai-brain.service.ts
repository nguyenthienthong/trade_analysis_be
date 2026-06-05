import { GoogleGenAI } from "@google/genai";
import { getTechnicalIndicatorsSummary } from "./market-data.service";
import { storeContext, retrieveRelevantContext } from "./ai-context.service";
import { Trade } from "../models/trade.model";
import { DailyStat } from "../models/daily-stat.model";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 1. Trading Profile Loader
 * Tổng hợp toàn bộ lịch sử và hiệu suất của trader thành văn bản,
 * sau đó lưu dưới dạng Vector để tái sử dụng.
 */
export const syncTradingProfile = async (userId: string) => {
  // Lấy thống kê cơ bản
  const stats = await DailyStat.findAll({ where: { userId } });
  
  let totalTrades = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let totalPnL = 0;

  stats.forEach(s => {
    totalTrades += Number(s.totalTrades || 0);
    totalWins += Number(s.wins || 0);
    totalLosses += Number(s.losses || 0);
    totalPnL += Number(s.pnl || 0);
  });

  const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

  // Lấy các lệnh giao dịch gần đây để tìm hiểu hành vi
  const recentTrades = await Trade.findAll({
    where: { userId },
    order: [["openTime", "DESC"]],
    limit: 10,
  });

  const recentBehaviors = recentTrades.map(
    (t) => `Trade ${t.symbol} (${t.side}): PnL ${t.pnl}, RR ${t.rr}. Note: ${t.note || 'None'}`
  ).join("\n");

  const profileText = `
User Trading Profile:
- Total Trades: ${totalTrades}
- Win Rate: ${winRate.toFixed(2)}%
- Total Net PnL: $${totalPnL.toFixed(2)}
- Trading Style & Recent Behaviors:
${recentBehaviors}
  `;

  // Lưu trữ vào Vector DB
  await storeContext(userId, "profile", profileText);
  return profileText;
};

/**
 * 2. Prompt Builder
 * Kết hợp System Context, Trading Profile, Market Context và RAG Search
 */
export const buildPrompt = async (
  userId: string,
  userMessage: string,
  symbol: string = "BTCUSDT"
): Promise<string> => {
  // A. Truy xuất ngữ cảnh liên quan từ Vector DB (RAG)
  const relevantContexts = await retrieveRelevantContext(userId, userMessage, 5);
  let ragText = "";
  if (relevantContexts.length > 0) {
    ragText = "Relevant past contexts:\n" + relevantContexts.map(c => `- [${c.type}] ${c.content}`).join("\n");
  }

  // B. Kéo thông tin thị trường hiện tại
  let marketText = "Market Context: Data unavailable.";
  try {
    const marketData = await getTechnicalIndicatorsSummary(symbol, "1h", "binance");
    marketText = `Current Market Context for ${symbol} (1h):
- Summary Rating: ${marketData.summary.rating}
- Oscillators Rating: ${marketData.oscillators.rating} (RSI: ${marketData.oscillators.items.rsi?.value})
- Moving Averages Rating: ${marketData.movingAverages.rating}`;
  } catch (e) {
    console.warn("Market data unavailable for prompt builder");
  }

  // C. System Context
  const systemContext = `Bạn là trợ lý AI phân tích giao dịch thông minh. Hãy hỗ trợ người dùng cải thiện hiệu suất giao dịch. Phân tích dựa trên thông tin thị trường và lịch sử của họ.`;

  // D. Tổng hợp Prompt
  const finalPrompt = `
${systemContext}

--- MARKET CONTEXT ---
${marketText}

--- MEMORY & KNOWLEDGE ---
${ragText}

--- USER REQUEST ---
${userMessage}
  `;

  return finalPrompt;
};

/**
 * 3. Chat Handler
 * Xử lý tin nhắn của user, gọi LLM và lưu cả câu hỏi & câu trả lời thành Vector
 */
export const chatWithBrain = async (
  userId: string,
  userMessage: string,
  symbol?: string
) => {
  // Xây dựng prompt thông minh
  const prompt = await buildPrompt(userId, userMessage, symbol);

  // Gọi LLM
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const aiReply = response.text || "No response generated.";

  // Lưu lịch sử dưới dạng Vector
  await storeContext(userId, "chat", `User asked: ${userMessage}\nAI answered: ${aiReply}`);

  return aiReply;
};
