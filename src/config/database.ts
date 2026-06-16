
import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user.model";
import { Account } from "../models/account.model";
import { Trade } from "../models/trade.model";
import { DailyStat } from "../models/daily-stat.model";
import { TradeSetup } from "../models/trade-setup.model";
import { Emotion } from "../models/emotion.model";
import { Tag } from "../models/tag.model";
import { TradeEmotion } from "../models/trade-emotion.model";
import { TradeTag } from "../models/trade-tag.model";
import { TradeImage } from "../models/trade-image.model";
import { AIContext } from "../models/ai-context.model";

const isProduction = process.env.NODE_ENV === "production";

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      models: [User, Account, Trade, DailyStat, TradeSetup, Emotion, Tag, TradeEmotion, TradeTag, TradeImage, AIContext],
      logging: false,
      dialectOptions: isProduction ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    })
  : new Sequelize({
      dialect: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      models: [User, Account, Trade, DailyStat, TradeSetup, Emotion, Tag, TradeEmotion, TradeTag, TradeImage, AIContext],
      logging: false,
    });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // dev
    console.log("✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ DB error:", error);
  }
};
