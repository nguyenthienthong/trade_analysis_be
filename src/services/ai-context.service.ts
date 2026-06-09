import { GoogleGenAI } from "@google/genai";
import { AIContext } from "../models/ai-context.model";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

// Khởi tạo Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Hàm tính độ tương đồng Cosine Similarity
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Tạo vector embedding từ văn bản
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: text,
    });
    
    if (response.embeddings && response.embeddings.length > 0) {
      return response.embeddings[0].values as number[];
    }
    throw new Error("No embedding returned");
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

/**
 * Lưu trữ hoặc cập nhật ngữ cảnh vào Vector Database (Thay thế bằng Postgres Array thường)
 */
export const storeContext = async (
  userId: string,
  type: string,
  content: string
) => {
  try {
    const embedding = await generateEmbedding(content);
    
    if (type === "profile") {
      await AIContext.destroy({ where: { userId, type: "profile" } });
    }

    const context = await AIContext.create({
      userId,
      type,
      content,
      embedding,
    });

    return context;
  } catch (error) {
    console.error("Error storing context:", error);
    throw error;
  }
};

/**
 * Truy xuất các ngữ cảnh liên quan nhất dựa trên Cosine Similarity (Tính toán in-memory JS)
 */
export const retrieveRelevantContext = async (
  userId: string,
  query: string,
  limit: number = 3
): Promise<AIContext[]> => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const contexts = await AIContext.findAll({ where: { userId } });
    if (!contexts || contexts.length === 0) return [];

    const similarities = contexts.map((ctx) => {
      const sim = cosineSimilarity(queryEmbedding, ctx.embedding || []);
      return { ctx, sim };
    });

    similarities.sort((a, b) => b.sim - a.sim);
    
    return similarities.slice(0, limit).map((item) => item.ctx);
  } catch (error) {
    console.error("Error retrieving context:", error);
    return [];
  }
};
