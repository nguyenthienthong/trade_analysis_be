import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AIAnalysisInput {
  symbol: string;
  price: number;
  trend: string;
  rsi: number;
  user_history: any;
}

export interface AIAnalysisOutput {
  bias: string;
  entry_zone: number[];
  risk: string;
  reasoning: string[];
}

export const analyzeTradeContext = async (input: AIAnalysisInput): Promise<AIAnalysisOutput> => {
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
    const parsedResponse = JSON.parse(cleanedText) as AIAnalysisOutput;
    
    return parsedResponse;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to generate AI analysis");
  }
};
