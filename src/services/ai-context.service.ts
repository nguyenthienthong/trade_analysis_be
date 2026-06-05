import { GoogleGenAI } from "@google/genai";
import { AIContext } from "../models/ai-context.model";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

// Khởi tạo Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Tạo vector embedding từ văn bản
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
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
 * Lưu trữ hoặc cập nhật ngữ cảnh vào Vector Database
 */
export const storeContext = async (
  userId: string,
  type: string,
  content: string
) => {
  try {
    const embedding = await generateEmbedding(content);
    
    // Xóa context cũ cùng loại nếu là profile (để luôn giữ 1 profile mới nhất)
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
 * Truy xuất các ngữ cảnh liên quan nhất dựa trên Cosine Similarity
 */
export const retrieveRelevantContext = async (
  userId: string,
  query: string,
  limit: number = 3
): Promise<AIContext[]> => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    // Sử dụng toán tử <=> của pgvector cho Cosine Distance
    // Cosine Distance = 1 - Cosine Similarity
    // ORDER BY <=> sẽ ưu tiên những vector có distance thấp nhất (Similarity cao nhất)
    const querySql = `
      SELECT id, type, content, "createdAt"
      FROM ai_contexts
      WHERE "userId" = :userId
      ORDER BY embedding <=> :embedding::vector
      LIMIT :limit
    `;

    const results = await sequelize.query(querySql, {
      replacements: { userId, embedding: embeddingString, limit },
      type: QueryTypes.SELECT,
      model: AIContext,
      mapToModel: true,
    });

    return results as AIContext[];
  } catch (error) {
    console.error("Error retrieving context:", error);
    return [];
  }
};
